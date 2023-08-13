<template>
	<v-card width="300" class="mx-auto" elevation="1">
    <v-form fast-fail @submit.prevent>
			<v-card-title class="py-5 font-weight-black text-center">Welcome to Raquetas!</v-card-title>
			<v-card-text class="font-weight-regular text-justify" >
				Since this is your first time here, we've picked an avatar for you.
				<br />
				Did we do a good job or would you like to change any of them? 🤔
			</v-card-text>
			<div class="settings-section">
				<label for="avatar" class="avatar-label"></label>
				<div class="avatar-container-settings">
					<img :src="updateAvatar || userData.avatar" alt="Avatar" class="avatar-settings" />
				</div>
				<input type="file" @change="handleNewAvatar" id="avatar-file" ref="avatarUpload" :key="inputKey"/>
			</div>
      <v-text-field
			v-model="updateNickname"
			label="Nickname"
			:rules="nickname.rules">
		</v-text-field>
      <v-btn type="submit" block variant="outlined" class="mt-2" @click="Submit">Submit</v-btn>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';

const emits = defineEmits(['submitted'])

let inputKey=ref(0)

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

const updateNickname = ref(userData.value.nick);
const updateAvatar = ref('');
let avatarUpload = ref<File|null>(null);

const nickname = reactive({
	rules: [
		value => value.length < 20 || 'Nickname too long',
		value => usernameRegex.test(value) || 'Invalid Characters found',
	],
});

const handleNewAvatar = async (event: Event) => {
  if (event.target instanceof HTMLInputElement && event.target.files) {
		console.log("INITIAL FILE WOULD BE"+avatarUpload.value);
    if (avatarUpload.value)
    {
			let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
			if (!regex.test(avatarUpload.value.name)) {
				alert("Please upload an image file");
        const inputFileElement = document.getElementById('avatar-file') as HTMLInputElement
        if (inputFileElement) {
          inputFileElement.value = '';
        }
        avatarUpload.value=null
        inputKey.value++
        return;
			}
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
        reader.readAsDataURL(avatarUpload.value);
    }
  }
}

async function Submit() {	
	if (updateNickname.value === ''){
    emits('submitted')
  }
  userData.value.nick = updateNickname.value;
  if (updateAvatar.value)
  {
    userData.value.avatar = updateAvatar.value;
  }
  let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/);
  if (avatarUpload.value && avatarUpload.value.value) {
    console.log("LETS POST"+avatarUpload.value.name)
    if (!regex.test(avatarUpload.value.name))
      return
    // Need to make validation for image files
    try {
      const formData = new FormData();
      formData.append('file', userData.value.avatar);
      formData.append('userId', String(userData.value.id));
      formData.append('nickUpdate', userData.value.nick);
      const response = await fetch(process.env.VUE_APP_BACKEND_URL + "/users/profile", {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        let data = await response.json();
        console.log("NEW URL "+data.newAvatar);
      }
    } catch(error) {
        console.log('Error:', error);
      }
  }
  emits('submitted')
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
  width:100px;
  height:100px;
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


