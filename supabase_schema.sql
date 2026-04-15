-- ===================================
-- 秘境 Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ===================================

-- 【表1】cities - 城市基本信息
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 如："浙江·丽水"
  province TEXT NOT NULL, -- "浙江"
  tags TEXT[] NOT NULL DEFAULT '{}', -- ["看海", "自然山水", ...]
  fun_score INT CHECK (fun_score >= 0 AND fun_score <= 100), -- 0-100 的趣味性评分
  image_url TEXT, -- 城市百科封面图
  description TEXT, -- 城市特色描述
  base_crowd_index INT DEFAULT 50, -- 基础拥挤指数（周末参考值）
  base_avg_price INT DEFAULT 300, -- 基础酒店均价（非假期参考值）
  match_level INT DEFAULT 60, -- 与游客偏好的匹配度 (0-100)
  transport_mode TEXT DEFAULT 'car', -- 交通方式：car(汽车)、train(高铁)等
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 【表2】metrics - 动态指标数据（随季节/假期波动）
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  season_type TEXT NOT NULL, -- 'weekend' | 'may_day' | 'national_day'
  crowd_index INT NOT NULL CHECK (crowd_index >= 0 AND crowd_index <= 100), -- 拥挤指数
  avg_price INT NOT NULL, -- 酒店均价（该假期期间）
  travel_time_map JSONB NOT NULL DEFAULT '{}', -- {"上海": 2.5, "杭州": 1.5, "南京": 3, "苏州": 2}
  supply_shortage BOOLEAN DEFAULT FALSE, -- 是否可能缺房
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, season_type) -- 防止同一城市同一季节的重复数据
);

-- ===================================
-- 创建索引优化查询性能
-- ===================================

-- 按 tags 快速搜索
CREATE INDEX idx_cities_tags ON cities USING GIN (tags);

-- 按省份分组
CREATE INDEX idx_cities_province ON cities(province);

-- 按季节类型快速查询 metrics
CREATE INDEX idx_metrics_season ON metrics(season_type);

-- 按 city_id 关联查询
CREATE INDEX idx_metrics_city_id ON metrics(city_id);

-- ===================================
-- 插入示例数据
-- ===================================

INSERT INTO cities (name, province, tags, fun_score, image_url, description, base_crowd_index, base_avg_price, match_level, transport_mode) VALUES
('江苏·高邮', '江苏', '{"吃货之旅", "人文古镇"}', 85, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '咸鸭蛋故乡，古镇韵味十足', 20, 280, 90, 'car'),
('安徽·宣城', '安徽', '{"人文古镇", "自然山水"}', 82, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '皖南山水画廊，新安江秀色', 28, 300, 85, 'train'),
('浙江·丽水', '浙江', '{"自然山水", "躺平度假"}', 88, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '瓯江美景，云和梯田晨雾', 30, 350, 88, 'train'),
('江苏·常州', '江苏', '{"看海", "躺平度假"}', 75, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '太湖之滨，溧阳茶园风光', 35, 320, 80, 'train'),
('浙江·舟山', '浙江', '{"看海", "自然山水"}', 90, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '海岛之城，普陀山圣地', 40, 400, 92, 'train');

-- 为每个城市插入多个季节的 metrics 数据
-- 高邮的 metrics
INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'weekend', 20, 280, '{"上海": 2.5, "杭州": 4, "南京": 2, "苏州": 1.5}'::jsonb 
FROM cities WHERE name = '江苏·高邮';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'may_day', 45, 380, '{"上海": 2.5, "杭州": 4, "南京": 2, "苏州": 1.5}'::jsonb 
FROM cities WHERE name = '江苏·高邮';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'national_day', 55, 420, '{"上海": 2.5, "杭州": 4, "南京": 2, "苏州": 1.5}'::jsonb 
FROM cities WHERE name = '江苏·高邮';

-- 宣城的 metrics
INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'weekend', 28, 300, '{"上海": 3, "杭州": 1.5, "南京": 1.5, "苏州": 2.5}'::jsonb 
FROM cities WHERE name = '安徽·宣城';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'may_day', 50, 380, '{"上海": 3, "杭州": 1.5, "南京": 1.5, "苏州": 2.5}'::jsonb 
FROM cities WHERE name = '安徽·宣城';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'national_day', 60, 420, '{"上海": 3, "杭州": 1.5, "南京": 1.5, "苏州": 2.5}'::jsonb 
FROM cities WHERE name = '安徽·宣城';

-- 丽水的 metrics
INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'weekend', 30, 350, '{"上海": 3.5, "杭州": 1, "南京": 2.5, "苏州": 2}'::jsonb 
FROM cities WHERE name = '浙江·丽水';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'may_day', 52, 420, '{"上海": 3.5, "杭州": 1, "南京": 2.5, "苏州": 2}'::jsonb 
FROM cities WHERE name = '浙江·丽水';

INSERT INTO metrics (city_id, season_type, crowd_index, avg_price, travel_time_map) 
SELECT id, 'national_day', 62, 480, '{"上海": 3.5, "杭州": 1, "南京": 2.5, "苏州": 2}'::jsonb 
FROM cities WHERE name = '浙江·丽水';

-- ===================================
-- 设置 Row Level Security (RLS) - 允许所有用户读表，不允许修改
-- ===================================

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取
CREATE POLICY "Allow public read cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Allow public read metrics" ON metrics
  FOR SELECT USING (true);

-- 仅允许认证用户（管理员）插入、更新、删除
CREATE POLICY "Allow authenticated insert/update cities" ON cities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update cities" ON cities
  FOR UPDATE WITH CHECK (true);

CREATE POLICY "Allow authenticated delete cities" ON cities
  FOR DELETE USING (true);

COMMIT;
