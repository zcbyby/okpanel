import { useState, useEffect } from 'react'
import { apiCallJSON } from '../utils/api'
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
        const data = await apiCallJSON('/api/processes')
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

  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null
    return <span className="sort-indicator">{sortOrder === 'desc' ? ' ↓' : ' ↑'}</span>
  }

  return (
    <div className="processes-container">
      <div className="processes-card">
        <div className="processes-header">
          <span className="header-icon">🖱️</span>
          <h3>进程列表 ({filteredProcesses.length})</h3>
        </div>

        <div className="processes-toolbar">
          <input
            type="search"
            placeholder="搜索进程名称或 PID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-box"
          />
        </div>

        <div className="table-wrapper">
          <table className="processes-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>
                  <button className="sort-button" onClick={() => handleSort('pid')}>
                    PID
                    <SortIndicator column="pid" />
                  </button>
                </th>
                <th style={{ flex: 1 }}>
                  <button className="sort-button" onClick={() => handleSort('name')}>
                    进程名称
                    <SortIndicator column="name" />
                  </button>
                </th>
                <th style={{ width: '100px' }}>
                  <button className="sort-button" onClick={() => handleSort('cpu')}>
                    CPU %
                    <SortIndicator column="cpu" />
                  </button>
                </th>
                <th style={{ width: '120px' }}>
                  <button className="sort-button" onClick={() => handleSort('mem')}>
                    内存
                    <SortIndicator column="mem" />
                  </button>
                </th>
                <th style={{ width: '100px' }}>
                  <button className="sort-button" onClick={() => handleSort('user')}>
                    用户
                    <SortIndicator column="user" />
                  </button>
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
            <p>没有找到匹配的进程</p>
          </div>
        )}
      </div>
    </div>
  )
}
