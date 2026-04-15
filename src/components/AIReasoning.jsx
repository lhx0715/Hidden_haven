/**
 * AI 推荐理由组件
 * 
 * 功能：
 * - 显示 AI 生成的推荐文案
 * - 打字机效果（逐字显现，模拟流式输出）
 * - 毛玻璃背景 + 闪烁 AI 图标
 * - 微动画交互体验
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';

export const AIReasoning = ({ reasoningText, isLoading = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // 【打字机效果】主要逻辑
  useEffect(() => {
    if (!reasoningText) return;

    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= reasoningText.length) {
        setDisplayedText(reasoningText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30); // 控制打字速度：30ms 一个字符

    return () => clearInterval(typingInterval);
  }, [reasoningText]);

  return (
    <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border border-purple-200 border-opacity-30 backdrop-blur-md shadow-lg">
      {/* 顶部：AI 图标 + 标题 */}
      <div className="flex items-center gap-3 mb-4">
        {/* 闪烁的 AI 图标 */}
        <div className="relative">
          <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
          <Bot className="absolute w-5 h-5 text-blue-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-70 animate-bounce" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🧠 秘境 AI 推荐分析
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {isLoading || isTyping ? '正在深度对比全网数据...' : '分析完成'}
          </span>
        </div>

        {/* 加载动画指示器 */}
        {(isLoading || isTyping) && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>

      {/* 【打字机效果】推荐文案展示区 */}
      <div className="relative">
        {/* 背景虚影文案（作为载体占位符） */}
        <div className="absolute inset-0 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-light opacity-20 pointer-events-none">
          {reasoningText}
        </div>

        {/* 实际显示的文案 */}
        <p className="relative text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light z-10">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-0.5 h-5 ml-1 bg-gradient-to-b from-purple-500 to-blue-500 animate-pulse" />
          )}
        </p>
      </div>

      {/* 底部提示语 */}
      {!isTyping && !isLoading && (
        <div className="mt-4 pt-4 border-t border-purple-200 border-opacity-30">
          <p className="text-xs text-gray-600 opacity-75">
            💡 <strong>建议：</strong>点击下方城市卡片的"查看详情"，前往小红书查看实时用户体验分享！
          </p>
        </div>
      )}
    </div>
  );
};
