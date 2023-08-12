<template>
  <div class="Chat">
    <div class="channels-list" :class="{ collapsed: !showSideInfo }">
      <div v-if="side_info === 0" class="convo-list-container">
        <div class="list-header">Conversations</div>
        <div
          v-for="joinedchannel in joinedchannels"
          :key="joinedchannel.id"
          :class="['channel', { selected: joinedchannel.channel_id.id === selected_channel }]"
          @click="chooseChannel(joinedchannel.channel_id.id)"
        >
          {{ getChannelName(joinedchannel.channel_id.id) }}
          <div class="unread-messages" v-if="unreadMessages[joinedchannel.channel_id.id] > 0">
            {{ unreadMessages[joinedchannel.channel_id.id] }}
          </div>
        </div>
      </div>
      <div v-if="side_info === 1">
        <div class="list-header">FRIENDS</div>
        <div v-for="user_friend in User_Friends" :key="user_friend.id" class="tooltip">
          <div class="user">
            <span class="tooltiptext">
              Nickname: {{ user_friend.nick }}<br />
              Intra Nick: {{ user_friend.intra_nick }}<br />
              Games Won: {{ user_friend.won_games }}<br />
              Games Lost: {{ user_friend.lost_games }}<br />
            </span>
            {{ user_friend.nick }}
            <button class="friend-remove" @click="removeFriend(user_friend)"></button>
          </div>
        </div>
      </div>
      <div v-if="side_info === 2">
        <div v-if="showModal && !createChannelOptions" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <span class="close" @click="closeModal()">&times;</span>
              <h1>New Message</h1>
              <button
                class="next"
                @click="
                  selectedUsers.length === 1
                    ? Dmessage(selectedUsers[0])
                    : (createChannelOptions = true)
                "
              >
                Next
              </button>
            </div>
            <h3 style="text-align: center">Selected Users</h3>

            <select
              class="invitedUsersList"
              id="inviteUser"
              name="inviteUser"
              multiple
              @mousedown="toggleOptionSelection($event)"
            >
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
                :selected="isSelectedUser(user.id)"
                class="user_options"
              >
                {{ user.intra_nick }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="showModal && createChannelOptions" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeModal()">&times;</span>
            <label for="channelName">Channel Name:</label>
            <input class="input-field" type="text" id="channelName" name="channelName" />
            <label for="channelName">Password:</label>
            <input
              class="input-field"
              placeholder="(optional)"
              type="text"
              id="channelPassword"
              name="channelPassword"
            />
            <button @click="createChannel()">Create</button>
          </div>
        </div>
      </div>
      <div v-if="side_info === 3" class="searchcontainer">
        <div class="list-header">USERS</div>
        <div v-for="user in users" :key="user.id" class="tooltip">
          <div class="user">
            <span class="tooltiptext">
              Nickname: {{ user.nick }}<br />
              Intra Nick: {{ user.intra_nick }}<br />
              Games Won: {{ user.won_games }}<br />
              Games Lost: {{ user.lost_games }}<br />
            </span>
            {{ user.nick }}
            <button
              v-if="!isFriend(user.id)"
              class="add-friend"
              @click="addFriend(user.id)"
            ></button>
            <button v-else class="friend-remove" @click="removeFriend(user)"></button>
          </div>
        </div>
        <div class="list-header">CHANNELS LIST</div>
        <div
          v-for="channel in channels"
          :key="channel.id"
          :class="['channel', { selected: channel.id === selected_channel }]"
          style="cursor: auto"
        >
          <span class="channel-name-wrap">{{ channel.channel_name }}</span>
          <button
            v-if="!isChannelJoined(channel.id)"
            @click="joinChannel(channel)"
            class="join-button"
          >
            Join
          </button>
          <button v-else @click="chooseChannel(channel.id)">
            <v-icon class="chat-button">mdi-send</v-icon>
          </button>
        </div>
        <form @submit.prevent="searchQuery">
          <div class="search-input-container">
            <button
              @click="
                searchText = ''
                side_info = 0
              "
            >
              <v-icon>mdi-arrow-left</v-icon>
            </button>
            <input v-model="searchText" type="text" placeholder="Search..." class="search-input" />
          </div>
        </form>
      </div>
      <div class="button-container" v-if="side_info !== 3">
        <v-row class="fill-parent">
          <v-col cols="3" class="button-column">
            <v-btn
              class="bar-button"
              block
              flat
              style="background-color: transparent; border: none"
              @click="
                getChannelsJoined()
                side_info = 0
              "
            >
              <v-icon size="25" style="color: white">mdi-format-list-bulleted</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="3" class="button-column">
            <v-btn
              class="bar-button"
              block
              flat
              style="background-color: transparent; border: none"
              @click="getFriends()"
            >
              <v-icon size="25" style="color: white">mdi-account-group</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="3" class="button-column">
            <v-btn
              class="bar-button"
              block
              flat
              style="background-color: transparent; border: none"
              @click="enableModal()"
            >
              <v-icon size="25" style="color: white">mdi-plus</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="3" class="button-column">
            <v-btn
              class="bar-button"
              block
              flat
              style="background-color: transparent; border: none"
              @click="search()"
            >
              <v-icon size="25" style="color: white">mdi-magnify</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    <div id="chat-container" ref="chatContainer">
      <div v-if="selected_channel" class="chat-container-header">
        <v-btn
          icon
          :class="['hamburguer-button', { 'full-hamburguer-button': showSideInfo }]"
          @click="toggleChannelList"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <div class="channel-name">
          {{ getChannelName(selected_channel) }}
        </div>
        <div class="fightButton">
          <v-btn icon @click="inviteToPrivateGame">
            <font-awesome-icon :icon="['fas', 'table-tennis-paddle-ball']" style="color: #ffffff" />
          </v-btn>
        </div>
        <v-btn
          icon
          class="more-options ml-auto"
          :class="{ 'close-moreoptions': showChannelOptions }"
          @click="moreChannelOptions()"
        >
          <v-icon>{{ showChannelOptions ? 'mdi-close' : 'mdi-dots-vertical' }}</v-icon>
        </v-btn>
      </div>
      <div v-if="showChannelOptions && getChannelType(selected_channel)">
        <div id="user-list-container">
          <h2 class="userHeader">
            {{ getChannelUserCount(usersInChannels) }} Users in
            {{ getChannelName(selected_channel) }}
          </h2>
          <div
            class="usersInChannel"
            v-for="usersInChannel in usersInChannels"
            :key="usersInChannels.id"
          >
            <img :src="usersInChannel.user_id.avatar" alt="UserAvatar" class="user-avatar" />
            <div class="adminCommands" v-if="isUserMorePowerful(usersInChannels, usersInChannel)">
              <button @click="kickUser(usersInChannel.user_id.id)">Kick</button>
              <button @click="banUser(usersInChannel.user_id.id)">Ban</button>
              <button @click="MuteUser(usersInChannel.user_id.id)">Mute</button>
              <button @click="ToggleAdminUser(usersInChannel.user_id.id)">
                Toggle Admin Access
              </button>
            </div>
            {{ usersInChannel.user_id.intra_nick }}
          </div>
        </div>
        <button class="leave-button" @click="leaveChannel(selected_channel)"></button>
      </div>
      <div v-else-if="showChannelOptions && !getChannelType(selected_channel)">
        <div v-for="usersInChannel in usersInChannels" :key="usersInChannels.id">
          <span v-if="usersInChannel.user_id.intra_nick !== users_Name">
            <div class="userInfo-container">
              <div class="userInfo">
                <img
                  :src="usersInChannel.user_id.avatar"
                  alt="UserAvatar"
                  class="alone-user-avatar"
                />
                <h1>{{ usersInChannel.user_id.intra_nick }}</h1>
                <h2>{{ usersInChannel.user_id.nick }}</h2>
                <p>Games Won : {{ usersInChannel.user_id.won_games }}</p>
                <p>Games Lost : {{ usersInChannel.user_id.lost_games }}</p>
                <p>Total XP : {{ usersInChannel.user_id.xp_total }}</p>
              </div>
            </div>
          </span>
        </div>
      </div>
      <div v-else id="msg-container" ref="msgsContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[getMessageClass(message.author.nick), 'message']"
        >
          <strong>[{{ message.author?.nick }}]:</strong> {{ message.message }}
          <div class="message-time">{{ formatTime(message.time) }}</div>
        </div>
      </div>
      <div
        v-if="!showChannelOptions && !isUserMutedOnChannel(usersInChannels)"
        class="msg-input"
        style="margin-bottom: -10px"
      >
        <form class="d-flex flex-row" @submit.prevent="sendMessage">
          <v-text-field
            class="input-field"
            v-model="messageText"
            placeholder="Type Something"
          ></v-text-field>
          <v-btn icon type="submit" class="send-button input-field" style="margin-top: 10px"
            ><v-icon>mdi-send</v-icon></v-btn
          >
        </form>
      </div>
      <div
        v-else
        style="color: red; text-align: center"
        v-if="isUserMutedOnChannel(usersInChannels) && !showChannelOptions"
      >
        YOU ARE MUTED
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onBeforeMount, watch, nextTick } from 'vue'
import jwt_decode from 'jwt-decode'
import { Md5 } from 'ts-md5'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'

