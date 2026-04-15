/**
 * 目的地卡片组件
 * 
 * 展示单个推荐目的地的详细信息：
 * - 封面图
 * - 名称和区域
 * - 【任务二】情绪价值标签 (替代冷冰冰的百分比)
 * - 核心指标（拥挤度、消费、交通）
 * - 推荐理由
 */

import React from 'react';
import { MapPin, DollarSign, Clock, Zap, ExternalLink } from 'lucide-react';
import {
  getCrowdStatusColor,
  formatCostLevel,
  formatDistance,
  generateRecommendationReason,
  generateEmotionalTag, // 【任务二】导入新的情绪标签函数
} from '../utils/algorithm';
import { trackEvent } from '../utils/analytics';

export const DestinationCard = ({ destination, departingCity, rank, travelTime, aiInsight }) => {
  // 【任务一】提取城市名并构建小红书外链
  const extractCityName = (fullName) => {
    // 从 "浙江·丽水" 中提取 "丽水"
    const parts = fullName.split('·');
    return parts.length > 1 ? parts[1] : fullName;
  };

  const cityName = extractCityName(destination.name);
  const searchKeyword = `${cityName}旅游攻略`;
  const xiaohongshuUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(searchKeyword)}&note_type=0`;

  // 检测环境
  const detectEnvironment = () => {
    const ua = navigator.userAgent;
    return {
      isWeChat: /micromessenger/i.test(ua),
      isQQ: /qq\//i.test(ua),
      isInAppBrowser: /micromessenger|qq|alipay|weibo|dingtalk|zhihu/i.test(ua),
      isMobile: /iPhone|iPad|Android|Mobile/i.test(ua),
    };
  };

  // 处理外链点击 - 更稳定的方案
  const handleExternalLinkClick = () => {
    trackEvent('outbound_search_click', {
      destination: destination.name,
      city: cityName,
      keyword: searchKeyword,
      source: 'recommendation_card',
    });

    const env = detectEnvironment();

    if (env.isInAppBrowser) {
      // 【微信/QQ/支付宝等内嵌浏览器】显示提示框
      const message = `需要在浏览器中打开小红书搜索\n\n搜索词：${searchKeyword}\n\n复制搜索词后，在小红书中搜索即可找到相关笔记`;
      
      // 弹出提示
      alert(message);
      
      // 尝试复制搜索词到剪贴板
      if (navigator.clipboard) {
        navigator.clipboard.writeText(searchKeyword).then(() => {
          // 说明都会提示用户已复制
        }).catch(() => {
          // 复制失败，用户手动输入
        });
      }
      
      // 提示后打开链接（用户自行在浏览器中打开）
      setTimeout(() => {
        window.open(xiaohongshuUrl, '_blank');
      }, 500);
    } else if (env.isMobile) {
      // 【普通手机浏览器】直接打开小红书网页
      window.open(xiaohongshuUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 【PC 端】使用 window.open
      window.open(xiaohongshuUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const crowdStatus = getCrowdStatusColor(destination.baseMetrics.crowdIndex);
  const costDisplay = formatCostLevel(destination.baseMetrics.costLevel);
  const distanceDisplay = formatDistance(destination.distanceMap[departingCity]);
  const reason = generateRecommendationReason(destination, departingCity);

  // 【任务二】生成情绪标签，替代百分比数字
  const emotionalTag = generateEmotionalTag(
    rank,
    destination.matchLevel,
    destination.distanceMap[departingCity],
    departingCity
  );

  // 拥挤指数进度条颜色映射
  const getCrowdBarColor = (index) => {
    if (index <= 25) return 'bg-green-500';
    if (index <= 45) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 【任务二】获取情绪标签的颜色类
  const getEmotionalTagStyle = () => {
    switch (emotionalTag.level) {
      case 'hero':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'; // 高亮紫色
      case 'featured':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'; // 蓝绿色
      case 'standard':
        return 'bg-blue-50 text-blue-700 border border-blue-300'; // 浅蓝色
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* 图片容器 */}
      <div className="relative h-48 md:h-56 bg-gray-200 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
        />
        {/* 排名徽章 */}
        <div className="absolute top-3 right-3 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
          {rank}
        </div>
        {/* 【任务一】出行时间标签 */}
        {travelTime !== 'weekend' && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {travelTime === 'labor_day' ? '五一' : '十一'}
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-5 flex flex-col flex-grow">
        {/* 名称和区域 */}
        <div className="mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {destination.name}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mt-0.5">
            <MapPin className="w-4 h-4 mr-1" />
            {destination.region}
          </div>
        </div>

        {/* 【任务二】情绪价值标签 - 替代百分比数字 */}
        <div className="mb-3">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getEmotionalTagStyle()}`}>
            <span className="text-lg">{emotionalTag.emoji}</span>
            <span>{emotionalTag.label}</span>
          </div>
        </div>

        {/* 【任务二】增强的标签展示（显示匹配的偏好标签） */}
        <div className="mb-4 flex flex-wrap gap-2">
          {destination.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {destination.tags.length > 2 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
              +{destination.tags.length - 2} 更多
            </span>
          )}
        </div>

        {/* 【AI 提取】亮点和防踩坑标签 */}
        {aiInsight && (
          <div className="mb-4 space-y-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 border-opacity-50">
            {/* 亮点标签 */}
            {aiInsight.highlights && aiInsight.highlights.length > 0 && (
              <div>
                {aiInsight.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-700 font-medium leading-relaxed mb-1.5"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            )}
            
            {/* 防踩坑提示 */}
            {aiInsight.warnings && aiInsight.warnings.length > 0 && (
              <div className="pt-2 border-t border-purple-200 border-opacity-30">
                {aiInsight.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-orange-700 font-medium leading-relaxed"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 核心指标网格 */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b border-gray-200">
          {/* 拥挤度 */}
          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1">
              拥挤预测
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full ${getCrowdBarColor(destination.baseMetrics.crowdIndex)}`}
                style={{
                  width: `${Math.min(100, destination.baseMetrics.crowdIndex)}%`,
                }}
              ></div>
            </div>
            <div className={`text-xs font-semibold`}>
              <span
                className={`px-2 py-0.5 rounded text-white`}
                style={{
                  backgroundColor:
                    crowdStatus.color === 'green'
                      ? '#10b981'
                      : crowdStatus.color === 'yellow'
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              >
                {crowdStatus.label}
              </span>
            </div>
          </div>

          {/* 消费水平 */}
          <div>
            <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              预计消费
            </div>
            <div className="text-lg font-bold text-green-600">
              {costDisplay}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              酒店均价
            </div>
          </div>

          {/* 交通耗时 */}
          <div className="col-span-2">
            <div className="text-xs text-gray-600 font-semibold mb-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              交通耗时
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                {destination.transportMode}
              </span>
              <span className="ml-2 text-lg font-bold text-blue-600">
                {distanceDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* 推荐理由 */}
        <div className="flex-grow">
          <p className="text-gray-700 text-sm leading-relaxed">
            <span className="font-semibold text-gray-900">💡 </span>
            {reason}
          </p>
        </div>

        {/* 查看详情按钮 - 【任务一】改为外链跳转 */}
        <button
          onClick={handleExternalLinkClick}
          className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 group"
        >
          查看详情
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
