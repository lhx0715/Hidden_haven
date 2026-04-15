/**
 * 结果展示区组件 (Recommendations Section)
 * 
 * 包含：
 * - 【AI 大脑】推荐分析框（打字机效果）
 * - 推荐结果标题
 * - 卡片网格列表（响应式：移动端1列，PC端3列）
 * - 单个目的地卡片组件
 */

import React, { useMemo } from 'react';
import { DestinationCard } from './DestinationCard';
import { AIReasoning } from './AIReasoning';
import { generateCityInsights } from '../utils/algorithm';

export const RecommendationsSection = ({ 
  recommendations, 
  departingCity,
  preferences = [],
  travelTime = 'weekend',
  aiText = '',
  isAIStreaming = false,
  aiError = null,
  isVisible = true 
}) => {
  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  const cityInsights = useMemo(() => {
    return generateCityInsights(recommendations, departingCity);
  }, [recommendations, departingCity]);

  const mainAIText = aiText || (isAIStreaming ? '秘境 AI 正在快速生成你的推荐分析...' : '秘境 AI 正在生成推荐分析，稍后为你展示。');

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 标题区 */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            为你推荐的秘境
          </h2>
          <p className="text-gray-600">
            基于 {departingCity} 出发，为你精选最适合的低密度旅游目的地
          </p>
        </div>

        {/* 【新增】AI 推荐分析框 - 打字机效果 */}
        <AIReasoning 
          reasoningText={mainAIText}
          isLoading={isAIStreaming}
        />
        {aiError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            AI 服务暂不可用，已回退到本地推荐文案。
          </div>
        )}

        {/* 卡片网格 - 响应式布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              departingCity={departingCity}
              travelTime={travelTime}
              rank={index + 1}
              aiInsight={cityInsights[index]}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-blue-900 text-sm md:text-base">
            <span className="font-semibold">💡 提示：</span>
            上述数据基于历年五一期间的游客数据统计和本地酒店价格调研。
            实际拥挤指数和消费水平会因天气、活动等因素波动。
            建议提前预订酒店和交通，确保最佳体验。
          </p>
        </div>
      </div>
    </section>
  );
};
