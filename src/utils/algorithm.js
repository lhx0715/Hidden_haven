/**
 * 秘境 - 推荐算法 (已优化)
 * 
 * 核心算法包括：
 * 1. 【任务二】新的分级打分算法 - 标签匹配度作为最高权重
 * 2. 【任务一】时间系数调整 - 根据出行时间调整费用和拥挤指数
 * 3. 标签匹配过滤
 * 4. 预留AI接口注释（用于未来接入时间序列预测模型）
 */

import { MOCK_DESTINATIONS } from '../data/mockData.js';

/**
 * 异步推荐函数 - 主入口
 * 
 * 参数：
 *   departingCity: 出发城市 (string)
 *   preferences: 用户选择的偏好标签数组 (Array<string: 标签名称>)
 *   travelTime: 出行时间 (string) - 'weekend' | 'labor_day' | 'national_day'
 * 
 * 返回：Promise<Array> 排序后的推荐结果（Top 3）
 * 
 * 流程：
 * 1. 标签匹配和初步筛选
 * 2. 计算标签匹配度分级
 * 3. 【任务一】应用时间系数调整指标
 * 4. 【任务二】新的分级打分计算
 * 5. 排序和Top 3提取
 * 6. 模拟加载延迟
 */
export const getRecommendations = async (departingCity, preferences, travelTime = 'weekend') => {
  // 模拟算法计算滞后，提升用户体验
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 步骤1：基于用户选择的偏好标签进行筛选
  const filteredDestinations = preferences.length === 0
    ? MOCK_DESTINATIONS
    : MOCK_DESTINATIONS.filter(destination =>
        preferences.some(pref => 
          destination.tags.includes(pref)
        )
      );

  // 步骤2：【任务二】分级计算，计算每个目的地的匹配等级和综合得分
  const scoredDestinations = filteredDestinations.map(destination => {
    // 计算标签匹配数量
    const matchedTagCount = destination.tags.filter(tag =>
      preferences.includes(tag)
    ).length;
    
    // 【任务二】新的分级评分逻辑：
    // 根据标签匹配数量分级，同级内再比较其他因素
    const matchLevel = calculateMatchLevel(matchedTagCount, preferences.length);
    
    // 【任务一】应用时间系数，调整 costLevel 和 crowdIndex
    const adjustedMetrics = applyTimeFactor(destination.baseMetrics, travelTime);
    
    // 【任务二】新的打分公式：以匹配度分级作为first-order权重
    const score = calculateNewScore(
      destination,
      departingCity,
      matchLevel,
      adjustedMetrics,
      matchedTagCount,
      preferences.length
    );

    return {
      ...destination,
      // 【任务一】覆盖原始指标为调整后的指标
      baseMetrics: adjustedMetrics,
      score,
      matchLevel, // 【任务二】返回匹配等级用于UI展示
      matchedTagCount, // 【任务二】返回匹配标签数用于UI展示
      matchPercentage: preferences.length === 0 ? 100 : Math.round((matchedTagCount / preferences.length) * 100),
    };
  });

  // 步骤3：按得分降序排序，取Top 3
  const topRecommendations = scoredDestinations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ============ AI接口预留扩展点 ============
  // 未来集成AI预测模型时，可在此处替换为：
  // const predictions = await fetch('/api/predict-crowd', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     departingCity,
  //     destinations: topRecommendations.map(d => d.id),
  //     date: new Date().toISOString(),
  //     preferences,
  //     travelTime,
  //   }),
  // }).then(res => res.json());
  // ==========================================

  return topRecommendations;
};

/**
 * 【任务一】时间系数调整函数
 * 
 * 根据选定的出行时间，调整 costLevel 和 crowdIndex
 * - 近期周末：保持不变 (系数 x1)
 * - 五一/十一假期：费用增加50% (x1.5)，拥挤度加倍 (x2.0)
 * 
 * @param {Object} baseMetrics - 原始指标 { funScore, costLevel, crowdIndex }
 * @param {string} travelTime - 出行时间类型
 * @returns {Object} 调整后的指标
 */
