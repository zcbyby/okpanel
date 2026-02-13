# OKPanel - 服务器状态监控面板

一个基于 Node.js + React + Windows UI 的实时 Linux 服务器监控仪表板。采用 Windows 11 风格的原生 UI 设计，可实时展示 Linux 服务器的各种运行信息。

## 功能特性

### 🎨 Windows 11 原生设计
- 采用 Windows 11 配色方案（Fluent Design 风格）
- 原生 HTML 组件 + windows-ui-fabric CSS 框架
- 轻量级，无重型 UI 组件库依赖
- 响应式设计，适配各种屏幕尺寸

### 🎯 仪表板信息栏（Header）
- **实时 CPU 使用率** - 全局显示当前 CPU 占用百分比
- **实时内存使用率** - 全局显示当前内存占用百分比  
- **网络速率** - 实时显示上行/下行网络流量
- **系统负载** - 显示 1 分钟负载平均值
- **系统运行时间** - 显示服务器启动至今的运行时长
- **主机名** - 显示服务器主机名

### 📊 总览标签页（Overview）
- **系统信息** - 显示 OS、内核版本、处理器、核心数、内存等基本信息
- **CPU 监控** - 实时 CPU 使用率、分核心使用率展示
- **内存监控** - 内存使用情况图表化展示
- **内存详情** - 显示缓存、缓冲区、交换空间等详细信息
- **进程统计** - 运行中、休眠、僵尸进程数统计
- **系统负载** - 1/5/15 分钟负载平均值及系统运行时间
- **磁盘 I/O** - 显示磁盘读写操作速率
- **网络连接** - 显示总连接数、已建立、侦听等连接统计
- **趋势图表** - CPU 和内存使用趋势（面积图）

### ⚙️ 进程标签页
- **进程列表** - 显示详细的进程信息（PID、名称、CPU、内存、用户）
- **搜索功能** - 支持按进程名称或 PID 搜索
- **排序功能** - 支持按 CPU、内存等指标排序
- **实时更新** - 每 3 秒更新一次进程列表

### 💾 存储标签页
- **磁盘信息** - 显示各磁盘的挂载点、容量、使用情况
- **使用率进度条** - 直观展示每个磁盘的使用百分比
- **状态提示** - 红、黄、绿三色提示使用状态

### 🌐 网络标签页
- **网络流量图表** - 实时显示网络发送和接收流量
- **接口统计** - 各网络接口的流量统计
- **接口详情** - 显示 IP 地址、MAC 地址、网掩码等网络信息


## 项目结构

```
okpanel/
├── server/                          # Node.js Express 后端
│   └── index.js                    # 服务器和 API 路由（7个端点）
├── web/                             # React 前端应用
│   ├── src/
│   │   ├── components/             # React 组件库
│   │   │   ├── Header.jsx          # 顶部标题栏
│   │   │   ├── OverviewTab.jsx     # 概览标签页
│   │   │   ├── ProcessesTab.jsx    # 进程管理标签页
│   │   │   ├── DiskTab.jsx         # 存储状态标签页
│   │   │   ├── NetworkTab.jsx      # 网络信息标签页
│   │   │   ├── SystemInfoPanel.jsx # 系统信息面板
│   │   │   └── *.css               # 组件样式
│   │   ├── App.jsx                 # 主应用入口
│   │   ├── main.jsx                # React 入口
│   │   └── index.css               # 全局样式
│   ├── index.html
│   └── dist/                        # 生产构建输出
├── vite.config.js                  # Vite 构建配置
├── package.json                    # 统一的项目配置
├── .gitignore
└── README.md
```

## API 端点

