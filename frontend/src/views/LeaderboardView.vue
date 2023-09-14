<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import router from '@/router';

  let token = getCookieValueByName('token');	
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
  interface Player {
    id: number;
    name: string;
    score: number;
  }

interface Player {
  id: number;
  name: string;
  score: number;
}

// Sample leaderboard data
const leaderboard = ref<Player[]>([
  { id: 1, name: 'Player 1', score: 100 },
  { id: 2, name: 'Player 2', score: 200 },
  { id: 3, name: 'Player 3', score: 150 },
  { id: 4, name: 'Player 4', score: 150 },
  { id: 5, name: 'Player 5', score: 0 },
  { id: 6, name: 'Player 6', score: 120 },
  { id: 7, name: 'Player 7', score: 300 },
  { id: 8, name: 'Player 8', score: 50 },
  { id: 9, name: 'Player 9', score: 100 },
  { id: 10, name: 'Player 10', score: 100 },
  { id: 11, name: 'Player 11', score: 1000 }
]);

const sortLeaderboard = () => {
  leaderboard.value.sort((a, b) => b.score - a.score);
};

const selectedPlayer = ref<Player | null>(null);

const openPlayerProfile = (player: Player) => {
  selectedPlayer.value = player;
};

const closeModal = () => {
  selectedPlayer.value = null;
};

/* Code below is to fetch the leaderboard data from the API, I think... */


const fetchLeaderboard = async () => {
    try {
      let url = process.env.VUE_APP_BACKEND_URL + '/users/leaderboard/'
      const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
      const data = await response.json();
      leaderboard.value = data;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

onBeforeMount(() => {
  fetchLeaderboard();
  sortLeaderboard();
});
const top10 = computed(() => leaderboard.value.slice(0, 10));

const goToProfile = (intraNick: string) => {
  router.push("/profile/" + intraNick)
}


</script>

<template>
  <div class="leaderboard">
    <h1>Leaderboard - Top 10</h1>
    <div class="board">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in top10" :key="player.id" @click="goToProfile(player.name)">
            <td class="player-name">
              <span v-if="index === 0">🥇</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
              <span v-else>{{ index + 1 }}</span>
            </td>
            <td class="player-name" @click="goToProfile(player.name)">{{ player.name }}</td>
            <td>{{ player.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
  
<style scoped>
.leaderboard {
  text-align: center;
  font-family: 'Roboto', sans-serif;
  color: hsla(160, 100%, 37%, 1);
}

.board {
  background-color: #f8f8f8;
  border-radius: 10px;
  padding: 20px;
  margin: 20px auto;
  max-width: 80vw;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
}

th {
  background-color: hsla(160, 100%, 37%, 0.3);
  color: hsla(0, 0, 100%, 0.);
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

tr:nth-child(odd) {
  background-color: #ffffff;
}

tbody tr:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.player-name {
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.closeModal {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>
  