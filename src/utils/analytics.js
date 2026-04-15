export const trackEvent = (eventName, payload = {}) => {
  console.log('[trackEvent]', eventName, payload);
  // TODO: 将来改造为发送到 Vercel Analytics / Google Analytics / 埋点平台
  // 例如：window.gtag('event', eventName, payload);
};
