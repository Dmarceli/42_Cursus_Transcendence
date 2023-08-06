<template>
	<v-sheet width="300" class="mx-auto">
    <v-form fast-fail @submit.prevent>
			<v-card-text class="font-weight-regular text-center" >
				Welcome to Raquetas! Since this is your first time here, we've picked an avatar and nickname for you.
			</v-card-text>
			<v-card-text class="font-weight-regular" >
				Did we do a good job or would you like to change any of them? 🤔"
			</v-card-text>
			<!-- <div class="settings-section">
        <label for="avatar" class="avatar-label"></label>
        <div class="avatar-container-settings">
          <img :src="updateAvatar || userProfile.avatar" alt="Avatar" class="avatar-settings" />
        </div>
        <input type="file" @change="handleNewAvatar" id="avatar" />
      </div> -->
      <v-text-field
        v-model="firstName"
        label="First name"
        :rules="firstNameRules"
      ></v-text-field>

      <v-text-field
        v-model="lastName"
        label="Last name"
        :rules="lastNameRules"
      ></v-text-field>

      <v-btn type="submit" block class="mt-2">Submit</v-btn>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import jwt_decode from 'jwt-decode';

const userData = reactive({
	id: null,
	nick: null,
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

let token = getCookieValueByName('token');
const decodedToken = jwt_decode(token);
userData.id = decodedToken.user["id"];
userData.nick = decodedToken.user["nick"];

</script>

<style scoped>

</style>