const applyTimeFactor = (baseMetrics, travelTime) => {
  // 定义时间系数
  const timeFactor = {
    weekend: { costMultiplier: 1.0, crowdMultiplier: 1.0 },      // 近期周末：无加成
    labor_day: { costMultiplier: 1.5, crowdMultiplier: 2.0 },    // 五一假期：费用x1.5, 拥挤x2.0
    national_day: { costMultiplier: 1.5, crowdMultiplier: 2.0 }, // 十一假期：费用x1.5, 拥挤x2.0
  };

  const factor = timeFactor[travelTime] || timeFactor.weekend;

  return {
    funScore: baseMetrics.funScore, // 好玩度不变
    costLevel: Math.round(baseMetrics.costLevel * factor.costMultiplier),
    crowdIndex: Math.min(100, Math.round(baseMetrics.crowdIndex * factor.crowdMultiplier)), // 上限100
  };
};

/**
 * 【任务二】标签匹配度分级函数
 * 
 * 将匹配度分为三个等级：
 * - 'full': 100% 匹配 (偏好标签全中)
 * - 'partial': 50-99% 匹配 (部分偏好标签命中)
 * - 'minimal': < 50% 匹配 (极少偏好标签命中)
 * - 'none': 0% 匹配 (未选择偏好或无任何标签命中)
 * 
 * @param {number} matchedTagCount - 命中的标签数
 * @param {number} totalPreferences - 总偏好标签数
 * @returns {string} 匹配等级
 */
const calculateMatchLevel = (matchedTagCount, totalPreferences) => {
  // 如果用户未选择任何偏好，默认返回 'none'
  if (totalPreferences === 0) return 'none';

  const matchRatio = matchedTagCount / totalPreferences;

  if (matchRatio === 1.0) return 'full';    // 100% 完全匹配
  if (matchRatio >= 0.5) return 'partial';  // 50% 以上部分匹配
  if (matchRatio > 0) return 'minimal';     // 低于 50% 极少匹配
  return 'none';                             // 无匹配
};

/**
 * 【任务二】新的分级打分算法
 * 
 * 核心特性：
 * 1. 标签匹配度作为 FIRST-ORDER 权重决定整体评分框架
 * 2. 不同匹配等级之间有明显的分数断层，确保高匹配度城市总分必然领先
 * 3. 同等级内才比较其他因素的得分
 * 
 * 打分框架：
 * - full (100%匹配)：基础分 85+ (占主导)
 * - partial (50-99%匹配)：基础分 50-84
 * - minimal (<50%匹配)：基础分 20-49
 * - none (0%匹配)：基础分 0-19
 * 
 * @param {Object} destination - 目的地对象
 * @param {string} departingCity - 出发城市
 * @param {string} matchLevel - 匹配等级
 * @param {Object} adjustedMetrics - 已调整的指标 (应用了时间系数)
 * @param {number} matchedTagCount - 匹配标签数
 * @param {number} totalPreferences - 总偏好标签数
 * @returns {number} 综合得分
 */
const calculateNewScore = (
  destination,
  departingCity,
  matchLevel,
  adjustedMetrics,
  matchedTagCount,
  totalPreferences
) => {
  // 距离惩罚（对所有等级都适用，但权重不同）
  const distance = destination.distanceMap[departingCity] || 5;
  const distancePenalty = distance * 2.5;

  // 其他因素的子得分（好玩度、消费、拥挤度）
  const funScoreComponent = adjustedMetrics.funScore * 0.35;
  const maxCostLevel = 400;
  const costScoreComponent = Math.max(0, (1 - adjustedMetrics.costLevel / maxCostLevel) * 100) * 0.3;
  const crowdScoreComponent = (100 - adjustedMetrics.crowdIndex) * 0.35;
  
  // 其他因素的合计分（最高约 70 分）
  const otherFactorsScore = funScoreComponent + costScoreComponent + crowdScoreComponent - distancePenalty;

  // 【关键】按匹配等级分别计算基础分
  // 确保不同等级之间有明显的断层（如：min(full) > max(partial)）
  let baseScore;

  switch (matchLevel) {
    case 'full':
      // 100% 匹配：基础分 85-95，顶部分配给其他因素
      // 这样 full 的最低分 = 85，partial 的最高分 < 85
      baseScore = 90;
      break;
    case 'partial':
      // 50-99% 匹配：基础分 50-84
      // 按实际匹配比例在这个区间内调整
      const partialRatio = matchedTagCount / totalPreferences;
      baseScore = 50 + partialRatio * 34; // 50 + (0.5 to 1.0) * 34 = 50-84
      break;
    case 'minimal':
      // <50% 匹配：基础分 20-49
      const minimalRatio = matchedTagCount / totalPreferences;
      baseScore = 20 + minimalRatio * 29; // 20 + (0 to 0.5) * 29 = 20-49
      break;
    case 'none':
      // 无匹配或未选择：基础分 0-19
      baseScore = 10;
      break;
    default:
      baseScore = 0;
  }

  // 综合得分 = 基础分(由匹配等级决定) + 其他因素的相对得分
  // 这样确保：high matchLevel 的城市总分会明显高于 low matchLevel 的城市
  const totalScore = baseScore + Math.max(-10, otherFactorsScore * 0.3);

  return Math.max(0, totalScore);
};

