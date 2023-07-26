<template>
  <div>
    <v-carousel :show-arrows="true" :hide-delimiters="true" v-model="model">

      <template v-slot:prev="{ props }">
        <v-btn variant="elevated" color="pink" @click="props.onClick">Previous</v-btn>
      </template>

      <template v-slot:next="{ props }">
        <v-btn variant="elevated" color="pink" @click="props.onClick">Next</v-btn>
      </template>

      <v-carousel-item :content-class="'cardClass'" v-for="(item, i) in items" :key="i">
        <img :src="item.src" class="cardClass" />
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';

const model = ref(0)

let items = ref([
  {
    src: "game_paddles/blue_pearl.jpg"
  },
  {
    src: "game_paddles/brown_wood.jpg"
  },
  {
    src: "game_paddles/cropped_sun.png"
  },
  {
    src: "game_paddles/fishies.png"
  },
  {
    src: "game_paddles/flower_powerz.jpg"
  },
  {
    src: "game_paddles/houses.jpg"
  },
  {
    src: "game_paddles/paddle_rainbow.jpg"
  },
  {
    src: "game_paddles/peas_paddle.png"
  },
  {
    src: "game_paddles/space_ship.png"
  },
  {
    src: "game_paddles/xing_ong.jpg"
  }
])


</script>

<style>
.cardClass {
  display: flex;
  justify-content: center;
}

img.cardClass {
  transform: rotate(90deg);
  height: 24vw;
  width: 4vw;
}

v-carousel-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>