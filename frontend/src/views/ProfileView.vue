<script setup lang="ts">
import { ref, onBeforeMount, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import jwt_decode from 'jwt-decode';
import router from '@/router';
import NotFound from "../components/NotFound.vue";

const userTokenData = ref({
  id: 0,
  nick: '',
});

let token = getCookieValueByName('token');
const decodedToken = jwt_decode(token);
userTokenData.value.id = decodedToken.user["id"];
userTokenData.value.nick = decodedToken.user["nick"];

const userProfile = ref({
  id: 0,
  nick: '',
  intra_nick: '',
  avatar: '',
  won_games: 0,
  lost_games: 0,
  win_streak: 0,
  highest_win_streak: 0,
  rank: 0,
  TwoFAEnabled: false
});

const defaultGame = {
  id: null,
  user: {
    nick: "-",
    score: 0,
    avatar: "",
  },
  opponent: {
    nick: "-",
    score: 0,
    avatar: "",
  },
  userWon: false,
};

const lastGames = ref([
]);

let avatarUploadFile = ref<File | null>(null);
const isSettingsOpen = ref(false);
const updateNickname = ref(userProfile.value.nick);
const updateAvatar = ref('');
let inputKey = ref(0)
const route = useRoute();
const isUserBlocked = ref(false)
const isUserFriend = ref(false)
const showAlert = ref(false);
let twofaSwitch = ref('false');
let qrcode_twofa= ref('')
let profileFound = ref(true)

const usernameRegex = /^[a-zA-Z0-9._-]{0,20}$/;

const nickname = reactive({
  rules: [
    value => value.length < 20 || 'Nickname too long',
    value => usernameRegex.test(value) || 'Invalid Characters found',
  ],
});

library.add(fas);

const isOwnProfile = computed(() => {
  return userProfile.value.id === userTokenData.value.id;
});

function getCookieValueByName(name: string) {
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

const fetchUserProfile = async () => {
  let url: string
  if (route.name == 'myProfile') {
    url = process.env.VUE_APP_BACKEND_URL + '/users/getUserInfo/';
  } else {
    url = process.env.VUE_APP_BACKEND_URL + '/users/getUsers/' + route.params.intra_nick;
  }
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      userProfile.value = data;
      twofaSwitch.value = userProfile.value.TwoFAEnabled.toString()
    } else {
      profileFound.value=false
    }
  } catch (error) {
    router.replace("/")
  }
}



const fetchBlockStatus = async () => {
  if (route.name !== 'otherProfile')
    return
  let url = process.env.VUE_APP_BACKEND_URL + '/friends/blocked/';
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      isUserBlocked.value = data.some(blockedUser => blockedUser.id === userProfile.value.id);
    } else {
      // Handle the case when the request fails
      console.error('Error fetching User Profile data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching User Profile data', error);
  }
}

const fetchFriends = async () => {
  if (route.name !== 'otherProfile')
    return
  let url = process.env.VUE_APP_BACKEND_URL + '/friends/';
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      isUserFriend.value = data.some((friendUser: any) => friendUser.id === userProfile.value.id);
    } else {
      // Handle the case when the request fails
      console.error('Error fetching Friends data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching Friends data', error);
  }
}

const fetchLeaderboard = async () => {
    try {
      let url = process.env.VUE_APP_BACKEND_URL + '/users/leaderboard/'
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      let rank = data.findIndex((user: any) => user.id == userProfile.value.id)
      if (rank == -1) {
        console.error('Could not find current user in leaderboard');
        return
      }
      userProfile.value.rank = rank+1;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };


const fetchLastFiveGames = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/game-history/' + userProfile.value.id;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      for (let backendPastGame of data) {
        let opponentNick: string
        let userScore: number
        let oppponentScore: number
        let oppponentAvatar: number
        let isUserWinner = backendPastGame.user_id_winner.nick == userProfile.value.nick
        if (isUserWinner) {
          userScore = 5
          oppponentScore = backendPastGame.points
          opponentNick = backendPastGame.user_id_loser.nick
          oppponentAvatar = backendPastGame.user_id_loser.avatar
        } else {
          userScore = backendPastGame.points
          oppponentScore = 5
          opponentNick = backendPastGame.user_id_winner.nick
          oppponentAvatar = backendPastGame.user_id_winner.avatar
        }
        let pastGame = {
          id: backendPastGame.match_id,
          user: {
            nick: userProfile.value.nick,
            score: userScore,
            avatar: userProfile.value.avatar,
          },
          opponent:
          {
            nick: opponentNick,
            score: oppponentScore,
            avatar: oppponentAvatar,
          },
          userWon: isUserWinner
        }
        lastGames.value.push(pastGame)
      }
    } else {
      // Handle the case when the request fails
      console.error('Error fetching Game History data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching Game History data', error);
  }
}

