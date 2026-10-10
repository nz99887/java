<script setup>
/**
 * 元素神之眼装饰（显隐由 useTheme 的 showVision 控制，样式挂在 body.show-vision）
 */
</script>

<template>
  <div class="vision-deco" aria-hidden="true">
    <svg viewBox="0 0 120 120">
      <ellipse cx="60" cy="60" rx="42" ry="54" fill="none" stroke="currentColor" stroke-width="3" />
      <ellipse
        cx="60"
        cy="60"
        rx="31"
        ry="41"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.6"
      />
      <path
        d="M60 14 L70 52 L108 60 L70 68 L60 106 L50 68 L12 60 L50 52 Z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  </div>
</template>
