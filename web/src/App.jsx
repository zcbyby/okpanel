import { useState, useEffect } from 'react'
import {
  Tab,
  TabList,
  TabValue,
} from '@fluentui/react-components'
import {
  Activity24Filled,
  Settings24Filled,
  HardDrive24Filled,
  Network24Filled,
} from '@fluentui/react-icons'
import OverviewTab from './components/OverviewTab'
import ProcessesTab from './components/ProcessesTab'
import DiskTab from './components/DiskTab'
import NetworkTab from './components/NetworkTab'
import Header from './components/Header'
import './App.css'

function App() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="app-container">
      <Header />
      
      <div className="tabs-container">
        <TabList
          selectedValue={selectedTab}
          onTabSelect={(e, data) => setSelectedTab(data.value)}
          style={{ width: '100%' }}
        >
          <Tab value="overview" icon={<Activity24Filled />}>
            总览
          </Tab>
          <Tab value="processes" icon={<Settings24Filled />}>
            进程
          </Tab>
          <Tab value="disk" icon={<HardDrive24Filled />}>
            存储
          </Tab>
          <Tab value="network" icon={<Network24Filled />}>
            网络
          </Tab>
        </TabList>
      </div>

      <div className="content">
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'processes' && <ProcessesTab />}
        {selectedTab === 'disk' && <DiskTab />}
        {selectedTab === 'network' && <NetworkTab />}
      </div>
    </div>
  )
}

export default App
