/**
 * 首页搜索区组件 (Hero Section)
 * 
 * 包含：
 * - 背景图+暗色遮罩
 * - 出发地下拉选择
 * - 出行偏好多选标签
 * - 搜索按钮
 */

import React, { useState } from 'react';
import { ChevronDown, Compass } from 'lucide-react';
import { DEPARTING_CITIES, TRAVEL_PREFERENCES } from '../data/mockData';

export const HeroSection = ({ onSearch, isLoading }) => {
  const [departingCity, setDepartingCity] = useState('上海');
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  // 【任务一】出行时间状态，默认"近期周末"
  const [travelTime, setTravelTime] = useState('weekend');

  const handlePreferenceToggle = (preference) => {
    setSelectedPreferences(prev => {
      const isSelected = prev.includes(preference);
      return isSelected
        ? prev.filter(p => p !== preference)
        : [...prev, preference];
    });
  };

  const handleSearch = () => {
    // 触发父组件的搜索逻辑，传递出行时间参数
    onSearch(departingCity, selectedPreferences, travelTime);
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), 
                          url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      {/* 内容容器 */}
      <div className="w-full max-w-2xl px-4 md:px-8 z-10">
        {/* 标题区 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Compass className="w-10 h-10 text-blue-400 mr-2" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">秘境</h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-200 mb-2">
            反向旅游推荐
          </p>
          <p className="text-gray-300 text-sm md:text-base">
            避开人潮，发现江浙沪周边的低密度秘境
          </p>
        </div>

        {/* 搜索表单 */}
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 space-y-6">
          {/* 出发地选择 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              出发地
            </label>
            <div className="relative">
              <select
                value={departingCity}
                onChange={(e) => setDepartingCity(e.target.value)}
                className="w-full px-4 py-3 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer text-gray-900"
              >
                {DEPARTING_CITIES.map(city => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 【任务一】出行时间选择 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              出行时间
            </label>
            <div className="relative">
              <select
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                className="w-full px-4 py-3 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer text-gray-900"
              >
                <option value="weekend">近期周末</option>
                <option value="labor_day">五一假期</option>
                <option value="national_day">十一假期</option>
              </select>
              <ChevronDown className="absolute right-4 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 出行偏好多选 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              出行偏好
              <span className="text-gray-500 font-normal ml-2">
                (可多选)
              </span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TRAVEL_PREFERENCES.map(pref => (
                <button
                  key={pref.id}
                  onClick={() => handlePreferenceToggle(pref.label)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPreferences.includes(pref.label)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white text-lg transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                寻找秘境中...
              </span>
            ) : (
              '寻找秘境'
            )}
          </button>
        </div>

        {/* 提示文案 */}
        <p className="text-center text-gray-300 text-xs md:text-sm mt-6">
          💡 选择偏好后，我们会为你推荐最适合的低密度目的地
        </p>
      </div>
    </div>
  );
};
