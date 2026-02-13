import { useState, useEffect } from 'react'
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridCell,
  Button,
  SearchBox,
  Card,
  CardHeader,
  Text,
} from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import './ProcessesTab.css'

export default function ProcessesTab() {
  const [processes, setProcesses] = useState([])
  const [filteredProcesses, setFilteredProcesses] = useState([])
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('mem')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await fetch('/api/processes')
        const data = await response.json()
        setProcesses(data.processes || [])
      } catch (error) {
        console.error('Failed to fetch processes:', error)
      }
    }

    fetchProcesses()
    const interval = setInterval(fetchProcesses, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = processes.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.pid.toString().includes(searchText)
    )

    filtered.sort((a, b) => {
      let aVal = a[sortBy] || 0
      let bVal = b[sortBy] || 0
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    setFilteredProcesses(filtered)
  }, [processes, searchText, sortBy, sortOrder])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatMemory = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

  const SortableHeader = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        font: 'inherit',
        fontWeight: sortBy === column ? '600' : 'normal',
        textAlign: 'left',
        width: '100%',
      }}
    >
      {children}
      {sortBy === column && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
    </button>
  )

  return (
    <div className="processes-container">
      <Card className="processes-card">
        <CardHeader
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <Text weight="semibold">进程列表 ({filteredProcesses.length})</Text>
            </div>
          }
        />
        <div className="processes-toolbar">
          <SearchBox
            placeholder="搜索进程名称或 PID..."
            value={searchText}
            onChange={(e, data) => setSearchText(data.value)}
            className="search-box"
          />
        </div>

        <div className="table-wrapper">
          <table className="processes-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>
                  <SortableHeader column="pid">PID</SortableHeader>
                </th>
                <th style={{ flex: 1 }}>
                  <SortableHeader column="name">进程名称</SortableHeader>
                </th>
                <th style={{ width: '100px' }}>
                  <SortableHeader column="cpu">CPU %</SortableHeader>
                </th>
                <th style={{ width: '120px' }}>
                  <SortableHeader column="mem">内存</SortableHeader>
                </th>
                <th style={{ width: '100px' }}>
                  <SortableHeader column="user">用户</SortableHeader>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((process) => (
                <tr key={process.pid} className="process-row">
                  <td className="pid-cell">{process.pid}</td>
                  <td className="name-cell">
                    <div className="process-name">
                      <span className="name">{process.name}</span>
                    </div>
                  </td>
                  <td className="cpu-cell">
                    <div className="metric-bar">
                      <div
                        className="metric-fill cpu"
                        style={{
                          width: `${Math.min(process.cpu, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="metric-value">{process.cpu.toFixed(2)}%</span>
                  </td>
                  <td className="mem-cell">
                    <span className="mem-value">{formatMemory(process.mem)}</span>
                  </td>
                  <td className="user-cell">{process.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProcesses.length === 0 && (
          <div className="empty-state">
            <Text style={{ color: '#666' }}>没有找到匹配的进程</Text>
          </div>
        )}
      </Card>
    </div>
  )
}
