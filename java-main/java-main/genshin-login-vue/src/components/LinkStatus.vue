<script setup>
/**
 * 前端实时检测后端连接状态（移植自原版 link.js，每 15 秒轮询）
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchHealth } from '../api'

const state = ref('wait') // wait | on | off
const text = ref('连接中…')
let timer = 0

async function check() {
  try {
    await fetchHealth()
    state.value = 'on'
    text.value = '后端已连接'
    return
  } catch {
    /* 忽略，标记离线 */
  }
  state.value = 'off'
  text.value = '后端未连接'
}

onMounted(() => {
  check()
  timer = setInterval(check, 15000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <span class="link-status" :class="state">{{ text }}</span>
</template>
