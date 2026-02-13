import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  ProgressBar,
} from '@fluentui/react-components'
import { HardDrive24Filled } from '@fluentui/react-icons'
import './DiskTab.css'

export default function DiskTab() {
  const [diskInfo, setDiskInfo] = useState(null)

  useEffect(() => {
    const fetchDiskInfo = async () => {
      try {
        const response = await fetch('/api/disk')
        const data = await response.json()
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
          const statusColor = usagePercent > 90 ? 'error' : usagePercent > 70 ? 'warning' : 'success'

          return (
            <Card key={idx} className="disk-card">
              <CardHeader
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HardDrive24Filled style={{ color: '#0078d4' }} />
                    <div>
                      <Text weight="semibold">{disk.mount}</Text>
                      <Text size={200} style={{ color: '#666' }}>
                        {disk.fs}
                      </Text>
                    </div>
                  </div>
                }
              />
              <CardPreview style={{ padding: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text size={300}>使用空间</Text>
                    <Text weight="semibold" size={300}>
                      {formatBytes(disk.used)} / {formatBytes(disk.size)}
                    </Text>
                  </div>
                  <ProgressBar value={usagePercent / 100} color={statusColor} />
                  <Text size={200} style={{ color: '#666', marginTop: 4 }}>
                    {usagePercent.toFixed(2)}% 已用 · {formatBytes(disk.available)} 可用
                  </Text>
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
              </CardPreview>
            </Card>
          )
        })}
      </div>

      {diskInfo.disks.length === 0 && (
        <div className="empty-state">
          <Text style={{ color: '#999' }}>未找到磁盘信息</Text>
        </div>
      )}
    </div>
  )
}
