<template>
  <div class="container">
    <div class="grid">
      <div class="text">404</div>
    </div>
  </div>
</template>

<script setup lang="ts">


</script>

<style scoped>


.container {
  background-image: url('404.png');
  background-size: cover;
  background-position: center;
  height: 80vh;
  display: flex;
  flex-direction: column;
  margin-top: 6%;
}

.grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-template-rows: 2fr 1fr;
  justify-items: center;
  align-items: center;
}

.text {
  color: rgb(195, 68, 68);
  font-size: 17vh;
  font-family: 'HKGroteskRegular', serif;
  font-style: normal;
  font-weight: normal;
}

</style>
