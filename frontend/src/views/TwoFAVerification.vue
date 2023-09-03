<template>
  <div class="loginpage">
    <div class="welcome">
      <h1>enter verification code</h1>
      <input type="text" v-model="verificationCode" placeholder="Verification Code">
    </div>
  </div>
</template>

<script lang="ts">

export default {
  data() {
    return {
      verificationCode: ''
    };
  }
}

</script>