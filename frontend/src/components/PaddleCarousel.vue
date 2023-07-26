<template>
  <v-carousel :show-arrows="true" :hide-delimiters="true">
    <v-carousel-item :content-class="'cardClass'" v-for="(item, i) in items" :key="i">
      <img :src="item.src" class="cardClass" />
    </v-carousel-item>
  </v-carousel>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';

let items = ref([
  {
    src: 'blue_pearl.jpg',
  },
  {
    src: 'brown_wood.jpg',
  },
  {
    src: 'cropped_sun.png',
  }])

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