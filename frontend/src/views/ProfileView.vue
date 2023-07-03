<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const userProfile = ref({
  nickname: 'John Doe',
  avatar: 'path/to/avatar.jpg',
  gamesWon: 10,
  gamesLost: 5,
  winStreak: 1,
  biggestStreak: 3,
  rank: 5,
  // Add more user profile data here
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

const isSettingsOpen = ref(false);

const updateNickname = ref(userProfile.value.nickname);
const updateAvatar = ref('');

function openSettings() {
  isSettingsOpen.value = true;
}

function saveSettings() {
  userProfile.value.nickname = updateNickname.value;
  userProfile.value.avatar = updateAvatar.value;
  //send it to backend here
  closeSettings();
}

function closeSettings() {
  isSettingsOpen.value = false;
}

function handleNewAvatar(event: Event) {
  if (event.target instanceof HTMLInputElement && event.target.files) {
    const file = event.target.files[0];
    if (file) {
      // Need to make validation for image files
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
}

// watch(() => userProfile.value.nickname, (newNickname, oldNickname) => {
//   lastGames.value.forEach((game) => {
//     if (game.user.nick === oldNickname) {
//       game.user.nick = newNickname;
//     }
//   });
// });


</script>

<template>
	<div class="profile">
    <!-- Avatar and Nick -->
    <div class="profile-header">
      <div class="avatar-container">
        <img :src="userProfile.avatar" alt="Avatar" class="avatar" />
      </div>
      <h1 class="nickname" >{{ userProfile.nickname }}</h1>
      <button @click="openSettings" class="settingsButton">Edit Profile</button>
    </div>
    <div class="profile-body">
      <!-- Statistics -->
      <div class="statistics">
	      <h2>Statistics</h2>
	      <div class="stat-board">
          <div class="stat-item">
            <div class="stat-label">Games Won</div>
            <div class="stat-value">{{ userProfile.gamesWon }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Games Lost</div>
            <div class="stat-value">{{ userProfile.gamesLost }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Win Streak</div>
            <div class="stat-value">{{ userProfile.winStreak }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Highest Streak</div>
            <div class="stat-value">{{ userProfile.biggestStreak }}</div>
          </div>
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
            <td>{{ game.user.nick }}</td>
            <td class="user-score">{{ game.user.score }}</td>
            <td class="vs">-</td>
            <td class="opponent-score">{{ game.opponent.score }}</td>
            <td>{{ game.opponent.nick }}</td>
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
          <label for="avatar" class="avatar-label">Avatar</label>
          <div class="avatar-container-settings">
            <img :src="updateAvatar || userProfile.avatar" alt="Avatar" class="avatar-settings" />
          </div>
          <input type="file" @change="handleNewAvatar($event)" id="avatar" />
        </div>
        <!-- Nickname -->
        <div class="settings-section">
          <label for="nickname">Nickname</label>
          <input v-model="updateNickname" type="text" id="nickname" />
        </div>
        <div class="modal-buttons">
          <button @click="saveSettings">Save</button>
          <button @click="closeSettings">Cancel</button>
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
}

.avatar-container {
  width: 20vw;
  height: 20vh;
  max-width: 200px;
  max-height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  border: 2px solid hsla(160, 100%, 37%, 1); /* Customize the color if needed */
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-container-settings {
  width:100px;
  height:100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid hsla(160, 100%, 37%, 1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-settings {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 2px solid hsla(160, 100%, 37%, 1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

label[for="nickname"] {
  font-weight: bold;
  margin-bottom: 8px;
}

#nickname {
  width: 100%;
  margin-bottom: 10px;
}

.nickname {
  text-align: right;
  font-size: 24px;
  color: white; /* Customize the color if needed */
}

.profile-body {
  display: flex;
  align-items: stretch;
}

.game-history {
  flex: 1;
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
  padding: 10px;
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
  color: #666666;
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

.settings-button {
  position: absolute;
  top: 10px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
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
  margin-top: 10px;
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
