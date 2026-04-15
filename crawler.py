"""
秘境 - 反向旅游指数数据爬虫
功能：爬取中国旅游城市的酒店价格、热度指数，计算反向旅游评分，同步到 Supabase

安装依赖：
pip install playwright requests pandas supabase python-dotenv beautifulsoup4
playwright install chromium

使用方法：
python crawler.py
"""

import os
import json
import time
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dotenv import load_dotenv
import pandas as pd
import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import asyncio
from supabase import create_client, Client

# ===================================
# 日志配置
# ===================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ===================================
# 环境变量加载
# ===================================
load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    logger.error('❌ 缺少 Supabase 环境变量！')
    logger.error('请在 .env 中设置 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
    exit(1)

# ===================================
# Supabase 客户端初始化
# ===================================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ===================================
# 爬虫配置
# ===================================

# 目标城市列表（可根据需要扩展）
TARGET_CITIES = [
    {'name': '丽水', 'province': '浙江'},
    {'name': '宣城', 'province': '安徽'},
    {'name': '高邮', 'province': '江苏'},
    {'name': '宜兴', 'province': '江苏'},
    {'name': '舟山', 'province': '浙江'},
    {'name': '景德镇', 'province': '江西'},
    {'name': '黄山', 'province': '安徽'},
    {'name': '千岛湖', 'province': '浙江'},
    # 可继续添加...
]

# 需要过滤的关键词（人山人海的景点）
FILTER_KEYWORDS = [
    '人山人海', '排队', '拥挤', '爆满', '热门', '打卡圣地', '网红',
]

# User-Agent 列表
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
]

# ===================================
# 数据采集函数
# ===================================

