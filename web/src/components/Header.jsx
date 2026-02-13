import { useEffect, useState } from 'react'
import './Header.css'

export default function Header({ onLogout, user }) {
  const [uptime, setUptime] = useState('加载中...')
  const [hostname, setHostname] = useState('加载中...')
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    rxSpeed: 0,
    txSpeed: 0,
    load: [0, 0, 0],
  })

  // 获取 JWT token
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // 创建带认证的 fetch 请求
  const fetchWithAuth = (url) => {
    const token = getToken()
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // 格式化速率
  const formatSpeed = (bytes) => {
    if (bytes < 1024) return bytes + ' B/s'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB/s'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB/s'
  }

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetchWithAuth('/api/system-info')
        
        // 如果返回 401，说明 token 过期
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          onLogout()
          return
        }

        const data = await response.json()
        setHostname(data.os.hostname || 'Unknown')
        
        // 格式化uptime
        const seconds = Math.floor(data.os.uptime)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        setUptime(`${days}d ${hours}h ${minutes}m`)
      } catch (error) {
        console.error('Failed to fetch system info:', error)
      }
    }

    fetchSystemInfo()
    const interval = setInterval(fetchSystemInfo, 60000)
    return () => clearInterval(interval)
  }, [onLogout])

  // 实时获取系统状态
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusRes, speedRes] = await Promise.all([
          fetchWithAuth('/api/system-status'),
          fetchWithAuth('/api/network-speed'),
        ])

        // 检查认证状态
        if (statusRes.status === 401 || speedRes.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          onLogout()
          return
        }

        const statusData = await statusRes.json()
        const speedData = await speedRes.json()

        setStats({
          cpu: statusData.cpu.load,
          memory: statusData.memory.usagePercent,
          rxSpeed: speedData.rx || 0,
          txSpeed: speedData.tx || 0,
          load: statusData.system.loadAverage ? 
            [statusData.system.loadAverage.one, 
             statusData.system.loadAverage.five, 
             statusData.system.loadAverage.fifteen] : [0, 0, 0],
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 2000) // 每2秒更新
    return () => clearInterval(interval)
  }, [onLogout])

  return (
    <div className="win-header">
      <div className="header-left">
        <h1>📊 OKPanel</h1>
        <p>服务器状态监控面板</p>
      </div>
      <div className="header-stats">
        <div className="stat-item">
          <span className="stat-label">CPU</span>
          <span className="stat-value">{stats.cpu.toFixed(1)}%</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">内存</span>
          <span className="stat-value">{stats.memory.toFixed(1)}%</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">↓</span>
          <span className="stat-value">{formatSpeed(stats.rxSpeed)}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">↑</span>
          <span className="stat-value">{formatSpeed(stats.txSpeed)}</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-label">负载</span>
          <span className="stat-value">{stats.load[0].toFixed(2)}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="info-item">
          <span className="icon">🕐</span>
          <span>{uptime}</span>
        </div>
        <div className="divider"></div>
        <div className="info-item">
          <span className="icon">🖥️</span>
          <span>{hostname}</span>
        </div>
        <div className="divider"></div>
        <div className="user-menu">
          <span className="user-icon">👤</span>
          <span className="username">{user?.username}</span>
          <button className="logout-btn" onClick={onLogout} title="登出">
            🚪
          </button>
        </div>
      </div>
    </div>
  )
}