后端提供以下 RESTful API 端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/system-info` | GET | 系统基本信息（CPU、内存、OS） |
| `/api/cpu-load` | GET | CPU 使用率详情（总体和分核心） |
| `/api/system-status` | GET | 综合系统状态（CPU、内存、进程、负载、运行时间） |
| `/api/disk` | GET | 磁盘分区信息和使用情况 |
| `/api/disk-io` | GET | 磁盘读写操作速率 |
| `/api/network` | GET | 网络接口信息和流量统计 |
| `/api/network-speed` | GET | 实时网络上传/下载速度 |
| `/api/network-connections` | GET | 网络连接统计（总计、已建立、侦听等） |
| `/api/processes` | GET | 进程列表（按内存使用排序，前 100 个） |
| `/api/dashboard` | GET | 完整的仪表板数据（合并所有数据源） |

## 技术栈

### 后端
- **Express.js** ^4.18.2 - Web 框架
- **systeminformation** ^5.16.10 - 系统信息收集库
- **cors** ^2.8.5 - 跨域资源共享
- **nodemon** ^3.0.2 - 开发热重载

### 前端
- **React** ^18.2.0 - 用户界面框架
- **React DOM** ^18.2.0 - React 真实 DOM 渲染
- **Vite** ^5.0.8 - 快速构建工具和开发服务器
- **windows-ui-fabric** - Windows 11 原生 UI 样式框架
- **Recharts** ^2.10.3 - 响应式图表库
- **Express Static** - 前端生产构建服务

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 监控指标说明

### 系统负载（Load Average）
- **1分钟负载** - 过去1分钟内的平均负载
- **5分钟负载** - 过去5分钟内的平均负载  
- **15分钟负载** - 过去15分钟内的平均负载
- **参考标准** - 负载值 = CPU 核数 表示系统完全利用，> CPU 核数 表示有等待任务

### 内存详情
- **缓存 (Cached)** - Linux 用于文件缓存的内存，可随时释放
- **缓冲区 (Buffers)** - 用于 I/O 缓冲的内存，可随时释放
- **交换空间 (Swap)** - 当物理内存不足时，系统使用的虚拟内存

### 磁盘 I/O
- **读取速率** - 每秒磁盘读操作次数 (ops/s)
- **写入速率** - 每秒磁盘写操作次数 (ops/s)
- **说明** - 高 I/O 可能预示磁盘性能瓶颈

### 网络连接
- **总计** - 当前所有网络连接总数
- **已建立** - 正在通信的连接数
- **侦听** - 等待传入连接的服务

### 进程状态
- **运行中** - R 状态，正在执行的进程
- **休眠** - S 状态，等待事件的进程
- **僵尸** - Z 状态，已退出但未被回收的进程

- **构建大小** - 生产构建 ~555 KB (gzip 压缩后 ~157 KB)
- **构建时间** - 约 3-4 秒
- **CPU 监控** - 实时更新，每 2-3 秒刷新
- **内存监控** - 实时更新，每 2-3 秒刷新
- **进程列表** - 每 3 秒刷新，显示前 100 个进程（按内存排序）
- **磁盘监控** - 每 5 秒刷新
- **网络监控** - 每 3 秒刷新，流量趋势保持最近 20 条记录


### 权限问题
某些系统信息需要足够的权限才能访问，如需获取完整信息，可能需要以 root 权限运行：
```bash
sudo npm start
```

## 部署

### 本地部署

#### 生产模式
1. 构建前端：
```bash
npm run build
```

2. 启动服务器：
```bash
npm start
```

3. 访问应用：
打开浏览器访问 `http://localhost:3000`

## 修改密码

默认账户：`admin / admin`

1. 生成新密码哈希：
```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('你的新密码', 10))"
```

2. 将生成的哈希替换 `server/index.js` 中的 password 值：
```javascript
password: '新哈希值'
```

## 许可证

MIT

## 修改密码

默认账户：`admin / admin`

### 方法一：修改代码

1. 生成新密码哈希：
```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('你的新密码', 10))"
```

2. 将生成的哈希替换 `server/index.js` 中的 password 值：
```javascript
password: '新哈希值'
```

### 方法二：环境变量（推荐）

设置环境变量 `ADMIN_PASSWORD`，服务启动时会自动使用该密码：
```bash
ADMIN_PASSWORD=your_password npm start
```