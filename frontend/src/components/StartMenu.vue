<template>
  <div class="start-menu">
    <v-card elevation="18">
      <div v-if="joinLobbyView" class="join-lobby">
        <img src="../assets/racketas.svg" alt="Green Rackets" />
        <button>Join Lobby</button>
      </div>
      <div v-else-if="choosePaddle" class="carousel">
        <PaddleCarousel></PaddleCarousel>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PaddleCarousel from './PaddleCarousel.vue'

let joinLobbyView = ref(false)
let choosePaddle = ref(true)

</script>

<style>

.v-card.elevation-18 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5%;
  width: 100%;
  height: 100%;

}

.start-menu button {
  padding: 2% 4%;
  font-size: 100%;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  color: #000;
  background-color: #fff;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

.start-menu button:hover {
  background-color: #23c483;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  color: #fff;
  transform: translateY(-7px);
}

.start-menu button:active {
  transform: translateY(-1px);
}

.start-menu img {
  width: 20%;
  margin: 5%;
}

.join-lobby {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>