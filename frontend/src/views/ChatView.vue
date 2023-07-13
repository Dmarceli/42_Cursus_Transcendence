<template>
  <div class="Chat">
	<div class="channels-list" :class="{'collapsed': !showSideInfo}">
      <div v-if="side_info === 0">
        <div class="list-header">JOINED CHANNELS</div>
        <div v-for="joinedchannel in joinedchannels" :key="joinedchannel.id"
          :class="['channel', { 'selected': joinedchannel.channel_id.id === selected_channel }]"
          @click="chooseChannel(joinedchannel.channel_id.id)">
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
            <select class="input-field"  id="inviteUser" name="inviteUser" multiple>
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
            <button  class="direct-message" @click="Dmessage(user.id)">DM</button>
            <button v-if="!isFriend(user.id)" class="add-friend" @click="addFriend(user.id)"></button>
            <button v-else class="friend-remove" @click="removeFriend(user)"></button>
          </div>
        </div>
        <div class="list-header">CHANNELS LIST</div>
        <div v-for="channel in channels" :key="channel.id"
          :class="['channel', { 'selected': channel.id === selected_channel }]">
          {{ channel.channel_name }}
          <button v-if="!isChannelJoined(channel.id)" @click="joinChannel(channel)">join</button>
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
          @click="getChannelsJoined(); side_info = 0"></button>
        <button :class="['people-button', 'bar-button', { 'highlighted': side_info === 1 }]"
          @click="getFriends()"></button>
        <button :class="['new-button', 'bar-button', { 'highlighted': side_info === 2 }]"
          @click="enableModal()"></button>
        <button :class="['search-button', 'bar-button', { 'highlighted': side_info === 3 }]" @click="search()"></button>
      </div>
    </div>
    <div id="chat-container" ref="chatContainer">
	<div class="chat-container-header">
		<button :class="['hamburguer-button', {'full-hamburguer-button': showSideInfo}]" @click="toggleChannelList"></button>
      	<div v-if="selected_channel" class="channel-name">{{ getChannelName(selected_channel) }}
        <button class="more-options" :class="{'more-options close-moreoptions': showChannelOptions}" @click="moreChannelOptions()"></button>
      </div>
	</div>
      <div v-if="showChannelOptions">
        <div id="user-list-container">
          <h2 class="userHeader">{{ getChannelUserCount(usersInChannels) }}  Users in {{ getChannelName(selected_channel) }}</h2>
          <div class="usersInChannel" v-for="usersInChannel in usersInChannels" :key="usersInChannels.id">
            <img :src="usersInChannel.user_id.avatar" alt="UserAvatar" class="user-avatar">
            <div class="adminCommands" v-if="isUserMorePowerful(usersInChannels, usersInChannel)"> 
              <button @click="kickUser(usersInChannel.user_id.id)">Kick</button>
              <button @click="banUser(usersInChannel.user_id.id)">Ban</button>
              <button @click="MuteUser(usersInChannel.user_id.id)">Mute</button>
              <button @click="ToggleAdminUser(usersInChannel.user_id.id)">Toggle Admin Access</button>
            </div>
            {{ usersInChannel.user_id.intra_nick }}
          </div>
          </div>
        <button class="leave-button" @click="leaveChannel(selected_channel)"></button>
      </div>
      <div v-else id="msg-container" ref="msgsContainer">
        <div v-for="message in messages" :key="message.id" :class="[getMessageClass(message.author.nick), 'message']">
          <strong>[{{ message.author?.nick }}]:</strong> {{ message.message }}
          <div class="message-time">{{ formatTime(message.time) }}</div>
        </div>
      </div>
      <div v-if="!showChannelOptions && !isUserMutedOnChannel(usersInChannels)" class="msg-input">
        <form class="submitform" @submit.prevent="sendMessage">
          <input v-model="messageText" placeholder="Message" class="input-field">
          <button type="submit" class="send-button">Send</button>
        </form>
      </div>
      <div style="color: red;text-align: center;" v-if="isUserMutedOnChannel(usersInChannels) && !showChannelOptions">YOU ARE MUTED</div>
    </div>
  </div>
</template>


<script setup>
import socket from '../socket'
import { ref, onBeforeMount, watch, nextTick } from 'vue';
import jwt_decode from 'jwt-decode';
import {Md5} from 'ts-md5';

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
const unreadMessages = ref([]);
let showChannelOptions = ref(false);

let showSideInfo = ref(true);

function toggleChannelList() {
	showSideInfo.value = !showSideInfo.value;
}

function enableModal() {
  getUsers();
  side_info.value = 2;
  showModal.value = true
}

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
const users_Name =  decodedToken.user['nick'];


const getChannelType = (channelID) => {
	const channel = joinedchannels.value.find((joinedchannel) => joinedchannel.channel_id.id === channelID)
	console.log(channel.type);
}

const getChannelName = (channelId) => {
 	const channel = joinedchannels.value.find((joinedchannel) => joinedchannel.channel_id.id === channelId);
	if(channel['channel_id']['type'] == 0)
	{
		const channelname = channel['channel_id']['channel_name'];
		const user1ID = channelname.split('-')[0];
		const user2ID = channelname.split('-')[1];
		const pmwith = user1ID == userId ? user2ID : user1ID;
	    const user = users.value.find((user) => user.id === parseInt(pmwith));
		return user.intra_nick;
	}
  	return channel ? channel.channel_id.channel_name : '';
};

