<template>
  <div class="Chat">
    <div class="channels-list">
      <div v-if="side_info === 0">
          <div class="list-header">JOINED CHANNELS</div>
        <div v-for="joinedchannel in joinedchannels" :key="joinedchannel.id"
          :class="['channel', { 'selected': joinedchannel === selected_channel }]" @click="chooseChannel(joinedchannel.id)">
          {{ joinedchannel.channel_id.channel_name }}
          <button @click="leaveChannel(joinedchannel.id)">Leave</button>
        </div>
      </div>
      <div v-if="side_info === 1">
        <div class="list-header">FRIENDS</div>
        <div v-for="user_friend in User_Friends" :key="user_friend.id" class="tooltip">
          <div class="user">
            <span class="tooltiptext">
              Nickname: {{ user_friend.nick }}<br>
              Intra Nick: {{ user_friend.intra_nick }}<br>
              Games Won: {{ user_friend.won_games }}<br>
              Games Lost: {{ user_friend.lost_games }}<br>
            </span>
            {{ user_friend.nick }}
            <button class="friend-remove" @click="removeFriend(user_friend)"></button>
          </div>
        </div>
      </div>
      <div v-if="side_info === 2">
        <div v-if="showModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="showModal = false">&times;</span>
            <label for="channelName">Channel Name:</label>
            <input class="input-field" type="text" id="channelName" name="channelName">
            <label for="channelName">Password:</label>
            <input class="input-field" placeholder="(optional)" type="text" id="channelPassword" name="channelPassword">
            <label for="inviteUser">Invite Users:</label>
            <select class="input-field" v-model="selectedUsers" id="inviteUser" name="inviteUser" multiple>
              <option value="" disabled>Select users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.nick }}</option>
            </select>
            <button @click="createChannel()">Create</button>
          </div>
        </div>
      </div>
      <div v-if="side_info === 3" class="searchcontainer">
        <div class="list-header">USERS</div>
        <div v-for="user in users" :key="user.id" class="tooltip">
          <div class="user">
            <span class="tooltiptext">
              Nickname: {{ user.nick }}<br>
              Intra Nick: {{ user.intra_nick }}<br>
              Games Won: {{ user.won_games }}<br>
              Games Lost: {{ user.lost_games }}<br>
            </span>
            {{ user.nick }}
            <button v-if="!isFriend(user.id)" class="add-friend" @click="addFriend(user.id)"></button>
            <button v-else class="friend-remove" @click="removeFriend(user)"></button>
          </div>
        </div>
        <div class="list-header">CHANNELS LIST</div>
        <div v-for="channel in channels" :key="channel.id"
          :class="['channel', { 'selected': channel.id === selected_channel }]" @click="chooseChannel(channel.id)">
          {{ channel.channel_name }}
          <button v-if="isChannelJoined(channel.id)" @click="leaveChannel(channel.id)">Leave</button>
          <button v-else @click="joinChannel(channel.id)">join</button>
        </div>
        <form @submit.prevent="searchQuery">
          <div class="search-input-container">
            <button type="button" class="back-button" @click="side_info = 0"></button>
            <input v-model="searchText" type="text" placeholder="Search..." class="search-input">
            <button type="submit" class="send-search-button"></button>
          </div>
        </form>
      </div>
      <div class="button-container" v-if="side_info !== 3">
        <button :class="['channel-button', 'bar-button', { 'highlighted': side_info === 0 }]"
          @click="getChannelsJoined()"></button>
        <button :class="['people-button', 'bar-button', { 'highlighted': side_info === 1 }]"
          @click="getFriends()"></button>
        <button :class="['new-button', 'bar-button', { 'highlighted': side_info === 2 }]"
          @click="createChannel()"></button>
        <button :class="['search-button', 'bar-button', { 'highlighted': side_info === 3 }]" @click="search()"></button>
      </div>
    </div>
    <div id="chat-container" ref="chatContainer">
      <div id="msg-container" ref="msgsContainer">
        <div v-for="message in messages" :key="message.id" :class="[getMessageClass(message.author.nick), 'message']">
          <strong>[{{ message.author?.nick }}]:</strong> {{ message.message }}
          <div class="message-time">{{ formatTime(message.time) }}</div>
        </div>
      </div>
      <div class="msg-input">
        <form @submit.prevent="sendMessage">
          <input v-model="messageText" placeholder="Message" class="input-field">
          <button type="submit" class="send-button">Send</button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { io } from 'socket.io-client'
import { ref, onBeforeMount, watch, nextTick } from 'vue';
import jwt_decode from 'jwt-decode';

const socket = io(process.env.VUE_APP_BACKEND_URL);
const msgsContainer = ref(null);
let show_UserInfo = ref(false);
const messageText = ref('');
const searchText = ref('');
const messages = ref([]);
const channels = ref([]);
const joinedchannels = ref([]);
const users = ref([]);
let User_Friends = ref([]);
let selected_channel = null;
let side_info = ref(0);
let showModal = ref(false);



