/**
 * 秘境 - Mock 数据库
 * 包含江浙沪周边冷门/平替旅游目的地的完整数据
 */

export const MOCK_DESTINATIONS = [
  {
    id: 'city_001',
    name: '浙江·丽水',
    region: '浙江',
    tags: ['自然山水', '躺平度假', '人文古镇'],
    baseMetrics: {
      funScore: 85,       // 好玩度 0-100
      costLevel: 350,     // 节假日酒店均价预估 (￥)
      crowdIndex: 30,     // 拥挤指数 0-100 (越低越好)
    },
    distanceMap: {
      '上海': 3.5,
      '杭州': 1.5,
      '南京': 4.0,
      '苏州': 3.5,
    },
    description: '被誉为最后的江南秘境，五一期间客流远低于苏杭，山水极佳，适合慢旅行。',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '高铁',
  },
  {
    id: 'city_002',
    name: '浙江·衢州',
    region: '浙江',
    tags: ['自然山水', '吃货之旅', '看海'],
    baseMetrics: {
      funScore: 78,
      costLevel: 320,
      crowdIndex: 25,
    },
    distanceMap: {
      '上海': 4.2,
      '杭州': 2.5,
      '南京': 3.5,
      '苏州': 4.0,
    },
    description: '仙居景区绝美，衢山岛看海秘境，节假日人烟稀少，本地美食独特。',
    imageUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '高铁',
  },
  {
    id: 'city_003',
    name: '安徽·宣城',
    region: '安徽',
    tags: ['人文古镇', '自然山水', '躺平度假'],
    baseMetrics: {
      funScore: 80,
      costLevel: 300,
      crowdIndex: 28,
    },
    distanceMap: {
      '上海': 3.0,
      '杭州': 2.8,
      '南京': 1.2,
      '苏州': 3.2,
    },
    description: '皖南古镇密集，水墨画般的山村，五一期间游客少，酒店便宜，适合摄影。',
    imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '高铁',
  },
  {
    id: 'city_004',
    name: '福建·霞浦',
    region: '福建',
    tags: ['看海', '自然山水', '摄影胜地'],
    baseMetrics: {
      funScore: 82,
      costLevel: 380,
      crowdIndex: 32,
    },
    distanceMap: {
      '上海': 6.5,
      '杭州': 5.8,
      '南京': 5.5,
      '苏州': 6.2,
    },
    description: '滨海摄影天堂，潮汐景观独特，五一人流远少于普陀，海鲜便宜量大。',
    imageUrl: 'https://images.unsplash.com/photo-1495954484750-af469f1dab0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '高铁',
  },
  {
    id: 'city_005',
    name: '江苏·高邮',
    region: '江苏',
    tags: ['吃货之旅', '人文古镇', '躺平度假'],
    baseMetrics: {
      funScore: 75,
      costLevel: 280,
      crowdIndex: 20,
    },
    distanceMap: {
      '上海': 2.5,
      '杭州': 3.2,
      '南京': 1.5,
      '苏州': 2.0,
    },
    description: '中国双黄鸭蛋之乡，大运河古镇风情，旅游开发程度低，物价亲民。',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '汽车',
  },
  {
    id: 'city_006',
    name: '浙江·遂昌',
    region: '浙江',
    tags: ['自然山水', '躺平度假', '吃货之旅'],
    baseMetrics: {
      funScore: 83,
      costLevel: 340,
      crowdIndex: 27,
    },
    distanceMap: {
      '上海': 4.0,
      '杭州': 2.2,
      '南京': 4.5,
      '苏州': 3.8,
    },
    description: '浙西山区秘境，山清水秀，本地山货丰富，五一期间极少游客。',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    transportMode: '汽车',
  },
];

/**
 * 出发地选项
 */
export const DEPARTING_CITIES = [
  { value: '上海', label: '上海' },
  { value: '杭州', label: '杭州' },
  { value: '南京', label: '南京' },
  { value: '苏州', label: '苏州' },
];

/**
 * 出行偏好标签
 */
export const TRAVEL_PREFERENCES = [
  { id: 'nature', label: '自然山水', icon: 'Mountain' },
  { id: 'foodie', label: '吃货之旅', icon: 'UtensilsCrossed' },
  { id: 'culture', label: '人文古镇', icon: 'Building2' },
  { id: 'beach', label: '看海', icon: 'Waves' },
  { id: 'relaxation', label: '躺平度假', icon: 'Sun' },
];
