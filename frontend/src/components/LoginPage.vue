<template>
  <div class="loginpage">
    <div class="welcome">
      <h1>Welcome to Raquetas</h1>
      <button class="button" @click="button42">Login with 42</button>
    </div>
  </div>
</template>

<script setup lang="ts">

import { mergeProps, ref } from 'vue'
let id_to_login_form = ref(0);


const emit = defineEmits(['clicked42', 'clickedgoogle', 'id_to_login'])

function buttonGoogle() {
  emit('clickedgoogle')
}
function button42() {
  emit('clicked42')
}
function buttonBYPASS_TEMP() {
  emit('id_to_login', id_to_login_form.value)
}

</script>

<style>


.loginpage {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 rem;
  margin: 0;
  height: 100vh;
  width: 100vw;
}

.button {
  background-color: #c2fbd7;
  border-radius: 100px;
  box-shadow: rgba(44, 187, 99, 0.2) 0 -25px 18px -14px inset, rgba(44, 187, 99, 0.15) 0 1px 2px,
    rgba(44, 187, 99, 0.15) 0 2px 4px, rgba(44, 187, 99, 0.15) 0 4px 8px,
    rgba(44, 187, 99, 0.15) 0 8px 16px, rgba(44, 187, 99, 0.15) 0 16px 32px;
  color: green;
  cursor: pointer;
  display: flex;
  font-family: CerebriSans-Regular, -apple-system, system-ui, Roboto, sans-serif;
  padding: 7px 20px;
  text-align: center;
  text-decoration: none;
  transition: all 250ms;
  border: 0;
  font-size: 16px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  width: 200px;
  height: 40px;
  margin-top: 1rem;
}

.button:hover {
  box-shadow: rgba(44, 187, 99, 0.35) 0 -25px 18px -14px inset, rgba(44, 187, 99, 0.25) 0 1px 2px,
    rgba(44, 187, 99, 0.25) 0 2px 4px, rgba(44, 187, 99, 0.25) 0 4px 8px,
    rgba(44, 187, 99, 0.25) 0 8px 16px, rgba(44, 187, 99, 0.25) 0 16px 32px;
  transform: scale(1.05) rotate(-1deg);
}

.welcome {
  display: flex;
  text-align: center;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
