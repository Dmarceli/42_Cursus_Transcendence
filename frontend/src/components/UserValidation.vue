<template>
  <v-card width="300" class="mx-auto" elevation="1">
    <v-form fast-fail @submit.prevent v-model="form">
      <v-card-title class="py-5 font-weight-black text-center">Welcome to Raquetas!</v-card-title>
      <v-card-text class="font-weight-regular text-justify">
        Since this is your first time here, we've picked an avatar for you.
        <br />
        Did we do a good job or would you like to change any of them? 🤔
      </v-card-text>
      <div class="settings-section">
        <label for="avatar" class="avatar-label"></label>
        <div class="avatar-container-settings">
          <img :src="updateAvatar || userData.avatar" alt="Avatar" class="avatar-settings" />
        </div>
        <input type="file" @change="handleNewAvatar" id="avatar-file" :key="inputKey" />
      </div>
      <v-text-field v-model="updateNickname" label="Nickname" :rules="nickname.rules">
      </v-text-field>
      <v-btn block variant="outlined" class="mt-2" @click.prevent="Submit">Submit</v-btn>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';

const emits = defineEmits(['submitted'])

let inputKey = ref(0)
let form = ref(false)

const userData = ref({
  id: 0,
  intra_nick: '',
  nick: '',
  avatar: '',
});

function getCookieValueByName(name: string) {
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

const fetchUserProfile = async () => {
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/users/getUserInfo/';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      userData.value = data;
    } else {
      // Handle the case when the request fails
      console.error('Error fetching User Profile data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching User Profile data', error);
  }
}

onBeforeMount(() => {
  fetchUserProfile();
});

let token = getCookieValueByName('token');
// const decodedToken = jwt_decode(token);

const usernameRegex = /^[a-zA-Z0-9._-]{1,20}$/;

const updateNickname = ref('');
const updateAvatar = ref('');
let avatarUploadFile = ref<File | null>(null);

const nickname = reactive({
  rules: [
    value => value.length < 20 || 'Nickname too long',
    value => value.length > 0 || 'Nickname cannot be empty',
    value => usernameRegex.test(value) || 'Invalid Characters found',
  ],
});

const handleNewAvatar = async (event: Event) => {
  const fileInput = event.target;
  if (fileInput instanceof HTMLInputElement && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
    if (!regex.test(file.name)) {
      alert("Please upload an image file");
      if (event.target)
        event.target.value = ''
      inputKey.value++
      return;
    }
    avatarUploadFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        updateAvatar.value = result;
      }
      else {
        console.error('Error reading file');
      }
    };
    reader.readAsDataURL(file);
  }
}

async function updateToken() {
  let token = getCookieValueByName('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  try {
    let url = process.env.VUE_APP_BACKEND_URL + '/auth/updateToken';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (response.ok) {
      const data = await response.json();
      const newToken = data.newToken;
      document.cookie = `token=${newToken}`;
      window.location.reload();
    } else {
      console.log('Error:', response.status);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}


async function Submit() {
  if (!form.value) {
    console.log("Submission not possible due to validation errors")
    return;
  }
  let oldNick = userData.value.nick;
  userData.value.nick = updateNickname.value;
  let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
  try {
    const formData = new FormData();
    if (avatarUploadFile.value && regex.test(avatarUploadFile.value.name)) {
      formData.append('file', avatarUploadFile?.value);
    }
    formData.append('userId', String(userData.value.id));
    formData.append('nickUpdate', userData.value.nick);
    const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/users/profile", {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      let data = await response.json();
      console.log("NEW URL " + data.newAvatar);
    }
    else if(response){
        //Retornar ao nome original em caso de erro
    userData.value.nick= oldNick;
    }
  } catch (error) {
    console.log('Error:', error);
    //Retornar ao nome original em caso de erro
    userData.value.nick= oldNick;
  }
  emits('submitted')
  updateToken();
}

</script>

<style scoped>
.settings-section {
  margin-bottom: 20px;
  /* center content */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-container-settings {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 2px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.avatar-settings {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>


