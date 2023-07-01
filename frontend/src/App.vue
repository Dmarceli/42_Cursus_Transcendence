<template>
  <header v-if="islogged">
    <nav>
      <RouterLink to="/">Pong</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <RouterLink to="/leaderboard">Leaderboard</RouterLink>
      <RouterLink to="/profile">User profile</RouterLink>
    </nav>
  </header>
  <div v-if="islogged">
    <RouterView />
  </div>
  <div v-else>
    <Login @clicked42="login42" @clickedgoogle="loginGoogle" />
  </div>
</template>

<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import Login from "./components/LoginPage.vue";
import { ref } from 'vue';

const islogged = ref(false);

function getCookieValueByName(name: any) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      cookie = cookie.substring(name.length + 1);
      return (cookie);
    }
  }
  return null;
}

let token = getCookieValueByName('token');

if (token) {
  if (token.substring(0, 3) === "2FA") 
    {
    const user_input = prompt("Enter the code");
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const response = fetch("http://localhost:3000/auth/check2fa", {
        method: 'POST',
        body: JSON.stringify({
          'id': payload.login,
          'code': user_input
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('Error:', error);
    }
    }
    islogged.value = true;
}

function login42() {
  window.location.href = "http://localhost:3000/auth/login";
}


function loginGoogle() {
  window.location.href = "http://localhost:3000/auth/login_google";
}


</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  display: flex;
  margin-right: 2vw;
}

nav {
  display: flex;
  width: 100%;
  font-size: 12px;
  text-align: center;
  line-height: 2.2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    place-items: center;
    padding-right: 0;
  }

  nav {
    flex-direction: column;
    text-align: left;
    margin-left: 0rem;
    font-size: 1.5rem;
  }

}
</style>
