import axios from 'axios'
import { Message } from 'view-design'

// 创建axios实例
const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  responseType: 'json'
})

// 请求拦截器
http.interceptors.request.use(config => {
  // 自动添加JWT
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
http.interceptors.response.use(response => {
  // 适配新的响应结构
  if (response.data && response.data.resultcode === 0) {
    return response.data // 返回完整响应对象
  }
  return handleError(response)
}, error => {
  return handleError(error.response || error)
})

// 统一错误处理
function handleError(error) {
    const statusMap = {
      400: '请求参数错误',
      401: '登录状态已过期',
      403: '没有操作权限',
      404: '资源未找到',
      500: '服务器错误'
    }
    
    // 修复可选链语法兼容性问题
    const message = (error.data && error.data.message) || 
      (statusMap[error.status] || 
      '网络连接异常，请稍后重试');
  
    Message.error({ content: message, duration: 3 })
    return Promise.reject(error)
  }

// 封装常用方法
export default {
  get(url, params, config) {
    // 调试输出（正式环境需移除）
    // 新增调试日志
    console.log('Current environment:', process.env.NODE_ENV)
    console.log('API_BASE_URL from env:', process.env.VUE_APP_API_BASE_URL)
    console.log('Using baseURL:', http.defaults.baseURL)
    return http.get(url, { params, ...config })
  },
  
  post(url, data, config) {
    return http.post(url, data, config)
  },
  
  put(url, data, config) {
    return http.put(url, data, config)
  },
  
  delete(url, config) {
    return http.delete(url, config)
  }
}