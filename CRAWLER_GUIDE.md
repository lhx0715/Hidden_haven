# 秘境数据爬虫使用指南

## 📋 概述

本爬虫用于自动化获取中国旅游城市的"反向旅游"相关数据，包括：
- 🏨 酒店均价（从携程、飞猪爬取）
- 🔥 社交热度指数（从小红书、百度指数）
- 📊 反向旅游评分（自动计算）
- 📤 自动同步到 Supabase 数据库

---

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
# 进入项目目录
cd d:\projects\Hidden_Haven

# 安装爬虫所需依赖
pip install -r requirements-crawler.txt

# 安装 Playwright 浏览器驱动
playwright install chromium
```

### 2️⃣ 配置环境变量

在 `.env.local` 中添加 Supabase Service Role Key：

```bash
# 已有的配置
VITE_SUPABASE_URL=https://aatxpawvvsavyjjqcguj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YeR20nvFSIGSYtIezyu1mA_P60i71AS

# 【新增】Service Role Key（用于爬虫的数据库写入权限）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**如何获取 Service Role Key？**
1. 进入 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制 **Service Role Key**（不是 Anon Key）

### 3️⃣ 运行爬虫

```bash
# 方式一：直接执行
python crawler.py

# 方式二：在后台运行（生成日志）
python crawler.py > crawler_output.log 2>&1
```

---

## 📊 爬虫工作流程

```
┌─────────────────┐
│  目标城市列表    │
└────────┬────────┘
         ↓
┌─────────────────────────────────┐
│ 1️⃣ 数据采集                      │
│  • 携程酒店价格                   │
│  • 飞猪酒店价格                   │
│  • 小红书热度 / 百度指数          │
└────────┬────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ 2️⃣ 数据清洗                       │
│  • 剔除热门/拥挤关键词             │
│  • 验证价格范围 (100-1000 元)    │
│  • 验证拥挤度 (0-100)             │
└────────┬───────────────────────┘
         ↓
┌──────────────────────────────────┐
│ 3️⃣ 数据计算                       │
│  • 反向指数 = (评分/拥挤度)*(1000/价格) │
│  • 标准化指标                     │
└────────┬───────────────────────┘
         ↓
┌──────────────────────────────────┐
│ 4️⃣ 数据同步                       │
│  • cities 表 (upsert)             │
│  • metrics 表 (upsert)            │
│  • 避免重复数据                   │
└──────────────────────────────────┘
```

---

## 🎯 主要函数说明

### `CityDataCrawler` 类

| 方法 | 功能 |
|-----|------|
| `fetch_hotel_price_from_ctrip()` | 从携程爬取酒店价格 |
| `fetch_hotel_price_from_fliggy()` | 从飞猪爬取酒店价格 |
| `fetch_xiaohongshu_heat_index()` | 获取小红书热度 |
| `fetch_baidu_index()` | 获取百度指数 |
| `calculate_reverse_index()` | 计算反向旅游分数 |
| `crawl_all_cities()` | 爬取所有目标城市 |

### `clean_and_validate_data()`
- 剔除包含"人山人海"、"排队"等关键词的城市
- 验证价格在 100-1000 元范围内
- 验证拥挤度在 0-100 范围内

### `sync_to_supabase()`
- 将数据同步到 `cities` 表
- 将每周末的指标同步到 `metrics` 表
- 使用 `upsert` 防止重复数据

---

## ⚙️ 自定义配置

### 1️⃣ 修改目标城市

编辑 `crawler.py` 中的 `TARGET_CITIES`：

```python
TARGET_CITIES = [
    {'name': '丽水', 'province': '浙江'},
    {'name': '宣城', 'province': '安徽'},
    {'name': '宜兴', 'province': '江苏'},
    # 继续添加...
]
```

### 2️⃣ 调整过滤关键词

编辑 `FILTER_KEYWORDS`：

```python
FILTER_KEYWORDS = [
    '人山人海', '排队', '拥挤', '爆满',
    # 添加你的自定义关键词...
]
```

### 3️⃣ 修改反向指数公式

