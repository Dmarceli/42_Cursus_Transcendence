<template>
  <div class="start-menu" v-if="view1">
    <v-card class="checks" elevation="18">
      <img src="../assets/racketas.svg" alt="Green Rackets" />
      <button>Join Lobby</button>
    </v-card>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';

let view1 = ref(true)

</script>

<style>
@media (min-width: 1024px) {
  .v-card.elevation-18 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200%;
    padding-right: 300%;
    padding-left: 300%;
  }
}

.v-card.elevation-18 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 35%;
    padding: 150%;
    padding-right: 300%;
    padding-left: 300%;
  }

.start-menu button {
  margin: 30%;
  padding: 1em 2em;
  font-size: 0.7rem;
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
  max-width: 70%;
  max-height: 20%;
  margin: 30%;
  ;
  padding: 5%;
}
</style>