onBeforeMount(async () => {
	await fetchUserProfile();
  if (profileFound.value)
  {
    await fetchBlockStatus();
    await fetchFriends();
    await fetchLeaderboard();
    await fetchLastFiveGames();
  }
});

function openSettings() {
  isSettingsOpen.value = true;
}

const handleNewAvatar = async (event: Event) => {
  const fileInput = event.target;
  if (fileInput instanceof HTMLInputElement && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
    if (!regex.test(file.name)) {
      alert("Please upload an image file");
      if (event.target)
        event.target.value = ''
      inputKey.value++
      return;
    }
    avatarUploadFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        updateAvatar.value = result;
      }
      else {
        console.error('Error reading file');
      }
    };
    reader.readAsDataURL(file);
  }
}

// // FirstComponent.vue

import { useStore } from 'vuex'


const store1 = useStore()
const emit = defineEmits(['user_dm'])

const goToSecondComponent = () => {
  router.push({ name: 'chat' }).then(() => {
    //emit('user_dm', userProfile.value.id)
    store1.commit('user_dm', userProfile.value.id)
  })
}


async function saveSettings() {
  if (!usernameRegex.test(updateNickname.value)) {
    return
  }
  let oldNick = userProfile.value.nick;
  let oldImage = userProfile.value.avatar;
  if (updateNickname.value !== '') {
    userProfile.value.nick = updateNickname.value;
  }
  let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
  try {
    const formData = new FormData();
    if (avatarUploadFile.value && regex.test(avatarUploadFile.value.name)) {
      formData.append('file', avatarUploadFile?.value);
    }
    formData.append('userId', String(userProfile.value.id));
    formData.append('nickUpdate', userProfile.value.nick);
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/users/profile", {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    let data = await response.json();
    if (response.ok) {
      updateToken();
    }
    //Caso o Nick já esteja em Uso
    else {
      userProfile.value.nick = oldNick;
      userProfile.value.avatar = oldImage;
      alert(data.message)
    }
  } catch (error) {
    console.log('Error:', error);
    userProfile.value.nick = oldNick;
    userProfile.value.avatar = oldImage;
  }
  updateAvatar.value=null
  closeSettings();
}

