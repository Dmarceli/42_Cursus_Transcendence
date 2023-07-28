<template>
  <div>
    <v-carousel :show-arrows="true" :hide-delimiters="true" v-model="model" style="height: 100%">
      <template v-slot:prev="{ props }">
        <v-btn class="choosePaddle" variant="elevated" color="pink" @click="props.onClick"
          >Previous</v-btn
        >
      </template>

      <template v-slot:next="{ props }">
        <v-btn class="choosePaddle" variant="elevated" color="pink" @click="props.onClick"
          >Next</v-btn
        >
      </template>

      <v-carousel-item :content-class="'cardClass'" v-for="(item, i) in items" :key="i">
        <img :src="item.src" class="cardClass" />
      </v-carousel-item>
    </v-carousel>
    <v-card-actions>
      <v-btn class="choosePaddle" variant="outlined" block @click="selectPaddle"
        >Choose Paddle</v-btn
      >
    </v-card-actions>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'

interface Emits {
  (e: 'chosePaddle', skinPaddlePath: string): void
}
const emit = defineEmits<Emits>()

const model: Ref<number> = ref(0)

const items = [
  {
    src: 'game_paddles/blue_pearl.jpg'
  },
  {
    src: 'game_paddles/brown_wood.jpg'
  },
  {
    src: 'game_paddles/cropped_sun.png'
  },
  {
    src: 'game_paddles/fishies.png'
  },
  {
    src: 'game_paddles/flower_powerz.jpg'
  },
  {
    src: 'game_paddles/houses.jpg'
  },
  {
    src: 'game_paddles/paddle_rainbow.jpg'
  },
  {
    src: 'game_paddles/peas_paddle.png'
  },
  {
    src: 'game_paddles/space_ship.png'
  },
  {
    src: 'game_paddles/xing_ong.jpg'
  }
]

function selectPaddle() {
  emit('chosePaddle', items[model.value].src)
}
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

button.v-btn.choosePaddle {
  height: 3vw;
  width: 10vw;
  font-size: 1vw;
}
</style>
