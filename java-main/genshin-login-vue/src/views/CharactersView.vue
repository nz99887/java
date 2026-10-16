<script setup>
/**
 * 角色图鉴页（原神风，纯前端）
 * - 复用全局导航栏与登录态守卫（useAuth 未登录自动跳登录页）
 * - 支持：关键词搜索 + 元素筛选 + 星级筛选，结果实时刷新
 */
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { CHARACTERS, VISION_COLOR } from '../data/characters'

useAuth() // 触发登录态守卫（未登录自动跳 /）

const colorOf = (v) => VISION_COLOR[v] || 'var(--gold)'

const VISIONS = ['火', '水', '风', '雷', '草', '冰', '岩']
const activeVision = ref('')
const activeRarity = ref(0) // 0 = 全部
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return CHARACTERS.filter((c) => {
    if (activeVision.value && c.vision !== activeVision.value) return false
    if (activeRarity.value && c.rarity !== activeRarity.value) return false
    if (
      q &&
      !(
        c.name.toLowerCase().includes(q) ||
        c.vision.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      )
    )
      return false
    return true
  })
})

function toggleVision(v) {
  activeVision.value = activeVision.value === v ? '' : v
}
function reset() {
  activeVision.value = ''
  activeRarity.value = 0
  query.value = ''
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h1 class="page-title">角 色 图 鉴</h1>
      <p class="page-sub">收录七国英杰，按元素与星级检索</p>

      <div class="toolbar">
        <div class="search mini">
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="query"
            class="search-input"
            type="text"
            placeholder="搜索角色 / 元素 / 地区，例如「岩」「璃月」"
          />
        </div>
        <button class="reset" type="button" @click="reset">重 置</button>
      </div>

      <div class="filters">
        <div class="chip-group">
          <button class="chip" :class="{ on: !activeVision }" type="button" @click="activeVision = ''">
            全部元素
          </button>
          <button
            v-for="v in VISIONS"
            :key="v"
            class="chip"
            :class="{ on: activeVision === v }"
            :style="{ '--vc': colorOf(v) }"
            type="button"
            @click="toggleVision(v)"
          >
            {{ v }}
          </button>
        </div>

        <div class="chip-group">
          <button class="chip" :class="{ on: !activeRarity }" type="button" @click="activeRarity = 0">全部</button>
          <button class="chip" :class="{ on: activeRarity === 5 }" type="button" @click="activeRarity = 5">5★</button>
          <button class="chip" :class="{ on: activeRarity === 4 }" type="button" @click="activeRarity = 4">4★</button>
        </div>
      </div>
    </header>

    <main class="content">
      <div class="section-head">
        <h2 class="section-title">共 {{ filtered.length }} 位角色</h2>
      </div>

      <div v-if="!filtered.length" class="state empty">没有符合条件的角色，调整筛选条件试试？</div>

      <div v-else class="grid">
        <article
          v-for="c in filtered"
          :key="c.name"
          class="card"
          :style="{ '--vc': colorOf(c.vision) }"
        >
          <div class="card-corner tl"></div>
          <div class="card-corner br"></div>

          <div class="card-top">
            <span class="vision" :style="{ color: colorOf(c.vision), borderColor: colorOf(c.vision) }">
              {{ c.vision }}
            </span>
            <span class="rarity">{{ '★'.repeat(c.rarity) }}</span>
          </div>

          <h3 class="card-name">{{ c.name }}</h3>
          <div class="card-region">{{ c.region }}</div>
          <p class="card-desc">{{ c.desc }}</p>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-head {
  text-align: center;
  padding: 30px 20px 8px;
}
.page-title {
  margin: 0 0 8px;
  font-size: 28px;
  letter-spacing: 8px;
  background: linear-gradient(
    100deg,
    var(--gold-dim) 18%,
    var(--gold-strong) 38%,
    #fff7e0 50%,
    var(--gold-strong) 62%,
    var(--gold-dim) 82%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: titleShine 4.5s linear infinite;
  filter: drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.35));
}
@keyframes titleShine {
  to {
    background-position: 220% center;
  }
}
.page-sub {
  margin: 0 0 22px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-dim);
}

.toolbar {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 18px;
}
.search.mini {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(520px, 90vw);
  padding: 7px 18px 7px 42px;
  background: rgba(12, 22, 36, 0.78);
  border: 1px solid rgba(var(--accent-rgb), 0.4);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.search.mini:focus-within {
  border-color: var(--gold);
  box-shadow:
    0 0 0 2px rgba(var(--accent-rgb), 0.28),
    0 0 18px rgba(var(--accent-rgb), 0.4);
}
.search.mini .search-icon {
  position: absolute;
  left: 16px;
  color: rgb(var(--accent-rgb));
  filter: drop-shadow(0 0 5px rgba(var(--accent-rgb), 0.7));
}
.search.mini .search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  letter-spacing: 1px;
}
.search.mini .search-input::placeholder {
  color: var(--text-dim);
}
.reset {
  padding: 0 18px;
  border: 1px solid rgba(var(--accent-rgb), 0.5);
  border-radius: 999px;
  background: transparent;
  color: var(--gold);
  font-size: 13px;
  letter-spacing: 2px;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.2s,
    box-shadow 0.2s;
}
.reset:hover {
  background: rgba(var(--accent-rgb), 0.14);
  box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.4);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.chip {
  padding: 6px 16px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(232, 200, 122, 0.28);
  border-radius: 999px;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}
.chip:hover {
  color: var(--text);
}
.chip.on {
  color: #1a1206;
  background: linear-gradient(180deg, rgba(245, 212, 136, 0.95), rgba(184, 146, 63, 0.95));
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(232, 200, 122, 0.4);
}
/* 元素筛选选中态用元素色描边 */
.chip-group .chip.on:not(.chip:first-child) {
  color: var(--vc, var(--gold-strong));
  background: transparent;
  border-color: var(--vc, var(--gold));
  box-shadow: 0 0 10px color-mix(in srgb, var(--vc, #e8c87a) 50%, transparent);
}

@media (max-width: 720px) {
  .page-title {
    font-size: 22px;
    letter-spacing: 5px;
  }
}
</style>
