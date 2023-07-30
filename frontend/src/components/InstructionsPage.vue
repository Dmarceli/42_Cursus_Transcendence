<template>

    <v-dialog
      v-model="props.dialog"
      width="auto"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="" dialog = false">Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import { ref } from 'vue';

// define emits

let props = defineProps<{
  dialog: boolean
}>()

</script>

<style>

button.start-menu {
  padding: 2% 4%;
  font-size: 100%;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  color: #fff;
  background-color: #e91e63;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

.start-menu button:hover {
  background-color: #fff;
  box-shadow: 0px 15px 20px rgba(255, 255, 255, 0.4);
  color: #e91e63;
  transform: translateY(-7px);
}

.start-menu button:active {
  transform: translateY(-1px);
}

button.play-game {
  margin-top: 1%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>