library.add(fas)

const msgsContainer = ref(null)
let show_UserInfo = ref(false)
const messageText = ref('')
const searchText = ref('')
const messages = ref([])
const channels = ref([])
const joinedchannels = ref([])
const users = ref([])
let User_Friends = ref([])
let selected_channel = null
let side_info = ref(0)
let showModal = ref(false)
const unreadMessages = ref([])
let showChannelOptions = ref(false)
let showSideInfo = ref(true)
let createChannelOptions = ref(null)
let route = useRouter()

let channelName = ref('')
let channelPassword = ref('')

const socket = inject('socket')

function toggleChannelList() {
  showSideInfo.value = !showSideInfo.value
}
function closeModal() {
  selectedUsers.value = []
  createChannelOptions.value = false
  side_info.value = 0
  showModal.value = false
  channelName.value = ''
  channelPassword.value = ''
}

function enableModal() {
  getUsers()
  side_info.value = 2
  showModal.value = true
}

function getCookieValueByName(name) {
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim()
    if (cookie.startsWith(`${name}=`)) {
      cookie = cookie.substring(name.length + 1)
      return cookie
    }
  }
  return null
}

let token = getCookieValueByName('token')
const decodedToken = jwt_decode(token)
let userId = decodedToken.id
const users_Name = decodedToken.user['intra_nick']
const users_Nick = decodedToken.user['nick']

