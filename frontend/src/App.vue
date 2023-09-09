<template>
  <header v-if="islogged && !first_login_modal">
    <nav>
      <RouterLink to="/">Pong</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <RouterLink to="/leaderboard">Leaderboard</RouterLink>
      <RouterLink to="/profile">User profile</RouterLink>
      <v-btn @click="toggleNotifications()" style="background-color:transparent;">
        <v-icon color="green">mdi-bell</v-icon>
        <div v-if="unseenNotifications.length > 0" class="notification-badge" >{{ unseenNotifications.length }}</div>
      </v-btn>
      <v-btn @click="logout">Logout</v-btn>
    </nav>
  </header>

  <v-dialog v-model="showNotifications" max-width="400">
    <v-card>
      <v-card-title>
        <span class="headline">Notifications</span>
      </v-card-title>
      <v-card-text>
        <div v-if="notifications.length > 0" class="notifications-box">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item">
            {{ formatTime(notification.time) }}
            {{ notification.message }}
            <div v-if="notification.type > 0">
              <v-btn @click="decideNotification(notification.id, true)">
                Accept
              </v-btn>
              <v-btn @click="decideNotification(notification.id, false)">
                Remove
              </v-btn>
            </div>
          </div>
        </div>
        <div v-else class="no-notifications">No new notifications</div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="showNotifications = false;">Close</v-btn>
        <v-btn color="primary" v-if="notifications.length > 0" @click="clearNotifications()">Clear Notifications</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <div v-if="islogged && !first_login_modal" :class="{ 'game-view': isGameRoute }">
    <RouterView :key="routerKey" />
  </div>
  <div v-else-if="!first_login_modal">
    <Login @clicked42="login42" @clickedgoogle="loginGoogle" @id_to_login="executeLoginwithId" />
  </div>
  <div v-else-if="first_login_modal" class="first_login_modal">
    <userValidation @submitted="first_login_modal = false"></userValidation>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import Login from "./components/LoginPage.vue";
import { Socket, io } from 'socket.io-client'
import { ref, provide, onBeforeMount, computed, nextTick } from 'vue'
import router from './router';
import userValidation from './components/UserValidation.vue'

const first_login_modal = ref(false);
const islogged = ref(false);
const isGameRoute = computed(() => router.currentRoute.value.path === '/')
let routerKey = ref(0)

async function decideNotification(NotificationID: number, Decision: boolean) {
  let token = getCookieValueByName('token');
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/events/event_decision/' + NotificationID + '/' + Decision;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      fetchNotifications();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

const formatTime = (timestamp) => {
  const currentTime = new Date();
  const messageTime = new Date(timestamp);
  const timeDiffMinutes = Math.floor((currentTime - messageTime) / (1000 * 60));

  if (timeDiffMinutes < 1) {
    return 'Just now';
  } else if (timeDiffMinutes < 60) {
    return `${timeDiffMinutes} mins ago`;
  } else if (timeDiffMinutes < 1440) {
    const hours = Math.floor(timeDiffMinutes / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(timeDiffMinutes / 1440);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

function logout() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  islogged.value = false;
  window.location.href = '/';
}

let socket: Socket | null = null;
async function setupSocket(token) {
  socket = io(process.env.VUE_APP_BACKEND_URL, {
    auth: {
      token: token,
    },
  });
  provide('socket', socket);
}
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
        'id': payload.login,
        'code': code
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
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
        document.cookie = `token=${new_code.code}`
        window.location.reload()
        islogged.value = true;
      } else {
        console.log('Invalid code');
      }
    }
    else {
      islogged.value = true;
      socket = io(process.env.VUE_APP_BACKEND_URL, {
        auth: {
          token: token
        }
      });
      provide('socket', socket)
      first_login_modal.value = await fetch_logged_previous()
    };
  }
}
)();


function login42() {
  window.location.href = process.env.VUE_APP_BACKEND_URL + "/auth/login";
}


function loginGoogle() {
  window.location.href = process.env.VUE_APP_BACKEND_URL + "/auth/login_google";
}



async function authtempBYPASS(idvalue: number) {
  try {
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/auth/tempbypass/" + idvalue);
    if (response.ok) {
      let res = await response.json();
      document.cookie = `token=${res.code}`
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}


async function fetch_logged_previous() {
  try {
    let token = getCookieValueByName('token');
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUserInfo/';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.is_first_login
    } else {
      // Handle the case when the request fails
      console.error('Error fetching User Profile data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching User Profile data', error);
  }
}


async function executeLoginwithId(idvalue: number) {
  let verify = await authtempBYPASS(idvalue)
  if (verify) {
    islogged.value = true;
    window.location.reload()

  }
  let token = getCookieValueByName('token');
  setupSocket(token);
}

const showNotifications = ref(false);
const notifications = ref([]);
const unseenNotifications = computed(() => {
  return notifications.value.filter(notification => !notification.already_seen);
});


const markAllNotificationsAsSeen = async () => {
  let token = getCookieValueByName('token');
  try {
    const unseenNotificationIds = notifications.value
      .filter((notification) => !notification.already_seen)
      .map((notification) => notification.id);
    if (!unseenNotificationIds.length)
      return;
    await fetch(process.env.VUE_APP_BACKEND_URL + '/events/mark_seen_all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ unseenNotificationIds }),
    });
    fetchNotifications();
  } catch (error) {
    console.log('Error marking all notifications as seen:', error);
  }
}

const toggleNotifications = async () => {
  markAllNotificationsAsSeen();
  if (!showNotifications.value) {
    await fetchNotifications();
  }
  showNotifications.value = !showNotifications.value;
};

const fetchNotifications = async () => {
  let token = getCookieValueByName('token');
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/events/notifications';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      const data = await response.json();
      notifications.value = data;
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

const clearNotifications = async () => {
  let token = getCookieValueByName('token');
  try {
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + '/events/clear_notifications', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      fetchNotifications();
    } else {
      console.log('Error clearing notifications:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

if (socket && islogged.value == true) {

  socket.on('notification', Notification => {
    fetchNotifications();
  });

  socket.on('logout', Notification => {
    logout();
  });
  socket.on('StartPaddleSelection', async () => {
    await nextTick()
    if (router.currentRoute.value.path !== '/') {
      router.push('/')
    }
    routerKey.value++
  })
  socket.on('DisconnectSocketToken', () => {
    logout();
  })
}

onBeforeMount(() => {
  let token = getCookieValueByName('token');
  if (token && token.substring(0, 3) != "2FA")
    fetchNotifications();
});
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
  margin-bottom: 2%;
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

.notifications-box {
  overflow-y: scroll;
}


.notification-item {
  padding: 8px;
  border: 2px solid #444;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.first_login_modal {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
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
    margin: 0%;
  }

  .notify-button {
    background-color: #555;
    width: 50px;
    height: 50px;
    background-image: url('src/assets/notification-bell.svg');
    background-size: contain;

  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: red;
    color: white;
    font-size: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  .game-view {
    display: flex;
    align-content: center;
    justify-content: center;
  }
}

@media (prefers-color-scheme: light) {
  .notification-badge{
    color: black !important;
  }
}
</style>
