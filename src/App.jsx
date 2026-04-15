/**
 * 秘境 (Hidden Haven) - 主应用入口
 * 
 * 反向旅游推荐 MVP 产品
 * 帮助江浙沪用户在节假日避开拥挤人潮，寻找高性价比、低密度旅游目的地
 * 
 * 核心功能：
 * 1. 首页搜索引导 (Hero Section)
 * 2. 推荐算法计算 (静态打分法 + AI接口预留)
 * 3. 结果展示卡片 (响应式布局)
 * 
 * 技术栈：React + Tailwind CSS + Lucide Icons
 * 部署模式：纯静态前端应用
 */

import React, { useState, useRef, useCallback } from 'react';
import { HeroSection } from './components/HeroSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { getRecommendations } from './utils/algorithm';
import { useAIStream } from './hooks/useAIStream';
import { trackEvent } from './utils/analytics';

function App() {
  // 状态管理
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchParams, setSearchParams] = useState({
    departingCity: '上海',
    preferences: [],
    travelTime: 'weekend', // 【任务一】添加出行时间默认值
  });

  // 引用结果容器，用于平滑滚动
  const resultsRef = useRef(null);
  const { aiText, isStreaming: isAIStreaming, aiError, startAIStream } = useAIStream();

  /**
   * 处理搜索逻辑
   * 参数：出发城市、用户偏好标签、出行时间
   */
  const handleSearch = useCallback(async (departingCity, preferences, travelTime) => {
    // 记录用户搜索行为
    trackEvent('search_started', { departingCity, preferences, travelTime });

    // 保存搜索参数
    setSearchParams({ departingCity, preferences, travelTime });
    
    // 开启加载状态
    setIsLoading(true);
    setShowResults(false);

    try {
      // 调用推荐算法（异步），传递出行时间参数
      const results = await getRecommendations(departingCity, preferences, travelTime);

      // 结果展示
      setRecommendations(results);
      setShowResults(true);
      startAIStream({ departingCity, preferences, travelTime }, results);

      // 延迟后平滑滚动到结果区
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('推荐算法执行出错:', error);
      alert('获取推荐失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [startAIStream]);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header - 固定导航栏 (可选，MVP可不要) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">秘境</span>
            <span className="text-xs text-gray-500 ml-2 hidden md:inline">
              Hidden Haven | 反向旅游推荐
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <span className="hidden md:inline">发现江浙沪周边的低密度秘境</span>
          </div>
        </div>
      </header>

      {/* Hero 搜索区 */}
      <div className="pt-16">
        <HeroSection
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* 推荐结果区 */}
      <div ref={resultsRef} className="scroll-mt-20">
        <RecommendationsSection
          recommendations={recommendations}
          departingCity={searchParams.departingCity}
          preferences={searchParams.preferences}
          travelTime={searchParams.travelTime}
          aiText={aiText}
          isAIStreaming={isAIStreaming}
          aiError={aiError}
          isVisible={showResults}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 关于 */}
            <div>
              <h4 className="font-bold text-white mb-3">关于秘境</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                秘境致力于帮助忙碌的都市人在节假日避开拥挤人潮，发现江浙沪周边的高性价比、低密度旅游目的地，享受真正的假期。
              </p>
            </div>

            {/* 推荐指南 */}
            <div>
              <h4 className="font-bold text-white mb-3">如何使用</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>✓ 选择出发城市</li>
                <li>✓ 选择出行偏好</li>
                <li>✓ 点击"寻找秘境"</li>
                <li>✓ 查看个性化推荐</li>
              </ul>
            </div>

            {/* 技术说明 */}
            <div>
              <h4 className="font-bold text-white mb-3">数据说明</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                当前版本采用静态 Mock 数据和基础打分算法。
                未来版本将接入实时大数据预测模型，提供更精准的拥挤指数预测。
              </p>
            </div>
          </div>

          {/* 分割线 */}
          <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-400">
            <p>© 2025 秘境 (Hidden Haven) | MVP 版本</p>
            <p className="text-xs mt-2 text-gray-500">
              Made with ❤️ for travelers who seek peace
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
