// API 工具函数，包装带 JWT 认证的 fetch 请求

export const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 如果返回 401，说明需要重新登录
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 触发重新加载，显示登录页
      window.location.reload();
      throw new Error('认证过期，请重新登录');
    }

    if (!response.ok && response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// 简化版本，直接解析 JSON
export const apiCallJSON = async (url, options = {}) => {
  const response = await apiCall(url, options);
  return response.json();
};