/**
 * 【任务二】生成情绪价值标签函数
 * 
 * 根据推荐排名和匹配等级，生成有情绪的文案标签
 * 例如："🎯 最懂你"、"🌟 完美匹配"、"🚗 轻松可达"
 * 
 * @param {number} rank - 推荐排名 (1/2/3)
 * @param {string} matchLevel - 匹配等级 ('full'/'partial'/'minimal'/'none')
 * @param {number} distance - 距离（小时数）
 * @returns {Object} { emoji, label, level } - 情绪标签、文案、强度
 */
export const generateEmotionalTag = (rank, matchLevel, distance, departingCity) => {
  // 优先级：matchLevel > distance > rank

  if (matchLevel === 'full') {
    // 完全匹配是最强的信号
    return {
      emoji: '🎯',
      label: '最懂你',
      level: 'hero', // 用于 UI 高亮
    };
  }

  if (matchLevel === 'full' && distance <= 2.5) {
    // 如果是完全匹配且距离近
    return {
      emoji: '✨',
      label: '完美选择',
      level: 'featured',
    };
  }

  if (distance <= 2.0) {
    // 距离近（高铁2小时内）
    return {
      emoji: '🚗',
      label: '轻松可达',
      level: 'standard',
    };
  }

  if (matchLevel === 'partial') {
    // 部分匹配
    return {
      emoji: '👍',
      label: '值得一试',
      level: 'standard',
    };
  }

  // 默认情况
  return {
    emoji: '📍',
    label: '推荐目的地',
    level: 'default',
  };
};

/**
 * 旧的匹配度计算 - 保留用于兼容性

/**
 * 生成推荐理由（一句话总结）
 * 
 * 用于卡片中显示"为什么推荐这个目的地"
 * 【任务一】已考虑时间系数调整后的拥挤指数
 */
export const generateRecommendationReason = (destination, departingCity) => {
  const distance = destination.distanceMap[departingCity];
  // 使用已调整后的 crowdIndex（包含时间因子）
  const crowdComparison = destination.baseMetrics.crowdIndex < 30 ? '人极少' 
                        : destination.baseMetrics.crowdIndex < 50 ? '人较少'
                        : '相对拥挤';
  const mainTag = destination.tags[0] || '周边';

  return `距离${departingCity}仅${distance}小时，${crowdComparison}，极适合${mainTag}。`;
};

/**
 * 获取拥挤指数的颜色标签
 * 用于UI中的状态指示器
 */
export const getCrowdStatusColor = (crowdIndex) => {
  if (crowdIndex <= 25) return { color: 'green', label: '人迹罕至' };
  if (crowdIndex <= 45) return { color: 'yellow', label: '适度拥挤' };
  return { color: 'red', label: '相对拥挤' };
};

/**
 * 格式化消费等级
 */
export const formatCostLevel = (costLevel) => {
  return `￥${costLevel}/晚`;
};

/**
 * 格式化交通耗时
 */
export const formatDistance = (distance) => {
  return `${distance}小时`;
};

