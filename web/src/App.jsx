import { useState, useEffect } from 'react'
import Login from './components/Login'
import OverviewTab from './components/OverviewTab'
import ProcessesTab from './components/ProcessesTab'
import DiskTab from './components/DiskTab'
import NetworkTab from './components/NetworkTab'
import Header from './components/Header'
import './App.css'

function App() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 页面加载时检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <p style={{ color: '#666' }}>加载中...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const tabs = [
    { id: 'overview', label: '📊 总览' },
    { id: 'processes', label: '⚙️ 进程' },
    { id: 'disk', label: '💾 存储' },
    { id: 'network', label: '🌐 网络' },
  ]

  return (
    <div className="win-app">
      <Header onLogout={handleLogout} user={user} />
      
      <div className="win-tab-container">
        <div className="win-tab-header">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`win-tab ${selectedTab === tab.id ? 'selected' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="win-content">
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'processes' && <ProcessesTab />}
        {selectedTab === 'disk' && <DiskTab />}
        {selectedTab === 'network' && <NetworkTab />}
      </div>
    </div>
  )
}

export default App
