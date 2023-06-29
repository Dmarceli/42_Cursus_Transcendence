<script setup lang="ts">
	import { ref, computed } from 'vue';
  	
	// Sample leaderboard data
	const leaderboard = ref([
	{ id: 1, name: 'Player 1', score: 100 },
	{ id: 2, name: 'Player 2', score: 200 },
	{ id: 3, name: 'Player 3', score: 150 },
	{ id: 3, name: 'Player 4', score: 150 },
	]);

  const sortLeaderboard = () => {
    leaderboard.value.sort((a, b) => b.score - a.score);
  };

  sortLeaderboard();
</script>

<template>
	<div class="leaderboard">
	  <h1>Leaderboard</h1>
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
          <tr v-for="(player, index) in leaderboard" :key="player.id">
		  	    <td>{{ index + 1 }}</td>
		  	    <td>{{ player.name }}</td>
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

.leaderboard-container {
  background-color: var(--vt-c-white-soft);
  border-radius: 10px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  font-weight: bold;
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
  background-color: var(--vt-c-white-mute);
  font-weight: bold;
  color: var(--vt-c-text-dark-1);
}

tr:nth-child(even) {
  background-color: var(--vt-c-white-mute);
}

tr:nth-child(odd) {
  background-color: var(--vt-c-white);
}

tbody tr:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}
  </style>
  