<script setup lang="ts">
import { ref, computed } from 'vue';

const userProfile = ref({
  nickname: 'John Doe',
  avatar: 'path/to/avatar.jpg',
  gamesWon: 10,
  gamesLost: 5,
  winStreak: 3,
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
</script>

<template>
	<div class="profile">
    <!-- Avatar and Nick -->
    <div class="profile-header">
      <div class="avatar-container">
        <img :src="userProfile.avatar" alt="Avatar" class="avatar" />
      </div>
      <h1 class="nickname" >{{ userProfile.nickname }}</h1>
    </div>
    <div class="profile-body">
      <!-- Statistics -->
      <div class="statistics">
	      <h2>Statistics</h2>
	      <p>Games Won: {{ userProfile.gamesWon }}</p>
	      <p>Games Lost: {{ userProfile.gamesLost }}</p>
	      <p>Win Streak: {{ userProfile.winStreak }}</p>
	      <!-- Add more statistics here -->
	    </div>

      <!-- Game History -->
	    <div class="game-history">
	    <h2>Last 5 games:</h2>
      <table>
        <tbody>
          <tr v-for="game in lastGames.slice(-5)" :key="game.id" :class="{'game-won': game.userWon, 'game-lost': !game.userWon}">
            <td>{{ game.user.nick }} ({{ game.user.score }})</td>
            <td class="vs">vs</td>
            <td>({{ game.opponent.score }}) {{ game.opponent.nick }}</td>
          </tr>
        </tbody>
      </table>
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
}

.profile-header {
  display: flex;
  align-items: center;
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

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nickname {
  text-align: right;
  font-size: 24px;
  color: white; /* Customize the color if needed */
}

.profile-body {
  display: flex;
  flex-direction: space-between;
  align-items: center;
}

.statistics {
  flex: 1;
  margin-right: 20px;
}

.game-history {
  flex: 1;
  margin-top: 20px;
}

.game-won {
  background-color: #87cefa;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);}

.game-lost {
  background-color: #ff7f7f;
  border-color: #d44d4d;
}

.vs {
  font-weight: bold;
  text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
}

td {
  padding: 10px;
  text-align: center;
  border: 2px solid transparent;
  border-radius: 5px;
  color: white;
}

</style>
