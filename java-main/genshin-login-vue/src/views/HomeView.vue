<script setup>
/**
 * 首页（原神风，纯前端）
 * - 英雄区 + 搜索栏：对内置角色数据实时筛选（不依赖后端）
 * - 内容区：热门角色卡片网格（随搜索结果更新）
 * 导航栏与登录态守卫已抽为全局（NavBar / useAuth），本页只负责内容。
 */
import { computed, ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { CHARACTERS, VISION_COLOR } from '../data/characters'

const { user, loaded } = useAuth()
const colorOf = (v) => VISION_COLOR[v] || 'var(--gold)'

// ---------- 搜索 ----------
const query = ref('')
const submitted = ref('')
const isSearching = computed(() => submitted.value.trim().length > 0)

const results = computed(() => {
  const q = submitted.value.trim().toLowerCase()
  if (!q) return CHARACTERS
  return CHARACTERS.filter(
    (it) =>
      it.name.toLowerCase().includes(q) ||
      it.vision.toLowerCase().includes(q) ||
      it.region.toLowerCase().includes(q) ||
      it.desc.toLowerCase().includes(q),
  )
})

function onSearch() {
  submitted.value = query.value
}
function clearSearch() {
  query.value = ''
  submitted.value = ''
}
</script>

<template>
  <div class="page">
    <!-- ============ 英雄区 + 搜索栏 ============ -->
    <header class="hero">
      <h1 class="hero-title">欢 迎 来 到 提 瓦 特</h1>
      <p class="hero-sub">
        {{ user ? `${user.username}，开始你的探索之旅` : '探索七国，检索你心仪的伙伴' }}
      </p>

      <form class="search" @submit.prevent="onSearch">
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="query"
          class="search-input"
          type="text"
          placeholder="搜索角色 / 元素 / 地区，例如「岩」「璃月」「钟离」"
          @input="onSearch"
        />
        <button class="search-btn" type="submit">检 索</button>
        <button v-if="isSearching" class="search-clear" type="button" @click="clearSearch">清除</button>
      </form>
    </header>

    <!-- ============ 内容区 ============ -->
    <main class="content">
      <div class="section-head">
        <h2 class="section-title">{{ isSearching ? `检索结果（${results.length}）` : '热门角色' }}</h2>
        <span class="section-tip" v-if="isSearching">关键词：{{ submitted }}</span>
      </div>

      <div v-if="!loaded" class="state">正在校验登录状态…</div>

      <div v-else-if="!results.length" class="state empty">
        没有匹配「{{ submitted }}」的内容，换个关键词试试？
      </div>

      <div v-else class="grid">
        <article
          v-for="c in results"
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
/* ============ 英雄区 + 搜索栏 ============ */
.hero {
  text-align: center;
  padding: 30px 20px 30px;
}
.hero-title {
  margin: 0 0 10px;
  font-size: 30px;
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
  filter: drop-shadow(0 0 10px rgba(var(--accent-rgb), 0.35));
}
@keyframes titleShine {
  to {
    background-position: 220% center;
  }
}
.hero-sub {
  margin: 0 0 28px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-dim);
}
.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 620px;
  margin: 0 auto;
  padding: 8px 8px 8px 44px;
  background: rgba(12, 22, 36, 0.78);
  border: 1px solid rgba(var(--accent-rgb), 0.4);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  box-shadow:
    0 0 0 1px rgba(var(--accent-rgb), 0.12),
    0 12px 40px rgba(0, 0, 0, 0.5);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.search:focus-within {
  border-color: var(--gold);
  animation: searchGlow 2.4s ease-in-out infinite;
}
@keyframes searchGlow {
  0%,
  100% {
    box-shadow:
      0 0 0 2px rgba(var(--accent-rgb), 0.18),
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 16px rgba(var(--accent-rgb), 0.22);
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(var(--accent-rgb), 0.34),
      0 12px 44px rgba(0, 0, 0, 0.55),
      0 0 26px rgba(var(--accent-rgb), 0.45);
  }
}
.search-icon {
  position: absolute;
  left: 16px;
  color: rgb(var(--accent-rgb));
  filter: drop-shadow(0 0 5px rgba(var(--accent-rgb), 0.7));
}
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  letter-spacing: 1px;
}
.search-input::placeholder {
  color: var(--text-dim);
}
.search-btn {
  padding: 9px 22px;
  border: 1px solid var(--gold);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(245, 212, 136, 0.95), rgba(184, 146, 63, 0.95));
  color: #1a1206;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  font-family: inherit;
  cursor: pointer;
  transition:
    filter 0.2s,
    transform 0.1s;
}
.search-btn:hover {
  filter: brightness(1.08);
}
.search-btn:active {
  transform: translateY(1px);
}
.search-clear {
  padding: 9px 16px;
  border: 1px solid rgba(var(--accent-rgb), 0.5);
  border-radius: 999px;
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  letter-spacing: 2px;
  font-family: inherit;
  cursor: pointer;
}
.search-clear:hover {
  color: var(--text);
}

@media (max-width: 720px) {
  .hero-title {
    font-size: 24px;
    letter-spacing: 5px;
  }
}
</style>
