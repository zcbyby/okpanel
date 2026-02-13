import { Text } from '@fluentui/react-components'
import { Clock24Filled, Subtract24Filled } from '@fluentui/react-icons'
import { useEffect, useState } from 'react'
import './Header.css'

export default function Header() {
  const [uptime, setUptime] = useState('加载中...')
  const [hostname, setHostname] = useState('加载中...')

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('/api/system-info')
        const data = await response.json()
        setHostname(data.os.hostname || 'Unknown')
        
        // 格式化uptime
        const seconds = Math.floor(data.os.uptime)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        setUptime(`${days}天 ${hours}小时 ${minutes}分钟`)
      } catch (error) {
        console.error('Failed to fetch system info:', error)
      }
    }

    fetchSystemInfo()
    const interval = setInterval(fetchSystemInfo, 60000) // 每分钟更新一次
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="header">
      <div className="header-left">
        <h1>📊 OKPanel</h1>
        <p>服务器状态监控面板</p>
      </div>
      <div className="header-right">
        <div className="info-item">
          <Clock24Filled className="icon" />
          <span>{uptime}</span>
        </div>
        <div className="divider"></div>
        <div className="info-item">
          <Subtract24Filled className="icon" />
          <span>{hostname}</span>
        </div>
      </div>
    </div>
  )
}
