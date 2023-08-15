<script setup lang="ts">
import { ref,onBeforeMount, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import jwt_decode from 'jwt-decode';



library.add(fas);

const userTokenData = ref({
	id: 0,
	intra_nick: '',
});

let token = getCookieValueByName('token');
const decodedToken = jwt_decode(token);
userTokenData.value.id = decodedToken.user["id"];

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
  // Add more user profile data here
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


let avatarUploadFile = ref<File|null>(null);

const isOwnProfile = computed(() => {
	return userProfile.value.id === userTokenData.value.id;
});

const route = useRoute();

const fetchUserProfile = async () => {
	try {
		let url = process.env.VUE_APP_BACKEND_URL + '/users/getUserInfo/';
		const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      userProfile.value = data;
    } else {
      // Handle the case when the request fails
      console.error('Error fetching User Profile data:', response.statusText);
    }
	} catch (error) {
		console.error('Error fetching User Profile data', error);
	}
}

onBeforeMount(() => {
	fetchUserProfile();
});

const lastGames = ref([
  { id: 1, user: { nick: 'JohnDoe', score: 10 }, opponent: { nick: 'JaneSmith', score: 8 }, userWon: true },
  { id: 3, user: { nick: 'JohnDoe', score: 12 }, opponent: { nick: 'SarahLee', score: 9 }, userWon: true },
  { id: 2, user: { nick: 'JohnDoe', score: 5 }, opponent: { nick: 'MikeJohnson', score: 7 }, userWon: false },
  { id: 4, user: { nick: 'JohnDoe', score: 9 }, opponent: { nick: 'DavidBrown', score: 10 }, userWon: false },
  { id: 5, user: { nick: 'JohnDoe', score: 8 }, opponent: { nick: 'EmilyDavis', score: 6 }, userWon: true },
  { id: 6, user: { nick: 'JohnDoe', score: 11 }, opponent: { nick: 'RobertMiller', score: 12 }, userWon: false },
  { id: 7, user: { nick: 'JohnDoe', score: 10 }, opponent: { nick: 'JamesWilson', score: 8 }, userWon: true },
  { id: 8, user: { nick: 'JohnDoe', score: 7 }, opponent: { nick: 'LisaMoore', score: 9 }, userWon: false },
  { id: 9, user: { nick: 'JohnDoe', score: 9 }, opponent: { nick: 'MarkTaylor', score: 11 }, userWon: false },
  // Add more game data here
]);

const getPlayerAvatar = (playerNick: string) => {
  if (playerNick === userProfile.value.nick) {
    return userProfile.value.avatar;
  }
  return '';
}
const isSettingsOpen = ref(false);

const updateNickname = ref(userProfile.value.nick);
const updateAvatar = ref('');
let inputKey=ref(0)

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


async function saveSettings() {	
  if (!usernameRegex.test(updateNickname.value)){
    return
  }
	if (updateNickname.value !== ''){
    userProfile.value.nick = updateNickname.value;
  }
  let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
    try {
      const formData = new FormData();
      if (avatarUploadFile.value && regex.test(avatarUploadFile.value.name)) {
        formData.append('file', avatarUploadFile?.value );
      }
      formData.append('userId', String(userProfile.value.id));
      formData.append('nickUpdate', userProfile.value.nick);
      const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/users/profile", {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        let data = await response.json();
        console.log("NEW URL "+data.newAvatar);
      }
    } catch(error) {
        console.log('Error:', error);
      }
  closeSettings();
}

const usernameRegex = /^[a-zA-Z0-9._-]{0,20}$/;

const nickname = reactive({
	rules: [
		value => value.length < 20 || 'Nickname too long',
		value => usernameRegex.test(value) || 'Invalid Characters found',
	],
});

function closeSettings() {
  isSettingsOpen.value = false;
}


</script>

