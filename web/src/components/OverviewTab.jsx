import { useState, useEffect } from 'react'
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
import { apiCallJSON } from '../utils/api'
import './OverviewTab.css'

export default function OverviewTab() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, statusData, diskIOData, netConnData] = await Promise.all([
          apiCallJSON('/api/system-info'),
          apiCallJSON('/api/system-status'),
          apiCallJSON('/api/disk-io').catch(() => ({ read: 0, write: 0 })),
          apiCallJSON('/api/network-connections').catch(() => ({ total: 0 })),
        ])
        
        setSystemInfo(infoData)
        setStatus(statusData)

        // 存储额外数据到 window 对象供其他地方使用
        window.__extraData = {
          diskIO: diskIOData,
          netConn: netConnData,
        }

        setChartData(prev => {
          const newData = [
            ...prev,
            {
              time: new Date(statusData.timestamp).toLocaleTimeString(),
              memory: Number(statusData.memory.usagePercent.toFixed(2)),
              cpu: Number(statusData.cpu.load.toFixed(2)),
            }
          ]
          return newData.slice(-20)
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

  return (
    <div className="overview-container">
      <SystemInfoPanel systemInfo={systemInfo} />

      <div className="status-cards">
        {/* CPU 卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">⚡</span>
            <h3>CPU 使用率</h3>
          </div>
          <div className="win-card-content">
            <div className="metric">
              <div className="metric-label">
                <span>总体</span>
                <span className="metric-value">{status.cpu.load.toFixed(2)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${status.cpu.load}%`,
                    backgroundColor: status.cpu.load > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
            </div>
            <div className="cpu-cores">
              <h4>核心使用率：</h4>
              {status.cpu.loadPerCpu.map((load, idx) => (
                <div key={idx} className="core-item">
                  <div className="core-label">
                    <span>Core {idx}</span>
                    <span>{load.toFixed(2)}%</span>
                  </div>
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${load}%`,
                        backgroundColor: load > 80 ? '#ffc107' : '#0078d4'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 内存卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">💾</span>
            <h3>内存使用</h3>
          </div>
          <div className="win-card-content">
            <div className="metric">
              <div className="metric-label">
                <span>已用内存</span>
                <span className="metric-value">
                  {(status.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(status.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${status.memory.usagePercent}%`,
                    backgroundColor: status.memory.usagePercent > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
              <div className="usage-percent">
                {status.memory.usagePercent.toFixed(2)}% 使用率
              </div>
            </div>
          </div>
        </div>

        {/* 进程卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">✓</span>
            <h3>进程统计</h3>
          </div>
          <div className="win-card-content">
            <div className="process-stats">
              <div className="stat-item">
                <div className="stat-label">总数</div>
                <div className="stat-value">{status.processes.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">运行中</div>
                <div className="stat-value" style={{ color: '#107c10' }}>{status.processes.running}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">休眠</div>
                <div className="stat-value" style={{ color: '#0078d4' }}>{status.processes.sleeping}</div>
              </div>
              {status.processes.zombie > 0 && (
                <div className="stat-item">
                  <div className="stat-label">僵尸</div>
                  <div className="stat-value" style={{ color: '#d13438' }}>{status.processes.zombie}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 系统负载卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">📊</span>
            <h3>系统负载</h3>
          </div>
          <div className="win-card-content">
            <div className="load-stats">
              <div className="load-item">
                <span className="load-label">1分钟</span>
                <span className="load-value">{status.system.loadAverage.one.toFixed(2)}</span>
              </div>
              <div className="load-item">
                <span className="load-label">5分钟</span>
                <span className="load-value">{status.system.loadAverage.five.toFixed(2)}</span>
              </div>
              <div className="load-item">
                <span className="load-label">15分钟</span>
                <span className="load-value">{status.system.loadAverage.fifteen.toFixed(2)}</span>
              </div>
            </div>
            <div className="uptime-info">
              <span className="uptime-label">运行时间</span>
              <span className="uptime-value">{status.system.uptimeFormatted}</span>
            </div>
          </div>
        </div>

        {/* 内存详情卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">🧠</span>
            <h3>内存详情</h3>
          </div>
          <div className="win-card-content">
            <div className="memory-detail">
              <div className="mem-row">
                <span className="mem-label">缓存</span>
                <span className="mem-value">{(status.memory.cached / 1024 / 1024 / 1024).toFixed(2)} GB</span>
              </div>
              <div className="mem-row">
                <span className="mem-label">缓冲区</span>
                <span className="mem-value">{(status.memory.buffers / 1024 / 1024 / 1024).toFixed(2)} GB</span>
              </div>
              {status.memory.swap.total > 0 && (
                <>
                  <div className="mem-row">
                    <span className="mem-label">交换空间</span>
                    <span className="mem-value">
                      {(status.memory.swap.used / 1024 / 1024 / 1024).toFixed(2)} / {(status.memory.swap.total / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${status.memory.swap.total > 0 ? (status.memory.swap.used / status.memory.swap.total) * 100 : 0}%`,
                        backgroundColor: status.memory.swap.used > 0 ? '#ffc107' : '#e0e0e0'
                      }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 额外指标行 */}
      <div className="status-cards">
        {/* 磁盘 I/O */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">💾</span>
            <h3>磁盘 I/O</h3>
          </div>
          <div className="win-card-content">
            <div className="io-stats">
              <div className="io-item">
                <div className="io-label">读取</div>
                <div className="io-value">{(window.__extraData?.diskIO?.readRate || 0).toFixed(2)} ops/s</div>
              </div>
              <div className="io-item">
                <div className="io-label">写入</div>
                <div className="io-value">{(window.__extraData?.diskIO?.writeRate || 0).toFixed(2)} ops/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* 网络连接 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">🔗</span>
            <h3>网络连接</h3>
          </div>
          <div className="win-card-content">
            <div className="conn-stats">
              <div className="conn-item">
                <div className="conn-label">总计</div>
                <div className="conn-value">{window.__extraData?.netConn?.total || 0}</div>
              </div>
              <div className="conn-item">
                <div className="conn-label">已建立</div>
                <div className="conn-value">{window.__extraData?.netConn?.established || 0}</div>
              </div>
              <div className="conn-item">
                <div className="conn-label">侦听</div>
                <div className="conn-value">{window.__extraData?.netConn?.listen || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="win-card chart-card">
        <div className="win-card-header">
          <span className="card-icon">📈</span>
          <h3>CPU &amp; 内存趋势</h3>
        </div>
        <div className="win-card-content">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }} />
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
        </div>
      </div>
    </div>
  )
}
