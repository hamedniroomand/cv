<script setup lang="ts">
import { cv } from '#cv'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>{{ cv.profile.name }}</h1>
    <p>{{ cv.profile.title }}</p>
  </div>
</template>
