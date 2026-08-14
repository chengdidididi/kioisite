<template>
  <!-- 主内容容器 -->
  <div class="page-container">
    <!-- Header + 欢迎语 + 导航 整合组件 -->
    <div class="header-block">
      <!-- 装饰：水波纹、星光、菱形 -->
      <svg class="deco-wave" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.15"/></svg>
      <svg class="deco-gold-star" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z"/></svg>
      <svg class="deco-diamond" viewBox="0 0 10 10" fill="currentColor"><path d="M5 0L10 5L5 10L0 5Z"/></svg>
      <svg class="deco-drop" viewBox="0 0 10 14" fill="currentColor"><path d="M5 0C5 0 0 7 0 10C0 12 2 14 5 14C8 14 10 12 10 10C10 7 5 0 5 0Z"/></svg>

      <!-- Logo -->
      <div class="logo-wrap">
        <img src="/header.png" alt="Header" class="header-img" />
      </div>

      <!-- 底部偏暖白长条：弧度与 header 一致，保持四周 margin -->
      <div class="bottom-bar">
        <span class="welcome-text">欢迎来到柚雨kioi粉丝站</span>
      </div>
    </div>

    <!-- 粉丝数主卡片 -->
    <section class="fans-card">
      <!-- 顶部薄荷装饰带 -->
      <div class="fans-band"></div>
      <!-- 金色小星 -->
      <svg class="deco-gold-star fans-star" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z"/></svg>

      <h2 class="fans-tag">柚雨kioi 当前粉丝量</h2>
      <div class="fans-counter">
        <span v-if="loading" class="loading">加载中...</span>
        <span v-else-if="fans !== null" class="fans-number">{{ displayFans.toLocaleString() }}</span>
        <span v-else class="error">获取失败</span>
      </div>
      <span class="fans-label">位粉丝</span>
    </section>

    <!-- 相关链接 -->
    <div class="links-card">
      <h3 class="section-title">
        相关链接
        <svg class="title-star" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L7 4.5L12 6L7 7.5L6 12L5 7.5L0 6L5 4.5Z"/></svg>
      </h3>
      <a href="https://space.bilibili.com/1096820127" target="_blank" rel="noopener noreferrer" class="link-item">
        <span class="link-icon-circle">
          <span class="link-icon">📺</span>
        </span>
        <span class="link-label">B站主页</span>
        <span class="link-arrow">↗</span>
      </a>
    </div>
  </div>

  <footer class="app-footer">
    <p>© 2026 柚雨kioi 粉丝站 · Made with ❤</p>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const fans = ref(null)
const displayFans = ref(0)
const loading = ref(true)
let timer = null

function animateCount(target) {
  const duration = 1500
  const start = displayFans.value
  const delta = target - start
  const startTime = performance.now()
  function tick(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    displayFans.value = Math.round(start + delta * eased)
    if (progress < 1) requestAnimationFrame(tick)
    else displayFans.value = target
  }
  requestAnimationFrame(tick)
}

async function fetchFans() {
  loading.value = true
  try {
    const res = await fetch('/api/x/relation/stat?vmid=1096820127')
    const data = await res.json()
    if (res.ok && data.code === 0 && data.data) {
      fans.value = data.data.follower
      loading.value = false
      animateCount(data.data.follower)
    } else {
      throw new Error(data.message || `获取失败（HTTP ${res.status}）`)
    }
  } catch (err) {
    console.error('获取粉丝数失败:', err)
    fans.value = null
    loading.value = false
  }
}

