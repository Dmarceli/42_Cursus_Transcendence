<template>
  <!-- <img src="blue_pearl.jpg" /> -->
  <div ref="inner" :style="moveInner" class="inner">
    <div v-for="card in cards" :key="card" class="cardiB">
      <img :src="card" />
    </div>
  </div>
  <button @click="goPrev">prev</button>
  <button @click="goNext">next</button>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';

const cards = ref(["blue_pearl.jpg", "brown_wood.jpg", "cropped_sun.png", "fishies.png", "flower_powerz.jpg"])
const moveInner = ref({})
const step = ref('')
const transitioning = ref(false)
const inner = ref(null)

function setStep() {
  const innerWidth = inner.value.scrollWidth
  const totalCards = cards.value.length
  step.value = `${innerWidth / totalCards}px`
}

function goNext() {
  if (transitioning.value) return
  transitioning.value = true

  moveLeft()
  afterTransition(() => {
    const card = cards.value.shift()
    cards.value.push(card)
    resetTranslate()
    transitioning.value = false
  })
}

function goPrev() {
  if (transitioning.value) return
  transitioning.value = true
  moveRight()
  afterTransition(() => {
    const card = cards.value.pop()
    cards.value.unshift(card)
    resetTranslate()
    transitioning.value = false
  })
}

function moveLeft() {
  moveInner.value = {
    transform: `translateX(-${step.value})
                translateX(-${step.value})`
  }
}

function moveRight() {
  moveInner.value = {
    transform: `translateX(${step.value})
                translateX(-${step.value})`
  }
}

function afterTransition(callback) {
  const listener = () => {
    callback()
    inner.value.removeEventListener('transitionend', listener)
  }
  inner.value.addEventListener('transitionend', listener)
}

function resetTranslate() {
  moveInner.value = {
    transition: 'none',
    transform: `translateX(-${step.value})`
  }
}

onMounted(() => {
  setStep()
  resetTranslate()
})

</script>

<style>


.inner {
  transition: transform 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cardiB {
  width: 80px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* optional */
button {
  margin-right: 5px;
  margin-top: 10px;
}

img {
  transform: rotate(90deg);
  height: 60px;
}

</style>