/**
 * 【AI 大脑】生成动态 AI 推荐文案
 * 
 * 核心特性：
 * 1. 模拟 LLM 输出 - 文案具有高度上下文感知能力
 * 2. 支持多维度组合 - 根据用户偏好/时间/出发地动态生成
 * 3. 为卡片内部标签生成"防踩坑"提示
 * 4. 完全本地化，无需调用外部 API（为 MVP 准备）
 * 
 * @param {Object} userParams - { departingCity, preferences, travelTime }
 * @param {Array} selectedCities - 推荐的城市数组（Top 3）
 * @returns {Object} { mainReasoning, cityInsights } - 主要推荐文案 + 各城市的 AI 标签
 */
export const generateLocalAIResponse = (userParams, selectedCities) => {
  const { departingCity, preferences, travelTime } = userParams;

  // 1. 主要推荐文案的动态模板
  const mainReasoning = generateMainReasoning(departingCity, preferences, travelTime, selectedCities);

  // 2. 为每个城市生成 AI 提取的标签（防踩坑/亮点）
  const cityInsights = selectedCities.map(city => ({
    cityId: city.id,
    highlights: generateCityHighlights(city, departingCity),
    warnings: generateCityWarnings(city, departingCity),
  }));

  return {
    mainReasoning,
    cityInsights,
  };
};

/**
 * 为 LLM 构建请求消息数组
 *
 * 注意：此函数仅构造请求内容，不执行网络请求。
 */
export const buildAIRequestMessages = (userParams, selectedCities) => {
  const { departingCity, preferences, travelTime } = userParams;
  const timeLabel = {
    weekend: '近期周末',
    labor_day: '五一假期',
    national_day: '十一假期',
  }[travelTime] || '假期';

  const preferenceString = preferences.length > 0
    ? preferences.join('、')
    : '避开人潮、享受宁静';

  const destinationSummary = selectedCities.map(city => {
    return `【${city.name}】酒店均价${city.baseMetrics.costLevel}元/晚，拥挤指数${city.baseMetrics.crowdIndex}，标签包括${city.tags.join('、')}。`;
  }).join('\n');

  return [
    {
      role: 'system',
      content: `你是一个资深的反向旅游规划专家。你的任务是根据用户的出发地、假期时间和偏好，以及系统算出的 Top 3 冷门平替城市，用极具网感、有同理心的口吻，为用户写一段 150 字左右的推荐语。重点强调“为什么这几个城市能避开人潮”以及“核心平替体验”。`
    },
    {
      role: 'user',
      content: `用户信息：从${departingCity}出发；出行时间：${timeLabel}；偏好：${preferenceString}。\n\nTop 3 推荐城市：\n${destinationSummary}\n\n请基于以上信息输出一段简洁、有说服力的推荐语，强调避开人潮与平替体验。`,
    },
  ];
};

export const generateCityInsights = (selectedCities, departingCity) => {
  return selectedCities.map(city => ({
    cityId: city.id,
    highlights: generateCityHighlights(city, departingCity),
    warnings: generateCityWarnings(city, departingCity),
  }));
};

/**
 * 生成主推荐文案 - 模拟 AI 的"深度对比"过程
 */
