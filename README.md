# 🗺️ 秘境 (Hidden Haven) - 反向旅游推荐 MVP

一款帮助"江浙沪"用户在节假日避开拥挤人潮，寻找高性价比、低密度旅游目的地的Web应用。

## 📋 项目概述

**秘境** 是一个反向旅游推荐系统的MVP产品，采用前端静态Mock数据和静态打分算法进行推荐。系统架构为后期接入复杂的AI预测大模型（如时间序列预测客流）留出了标准的API接口。

### ✨ 核心特性

- ✅ **极简搜索界面**：选择出发地和出行偏好，一键获取个性化推荐
- ✅ **智能推荐算法**：基于好玩度、性价比、拥挤指数、距离的综合打分
- ✅ **响应式设计**：完美适配手机、平板、桌面端
- ✅ **AI接口预留**：代码中明确标注AI接口扩展点，便于后期集成预测模型
- ✅ **丰富数据展示**：拥挤度进度条、消费等级、交通耗时、推荐理由

## 🚀 快速启动

### 前置要求

- Node.js >= 14.0
- npm 或 yarn

### 安装步骤

```bash
# 1. 进入项目目录
cd Hidden_Haven

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中访问
# http://localhost:5173
```

### 构建生产版本

```bash
npm run build

# 构建输出在 dist/ 目录
# 可直接部署到静态托管服务（GitHub Pages, Netlify, Vercel等）
```

## 📁 项目结构

```
Hidden_Haven/
├── src/
│   ├── components/
│   │   ├── HeroSection.jsx          # 首页搜索区（Hero Section）
│   │   ├── RecommendationsSection.jsx # 结果展示区
│   │   └── DestinationCard.jsx      # 单个目的地卡片
│   ├── utils/
│   │   └── algorithm.js              # 推荐算法和工具函数
│   ├── data/
│   │   └── mockData.js               # Mock数据库
│   ├── App.jsx                       # 主应用入口
│   ├── main.jsx                      # React入口
│   └── index.css                     # 全局样式（Tailwind导入）
├── index.html                        # HTML模板
├── package.json                      # 项目依赖配置
├── vite.config.js                    # Vite配置
├── tailwind.config.js                # Tailwind CSS配置
├── postcss.config.js                 # PostCSS配置
├── .gitignore
└── README.md
```

## 🎯 核心功能说明

### 1. 首页搜索区 (Hero Section)

- 📍 **出发地下拉选择**：上海、杭州、南京、苏州
- 🏷️ **出行偏好多选标签**：自然山水、吃货之旅、人文古镇、看海、躺平度假
- 🔔 **搜索按钮**：点击后触发推荐算法，平滑滚动到结果区

### 2. 推荐算法 (algorithm.js)

#### MVP静态逻辑

综合得分公式：

```
综合得分 = (好玩度 × 0.4) + (性价比 × 0.3) - (拥挤指数 × 0.4) - (距离惩罚)
```

**权重说明：**
- **好玩度 (40%)**：0-100分，越高越好
- **性价比 (30%)**：基于酒店均价，价格越低得分越高
- **拥挤指数 (40%)**：0-100分（负向），越低（人越少）得分越高
- **距离惩罚**：每小时扣2.5分

#### AI接口预留

代码中已标注未来扩展点：

```javascript
// 未来替换为实际API调用
const predictions = await fetch('/api/predict-crowd', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    departingCity,
    destinations: topRecommendations.map(d => d.id),
    date: new Date().toISOString(),
    preferences,
  }),
}).then(res => res.json());
```

### 3. 结果展示卡片 (Destination Card)

**卡片内容包括：**
- 📷 目的地封面图
- ⭐ 匹配度分数（百分比）
- 🏷️ 相关标签
- 📊 核心指标：
  - 拥挤预测（进度条+状态标签）
  - 预计消费（￥/晚）
  - 交通耗时（小时）
- 💡 推荐理由（一句话总结）
- 🔗 查看详情按钮（占位）

## 📊 Mock数据结构

### 城市数据示例

```javascript
{
  id: 'city_001',
  name: '浙江·丽水',
  region: '浙江',
  tags: ['自然山水', '躺平度假', '人文古镇'],
  baseMetrics: {
    funScore: 85,           // 好玩度 0-100
    costLevel: 350,         // 节假日酒店均价 (￥)
    crowdIndex: 30,         // 拥挤指数 0-100
  },
  distanceMap: {
    '上海': 3.5,            // 往返耗时 (小时)
    '杭州': 1.5,
    '南京': 4.0,
    '苏州': 3.5,
  },
  description: '被誉为最后的江南秘境...',
  imageUrl: 'https://...',
  transportMode: '高铁',
}
```