const  getChannelUserCount  = (channel) => {
console.log(channel)
  return channel.length
}

const isUserMutedOnChannel = (userList) => {
  for (const userId in userList) {
    const entry = userList[userId];
    if (entry['user_id']['nick'] === users_Name) {
      if(entry['is_muted'])
        return true
      else
        return false
    }
  }
  return false
}

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
  if (selected_channel) {
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
  }
};

const getUsers = async () => {
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

const usersInChannels = ref([]);
const getUsersInGivenChannel = async (channel_ID) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/usersinchannel/' + channel_ID;
    const response = await fetch(url,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      const data = await response.json();
      usersInChannels.value = data;
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
    const response = await fetch(url,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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
  if(confirm("Are you sure you wanto to leave this channel?"))
  {
    try {
      let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/leavechannel'
      const response = await fetch(url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: parseInt(channelid) })
        });
      if (response.ok) {
        await getChannelsJoined();
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }
    selected_channel = null;
    showChannelOptions.value = !showChannelOptions.value;
    messages.value = null;
    await getChannelsJoined();
  }
}

const joinChannel = async (channel, ownerPWD) => {
  let pass = ownerPWD
  if(channel.type == 2 && !ownerPWD){
    let input = await window.prompt("Channel Password:");
    pass = Md5.hashStr(input);
  }
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/joinchannel'
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: parseInt(channel.id) , pass: pass })
      });
    if (response.ok) {
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  await getChannelsJoined();

}

// ADMIN COMMANDS \\


const isUserMorePowerful = (userList, target) => {
  for (const userId in userList) {
    if(target['user_id']['nick'] === users_Name)
      return false;
    const entry = userList[userId];
    if (entry['user_id']['nick'] === users_Name) {
      if(entry['is_owner'])
        return true
      else if (entry['is_admin'])
      {
        if(target['is_owner']){
          return false
        }
        else {
          return true
        }
      }
    }
  }
  return false
}


const kickUser = async (KickedUserID) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/kick/' + KickedUserID + '/from/' +  selected_channel
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  await getChannelsJoined();
  await getUsersInGivenChannel(selected_channel)
}

const banUser = async (bannedUserID) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/ban/' + bannedUserID + '/from/' +  selected_channel
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  await getChannelsJoined();
  await getUsersInGivenChannel(selected_channel)
}

const is_already_admin = async(actionToUserID) => {
  for (const userId in usersInChannels.value) {
    if(usersInChannels.value[userId].user_id.id == actionToUserID){
     if(!usersInChannels.value[userId].is_admin)
        return "give"
     else
        return "take"
    }
  }
}

const ToggleAdminUser = async (actionToUserID) => {
  let action = await is_already_admin(actionToUserID)
  console.log(await action)
  try {
    
    let url = await process.env.VUE_APP_BACKEND_URL + '/usertochannel/giveadmin/' + actionToUserID + '/on/' +  selected_channel + "/" + action
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  await getChannelsJoined();
  await getUsersInGivenChannel(selected_channel)
}

const MuteUser  = async (userToMute) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/mute/' + userToMute + '/from/' +  selected_channel
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}


const Dmessage = async (User_ID) => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/usertochannel/privatemessage/' + User_ID;
    const response = await fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    if (response.ok) {
      const data = await response.json();
      chooseChannel(data.id)
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const scrollToBottom = () => {
  try {
    nextTick(() => {
      let container = msgsContainer.value;
      container.scrollTop = container.scrollHeight;
    });
  } catch (error) {
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
  selected_channel = channel;
  unreadMessages.value[channel] = 0;
  getChannelsJoined();
  getMessages();
  getUsersInGivenChannel(channel)
}

const createChannel = async () => {
  
  let channelName = document.getElementById("channelName").value;
  let channelPassword = document.getElementById("channelPassword").value;
  let ch_type = channelPassword ? 2 : 1;
  const pass = Md5.hashStr(channelPassword);
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/channels/create';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: ch_type, channel_name: channelName, password: pass}),
    });
    if (response.ok) {
      const data = await response.json();
      joinChannel(data, pass);
      chooseChannel(data.id);
      await getChannelsJoined();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
  showModal.value = false;
};

const moreChannelOptions = () => {
  showChannelOptions.value = !showChannelOptions.value;
  getUsersInGivenChannel(selected_channel);
}


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
        'Authorization': `Bearer ${token}`
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
	getUsers();	
	getChannelsJoined();
	getChannels();
	getFriends();
});

socket.on('recMessage', message => {
  if (message.channelId === selected_channel) {
    scrollToBottom();
  } else {
    if (typeof unreadMessages.value[message.channelId] === 'undefined') {
      unreadMessages.value[message.channelId] = 0;
    }
    unreadMessages.value[message.channelId]++;
  }
  getMessages();
});


watch(messages, () => {
  scrollToBottom();
});


</script>


<style>
@import '../assets/Chat.css';
</style>