onMounted(() => {
  fetchFans()
  timer = setInterval(fetchFans, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* 统一内容宽度 */
.page-container {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 20px 32px;
}

/* === Header 整合组件 === */
.header-block {
  position: relative;
  width: 100%;
  background: linear-gradient(160deg, var(--accent) 0%, var(--accent-light) 40%, var(--warm-white) 100%);
  border-radius: 36px;
  padding: 24px 24px 0;
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

/* Logo */
.logo-wrap {
  text-align: center;
  padding: 8px 0 20px;
}
.header-img {
  max-width: 100%;
  max-height: 120px;
  height: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

/* 底部长条：偏暖白，弧度与 header 一致，四周保持相同 margin */
.bottom-bar {
  background: var(--warm-white);
  border-radius: 24px;
  margin: 0 16px 16px;
  padding: 14px 24px;
  text-align: center;
}
.welcome-text {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--accent-deep);
}

/* === 粉丝数主卡片 === */
.fans-card {
  text-align: center;
  padding: 36px 24px 32px;
  background: var(--warm-white);
  border: 2px solid var(--accent-light);
  border-radius: 32px;
  margin-top: 44px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  position: relative;
}

/* 顶部薄荷装饰带 */
.fans-band {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 6px;
  background: var(--accent);
  border-radius: 0 0 8px 8px;
}

/* 标题胶囊 */
.fans-tag {
  display: inline-block;
  background: var(--accent);
  color: var(--accent-deep);
  font-size: 1.05rem;
  font-weight: 600;
  padding: 6px 20px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.fans-counter {
  font-size: 3rem;
  font-weight: 700;
  margin: 12px 0 4px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
/* 深青色数字 */
.fans-number {
  color: var(--accent-deep);
  letter-spacing: 2px;
}
.fans-label {
  font-size: 1rem;
  color: var(--text-dim);
  font-weight: 500;
}
.loading { font-size: 1.2rem; font-weight: 400; color: var(--text-dim); }
.error { font-size: 1.2rem; color: #e74c3c; }

/* === 相关链接卡片 === */
.links-card {
  padding: 28px 24px;
  background: var(--warm-white);
  border-radius: 24px;
  margin-bottom: 32px;
  box-shadow: var(--card-shadow);
}
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-star {
  width: 14px;
  height: 14px;
  color: var(--gold);
}

/* 链接项：中等圆角独立卡片 */
.link-item {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--bg-cream);
  border: 2px solid var(--accent-light);
  border-radius: 18px;
  transition: all 0.25s;
  color: var(--text-dark);
}
.link-item:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--card-shadow);
}
.link-item:hover .link-arrow {
  color: var(--gold);
}

/* 图标圆形底 */
.link-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--accent-light);
  border-radius: 50%;
  flex-shrink: 0;
}
.link-icon { font-size: 1.2rem; }
.link-label { font-weight: 600; }
.link-arrow { font-size: 1.1rem; color: var(--text-dim); transition: color 0.25s; }

/* === Header 装饰元素 === */
.deco-wave {
  position: absolute;
  bottom: 70px;
  left: 0;
  width: 100%;
  height: 24px;
  color: var(--accent-deep);
}
.deco-gold-star {
  position: absolute;
  width: 10px;
  height: 10px;
  color: var(--gold);
  opacity: 0.6;
}
.deco-diamond {
  position: absolute;
  width: 8px;
  height: 8px;
  color: var(--gold);
  opacity: 0.4;
}
.deco-drop {
  position: absolute;
  width: 8px;
  height: 11px;
  color: var(--accent-deep);
  opacity: 0.2;
}

/* header 内装饰位置 */
.header-block .deco-gold-star:nth-child(2) { top: 40px; left: 10%; }
.header-block .deco-gold-star:nth-child(3) { top: 60px; right: 8%; }
.header-block .deco-diamond:nth-child(4) { top: 30px; right: 18%; }
.header-block .deco-diamond:nth-child(5) { bottom: 70px; left: 15%; }
.header-block .deco-drop:nth-child(6) { top: 50px; left: 20%; }

/* 粉丝卡片边角金色小星 */
.fans-star {
  color: var(--gold);
  opacity: 0.7;
  position: absolute;
}
.fans-star { top: 16px; right: 20px; width: 12px; height: 12px; }

/* 页脚 */
.app-footer {
  text-align: center;
  padding: 24px;
  font-size: 0.85rem;
  color: var(--text-dim);
}
</style>