const getChannelType = (channelID) => {
  const channel = joinedchannels.value.find(
    (joinedchannel) => joinedchannel.channel_id.id === channelID
  )
  return channel.channel_id.type
}

const getChannelName = (channelId) => {
  const channel = joinedchannels.value.find(
    (joinedchannel) => joinedchannel.channel_id.id === channelId
  )
  if (channel && channel['channel_id']['type'] == 0) {
    const channelname = channel['channel_id']['channel_name']
    const user1ID = channelname.split('-')[0]
    const user2ID = channelname.split('-')[1]
    const pmwith = user1ID == userId ? user2ID : user1ID
    const user = users.value.find((user) => user.id === parseInt(pmwith))
    return user.intra_nick
  }
  return channel ? channel.channel_id.channel_name : ''
}

const getChannelUserCount = (channel) => {
  return channel.length
}

const isUserMutedOnChannel = (userList) => {
  for (const userId in userList) {
    const entry = userList[userId]
    if (entry['user_id']['nick'] === users_Name) {
      if (entry['is_muted']) return true
      else return false
    }
  }
  return false
}

const check_user = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUsers/'
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
    } else {
      console.log('Error:', response.status)
      window.alert("User Doesn't exist")
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const getMessageClass = (author) => {
  if (author == users_Nick) {
    return 'message-sent'
  }
  return 'message-received'
}

const getMessages = async () => {
  if (selected_channel) {
    try {
      let url = process.env.VUE_APP_BACKEND_URL + '/chat/msg_in_channel/' + selected_channel
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        messages.value = data
        scrollToBottom()
      } else {
        console.log('Error:', response.status)
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }
}

const getUsers = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUsers'
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      const filteredUsers = data.filter((user) => user.id !== userId)
      users.value = filteredUsers
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const usersInChannels = ref([])
const getUsersInGivenChannel = async (channel_ID) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/usersinchannel/' + channel_ID
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      usersInChannels.value = data
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const getChannels = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/channels/all'
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      channels.value = data
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const getChannelsJoined = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/joinedchannels'
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      joinedchannels.value = data
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const leaveChannel = async (channelid) => {
  if (confirm('Are you sure you wanto to leave this channel?')) {
    try {
      let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/leavechannel'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: parseInt(channelid) })
      })
      if (response.ok) {
        await getChannelsJoined()
      } else {
        console.log('Error:', response.status)
      }
    } catch (error) {
      console.log('Error:', error)
    }
    selected_channel = null
    showChannelOptions.value = !showChannelOptions.value
    messages.value = null
    showSideInfo.value = true
    await getChannelsJoined()
  }
}

