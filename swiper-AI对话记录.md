# Swiper 课堂任务 · AI 协作记录

作者：邵玉紫檬　｜　时间：2026-11-06　｜　使用大模型：DeepSeek-V4.1-Flash

页面文件：`swiper-task.html`　｜　配图：`swiper-imgs/aida_modu_1.jpg`（AI 生成）

---

## 任务一 · 提示词工程师：让 AI 听懂需求

### 第 1 轮提示词（v1）

> 用 Swiper 写一个 `#wySw4` 的配置：要循环、3.2 秒自动播放、分页器可点、初始效果 cube。

AI 第 1 版回答：

```js
new Swiper('#wySw4', {
  loop: true,
  effect: 'cube',
  autoplay: { delay: 3200 },
  pagination: { clickable: true }
});
```

**粘进页面验证后发现的问题**

| 需求 | 第 1 版结果 | 问题 |
|---|---|---|
| ① 无缝循环 | `loop: true` | 满足 |
| ② 3.2 秒自动翻页、手动操作后**不停止** | `autoplay.delay: 3200` | 表面满足：Swiper 11 的 `disableOnInteraction` 默认就是 `false`；但需求没显式写明，换版本/换环境就可能失效 |
| ③ 圆点分页器可点击 | `pagination: { clickable: true }` | **缺 `el`**，页面上根本没有圆点渲染出来 |
| ④ 初始效果 cube | `effect: 'cube'` | 满足 |

### 第 2 轮提示词（v2）

把需求逐条编号，并把每条需求"翻译"成对应参数名，要求 AI 逐条回填、不许省略：

> 请给出 `#wySw4` 的完整配置，并逐条对照下面 5 条要求说明用哪个参数实现，缺一不可：
> ① `loop` 无缝循环；
> ② `autoplay.delay = 3200`，且 `autoplay.disableOnInteraction = false`（手动拖动后自动播放必须继续）；
> ③ `pagination` 必须写 `el: '#wyPag4'` 且 `clickable: true`；
> ④ 初始 `effect: 'cube'`；
> ⑤ 切换动画时长 `speed: 800`。

AI 第 2 版回答（即页面中实际运行的配置）：

```js
var wySw4Config = {
  loop: true,
  effect: 'cube',
  speed: 800,
  autoplay: { delay: 3200, disableOnInteraction: false },
  pagination: { el: '#wyPag4', clickable: true }
};
```

### 验证结果（在页面里实际运行）

把第 2 版代码粘进 `swiper-task.html` 后逐项核对，截图存于 `swiper-shots/`。为保证"眼见为实"，截图时在页面右上角临时叠加了一块调试角标，显示的是**当场从 Swiper 实例上读到的实时参数**（角标只在截图时注入，未写入页面文件）。

| 需求 | 证据截图 | 一句话结论 |
|---|---|---|
| ① 无缝循环 | `swiper-shots/02-自动翻页.png` | `params.loop = true`，翻到第 6 张后继续往前会接回第 1 张，没有"到头停住"的空档，循环成立。 |
| ② 3.2 秒自动翻页 | `swiper-shots/01-初始cube.png` → `02-自动翻页.png` | 两张截图间隔 3.4 秒，画面从天宫空间站换成了下一张，说明 3.2 秒的定时器在工作。 |
| ② 手动操作后不停止 | `swiper-shots/03-手动拖动后仍在播.png` | 在轮播上模拟一次拖拽后立即读 `autoplay.running`，结果仍是 `true`，`disableOnInteraction: false` 生效。 |
| ③ 圆点分页器可点击 | `swiper-shots/04-点击圆点跳转.png` | 点第 4 个圆点后 `realIndex` 变为 3、高亮圆点同步移到第 4 个，跳转与选中态都正确。 |
| ④ 初始效果 cube | `swiper-shots/01-初始cube.png` | 首屏即为立方体透视（两侧能看到相邻幻灯片的暗面），且按钮行里 `cube` 高亮，初始态一致。 |

实测参数：`effect=cube`、`loop=true`、`autoplay.delay=3200`、`autoplay.disableOnInteraction=false`、`pagination.el='#wyPag4'`、`pagination.clickable=true`、`speed=800`；圆点共 6 个，`autoplay.running=true`，控制台 0 报错。

**一句话结论**：四项需求全部命中；差别出在第 1 轮只说"分页器可点"没说"挂到哪个元素"、只说"手动后不停"没点明 `disableOnInteraction`，第 2 轮把需求拆成"编号 → 参数名"的对应关系后才一次到位。

### 答辩抽问