async function updateToken() {
  let token = getCookieValueByName('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/auth/updateToken';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      const data = await response.json();
      const newToken = data.newToken;
      document.cookie = `token=${newToken}`;
      window.location.reload();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

function closeSettings() {
  isSettingsOpen.value = false;
}

async function BlockUser() {
  try {
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/friends/block-user", {
      method: 'POST',
      body: JSON.stringify({
        'user_to_block': userProfile.value.id,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      const data = await response.json();
      isUserBlocked.value = true
      isUserFriend.value = false
    } else {
      console.log('Error during BlockUser:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}

async function UnBlockUser() {
  try {
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/friends/unblock-user", {
      method: 'POST',
      body: JSON.stringify({
        'user_to_unblock': userProfile.value.id,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      const data = await response.json();
      isUserBlocked.value = false
    } else {
      console.log('Error during UnblockUser:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}

const addFriend = async () => {
  try {
    const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/events/friendship_request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requester_user: parseInt(userTokenData.value.id), decider_user: parseInt(userProfile.value.id), message: "You have received a friend request from " + userTokenData.value.nick }),
    });
    if (response.ok) {
      const data = await response.json();
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 4000);
    } else {
      if (response.status == 303) {
        window.alert('friendship request already sent!')
      }
      else
        console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const removeFriend = async () => {
  if (confirm('Are you sure you want to stop being friends with ' + userProfile.value.nick + '?')) {
    try {
      const url = `${process.env.VUE_APP_BACKEND_URL}/friends/deletefriends/${userTokenData.value.id}/${userProfile.value.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        isUserFriend.value = false;
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }

  }
};

const twofahandling = async () => {
  if (twofaSwitch.value == 'false') {
    qrcode_twofa.value = ''
    try {
      const url = `${process.env.VUE_APP_BACKEND_URL}/auth/remove2fa`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }
    return
  }
  else {
    try {
      const url = `${process.env.VUE_APP_BACKEND_URL}/auth/gen2fa`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const img = await response.blob();
        const imageObjectURL = URL.createObjectURL(img);
        const image = document.createElement('img')
        image.src = imageObjectURL
        qrcode_twofa.value = imageObjectURL
      } else {
        console.log('Error:', response.status);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
};


</script>

<template>
 <div v-if="!profileFound">
  <NotFound></NotFound>
</div>
	<div v-else class="profile">
    <transition name="fade" mode="out-in">
      <v-alert style="position: fixed; z-index: 200; top: 20px; right: 20px; width: 300px;" v-if="showAlert"
        color="success" icon="$success" title="Success!" text="Friendship request sent successfully!"
        dismissible></v-alert>
    </transition>
    <!-- Avatar and Nick -->
    <div class="profile-header">
      <v-avatar class="avatar-container">
        <img :src="userProfile.avatar" alt="Avatar" class="avatar" :class="{ 'grey-out': isUserBlocked }" />
      </v-avatar>
      <h1 class="nickname">{{ userProfile.nick }}</h1>
      <font-awesome-icon class="settingsButton" :icon="['fas', 'gear']" style="color: #77767b;" v-if="isOwnProfile"
        @click="openSettings" />
      <div class="user-actions">
        <v-btn class="ma-2" v-if="!isOwnProfile && !isUserFriend" @click="addFriend()" color="green-darken-1">
          Add Friend <v-icon end icon="mdi-account-plus-outline"></v-icon>
        </v-btn>
        <v-btn class="ma-2" v-if="!isOwnProfile && isUserFriend" @click="removeFriend()" color="blue-grey-darken-3">
          You are Friends <v-icon end icon="mdi-star-face" color="green-darken-1"></v-icon>
        </v-btn>

        <v-btn class="ma-2" v-if="!isOwnProfile && !isUserBlocked" @click="BlockUser()" color="red-darken-4">
          Block <v-icon end icon="mdi-account-cancel-outline"></v-icon>
        </v-btn>
        <v-btn class="ma-2" v-if="!isOwnProfile && isUserBlocked" @click="UnBlockUser()" color="light-blue-lighten-2">
          Unblock <v-icon end icon="mdi-account-lock-open-outline"></v-icon>
        </v-btn>

        <v-btn class="ma-2" v-if="!isOwnProfile" @click="goToSecondComponent" color="green-darken-1">
          DM to User <v-icon end icon="mdi-email"></v-icon>
        </v-btn>
      </div>
    </div>
    <div class="profile-body">
      <!-- Statistics -->
      <h2 class="profile">Statistics</h2>
      <div class="statistics">
        <div class="stat-board">
          <div class="stat-item">
            <div class="stat-label">Games Won</div>
            <div class="stat-value">{{ userProfile.won_games }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Rank</div>
            <div class="stat-value">{{ userProfile.rank }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Games Lost</div>
            <div class="stat-value">{{ userProfile.lost_games }}</div>
          </div>
        </div>
      </div>

      <!-- Game History -->
      <template v-if=lastGames.length>
        <h2 class="profile">Recent Games</h2>
      </template>
      <div class="game-history-container">
        <div class="game-history">
          <table>
            <tbody>

              <template v-if="lastGames.length" v-for="i in 5">
                <tr v-if="i - 1 < lastGames.slice(-5).length" :key="lastGames.slice(-5)[i - 1].id"
                  :class="{ 'game-won': lastGames.slice(-5)[i - 1].userWon, 'game-lost': !lastGames.slice(-5)[i - 1].userWon }">
                  <td class="recent-game-user">
                    <div class="history-avatar-container">
                      <img :src="lastGames.slice(-5)[i - 1].user.avatar" alt="Avatar" class="history-avatar" />
                      <FontAwesomeIcon :icon="['fas', 'crown']" :style="{ color: 'gold' }" class="crown"
                        v-if="lastGames.slice(-5)[i - 1].userWon" />
                    </div>
                    <span class="history-player-nick">{{ lastGames.slice(-5)[i - 1].user.nick }}</span>
                  </td>
                  <td class="user-score">{{ lastGames.slice(-5)[i - 1].user.score }}</td>
                  <td class="vs">-</td>
                  <td class="opponent-score">{{ lastGames.slice(-5)[i - 1].opponent.score }}</td>
                  <td class="recent-game-user">
                    <div class="history-avatar-container">
                      <img :src="lastGames.slice(-5)[i - 1].opponent.avatar" alt="Avatar" class="history-avatar" />
                      <FontAwesomeIcon :icon="['fas', 'crown']" :style="{ color: 'gold' }" class="crown"
                        v-if="!lastGames.slice(-5)[i - 1].userWon" />
                    </div>
                    <span class="history-player-nick">{{ lastGames.slice(-5)[i - 1].opponent.nick }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <!-- Settings Modal -->
    <div v-if="isSettingsOpen" class="dimmed-background"></div>
    <div v-if="isSettingsOpen" class="settings">
      <div class="settings-content">
        <h2>Edit Profile</h2>
        <!-- Avatar -->
        <div class="settings-section">
          <label for="avatar" class="avatar-label"></label>
          <div class="avatar-container-settings">
            <img :src="updateAvatar || userProfile.avatar" alt="Avatar" class="avatar-settings" />
          </div>
          <input type="file" @change="handleNewAvatar" id="avatar-file" :key="inputKey" />
        </div>
        <!-- Nickname -->
        <div class="settings-section">
          <v-text-field v-model="updateNickname" label="Nickname" class="nickname-settings" :rules="nickname.rules" />
        </div>
        <!-- Enable 2 Fa -->
        <v-switch label="2FA" inset inline v-model="twofaSwitch" true-value='true' false-value='false'
          @change="twofahandling"></v-switch>
        <div v-if="twofaSwitch == 'true'">
          <img :src=qrcode_twofa>
        </div>
        <div class="modal-buttons">
          <v-btn variant="outlined" @click="saveSettings" class="save">Save</v-btn>
          <v-btn @click="closeSettings" class="cancel">Cancel</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  font-family: 'Roboto', sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid hsla(160, 100%, 37%, 1);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.v-avatar.v-avatar--density-default {
  width: 20vw;
  max-width: 200px;
  height: 20vw;
  max-height: 200px;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

@media (max-width: 760px) {
  .avatar-container {
    width: 100px;
    height: 100px;
    max-width: 100px;
    max-height: 100px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    z-index: 2;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container img {
    position: relative;
  }

  .profile-header .stat-item {
    margin-bottom: 10px;
  }

  .user-actions {
    max-width: 170px;
    margin: 0 auto;
  }
}

.avatar-container-settings {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.avatar-settings {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nickname {
  font-size: 2.5rem;
  font-weight: bold;
}

.user-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.profile-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 1%;
}

.game-history-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.game-history {
  /* flex: 1; */
  width: calc(100% - 10px);
  margin-right: 20px;
}

.history-avatar-container {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.history-avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

img.history-avatar {
  display: flex;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid white;
}

.history-player-nick {
  font-size: 100%;
  margin-left: 10px;
  display: inline-block;
  width: 3vw;
  text-align: left;
}

.crown {
  position: absolute;
  top: -5px;
  left: -5px;
  font-size: 16px;
}

.statistics {
  flex: 1;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

table {
  width: 100%;
  border-collapse: collapse;

}

.game-won {
  background-color: #47a170;
}

.game-lost {
  background-color: #c04741;
}

td {
  padding: 1vw;
  text-align: center;
  color: black;
}

.vs {
  font-weight: bold;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  color: white;
}

.user-score {
  font-weight: bold;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  color: white;
}

.opponent-score {
  font-weight: bold;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  color: white;
}

.stat-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  background-color: #162a2d;
  padding: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 20px;
  font-weight: bold;
  color: #4b8d9c;
}

.stat-value {
  font-size: 20px;
  color: rgb(203, 218, 206);
}

.settings {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  z-index: 100;
  pointer-events: auto;
}

.settings-section {
  margin-bottom: 20px;
}

.settingsButton {
  position: absolute;
  top: 10px;
  right: 20px;
  transition: all 0.2s ease-in-out;
}

.settingsButton:hover {
  color: #c0c0c0;
  transform: scale(1.2);
}

.settings-content {
  background-color: rgb(13, 24, 13);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  max-width: 400px;
  margin: 0 auto;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  align-content: space-around;
  margin-top: 10px;
}

.save {
  margin-right: 10px;
  color: #87cefa;
}

.dimmed-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

img.grey-out {
  filter: grayscale(100%) opacity(0.5);
}

h2.profile {
  color: rgb(225, 225, 225);
  text-align: left;
  padding: 10px;
  font-size: 3.5vh;
  font-weight: 600;
  padding: 1.2vw;
}

.recent-game-user {
  padding: 1.7%;
}

.default-game {
  background-color: rgb(234, 220, 192);
}</style>
