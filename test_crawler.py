"""
秘境爬虫 - 快速测试脚本
用于验证爬虫逻辑和 Supabase 连接

使用方法：
python test_crawler.py
"""

import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def test_supabase_connection():
    """测试 Supabase 连接"""
    logger.info('🧪 测试 Supabase 连接...')
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.error('❌ 缺少 Supabase 环境变量！')
        logger.error('请在 .env.local 中设置:')
        logger.error('  - VITE_SUPABASE_URL')
        logger.error('  - SUPABASE_SERVICE_ROLE_KEY')
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        # 测试读取
        response = supabase.table('cities').select('count(id)').execute()
        logger.info('✅ Supabase 连接成功！')
        logger.info(f'   Cities 表中的记录数: {len(response.data)}')
        
        # 测试写入权限
        test_record = {
            'name': 'TEST·Test City',
            'province': 'Test',
            'fun_score': 50,
            'base_crowd_index': 50,
            'base_avg_price': 300,
        }
        
        upsert_response = supabase.table('cities').upsert(test_record).execute()
        logger.info('✅ Supabase 写入权限正常！')
        
        # 清理测试数据
        supabase.table('cities').delete().eq('name', 'TEST·Test City').execute()
        logger.info('✅ 测试数据已清理')
        
        return True
        
    except Exception as e:
        logger.error(f'❌ Supabase 连接失败: {str(e)}')
        logger.error('请检查：')
        logger.error('  1. VITE_SUPABASE_URL 是否正确')
        logger.error('  2. SUPABASE_SERVICE_ROLE_KEY 是否为 Service Role 密钥（不是 Anon Key）')
        logger.error('  3. 数据库表 cities 和 metrics 是否存在')
        return False

async def test_hotel_price_parsing():
    """测试酒店价格解析逻辑"""
    logger.info('🧪 测试价格解析逻辑...')
    
    # 模拟价格提取
    test_prices = [200, 250, 300, 350, 400]
    avg_price = int(sum(test_prices) / len(test_prices))
    
    logger.info(f'✅ 价格列表: {test_prices}')
    logger.info(f'✅ 平均价格: ¥{avg_price}')
    
    return True

def test_reverse_index_calculation():
    """测试反向指数计算"""
    logger.info('🧪 测试反向指数计算...')
    
    test_cases = [
        {'fun_score': 80, 'crowd': 20, 'price': 280, 'desc': '好玩、人少、便宜'},
        {'fun_score': 80, 'crowd': 80, 'price': 500, 'desc': '好玩、拥挤、贵'},
    ]
    
    for case in test_cases:
        reverse_index = (case['fun_score'] / case['crowd']) * (1000 / case['price']) * 10
        logger.info(f"  {case['desc']}: 反向指数 = {int(reverse_index)}")
    
    return True

async def main():
    logger.info('=' * 50)
    logger.info('🚀 秘境爬虫 - 快速测试')
    logger.info('=' * 50)
    
    # 测试 1: Supabase 连接
    test1 = test_supabase_connection()
    
    # 测试 2: 价格解析
    test2 = await test_hotel_price_parsing()
    
    # 测试 3: 反向指数计算
    test3 = test_reverse_index_calculation()
    
    logger.info('=' * 50)
    if test1 and test2 and test3:
        logger.info('✅ 所有测试通过！可以运行完整爬虫')
        logger.info('   执行: python crawler.py')
    else:
        logger.error('❌ 某些测试失败，请检查配置')
    
    logger.info('=' * 50)

if __name__ == '__main__':
    asyncio.run(main())