- **第一版提示词漏了哪个需求？** 漏掉了"③ 圆点要渲染出来"（没写 `pagination.el`）和"⑤ 动画时长"（没写 `speed`）；② 则属于"没把参数写死"，靠默认值蒙对。
- **第二轮怎么"说清楚"的？** 不再用自然语言描述，而是把每条需求拆成"编号 + 具体参数名 + 期望值"，并要求 AI 逐条对照回填。
- **AI 第一次给的代码错在哪？** 一是 `pagination` 只写 `clickable` 没写 `el`，Swiper 找不到容器就不渲染圆点；二是漏了 `speed`，切换动画用默认 300ms，不是要求的 800ms。

---

## 任务二 · creative 仿写：课堂没讲的效果

### 关键提示词

> 打开 `swiper/demo/257-effect-creative.html`，读懂 `creativeEffect` 里 `prev` / `next` 的 transform 写法，说明每个字段控制什么；然后为演示四写第 7 种效果「creative 电影墙」：上一张缩小、左移、带角度，下一张放大右移进场。

AI 回答要点（结构完全照官方示例：`prev` / `next` 各是一个"等待区形态"）：

```js
creativeEffect: {
  prev: { shadow: true, translate: ['-35%', 0, -220], rotate: [0, 18, 0], scale: 0.78, opacity: 0.85 },
  next: { shadow: true, translate: ['100%', 0, 0], scale: 1.18 }
}
```

### prev / next 的 transform 各控制什么

- **`prev`**：控制"已经翻过去的那张幻灯片"停在**左侧等待区**时的样子——位置（左移 35%、压向 z 轴 -220px）、绕 Y 轴 18° 的角度、缩到 0.78、略透明。
- **`next`**：控制"即将进场的那张"停在**右侧等待区**时的样子——在 100%（容器宽度）之外、放大 1.18 倍。
- 切换动画就是这两个"等待区形态"与"当前位（translate 0、rotate 0、scale 1）"之间的插值。

### 验证结果

实测当前页的上一张 / 下一张行内样式：

- `prev → translate3d(-35%, 0, -220) rotateY(18deg) scale(0.78)` ✔ 缩小 + 左移 + 带角度
- `next → translate3d(100%, 0, 0) scale(1.18)` ✔ 放大 + 右移进场
- 第 7 个按钮高亮唯一，其余 6 个按钮自动取消高亮

### 答辩抽问

- **transform 里的百分号是相对谁的？** 相对 Swiper 容器（`.swiper` 的宽 / 高），不是相对图片本身。
- **translate 数组三项分别是什么？** `[x, y, z]`：x 是宽度的百分比、y 是高度的百分比、z 是**像素**（所以 -220 不是 -220%）。
- **改成转 20° 怎么做？** 把 `rotate: [0, 18, 0]` 改成 `rotate: [0, 20, 0]`，卡片绕 Y 轴转 20°；数值越大角度越"侧"。

---

## 任务三 · 综合创作：第六件展品 + 课堂外能力

### ① 第六件展品「爱达·魔都号」

- 配图由 AI 生成，横版 16:9，存入 `swiper-imgs/aida_modu_1.jpg`
- 四个演示台（演示一 ~ 演示四）各新增一张幻灯片，结构与原有幻灯片完全一致：

```html
<div class="swiper-slide">
  <img src="swiper-imgs/aida_modu_1.jpg" alt="爱达·魔都号">
  <div class="wy-cap"><h3>爱达·魔都号</h3><p>2024 年 1 月首航 · 首艘国产大型邮轮</p></div>
</div>
```

- 验证：每个演示台的幻灯片数量由 5 变 6，图片全部加载成功

### ② 课堂没讲的 Swiper 能力：keyboard 键盘控制

```js
var swiper = new Swiper("#wySw1", {
  keyboard: {
    enabled: true,          // 开启键盘控制
    onlyInViewport: true    // 只有轮播出现在视口内才响应
  }
});
```

- 验证：按 `→`（ArrowRight）`activeIndex` 从 0 变 1；按 `←`（ArrowLeft）回到 0

### 答辩四连

- **这段代码什么意思？** 给演示一轮播挂上 `keyboard` 模块：键盘按下方向键时切换幻灯片；`onlyInViewport` 保证只有轮播在视口里时才响应，避免用户滚动页面时被"劫持"。
- **AI 第一次给的哪里不对？** 第一版给的是 `mousewheel` 方案，滚轮会把整个页面的滚动抢走，在长页面里体验很差；改成 `keyboard` 并加 `onlyInViewport: true`。
- **新参数的作用？** `onlyInViewport` 是"作用域开关"：true 时只有组件在视口内才处理按键，false 时会全局响应。
- **现场把 delay 改成指定值？** 把 `autoplay.delay` 从 3200 改成 1200，预期每 1.2 秒翻一页（圆点高亮变化明显变快、`slideChange` 触发更频繁）；改成 0 或负数则几乎连续滚动。