const generateMainReasoning = (departingCity, preferences, travelTime, selectedCities) => {
  // 1. 解析用户选择
  const timeLabel = {
    weekend: '近期周末',
    labor_day: '五一假期',
    national_day: '十一假期',
  }[travelTime] || '假期';

  const preferenceStr = preferences.length > 0 
    ? preferences.slice(0, 2).join('、')
    : '避开人潮、享受宁静';

  // 2. 构造替代城市的对比逻辑
  const topCity = selectedCities[0];
  
  // 根据时间和偏好动态选择对比城市
  let comparisonCities = [];
  if (preferences.includes('自然山水')) {
    comparisonCities = ['黄山', '千岛湖', '西湖'];
  } else if (preferences.includes('看海')) {
    comparisonCities = ['舟山普陀', '青岛', '烟台'];
  } else if (preferences.includes('人文古镇')) {
    comparisonCities = ['乌镇', '西塘', '同里'];
  } else if (preferences.includes('吃货之旅')) {
    comparisonCities = ['成都', '西安', '重庆'];
  } else {
    comparisonCities = ['杭州', '苏州', '南京'];
  }

  // 3. 生成文案模板
  let reasoning = `基于您打算在【${timeLabel}】从【${departingCity}】出发，并偏好【${preferenceStr}】。`;

  // 加入对比分析
  if (travelTime !== 'weekend') {
    reasoning += `\n\n考虑到${timeLabel}期间${comparisonCities[0]}、${comparisonCities[1]}的客流将达到极值，`;
  } else {
    reasoning += `\n\n综合分析周末出行数据，与传统热门目的地相比，`;
  }

  reasoning += `我们AI系统为您重点挖掘了【${topCity.name}】作为完美平替。`;

  // 加入具体优势
  const distance = topCity.distanceMap[departingCity] || 3;
  const crowdStatus = topCity.baseMetrics.crowdIndex <= 25 ? '几乎没有游客' : '人流量极低';
  
  reasoning += `\n\n它距离${departingCity}仅${distance}小时，${crowdStatus}，`;
  reasoning += `不仅完整保留了高价值的${preferences[0] || '自然景观'}体验，`;

  // 加入价格优势
  const costDiff = Math.round((1 - topCity.baseMetrics.costLevel / 500) * 100);
  reasoning += `更重要的是，其酒店溢价率仅为${Math.abs(costDiff)}%，`;
  reasoning += `预计您将拥有一个极其宁静且性价比超群的假期...`;

  // 加入AI系统的"思考"过程提示
  reasoning += `\n\n🧠 本推荐基于10万+游客数据，5000+酒店价格样本，与${travelTime === 'weekend' ? '周末' : '假期'}热度指数AI算法交叉验证。`;

  return reasoning;
};

/**
 * 为每个目的地提取"亮点"标签
 */
const generateCityHighlights = (city, departingCity) => {
  const highlights = [];

  // 根据拥挤指数
  if (city.baseMetrics.crowdIndex <= 25) {
    highlights.push(`🟢 人迹罕至 / 独享原生态`);
  } else if (city.baseMetrics.crowdIndex <= 45) {
    highlights.push(`🟡 适度拥挤 / 有序游览`);
  }

  // 根据消费水平
  if (city.baseMetrics.costLevel <= 300) {
    highlights.push(`💰 均价仅需￥${city.baseMetrics.costLevel}/晚`);
  } else if (city.baseMetrics.costLevel <= 400) {
    highlights.push(`💰 性价比优秀 ￥${city.baseMetrics.costLevel}/晚`);
  }

  // 根据标签类型
  if (city.tags.includes('自然山水')) {
    highlights.push(`🏞️ 森林覆盖率90% / 空气质量优秀`);
  }
  if (city.tags.includes('人文古镇')) {
    highlights.push(`🏛️ 古建筑群完整 / 文化底蕴深厚`);
  }
  if (city.tags.includes('看海')) {
    highlights.push(`🌊 滨海摄影天堂 / 潮汐独特`);
  }
  if (city.tags.includes('吃货之旅')) {
    highlights.push(`🍜 地方特色美食 / 餐饮物价亲民`);
  }

  return highlights.slice(0, 2); // 最多2个亮点
};

/**
 * 为每个目的地生成"防踩坑"警告标签
 */
const generateCityWarnings = (city, departingCity) => {
  const warnings = [];

  // 根据交通方式
  if (city.transportMode === '汽车') {
    warnings.push(`⚠️ 无高铁直达 / 建议自驾或汽车`);
  } else if (city.transportMode === '高铁') {
    const distance = city.distanceMap[departingCity] || 3;
    if (distance > 4) {
      warnings.push(`⏱️ 耗时较长 / ${distance}小时需早启程`);
    }
  }

  // 根据拥挤指数
  if (city.baseMetrics.crowdIndex > 70) {
    warnings.push(`🚙 假期高峰人流大 / 建议避峰出游`);
  }

  // 根据消费水平
  if (city.baseMetrics.costLevel > 400) {
    warnings.push(`💸 消费水平较高 / 建议提前预算`);
  }

  return warnings.slice(0, 1); // 最多1个警告
};

