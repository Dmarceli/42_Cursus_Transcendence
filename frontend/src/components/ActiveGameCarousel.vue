<template>
  <transition name ="carousel-transition">
    <div class="carousel">
      <div class="carousel-arrows">
        <font-awesome-icon class="carousel-arrow" :icon="['fas', 'circle-chevron-left']" @click="prevPage"></font-awesome-icon> 
      </div>
      <div class="carousel-container">
        <div class="carousel-item" v-for="game in currentGames" :key="game.id">
          <h3>{{ game.name }}</h3>
        </div>
      </div>
      <div class="carousel-arrows">
        <font-awesome-icon class="carousel-arrow" :icon="['fas', 'circle-chevron-right']" @click="nextPage"></font-awesome-icon> 
      </div>
      <div class="carousel-dots">
        <span
          class="carousel-dot"
          v-for="(page, index) in totalPages"
          :key="index"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
          ></span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

interface Game {
  id: number;
  name: string;
}

const games = ref<Game[]>([
  { id: 1, name: 'Game 1' },
  { id: 2, name: 'Game 2' },
  { id: 3, name: 'Game 3' },
  { id: 4, name: 'Game 4' },
  { id: 5, name: 'Game 5' },
  { id: 6, name: 'Game 6' },
  { id: 7, name: 'Game 7' },
  { id: 8, name: 'Game 8' },
  { id: 9, name: 'Game 9' },
  { id: 10, name: 'Game 10' },
]);

const gamesPerPage = 3;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(games.value.length / gamesPerPage));

const currentGames = computed(() => {
  const startIndex = (currentPage.value - 1) * gamesPerPage;
  return games.value.slice(startIndex, startIndex + gamesPerPage);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};
</script>

<style scoped>
.carousel {
  /* display: flex; */
  /* align-items: center; */
  /* justify-content: center; */
  width: 100%; 
  position: relative;
}

.carousel-container {
  display: flex;
  overflow: hidden;
}

.carousel-item {
  flex: 0 0 auto;
  width: 200px;
  height: 150px;
  border: 1px solid #ccc;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrows {
  display: flex;
  align-items: center;
}

.carousel-arrow {
  font-size: 24px;
  cursor: pointer;
  margin: 0 10px;
  color: hsla(160, 100%, 37%, 1);
  transition: color 0.3s;
}

.carousel-arrow:hover {
  opacity: 60%;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-dot.active {
  background-color: hsla(160, 100%, 37%, 1);
}

.carousel-transition-enter-active,
.carousel-transition-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.carousel-transition-enter,
.carousel-transition-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>