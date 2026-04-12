<script setup>
import { ref } from 'vue'

const count = ref(0)
const items = ref(['Minimalist', 'Clean', 'Untangled'])
</script>

<template>
  <div class="vue-container">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
      <div class="wrapper">
        <h1>{{ count }}</h1>
        <button @click="count++">Increment</button>
      </div>
    </header>

    <main>
      <ul class="item-list">
        <li v-for="item in items" :key="item" class="list-item">
          <span>{{ item }}</span>
          <i class="icon-check"></i>
        </li>
      </ul>

      <section v-if="count > 5" class="bonus">
        <h3>You are a power user!</h3>
        <p>Keep untangling your Vue components.</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.vue-container {
  padding: 2rem;
  font-family: sans-serif;
}
</style>
