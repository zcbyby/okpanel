import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  ProgressBar,
} from '@fluentui/react-components'
import {
  Cpu24Filled,
  DataArea24Filled,
  Checkmark24Filled,
} from '@fluentui/react-icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import SystemInfoPanel from './SystemInfoPanel'
import './OverviewTab.css'

export default function OverviewTab() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [chartData, setChartData] = useState([])
  const [cpuChartData, setCpuChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, statusRes] = await Promise.all([
          fetch('/api/system-info'),
          fetch('/api/system-status'),
        ])
        const infoData = await infoRes.json()
        const statusData = await statusRes.json()
        
        setSystemInfo(infoData)
        setStatus(statusData)

        // 添加到图表数据
        setChartData(prev => {
          const newData = [
            ...prev,
            {
              time: new Date(statusData.timestamp).toLocaleTimeString(),
              memory: Number(statusData.memory.usagePercent.toFixed(2)),
              cpu: Number(statusData.cpu.load.toFixed(2)),
            }
          ]
          return newData.slice(-20) // 保持最近20条记录
        })

        // CPU核心图表
        setCpuChartData({
          time: new Date(statusData.timestamp).toLocaleTimeString(),
          ...statusData.cpu.loadPerCpu.reduce((acc, load, idx) => {
            acc[`cpu${idx}`] = Number(load.toFixed(2))
            return acc
          }, {})
        })
      } catch (error) {
        console.error('Failed to fetch overview data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  if (!systemInfo || !status) {
    return <div className="loading">加载中...</div>
  }

  const colors = [
    '#0078d4', '#107c10', '#d83b01', '#ca5010',
    '#005a9e', '#48a5a8', '#6200ea', '#87107e'
  ]

  return (
    <div className="overview-container">
      {/* 系统信息面板 */}
      <SystemInfoPanel systemInfo={systemInfo} />

      {/* 上层: CPU 和内存状态卡片 */}
      <div className="status-cards">
        {/* CPU 卡片 */}
        <Card className="status-card">
          <CardHeader
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu24Filled style={{ color: '#0078d4' }} />
                <Text weight="semibold">CPU 使用率</Text>
              </div>
            }
          />
          <CardPreview style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text size={300}>总体</Text>
                <Text weight="semibold" size={300}>{status.cpu.load.toFixed(2)}%</Text>
              </div>
              <ProgressBar
                value={status.cpu.load / 100}
                color={status.cpu.load > 80 ? 'error' : 'success'}
              />
            </div>
            <Text size={200} style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              核心使用率:
            </Text>
            {status.cpu.loadPerCpu.map((load, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text size={200}>Core {idx}</Text>
                  <Text size={200}>{load.toFixed(2)}%</Text>
                </div>
                <ProgressBar
                  value={load / 100}
                  color={load > 80 ? 'warning' : 'success'}
                  size="small"
                />
              </div>
            ))}
          </CardPreview>
        </Card>

        {/* 内存卡片 */}
        <Card className="status-card">
          <CardHeader
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DataArea24Filled style={{ color: '#107c10' }} />
                <Text weight="semibold">内存使用</Text>
              </div>
            }
          />
          <CardPreview style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text size={300}>已用</Text>
                <Text weight="semibold" size={300}>
                  {(status.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(status.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
                </Text>
              </div>
              <ProgressBar
                value={status.memory.usagePercent / 100}
                color={status.memory.usagePercent > 80 ? 'error' : 'success'}
              />
            </div>
            <Text size={200} style={{ color: '#666' }}>
              {status.memory.usagePercent.toFixed(2)}% 使用率
            </Text>
          </CardPreview>
        </Card>

        {/* 进程卡片 */}
        <Card className="status-card">
          <CardHeader
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkmark24Filled style={{ color: '#ca5010' }} />
                <Text weight="semibold">进程统计</Text>
              </div>
            }
          />
          <CardPreview style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Text size={200} style={{ color: '#666', display: 'block' }}>
                  总数
                </Text>
                <Text size={600} weight="semibold">
                  {status.processes.total}
                </Text>
              </div>
              <div>
                <Text size={200} style={{ color: '#666', display: 'block' }}>
                  运行中
                </Text>
                <Text size={600} weight="semibold" style={{ color: '#107c10' }}>
                  {status.processes.running}
                </Text>
              </div>
              <div>
                <Text size={200} style={{ color: '#666', display: 'block' }}>
                  休眠
                </Text>
                <Text size={600} weight="semibold" style={{ color: '#0078d4' }}>
                  {status.processes.sleeping}
                </Text>
              </div>
            </div>
          </CardPreview>
        </Card>
      </div>

      {/* 中层: CPU 和内存趋势图 */}
      <div className="chart-container">
        <Card className="chart-card">
          <CardHeader header={<Text weight="semibold">CPU &amp; 内存趋势</Text>} />
          <CardPreview style={{ padding: '0' }}>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0078d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#107c10" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#107c10" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1dfdd" />
                  <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e1dfdd' }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#0078d4"
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    name="CPU 使用率 (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#107c10"
                    fillOpacity={1}
                    fill="url(#colorMemory)"
                    name="内存使用率 (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardPreview>
        </Card>
      </div>
    </div>
  )
}