const joinChannel = async (channel, ownerPWD) => {
  let pass = ownerPWD
  if (channel.type == 2 && !ownerPWD) {
    let input = await window.prompt('Channel Password:')
    pass = Md5.hashStr(input)
  }
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/joinchannel'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id: parseInt(channel.id), pass: pass })
    })
    if (response.ok) {
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
  await getChannelsJoined()
}

// ADMIN COMMANDS \\

// TEMP TESTS COMMENTED
const isUserMorePowerful = (userList, target) => {
  let is_owner_of_channel = false
  for (const userId in userList) {
    if (userList[userId]['user_id']['nick'] == users_Nick && userList[userId]['is_owner'])
      is_owner_of_channel = true
  }
  if (target['user_id']['nick'] === users_Name || !is_owner_of_channel) return false
  if (target['is_owner']) return false
  return true
}

const kickUser = async (KickedUserID) => {
  try {
    let url =
      process.env.VUE_APP_BACKEND_URL +
      '/usertochannel/kick/' +
      KickedUserID +
      '/from/' +
      selected_channel
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
  await getChannelsJoined()
  await getUsersInGivenChannel(selected_channel)
}

const banUser = async (bannedUserID) => {
  try {
    let url =
      process.env.VUE_APP_BACKEND_URL +
      '/usertochannel/ban/' +
      bannedUserID +
      '/from/' +
      selected_channel
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
  await getChannelsJoined()
  await getUsersInGivenChannel(selected_channel)
}

const is_already_admin = async (actionToUserID) => {
  for (const userId in usersInChannels.value) {
    if (usersInChannels.value[userId].user_id.id == actionToUserID) {
      if (!usersInChannels.value[userId].is_admin) return 'give'
      else return 'take'
    }
  }
}

const ToggleAdminUser = async (actionToUserID) => {
  let action = await is_already_admin(actionToUserID)
  console.log(await action)
  try {
    let url =
      (await process.env.VUE_APP_BACKEND_URL) +
      '/usertochannel/giveadmin/' +
      actionToUserID +
      '/on/' +
      selected_channel +
      '/' +
      action
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
  await getChannelsJoined()
  await getUsersInGivenChannel(selected_channel)
}

const MuteUser = async (userToMute) => {
  try {
    let url =
      process.env.VUE_APP_BACKEND_URL +
      '/usertochannel/mute/' +
      userToMute +
      '/from/' +
      selected_channel
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const Dmessage = async (User_ID) => {
  selectedUsers.value = []
  showModal.value = false
  side_info.value = 0
  createChannelOptions.value = false
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/privatemessage/' + User_ID
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      chooseChannel(data.id)
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const scrollToBottom = () => {
  try {
    nextTick(() => {
      let container = msgsContainer.value
      container.scrollTop = container.scrollHeight
    })
  } catch (error) {}
}

const formatTime = (timestamp) => {
  const currentTime = new Date()
  const messageTime = new Date(timestamp)
  const timeDiffMinutes = Math.floor((currentTime - messageTime) / (1000 * 60))

  if (timeDiffMinutes < 1) {
    return 'Just now'
  } else if (timeDiffMinutes < 60) {
    return `${timeDiffMinutes} mins ago`
  } else if (timeDiffMinutes < 1440) {
    const hours = Math.floor(timeDiffMinutes / 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else {
    const days = Math.floor(timeDiffMinutes / 1440)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
}

const searchQuery = () => {
  const searchTerm = searchText.value.toLowerCase().trim()
  if (searchTerm === '') search()
  else {
    const filteredChannels = channels.value.filter((channel) =>
      channel.channel_name.toLowerCase().includes(searchTerm)
    )
    const filteredUsers = users.value.filter((user) => user.nick.toLowerCase().includes(searchTerm))
    channels.value = filteredChannels
    users.value = filteredUsers
  }
}

watch(searchText, searchQuery)

const sendMessage = () => {
  if (messageText.value == '' || selected_channel == null)
    return window.alert(
      'Error: Message cannot be empty. Please enter a valid message or join channel before sending '
    )
  socket.emit('sendMessage', {
    authorId: parseInt(userId),
    message: messageText.value,
    channelId: selected_channel
  })
  messageText.value = ''
}

const search = () => {
  getUsers()
  fetchFriends()
  getChannels()
  getChannelsJoined()
  side_info.value = 3
}

const chooseChannel = (channel) => {
  showChannelOptions.value = false
  unreadMessages.value[channel] = 0
  selected_channel = channel
  getChannelsJoined()
  getMessages()
  getUsersInGivenChannel(channel)
}

const selectedUsers = ref([])

const isSelectedUser = (intraNick) => {
  return selectedUsers.value.includes(intraNick)
}

function toggleOptionSelection(event) {
  event.preventDefault()
  const option = event.target
  const selectedValue = option.value
  if (!option.selected) {
    selectedUsers.value.push(parseInt(selectedValue))
  } else {
    const index = selectedUsers.value.indexOf(parseInt(selectedValue))
    if (index !== -1) {
      selectedUsers.value.splice(index, 1)
    }
  }
}

const createChannel = async () => {
  let channel_name = channelName.value
  let channel_password = channelPassword.value
  let ch_type = channelPassword ? 2 : 1
  const pass = Md5.hashStr(channel_password)
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/channels/create'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: ch_type,
        channel_name: channel_name,
        password: pass,
        invitedusers: selectedUsers.value
      })
    })
    if (response.ok) {
      const data = await response.json()
      joinChannel(data, pass)
      chooseChannel(data.id)
      await getChannelsJoined()
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
  closeModal()
}

const moreChannelOptions = () => {
  showChannelOptions.value = !showChannelOptions.value
  getUsersInGivenChannel(selected_channel)
}

const isFriend = (friendId) => {
  return User_Friends.value.some((friendship) => {
    return friendship.id === friendId
  })
}

const isChannelJoined = (givenID) => {
  return joinedchannels.value.some((channel) => {
    return channel['channel_id']['id'] === givenID
  })
}

const fetchFriends = async () => {
  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      User_Friends.value = data
    } else {
      console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const getFriends = async () => {
  side_info.value = 1
  fetchFriends()
}

const addFriend = async (friendId) => {
  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/events/friendship_request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        requester_user: parseInt(userId),
        decider_user: parseInt(friendId),
        message: 'You have received a friend request from ' + users_Name
      })
    })
    if (response.ok) {
      const data = await response.json()
      fetchFriends()
    } else {
      if (response.status == 303) {
        window.alert('friendship request already sent!')
      } else console.log('Error:', response.status)
    }
  } catch (error) {
    console.log('Error:', error)
  }
}

const removeFriend = async (friend) => {
  if (confirm('Are you sure you want to stop being friends with ' + friend.nick + '?')) {
    try {
      const url = `${process.env.VUE_APP_BACKEND_URL}/friends/deletefriends/${userId}/${friend.id}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        fetchFriends()
      } else {
        console.log('Error:', response.status)
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }
}

onBeforeMount(() => {
  getUsers()
  getChannels()
  fetchFriends()
  getChannelsJoined()
})

socket.on('recMessage', (message) => {
  if (message.channelId === selected_channel) {
    scrollToBottom()
  } else {
    if (typeof unreadMessages.value[message.channelId] === 'undefined') {
      unreadMessages.value[message.channelId] = 0
    }
    unreadMessages.value[message.channelId]++
  }
  getMessages()
})

socket.on('notification', (Notification) => {
  getUsers()
  getChannelsJoined()
  fetchFriends()
})

watch(messages, () => {
  scrollToBottom()
})

function inviteToPrivateGame() {
  if (usersInChannels.value.length > 2) return
  console.log('Our User is ' + users_Name)
  for (const id in usersInChannels.value) {
    if (usersInChannels.value[id].user_id.id != userId) {
      console.log('OTHER USER IS ' + usersInChannels.value[id].user_id.nick)
      // socket.emit('InviteToGame', usersInChannels.value[id].user_id.id);
      let toSend = {
        player1_intra_nick: users_Name,
        player2_intra_nick: usersInChannels.value[id].user_id.intra_nick,
        opponent_id: parseInt(usersInChannels.value[id].user_id.id)
      }
      console.log(toSend)
      socket.emit('PrivateGame', toSend)
    }
  }
  // if (usersInChannels.value.length())
}

socket.on('NewGameInvite', () => {
  console.log('GOT HERE')
  route.push('/')
})
</script>

<style>
@import '../assets/Chat.css';
</style>
