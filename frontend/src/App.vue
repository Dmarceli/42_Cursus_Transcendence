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
      <RouterView/>
    </div>
    <div v-else >
      <Login @isbuttonclicked="login"/>
    </div>

</template>

<script setup lang="ts">
import { RouterLink, RouterView} from 'vue-router';
import Login from "./components/LoginPage.vue";
import { ref } from 'vue';

const islogged = ref(false);
const cookies = document.cookie.split('=')
let token  = cookies[1];

if (token) {
  islogged.value = true;
}


function login() {
  window.location.href = "http://localhost:3000/auth/login";
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
