const express = require('express');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 存储进程列表缓存以减少系统调用
let processCache = [];
let lastProcessUpdate = 0;
const PROCESS_CACHE_TIME = 2000; // 2秒缓存

// API 路由
app.get('/api/system-info', async (req, res) => {
  try {
    const [cpuInfo, memInfo, osInfo, cpuSpeed] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.cpuCurrentSpeed(),
    ]);

    res.json({
      cpu: {
        manufacturer: cpuInfo.manufacturer,
        brand: cpuInfo.brand,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        speed: cpuInfo.speed,
        currentSpeed: cpuSpeed.avg,
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        available: memInfo.available,
        free: memInfo.free,
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        hostname: os.hostname(),
        uptime: os.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 CPU 使用率
app.get('/api/cpu-load', async (req, res) => {
  try {
    const cpuLoad = await si.currentLoad();
    res.json({
      load: cpuLoad.currentLoad,
      loadPerCpu: cpuLoad.cpus.map(cpu => cpu.load),
      temps: cpuLoad,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取网络信息
app.get('/api/network', async (req, res) => {
  try {
    const [networkStats, networkInterfaces] = await Promise.all([
      si.networkStats(),
      si.networkInterfaces(),
    ]);

    res.json({
      interfaces: networkStats.map(net => ({
        iface: net.iface,
        rx_bytes: net.rx_bytes,
        rx_dropped: net.rx_dropped,
        rx_errors: net.rx_errors,
        tx_bytes: net.tx_bytes,
        tx_dropped: net.tx_dropped,
        tx_errors: net.tx_errors,
      })),
      physicalInterfaces: networkInterfaces,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取磁盘信息
app.get('/api/disk', async (req, res) => {
  try {
    const diskInfo = await si.fsSize();
    res.json({
      disks: diskInfo.map(disk => ({
        fs: disk.fs,
        type: disk.type,
        size: disk.size,
        used: disk.used,
        available: disk.available,
        use: disk.use,
        mount: disk.mount,
        rw: disk.rw,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取进程列表
app.get('/api/processes', async (req, res) => {
  try {
    const now = Date.now();
    
    // 使用缓存避免频繁调用
    if (now - lastProcessUpdate > PROCESS_CACHE_TIME || processCache.length === 0) {
      const processes = await si.processes();
      processCache = (processes.list || [])
        .sort((a, b) => (b.mem || 0) - (a.mem || 0))
        .slice(0, 100)
        .map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu || 0,
          mem: p.mem || 0,
          user: p.user || 'unknown',
          command: p.command || p.name,
        }));
      lastProcessUpdate = now;
    }

    res.json({
      processes: processCache,
      timestamp: now,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取完整的系统状态
app.get('/api/system-status', async (req, res) => {
  try {
    const [cpuLoad, memInfo, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.processes(),
    ]);

    res.json({
      cpu: {
        load: cpuLoad.currentLoad,
        loadPerCpu: cpuLoad.cpus.map(cpu => cpu.load),
        temp: cpuLoad.avgTemp || 0,
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        available: memInfo.available,
        usagePercent: (memInfo.used / memInfo.total) * 100,
      },
      processes: {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务 (生产环境)
const webBuildPath = path.join(__dirname, '../web/dist');
app.use(express.static(webBuildPath));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - 在最后添加
app.get('*', (req, res) => {
  res.sendFile(path.join(webBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
});
