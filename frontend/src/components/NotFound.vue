<template>
  <div class="container">
    <div class="over-arm-text">404</div>
    <img class="arm" src="/404.svg" alt="">
  </div>
</template>

<script setup lang="ts">

let ok = 4;

</script>

<style scoped>
.container {
  margin-top: 6%;
  background-color: var(--color-background-mute);
  overflow: hidden;
}

.over-arm-text {
  position: fixed;
  font-size: 10vw;
  font-family: 'Gotham Black', sans-serif;
  font-weight: 700;
  margin-left: 15vw;
  top: 20vw;
  z-index: 2;
  color: rgb(171, 37, 53);
}

img.arm {
  width: 80vw;
  padding: 2% 3% 0% 0%;
  animation: slide-in 1s ease-in-out forwards;
}

@media (max-width: 1025px) {
  .over-arm-text {
    font-size: 80px;
    top: 12%
  }
}

@keyframes slide-in {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0%);
  }
}
</style>