class CityDataCrawler:
    """城市数据爬虫类"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': random.choice(USER_AGENTS)})

    async def fetch_hotel_price_from_ctrip(self, city_name: str) -> Optional[int]:
        """
        从携程获取酒店均价
        
        注意：这是一个示例实现。实际的携程页面结构可能不同，需要根据最新 HTML 调整选择器。
        """
        try:
            logger.info(f'🏨 正在获取 {city_name} 的携程酒店价格...')
            
            url = f'https://hotels.ctrip.com/Domestic/Search?SearchText={city_name}'
            
            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                await page.goto(url, timeout=10000)
                
                # 等待页面加载
                await page.wait_for_timeout(3000)
                
                # 获取酒店价格列表（需要根据实际页面结构调整）
                prices = await page.evaluate("""
                    () => {
                        const priceElements = document.querySelectorAll('.price-info span');
                        const prices = [];
                        priceElements.forEach(el => {
                            const text = el.textContent.replace(/[^0-9]/g, '');
                            if (text) prices.push(parseInt(text));
                        });
                        return prices.slice(0, 10); // 取前10个价格
                    }
                """)
                
                await browser.close()
                
                if prices:
                    avg_price = int(sum(prices) / len(prices))
                    logger.info(f'✅ {city_name} 携程酒店均价: ¥{avg_price}')
                    return avg_price
                else:
                    logger.warn(f'⚠️  {city_name} 携程未获取到价格')
                    return None
                    
        except Exception as e:
            logger.error(f'❌ 获取 {city_name} 携程价格失败: {str(e)}')
            return None

    def fetch_hotel_price_from_fliggy(self, city_name: str) -> Optional[int]:
        """
        从飞猪获取酒店均价
        
        飞猪使用动态加载，建议用 Playwright 实现
        """
        try:
            logger.info(f'🏨 正在获取 {city_name} 的飞猪酒店价格...')
            
            # 飞猪 API 端点（需要抓包获取最新端点）
            url = 'https://hotels.fliggy.com/search'
            params = {
                'keyword': city_name,
                'page': 1,
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.encoding = 'utf-8'
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 提取价格（需要根据实际 HTML 结构调整选择器）
            price_elements = soup.find_all('span', class_='price')
            prices = []
            
            for el in price_elements[:10]:  # 取前10个价格
                try:
                    price_text = el.get_text(strip=True)
                    price = int(''.join(filter(str.isdigit, price_text)))
                    if 100 <= price <= 1000:  # 合理范围过滤
                        prices.append(price)
                except:
                    pass
            
            if prices:
                avg_price = int(sum(prices) / len(prices))
                logger.info(f'✅ {city_name} 飞猪酒店均价: ¥{avg_price}')
                return avg_price
            else:
                logger.warn(f'⚠️  {city_name} 飞猪未获取到价格')
                return None
                
        except Exception as e:
            logger.error(f'❌ 获取 {city_name} 飞猪价格失败: {str(e)}')
            return None

    def fetch_xiaohongshu_heat_index(self, city_name: str) -> Optional[int]:
        """
        从小红书获取热度指数
        
        小红书有反爬虫机制，这里使用模拟 API 调用
        实际使用时可能需要用 Playwright + 反爬虫对抗
        """
        try:
            logger.info(f'🔥 正在获取 {city_name} 的小红书热度指数...')
            
            # 【方案】通过小红书搜索页面的动态数据获取
            # 实际的小红书 API 需要正确的 token 和 headers，这里是框架代码
            
            url = 'https://edith.xiaohongshu.com/web_api/web_v1/homefeed_recommend'
            
            headers = {
                'User-Agent': random.choice(USER_AGENTS),
                'Referer': 'https://www.xiaohongshu.com/',
            }
            
            params = {
                'feed_type': 'homefeed',
                'num': 20,
                'refresh_type': 1,
                'note_index': 0,
                'unread_begin_note_id': '',
                'unread_end_note_id': '',
                'unread_note_count': 0,
                'category': 0,
            }
            
            # 注意：这个请求可能需要验证和 cookie
            # response = self.session.get(url, params=params, headers=headers, timeout=10)
            
            # 【临时方案】使用百度指数替代
            heat_index = self.fetch_baidu_index(city_name)
            return heat_index
            
        except Exception as e:
            logger.error(f'❌ 获取 {city_name} 小红书热度失败: {str(e)}')
            return None

    def fetch_baidu_index(self, city_name: str) -> int:
        """
        从百度指数获取搜索热度
        
        百度指数免费版通过页面抓取，需要解析 JS 生成的数据
        """
        try:
            logger.info(f'📊 正在获取 {city_name} 的百度指数...')
            
            url = 'https://index.baidu.com/api/SearchrApi/index'
            
            headers = {
                'User-Agent': random.choice(USER_AGENTS),
                'Referer': 'https://index.baidu.com/',
            }
            
            # 百度指数 API (需要提交关键词)
            keyword = f'{city_name}旅游'
            
            # 【注意】百度指数有反爬机制，这里是伪代码
            # 实际使用需要破解 token 或使用爬虫代理
            
            # 临时方案：返回一个基于城市名长度的伪热度值
            # 实际项目应该使用真实的 API
            heat_index = 50 + len(city_name) * 10
            
            logger.info(f'✅ {city_name} 百度指数（模拟）: {heat_index}')
            return heat_index
            
        except Exception as e:
            logger.error(f'❌ 获取 {city_name} 百度指数失败: {str(e)}')
            return 50  # 默认值

    def calculate_reverse_index(self, fun_score: int, crowd_index: int, price: int) -> int:
        """
        计算反向旅游指数
        
        公式：反向指数 = (风景评分 / 拥挤度) * (1000 / 价格) * 100
        目的：评分高、人少、便宜的地方得分高
        """
        try:
            if crowd_index == 0:
                crowd_index = 1  # 避免除零
            
            reverse_index = (fun_score / crowd_index) * (1000 / price) * 10
            return int(reverse_index)
        except Exception as e:
            logger.error(f'❌ 计算反向指数失败: {str(e)}')
            return 50

    async def crawl_all_cities(self) -> List[Dict]:
        """
        爬取所有目标城市的数据
        """
        results = []
        
        for city in TARGET_CITIES:
            try:
                city_name = city['name']
                province = city['province']
                
                # 获取酒店价格
                ctrip_price = await self.fetch_hotel_price_from_ctrip(city_name)
                fliggy_price = self.fetch_hotel_price_from_fliggy(city_name)
                
                # 取平均值，或使用单一来源
                avg_price = None
                if ctrip_price and fliggy_price:
                    avg_price = int((ctrip_price + fliggy_price) / 2)
                elif ctrip_price:
                    avg_price = ctrip_price
                elif fliggy_price:
                    avg_price = fliggy_price
                else:
                    avg_price = 300  # 默认值
                
                # 获取热度指数
                heat_index = self.fetch_xiaohongshu_heat_index(city_name)
                
                # 计算反向指数（假设风景评分为 80，拥挤度基于热度）
                fun_score = 80  # 可以根据实际景点评价调整
                crowd_estimate = min(100, heat_index)  # 热度越高，拥挤度越高
                reverse_index = self.calculate_reverse_index(fun_score, crowd_estimate, avg_price)
                
                result = {
                    'name': f'{province}·{city_name}',
                    'province': province,
                    'city': city_name,
                    'fun_score': fun_score,
                    'base_crowd_index': crowd_estimate,
                    'base_avg_price': avg_price,
                    'heat_index': heat_index,
                    'reverse_index': reverse_index,
                    'crawled_at': datetime.now().isoformat(),
                }
                
                results.append(result)
                
                # 随机延迟，避免被反爬虫阻止
                await asyncio.sleep(random.uniform(2, 5))
                
            except Exception as e:
                logger.error(f'❌ 爬取 {city_name} 失败: {str(e)}')
                continue
        
        return results

# ===================================
# 数据清洗和验证
# ===================================

def clean_and_validate_data(data: List[Dict]) -> pd.DataFrame:
    """
    清洗数据：
    1. 剔除包含过滤关键词的城市
    2. 格式化价格
    3. 验证数据合理性
    """
    logger.info('🧹 开始数据清洗...')
    
    # 转换为 DataFrame
    df = pd.DataFrame(data)
    
    if df.empty:
        logger.warn('⚠️  无有效数据')
        return df
    
    # 剔除包含过滤关键词的城市
    for keyword in FILTER_KEYWORDS:
        df = df[~df['city'].str.contains(keyword, case=False, na=False)]
    
    logger.info(f'✅ 清洗后保留 {len(df)} 条城市数据')
    
    # 验证价格合理性
    df = df[(df['base_avg_price'] >= 100) & (df['base_avg_price'] <= 1000)]
    
    # 验证拥挤度 0-100
    df = df[(df['base_crowd_index'] >= 0) & (df['base_crowd_index'] <= 100)]
    
    logger.info(f'✅ 验证后保留 {len(df)} 条有效数据')
    
    return df

# ===================================
# Supabase 同步
# ===================================

def sync_to_supabase(df: pd.DataFrame) -> bool:
    """
    将清洗后的数据同步到 Supabase
    使用 upsert 方法确保不产生重复
    """
    if df.empty:
        logger.warn('⚠️  无数据可同步')
        return False
    
    try:
        logger.info('📤 开始同步到 Supabase...')
        
        # 准备数据格式
        records = []
        for _, row in df.iterrows():
            record = {
                'name': row['name'],
                'province': row['province'],
                'fun_score': int(row['fun_score']),
                'base_crowd_index': int(row['base_crowd_index']),
                'base_avg_price': int(row['base_avg_price']),
                'updated_at': datetime.now().isoformat(),
            }
            records.append(record)
        
        # 使用 upsert 同步数据（根据 name 作为唯一键）
        # 如果城市已存在，则更新；否则插入
        response = supabase.table('cities').upsert(
            records,
            on_conflict='name'  # 按 name 字段作为冲突解决关键字
        ).execute()
        
        logger.info(f'✅ 成功同步 {len(records)} 条数据到 Supabase')
        
        # 同步 metrics 数据（不同季节的指标）
        # 这里假设都是周末数据
        metrics_records = []
        for _, row in df.iterrows():
            # 获取该城市的 ID（从已插入的数据中查询）
            city_response = supabase.table('cities').select('id').eq('name', row['name']).execute()
            
            if city_response.data and len(city_response.data) > 0:
                city_id = city_response.data[0]['id']
                
                metric = {
                    'city_id': city_id,
                    'season_type': 'weekend',
                    'crowd_index': int(row['base_crowd_index']),
                    'avg_price': int(row['base_avg_price']),
                    'travel_time_map': json.dumps({
                        '上海': 3.0,
                        '杭州': 2.0,
                        '南京': 2.5,
                        '苏州': 2.5,
                    }),
                }
                metrics_records.append(metric)
        
        if metrics_records:
            metrics_response = supabase.table('metrics').upsert(
                metrics_records,
                on_conflict='city_id,season_type'
            ).execute()
            logger.info(f'✅ 成功同步 {len(metrics_records)} 条 metrics 数据')
        
        return True
        
    except Exception as e:
        logger.error(f'❌ 同步到 Supabase 失败: {str(e)}')
        return False

# ===================================
# 主函数
# ===================================

async def main():
    """主函数：协调爬虫、清洗、同步流程"""
    
    logger.info('🚀 秘境数据爬虫启动！')
    logger.info(f'📍 目标城市数: {len(TARGET_CITIES)}')
    
    # 初始化爬虫
    crawler = CityDataCrawler()
    
    # 爬取数据
    logger.info('⏱️  开始爬取数据...')
    raw_data = await crawler.crawl_all_cities()
    
    if not raw_data:
        logger.error('❌ 未获取到任何数据')
        return
    
    logger.info(f'✅ 成功爬取 {len(raw_data)} 条原始数据')
    
    # 清洗数据
    df_cleaned = clean_and_validate_data(raw_data)
    
    # 同步到 Supabase
    if sync_to_supabase(df_cleaned):
        logger.info('✅ 爬虫执行完成！')
    else:
        logger.error('❌ 数据同步失败')

if __name__ == '__main__':
    asyncio.run(main())
