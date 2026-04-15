import { useCallback, useRef, useState } from 'react';
import { buildAIRequestMessages, generateLocalAIResponse } from '../utils/algorithm';

export const useAIStream = () => {
  const [aiText, setAIText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiError, setAIError] = useState(null);
  const controllerRef = useRef(null);

  const startAIStream = useCallback(async (userParams, selectedCities) => {
    setAIError(null);
    setAIText('');

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.warn('[AI Stream] VITE_DEEPSEEK_API_KEY 未配置，使用本地备用文本。');
      const localResponse = generateLocalAIResponse(userParams, selectedCities);
      setAIText(localResponse.mainReasoning);
      return;
    }

    setIsStreaming(true);
    const messages = buildAIRequestMessages(userParams, selectedCities);
    const payload = {
      model: 'deepseek-chat', // DeepSeek 的标准模型名称
      stream: true,
      temperature: 0.85,
      max_tokens: 250,
      messages,
    };

    controllerRef.current = new AbortController();

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`AI 请求失败：${response.status} ${response.statusText} ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const jsonString = trimmed.replace(/^data:\s*/, '');
            if (jsonString === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(jsonString);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                setAIText(prev => prev + delta);
              }
            } catch (error) {
              console.warn('[AI Stream] 解析 chunk 失败:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[AI Stream] 错误', error);
      setAIError(error instanceof Error ? error.message : 'AI 服务异常');
      const localResponse = generateLocalAIResponse(userParams, selectedCities);
      setAIText(localResponse.mainReasoning);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const cancelAIStream = useCallback(() => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    aiText,
    isStreaming,
    aiError,
    startAIStream,
    cancelAIStream,
  };
};
