<template>
  <transition name="carousel-transition">
    <div class="carousel">
      <div class="carousel-container">
        <div class="carousel-arrows" :class="{ 'arrows-top': isSmallScreen }">
          <font-awesome-icon class="carousel-arrow carousel-arrow-left" :icon="['fas', 'circle-chevron-left']"
            @click="prevPage"></font-awesome-icon>
          <font-awesome-icon class="carousel-arrow carousel-arrow-right" :icon="['fas', 'circle-chevron-right']"
            @click="nextPage"></font-awesome-icon>
        </div>
        <div class="carousel-items-container">
          <div class="carousel-items" :class="{ 'column-layout': isSmallScreen }">
            <div class="carousel-item" v-for="game in currentGames" :key="game.id">
              <h3>{{ game.name }}</h3>
            </div>
          </div>
        </div>
      </div>
      <div class="carousel-dots" v-if="!isSmallScreen">
        <span class="carousel-dot" v-for="(page, index) in totalPages" :key="index"
          :class="{ active: currentPage === page }" @click="goToPage(page)"></span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

const totalPages = 3;

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
  if (currentPage.value < totalPages) {
    currentPage.value++;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};

const isSmallScreen = ref(window.innerWidth <= 768);

const handleResize = () => {
  isSmallScreen.value = window.innerWidth <= 768;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<style scoped>
.carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.carousel-container {
  position: relative;
  width: 100%;
}

.carousel-items {
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.carousel-item {
  flex: 0 0 auto;
  width: 200px;
  height: 150px;
  border: 1px solid #ccc;
  background-color: #555;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-arrows {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
  margin-bottom: 10px;
}

.carousel-arrow {
  font-size: 24px;
  cursor: pointer;
  color: var(--main-color);
  transition: color 0.3s;
}

.carousel-arrow-left {
  left: 0;
}

.carousel-arrow.right {
  right: 0;
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
  background-color: var(--main-color);
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

@media (max-width: 786px) {
  .carousel-arrows {
    padding: 0 10px;
    flex-direction: column;
    align-items: center;
  }

  .carousel-items-container {
    flex-direction: column;
    align-items: center;
  }

  .carousel-items {
    justify-content: flex-start;
  }

  .carousel-item {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .carousel-dots {
    display: none;
  }
}
</style>