<template>
	<div class="profile">
    <!-- Avatar and Nick -->
    <div class="profile-header">
      <v-avatar class="avatar-container">
        <img :src="userProfile.avatar" alt="Avatar" class="avatar" />
			</v-avatar>
      <h1 class="nickname" >{{ userProfile.nick }}</h1>
      <font-awesome-icon class="settingsButton" :icon="['fas', 'gear']" style="color: #77767b;" v-if="isOwnProfile" @click="openSettings" />
			<div class="user-actions">
					<v-btn class="ma-2 blockBtn" color="red-darken-4">
						Block User<v-icon end icon="mdi-account-cancel-outline"></v-icon>
					</v-btn>
					<v-btn class="ma-2 chatInviteBtn" color="green">
						Invite to chat<v-icon end icon="mdi-email"></v-icon>
					</v-btn>
			</div>
    </div>
    <div class="profile-body">
      <!-- Statistics -->
      <div class="statistics">
	      <h2>Statistics</h2>
	      <div class="stat-board">
          <div class="stat-item">
            <div class="stat-label">Games Won</div>
            <div class="stat-value">{{ userProfile.won_games }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Games Lost</div>
            <div class="stat-value">{{ userProfile.lost_games }}</div>
          </div>
          <!-- <div class="stat-item">
            <div class="stat-label">Win Streak</div>
            <div class="stat-value">{{ userProfile.win_streak }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Highest Streak</div>
            <div class="stat-value">{{ userProfile.highest_win_streak }}</div>
          </div> -->
          <div class="stat-item stat-rank">
            <div class="stat-label">Rank</div>
            <div class="stat-value">{{ userProfile.rank }}</div>
          </div>
        </div>
	    </div>

      <!-- Game History -->
	    <div class="game-history">
	    <h2>Last 5 games:</h2>
      <table>
        <tbody>
          <tr v-for="game in lastGames.slice(-5)" :key="game.id" :class="{'game-won': game.userWon, 'game-lost': !game.userWon}">
            <td>
              <div class="history-avatar-container">
                <img :src="getPlayerAvatar(game.user.nick)" alt="Avatar" class="history-avatar" />
                <FontAwesomeIcon :icon="['fas', 'crown']" :style="{color: 'gold'}" class="crown" v-if="game.userWon" />
              </div>
              <span class="history-player-nick">{{ game.user.nick }}</span>
            </td>
            <td class="user-score">{{ game.user.score }}</td>
            <td class="vs">-</td>
            <td class="opponent-score">{{ game.opponent.score }}</td>
            <td>
              <div class="history-avatar-container">
                <img :src="getPlayerAvatar(game.opponent.nick)" alt="Avatar" class="history-avatar" />
                <FontAwesomeIcon :icon="['fas', 'crown']" :style="{color: 'gold'}" class="crown" v-if="!game.userWon" />
              </div>
              <span class="history-player-nick">{{ game.opponent.nick }}</span>
            </td>
          </tr>
        </tbody>
      </table>
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
          <input type="file" @change="handleNewAvatar" id="avatar-file" :key="inputKey"/>
        </div>
        <!-- Nickname -->
        <div class="settings-section">
					<v-text-field v-model="updateNickname" label="Nickname" class="nickname-settings" :rules="nickname.rules"/>
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
  margin-bottom: 20px;
  border: 2px solid hsla(160, 100%, 37%, 1);  padding: 20px;
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
  width:100px;
  height:100px;
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
}

@media (max-width: 760px) {
  .avatar-container {
    width: 100px;
    height: 100px;
    max-width: 100px;
    max-height: 100px;
    margin-left: auto;
    margin-right: auto;
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
  width:100px;
  height:100px;
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

/* .avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
} */

label[for="nickname"] {
  font-weight: bold;
  margin-bottom: 8px;
}

#nickname {
  width: 100%;
  margin-bottom: 10px;
}

.nickname {
  font-size: 2.5rem;
	font-weight: bold;
  color: white; /* Customize the color if needed */
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
  align-items: stretch;
}

.game-history {
  flex: 1;
}

.history-avatar-container {
  display: inline-block;
  position: relative;
  border-radius: 50%;
  border: 1px solid white;
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

.history-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}

.history-player-nick {
  font-size: 16px;
  margin-left: 10px;
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
  background-color: #87cefa;
}

.game-lost {
  background-color: #ff7f7f;
}

td {
  padding: 5px;
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
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px;
  background-color: #f1f1f1;
  padding: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-rank {
  grid-column: 1 / span 2;
  align-items: center;
}
.stat-label {
  font-weight: bold;
  color: #333333;
}

.stat-value {
  font-size: 24px;
  color: black;
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
  transition: all 0.2s ease-in-out; /* Add a smooth transition on hover */
}


.settingsButton:hover {
  color: #c0c0c0; /* Change the color when hovering */
  transform: scale(1.2); /* Make the icon 20% bigger on hover */
}

.settings-open {
  pointer-events: none;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(150, 81, 81, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
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

</style>
