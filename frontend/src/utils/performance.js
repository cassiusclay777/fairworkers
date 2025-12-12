// Performance monitoring utilities

export const measurePerformance = (metricName, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${metricName}: ${(end - start).toFixed(2)}ms`);
  }

  return result;
};

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not installed, skip
    });
  }
};

// Log performance metrics to console in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  reportWebVitals((metric) => {
    console.log(`📊 ${metric.name}:`, metric.value);
  });
}

// Monitor API call performance
export const monitorApiCall = async (url, fetchFn) => {
  const start = performance.now();

  try {
    const result = await fetchFn();
    const end = performance.now();
    const duration = end - start;

    if (duration > 1000) {
      console.warn(`🐢 Slow API call to ${url}: ${duration.toFixed(0)}ms`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API call to ${url}: ${duration.toFixed(0)}ms`);
    }

    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`❌ Failed API call to ${url} after ${(end - start).toFixed(0)}ms:`, error);
    throw error;
  }
};
