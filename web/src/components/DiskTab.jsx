import { useState, useEffect } from 'react'
import { apiCallJSON } from '../utils/api'
import './DiskTab.css'

export default function DiskTab() {
  const [diskInfo, setDiskInfo] = useState(null)

  useEffect(() => {
    const fetchDiskInfo = async () => {
      try {
        const data = await apiCallJSON('/api/disk')
        setDiskInfo(data)
      } catch (error) {
        console.error('Failed to fetch disk info:', error)
      }
    }

    fetchDiskInfo()
    const interval = setInterval(fetchDiskInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (!diskInfo) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="disk-container">
      <div className="disk-grid">
        {diskInfo.disks.map((disk, idx) => {
          const usagePercent = (disk.used / disk.size) * 100
          const statusColor = usagePercent > 90 ? '#d13438' : usagePercent > 70 ? '#ffc107' : '#107c10'

          return (
            <div key={idx} className="disk-card">
              <div className="disk-card-header">
                <span className="disk-icon">💿</span>
                <div className="disk-header-content">
                  <h4>{disk.mount}</h4>
                  <span className="disk-fs">{disk.fs}</span>
                </div>
              </div>
              <div className="disk-card-content">
                <div className="disk-usage">
                  <div className="usage-label">
                    <span>使用空间</span>
                    <span className="usage-value">
                      {formatBytes(disk.used)} / {formatBytes(disk.size)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${usagePercent}%`,
                        backgroundColor: statusColor
                      }}
                    ></div>
                  </div>
                  <div className="usage-stat">
                    {usagePercent.toFixed(2)}% 已用 · {formatBytes(disk.available)} 可用
                  </div>
                </div>

                <div className="disk-details">
                  <div className="detail-row">
                    <span className="label">设备类型</span>
                    <span className="value">{disk.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">读写状态</span>
                    <span className="value">{disk.rw ? '读写' : '只读'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {diskInfo.disks.length === 0 && (
        <div className="empty-state">
          <p>未找到磁盘信息</p>
        </div>
      )}
    </div>
  )
}
