<template>
  <h1>Waiting for other players{{ ellipsis }}</h1>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

let ellipsis = ref("")

onMounted(() => {
  setInterval(() => {
    if (ellipsis.value.length < 3)
      {
        ellipsis.value +="."
      }
    else
        ellipsis.value =""
    }, 800);
})

</script>

<style>
</style>