### 当前包含的目的地

1. 🏔️ **浙江·丽水** - 最后的江南秘境，山水极佳
2. 🏜️ **浙江·衢州** - 仙居景区，衢山岛看海秘境
3. 🏞️ **安徽·宣城** - 皖南古镇密集，水墨画般山村
4. 🌊 **福建·霞浦** - 滨海摄影天堂，潮汐景观独特
5. 🏘️ **江苏·高邮** - 中国双黄鸭蛋之乡，大运河古镇
6. ⛰️ **浙江·遂昌** - 浙西山区秘境，山清水秀

## 🎨 设计亮点

- **移动优先设计**：采用Mobile First响应式设计
- **Tailwind CSS**：原子化CSS框架，快速迭代
- **Lucide React Icons**：轻量级、现代的图标库
- **平滑交互**：搜索加载动画、平滑滚动、悬停效果
- **色彩系统**：蓝色主题，绿/黄/红警示系统

## 🔒 状态管理

使用 React Hooks 进行状态管理：

- `useState`：管理搜索参数、加载状态、推荐结果
- `useRef`：获取DOM引用，实现平滑滚动
- `useCallback`：优化搜索处理函数

## 📈 未来迭代方向

### Phase 2: 动态数据

- [ ] 接入后端API，获取实时城市数据
- [ ] 集成时间序列预测模型，提供动态拥挤指数预测
- [ ] 接入地图API（高德/Google Maps）
- [ ] 实现用户收藏功能（基于LocalStorage或MongoDB）

### Phase 3: 产品功能

- [ ] 首页推荐（基于季节、天气、热点事件）
- [ ] 目的地详情页（景点介绍、餐厅推荐、评价等）
- [ ] 用户评价和反馈系统
- [ ] 行程规划工具
- [ ] 社区分享功能

### Phase 4: 商业化

- [ ] 酒店和民宿预订整合（佣金模式）
- [ ] 主题旅游包（与旅行社合作）
- [ ] 高级会员制
- [ ] 品牌合作推广

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 | 用户界面构建 |
| 构建工具 | Vite | 快速开发热更新 |
| 样式方案 | Tailwind CSS | 原子化CSS框架 |
| 图标库 | Lucide React | 现代图标库 |
| 状态管理 | React Hooks | useState, useRef, useCallback |
| 部署模式 | 纯静态 | H5/Web应用 |

## 📝 代码注释

项目代码包含详尽的中文注释，特别是：

- 算法核心逻辑（`algorithm.js`）
- 组件接口设计（各React组件）
- AI接口预留点（标注为 `AI接口预留扩展点`）
- Mock数据结构说明（`mockData.js`）

## 🤝 开发建议

### 本地开发

```bash
# 启动开发服务器（包含热更新）
npm run dev

# 在另一个终端检查代码质量（可选）
npm run lint
```

### 代码扩展

#### 添加新的目的地

在 `src/data/mockData.js` 中添加到 `MOCK_DESTINATIONS` 数组：

```javascript
{
  id: 'city_007',
  name: '江苏·同里',
  region: '江苏',
  tags: ['人文古镇', '看水乡'],
  baseMetrics: { funScore: 80, costLevel: 380, crowdIndex: 40 },
  distanceMap: { '上海': 1.5, '杭州': 2.5, '南京': 3.0, '苏州': 0.5 },
  description: '...',
  imageUrl: '...',
  transportMode: '汽车',
}
```

#### 修改算法权重

在 `src/utils/algorithm.js` 的 `calculateScore` 函数中调整权重：

```javascript
// 调整这些系数来改变算法行为
const funScoreComponent = baseMetrics.funScore * 0.4;  // 好玩度权重
const costScoreComponent = ... * 0.3;                   // 性价比权重
const crowdScoreComponent = ... * 0.4;                  // 拥挤度权重
const distancePenalty = distance * 2.5;                 // 距离惩罚系数
```

## 🐛 常见问题

### Q: 为什么推荐结果只有3个？
A: MVP版本采用Top 3推荐策略，方便用户快速决策。可在算法中修改 `slice(0, 3)` 的参数。

### Q: 如何修改推荐算法权重？
A: 编辑 `src/utils/algorithm.js` 中 `calculateScore` 函数的权重系数即可。

### Q: 如何部署到生产环境？
A: 运行 `npm run build`，将 `dist/` 目录上传到任何静态托管服务（GitHub Pages, Netlify, Vercel等）。

## 📄 许可证

MIT License

## 👨‍💻 联系方式

有任何问题或建议，欢迎联系我们！

---

**最后更新**: 2025年4月
**版本**: 0.1.0 (MVP)
**状态**: 开发中 🚀