function getCookieValueByName(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      cookie = cookie.substring(name.length + 1);
      return (cookie);
    }
  }
  return null;
}
let token = getCookieValueByName('token');
const decodedToken = jwt_decode(token);
let userId = decodedToken.id;
const users_Name = decodedToken.login;


const check_user = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUsers/'
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
    } else {
      console.log('Error:', response.status);
      window.alert("User Doesn't exist")
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const getMessageClass = (author) => {
  if (author == users_Name) {
    return 'message-sent';
  }
  return 'message-received';
};


const getMessages = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/chat/msg_in_channel/' + selected_channel
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      messages.value = data;
      scrollToBottom();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const getUsers = async () => {
  side_info.value = 1;
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUsers';
    const response = await fetch(url,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    if (response.ok) {
      const data = await response.json();
      const filteredUsers = data.filter(user => user.id !== userId);
      users.value = filteredUsers;
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};



const getChannels = async () => {

  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/channels/all'
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      channels.value = data;
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};


const getChannelsJoined = async () => {
  side_info.value = 0;
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/joinedchannels'
    const response = await fetch(url,
      {
        
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    if (response.ok) {
      const data = await response.json();
      joinedchannels.value = data;
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const leaveChannel = async (channelid) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/leavechannel'
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body:  JSON.stringify({id: parseInt(channelid)})
      });
    if (response.ok) {
      getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

const joinChannel = async (channelid) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/joinchannel'
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({id: parseInt(channelid)})
      });
    if (response.ok) {
      getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}


const scrollToBottom = () => {
  try {
    nextTick(() => {
      let container = msgsContainer.value;
      container.scrollTop = container.scrollHeight;
    });
  } catch (error) {
    console.log('Error:', error);
  }
};

const formatTime = (timestamp) => {
  const currentTime = new Date();
  const messageTime = new Date(timestamp);
  const timeDiffMinutes = Math.floor((currentTime - messageTime) / (1000 * 60));

  if (timeDiffMinutes < 1) {
    return 'Just now';
  } else if (timeDiffMinutes < 60) {
    return `${timeDiffMinutes} mins ago`;
  } else if (timeDiffMinutes < 1440) {
    const hours = Math.floor(timeDiffMinutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(timeDiffMinutes / 1440);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};


const searchQuery = () => {
  const searchTerm = searchText.value.toLowerCase().trim();
  if (searchTerm === '')
    search()
  else {
    const filteredChannels = channels.value.filter(channel => channel.channel_name.toLowerCase().includes(searchTerm));
    const filteredUsers = users.value.filter(user => user.nick.toLowerCase().includes(searchTerm));
    channels.value = filteredChannels;
    users.value = filteredUsers;
  }
};

watch(searchText, searchQuery);

const sendMessage = () => {
  if (messageText.value == '' || selected_channel == null)
    return window.alert("Error: Message cannot be empty. Please enter a valid message or join channel before sending ");
  socket.emit('sendMessage', { authorId: parseInt(userId), message: messageText.value, channelId: selected_channel })
  messageText.value = '';
}

const search = () => {
  getUsers();
  getChannels()
  getChannelsJoined();
  side_info.value = 3;
}

const chooseChannel = (channel) => {
  getChannelsJoined();
  selected_channel = channel;
  getMessages();
}

const createChannel = async () => {
  getUsers();
  side_info.value = 2;
  showModal.value = true;
  let channelName = document.getElementById("channelName").value;
  let channelPassword = document.getElementById("channelPassword").value;
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/channels/create';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 1, channel_name: channelName, password: channelPassword }),
    });
    if (response.ok) {
      const data = await response.json();
      joinChannel(data.id);
      await getChannelsJoined();
      chooseChannel(data.id);
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  showModal.value = false;
};


const isFriend = (friendId) => {
  return User_Friends.value.some((friendship) => {
    return friendship.id === friendId
  });
};


const isChannelJoined = (givenID) => {
  return joinedchannels.value.some((channel) => {
    return channel['channel_id']['id'] === givenID;
  });
};



const getFriends = async () => {
  side_info.value = 1;
  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/friends`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    if (response.ok) {
      const data = await response.json();
      User_Friends.value = data;
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const addFriend = async (friendId) => {
  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/friends/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user1Id: parseInt(userId), user2Id: parseInt(friendId) }),
    });
    if (response.ok) {
      const data = await response.json();
      getFriends();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const removeFriend = async (friend) => {
  if (confirm('Are you sure you want to stop being friends with ' + friend.nick + '?')) {
    try {
      const url = `${process.env.VUE_APP_BACKEND_URL}/friends/deletefriends/${userId}/${friend.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        getFriends();
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }

  }
};

onBeforeMount(() => {
  getChannelsJoined();
  getChannels();
  getFriends();
});

socket.on('recMessage', message => {
  getMessages()
});

watch(messages, () => {
  scrollToBottom();
});


</script>


<style>
@import '../assets/Chat.css';
</style>