编辑 `calculate_reverse_index()` 方法：

```python
def calculate_reverse_index(self, fun_score: int, crowd_index: int, price: int) -> int:
    # 公式：反向指数 = (风景评分 / 拥挤度) * (1000 / 价格) * 系数
    reverse_index = (fun_score / crowd_index) * (1000 / price) * 10
    return int(reverse_index)
```

---

## ⚠️ 重要说明

### 🚨 爬虫法律合规性

1. **遵守 robots.txt** - 尊重网站的爬虫协议
2. **速率限制** - 脚本中设置了随机延迟 (2-5 秒)，避免对服务器造成压力
3. **用户代理轮换** - 使用多个 User-Agent 避免被检测
4. **仅供学习** - 仅用于个人项目和学习目的，商业用途需获得网站授权

### 🔧 常见问题

**Q: 爬虫超时或无法连接？**
- A: 检查网络连接，或由于网站反爬虫机制，可使用代理
- 建议添加代理配置：
```python
proxies = {
    'http': 'http://proxy.example.com:8080',
    'https': 'http://proxy.example.com:8080',
}
response = self.session.get(url, proxies=proxies)
```

**Q: Supabase 同步失败？**
- A: 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
- 确保数据库中 `cities` 和 `metrics` 表存在
- 查看 `crawler.log` 文件中的错误信息

**Q: 数据产生了重复记录？**
- A: 使用了 `upsert` 方法和 `on_conflict` 参数，应该不会产生重复
- 如果已有重复，手动清理数据库或执行：
```sql
DELETE FROM cities WHERE id NOT IN (
    SELECT MAX(id) FROM cities GROUP BY name
);
```

**Q: 爬虫获取的价格不准确？**
- A: 网站 HTML 结构可能变了，需要根据最新的网页结构调整 CSS 选择器
- 使用浏览器开发者工具 (F12) 检查网页报价元素的 class 或 id

---

## 📈 监控和日志

爬虫会自动生成日志文件：

```bash
# 实时查看日志
tail -f crawler.log

# 查看特定错误
grep "❌" crawler.log
```

典型日志输出：

```
2024-04-15 10:30:25,123 - INFO - 🚀 秘境数据爬虫启动！
2024-04-15 10:30:25,125 - INFO - 📍 目标城市数: 5
2024-04-15 10:30:26,345 - INFO - 🏨 正在获取 丽水 的携程酒店价格...
2024-04-15 10:30:30,567 - INFO - ✅ 丽水 携程酒店均价: ¥350
2024-04-15 10:30:35,789 - INFO - 📤 开始同步到 Supabase...
2024-04-15 10:30:37,901 - INFO - ✅ 成功同步 5 条数据到 Supabase
```

---

## 🔄 定期同步（可选）

### 使用 Windows 任务计划程序

1. 打开**任务计划程序**
2. 创建基本任务
3. 触发器：每天上午 10:00
4. 操作：启动程序
   - Program: `python.exe`
   - Arguments: `d:\projects\Hidden_Haven\crawler.py`
   - Start in: `d:\projects\Hidden_Haven`

### 使用 Linux/Mac Cron

```bash
# 每天早上 10:00 运行一次
0 10 * * * cd /path/to/Hidden_Haven && python crawler.py >> crawler.log 2>&1
```

---

## 📚 参考资源

- [Playwright 文档](https://playwright.dev/python/)
- [Requests 文档](https://requests.readthedocs.io/)
- [Supabase Python 客户端](https://supabase.com/docs/reference/python/introduction)
- [Pandas 数据清洗教程](https://pandas.pydata.org/docs/user_guide/index.html)

---

## 📞 故障排查

如遇到问题，按以下步骤排查：

1. **查看 `crawler.log`** - 找到详细的错误信息
2. **检查网络连接** - `ping github.com`
3. **验证环境变量** - 确保 `.env.local` 配置无误
4. **检查数据库权限** - 确保 Service Role Key 有写入权限
5. **更新依赖** - `pip install --upgrade -r requirements-crawler.txt`

祝你爬虫运行顺利！🎉
