<template>
    <v-dialog
      v-model="props.dialog"
      width="auto"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
              color="#26654E"
              title="Instructions"
            ></v-toolbar>
        <v-card-text>
          <p>Control your paddle using the arrow keys.</p>
          <div class="descript">
            <img class="arrow" src="arrow-up.png"><span>Press <b>arrow up</b> on the keyboard to move paddle up.</span>
          </div>
          <div class="descript">
            <img class="arrow" src="arrow-down.png"><span>Press <b>arrow down</b> on the keyboard to move paddle up</span>
          </div>
        <p>Points are scored when your opponent misses the ball.</p>
        <p>First player to score 5 points wins.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click='emit("close-window")'>Close Dialog</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

let props = defineProps<{
  dialog: boolean
}>()

const emit = defineEmits(['close-window'])

</script>

<style scoped>
.descript
{
  display: flex;
  margin-top: 5%;
  margin-bottom: 5%;
  align-items: center;
}

.arrow
{
  height: 40px;
}

</style>
