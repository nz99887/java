<script setup>
import { useToast } from '../composables/useToast'
const { state } = useToast()
</script>

<template>
  <div
    class="toast"
    :class="{ show: state.show }"
    :style="{ background: state.ok ? '#16a34a' : '#dc2626' }"
  >
    {{ state.text }}
  </div>
</template>
