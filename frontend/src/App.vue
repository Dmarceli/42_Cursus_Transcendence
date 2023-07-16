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
    <Login @clicked42="login42" @clickedgoogle="loginGoogle" @clickedBYPASS="loginBYPASS" />
  </div>
</template>

<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import Login from "./components/LoginPage.vue";
import { io } from 'socket.io-client'
import { ref, provide } from 'vue'

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

async function verifyCode(token: string, code: any) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/auth/check2fa", {
      method: 'POST',
      body: JSON.stringify({
        'id': payload,
        'code': code
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      //console.log(response.headers.get('token2'))
      return response.json();
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}

//let token = getCookieValueByName('token');

(async () => {
  let token = getCookieValueByName('token');
  if (token) {
    if (token.substring(0, 3) === "2FA") {
      const user_input = prompt("Enter the code");
      const new_code = await verifyCode(token, user_input);
      if (new_code) {
        console.log('Verification successful', new_code);
        document.cookie = `token=${new_code.code}`
        islogged.value = true;
      } else {
        console.log('Invalid code');
      }
    }
    else {
      islogged.value = true;
      let socket = io(process.env.VUE_APP_BACKEND_URL);
      provide('socket', socket)
    }
  }

})();


function login42() {
  window.location.href = process.env.VUE_APP_BACKEND_URL + "/auth/login";
}


function loginGoogle() {
  window.location.href = process.env.VUE_APP_BACKEND_URL + "/auth/login_google";
}


async function authtempBYPASS() {
  try {
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/auth/tempbypass");
    if (response.ok) {
      let res =  await response.json();
      document.cookie = `token=${res.code}`
      islogged.value = true;
      return res;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}
async function loginBYPASS() {
  let verify = await authtempBYPASS()
  if (verify)
    islogged.value = true;
    let socket = io(process.env.VUE_APP_BACKEND_URL);
    provide('socket', socket)
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
