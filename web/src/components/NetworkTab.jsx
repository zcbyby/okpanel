import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Tab,
  TabList,
} from '@fluentui/react-components'
import { Network24Filled } from '@fluentui/react-icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './NetworkTab.css'

export default function NetworkTab() {
  const [networkInfo, setNetworkInfo] = useState(null)
  const [selectedTab, setSelectedTab] = useState('stats')
  const [networkHistory, setNetworkHistory] = useState([])

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const response = await fetch('/api/network')
        const data = await response.json()
        setNetworkInfo(data)

        // 添加历史数据用于图表
        setNetworkHistory(prev => {
          const totalRx = data.interfaces.reduce((sum, net) => sum + (net.rx_bytes || 0), 0)
          const totalTx = data.interfaces.reduce((sum, net) => sum + (net.tx_bytes || 0), 0)
          
          const newEntry = {
            time: new Date().toLocaleTimeString(),
            rx: totalRx,
            tx: totalTx,
          }
          
          const newHistory = [...prev, newEntry]
          return newHistory.slice(-20)
        })
      } catch (error) {
        console.error('Failed to fetch network info:', error)
      }
    }

    fetchNetworkInfo()
    const interval = setInterval(fetchNetworkInfo, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (!networkInfo) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="network-container">
      <div className="tabs-wrapper">
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(e, data) => setSelectedTab(data.value)}
        >
          <Tab value="stats">统计信息</Tab>
          <Tab value="interfaces">网络接口</Tab>
        </TabList>
      </div>

      {selectedTab === 'stats' && (
        <div className="stats-content">
          {networkHistory.length > 1 && (
            <Card className="chart-card">
              <CardHeader header={<Text weight="semibold">网络流量趋势</Text>} />
              <CardPreview style={{ padding: '0' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={networkHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1dfdd" />
                    <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <Tooltip
                      formatter={(value) => formatBytes(value)}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e1dfdd' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rx"
                      stroke="#0078d4"
                      dot={false}
                      name="接收流量"
                    />
                    <Line
                      type="monotone"
                      dataKey="tx"
                      stroke="#107c10"
                      dot={false}
                      name="发送流量"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardPreview>
            </Card>
          )}

          <Card className="summary-card">
            <CardHeader header={<Text weight="semibold">总体统计</Text>} />
            <CardPreview style={{ padding: '16px' }}>
              <div className="summary-grid">
                {networkInfo.interfaces.map((net, idx) => (
                  <div key={idx} className="summary-item">
                    <Text size={200} style={{ color: '#666' }}>
                      {net.iface}
                    </Text>
                    <div className="metrics">
                      <div className="metric">
                        <span className="label">收</span>
                        <span className="value">{formatBytes(net.rx_bytes)}</span>
                      </div>
                      <div className="metric">
                        <span className="label">发</span>
                        <span className="value">{formatBytes(net.tx_bytes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardPreview>
          </Card>
        </div>
      )}

      {selectedTab === 'interfaces' && (
        <div className="interfaces-content">
          <div className="interfaces-grid">
            {networkInfo.physicalInterfaces.map((iface, idx) => (
              <Card key={idx} className="interface-card">
                <CardHeader
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Network24Filled style={{ color: '#0078d4' }} />
                      <Text weight="semibold">{iface.ifname}</Text>
                    </div>
                  }
                />
                <CardPreview style={{ padding: '16px' }}>
                  <div className="interface-details">
                    <div className="detail-row">
                      <span className="label">状态</span>
                      <span className={`value status-${iface.iface === 'up' ? 'up' : 'down'}`}>
                        {iface.iface === 'up' ? '启用' : '禁用'}
                      </span>
                    </div>
                    {iface.ip4 && (
                      <div className="detail-row">
                        <span className="label">IPv4</span>
                        <span className="value">{iface.ip4}</span>
                      </div>
                    )}
                    {iface.ip6 && (
                      <div className="detail-row">
                        <span className="label">IPv6</span>
                        <span className="value" style={{ fontSize: '12px' }}>{iface.ip6}</span>
                      </div>
                    )}
                    {iface.mac && (
                      <div className="detail-row">
                        <span className="label">MAC</span>
                        <span className="value" style={{ fontSize: '12px' }}>{iface.mac}</span>
                      </div>
                    )}
                    {iface.netmask && (
                      <div className="detail-row">
                        <span className="label">网掩码</span>
                        <span className="value">{iface.netmask}</span>
                      </div>
                    )}
                    {iface.speed && (
                      <div className="detail-row">
                        <span className="label">速率</span>
                        <span className="value">{iface.speed} Mbps</span>
                      </div>
                    )}
                  </div>
                </CardPreview>
              </Card>
            ))}
          </div>

          {networkInfo.physicalInterfaces.length === 0 && (
            <div className="empty-state">
              <Text style={{ color: '#999' }}>未找到网络接口信息</Text>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
