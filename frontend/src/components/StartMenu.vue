<template>
  <div v-if="view1">
    <img src="../assets/racketas.svg" alt="Green Rackets" />
    <button>Join Lobby</button>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';

let view1 = ref(false)

</script>

<style>
.start-menu button {
  margin: 20px;
  /* Adjust the margin as desired */
  padding: 1.3em 3em;
  font-size: 20px;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 500;
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
  max-width: 30%;
  max-height: 30%;
  /* Set the maximum height to your desired value */
  margin: 10px;
  /*Adjust the margin as desired */
}

</style>