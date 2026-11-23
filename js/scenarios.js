/* ============================================================
   陕西省城市生命线 - 专题页渲染 & 路由
   ============================================================ */

const Scenarios = (() => {

  /* ===== 首页渲染 ===== */
  async function renderHome() {
    // 顶部核心数字带
    const stripEl = document.getElementById('home-kpi-strip');
    if (stripEl) {
      stripEl.innerHTML = HOME_KPI_STRIP.map(k => `
        <div class="kpi-cell">
          <div class="k-num">${k.num}<span class="unit">${k.unit}</span></div>
          <div class="k-label">${k.label}</div>
          <div class="k-sub">${k.sub}</div>
        </div>`).join('');
    }

    // 核心指标
    const metricsEl = document.getElementById('home-core-metrics');
    metricsEl.innerHTML = [
      { n: '68,240', u: '台', l: '接入设备总数', t: '↑ 12.8%' },
      { n: '3,862',  u: '条', l: '累计预警数',   t: '↑ 8.6%' },
      { n: '426',    u: '条', l: '今日预警',     t: '↑ 15%' },
      { n: '96.8',   u: '%',  l: '设备在线率',   t: '↑ 1.2%' },
      { n: '2,128',  u: '台', l: '监测报警数',   t: '↑ 5.3%' },
      { n: '11',     u: '地市', l: '接入地市',   t: '全覆盖' },
    ].map(m => `
      <div class="metric-card">
        <div class="num">${m.n}<span class="unit">${m.u}</span></div>
        <div class="label">${m.l}</div>
        <div class="${m.t.startsWith('↓') ? 'trend-down' : 'trend-up'}">${m.t}</div>
      </div>`).join('');

    // 八大专题运行状态
    const topicEl = document.getElementById('home-topic-status');
    if (topicEl) {
      topicEl.innerHTML = TOPIC_STATUS.map(t => `
        <div class="topic-status-row" onclick="location.hash='#/${t.key}'">
          <span class="ts-icon">${t.icon}</span>
          <span class="ts-name">${t.name}</span>
          <span class="ts-num">设备 <b>${t.devices.toLocaleString()}</b> · 预警 <b>${t.alerts}</b></span>
          <span class="ts-tag lv-${t.level}">${t.status}</span>
        </div>`).join('');
    }

    // 预警列表
    const alertEl = document.getElementById('home-alert-list');
    alertEl.innerHTML = HOME_ALERTS.map(a => `
      <div class="alert-item level-${a.level}">
        <div class="time">${a.time}</div>
        <div class="content">
          <div class="title">[${a.city}] ${a.title}</div>
          <div class="loc">📍 ${a.loc}</div>
        </div>
      </div>`).join('');

    // 天气
    const weatherEl = document.getElementById('home-weather-list');
    weatherEl.innerHTML = HOME_WEATHER.map(w => `
      <div class="weather-item">
        <span class="city">${w.city}</span>
        <span class="level ${w.level}">${w.text}</span>
      </div>`).join('');

    // 预警类型TOP5 图表
    renderBar('#home-alert-type-chart', ALERT_TYPE_TOP5);

    // 设备接入排行
    const rankData = SHAANXI_CITIES
      .slice()
      .sort((a, b) => b.online - a.online)
      .slice(0, 7);
    renderRank('#home-device-rank', rankData.map(c => ({ name: c.name, value: c.online })));

    // 风险分布
    renderRiskPie('#home-risk-chart', SHAANXI_CITIES);

    // 八大专题今日预警分级（堆叠柱）
    const topicAlertEl = document.getElementById('home-topic-alert-chart');
    if (topicAlertEl) {
      const s = TOPIC_ALERT_STATS;
      const taChart = echarts.init(topicAlertEl);
      taChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['红', '橙', '黄', '蓝'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5, itemWidth: 12, itemHeight: 8 },
        grid: { top: 26, left: 30, right: 10, bottom: 22 },
        xAxis: { type: 'category', data: s.topics, axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6', fontSize: 10, interval: 0 } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(64,158,255,0.12)' } } },
        series: [
          { name: '红', type: 'bar', stack: 'a', data: s.red,    itemStyle: { color: '#ff4d4f' }, barWidth: 12 },
          { name: '橙', type: 'bar', stack: 'a', data: s.orange, itemStyle: { color: '#ffa940' } },
          { name: '黄', type: 'bar', stack: 'a', data: s.yellow, itemStyle: { color: '#ffec3d' } },
          { name: '蓝', type: 'bar', stack: 'a', data: s.blue,   itemStyle: { color: '#00e5ff', borderRadius: [2, 2, 0, 0] } },
        ],
      });
    }

    // 陕西地图
    await MapLayer.render('shaannxi-map');
    bindMapToolbar();
    initHomeAutoScroll();
    setTimeout(() => {
      MapLayer.resize();
      // 全局图表resize
      document.querySelectorAll('.chart-box').forEach(el => {
        const inst = echarts.getInstanceByDom(el);
        if (inst) inst.resize();
      });
    }, 250);

    // 图例
    const legendEl = document.getElementById('map-legend');
    legendEl.innerHTML = `
      <div class="row"><span class="dot" style="background:#ff4d4f"></span>高风险区 (n>100)</div>
      <div class="row"><span class="dot" style="background:#ffa940"></span>中风险区 (70-100)</div>
      <div class="row"><span class="dot" style="background:#ffec3d"></span>低风险区 (40-70)</div>
      <div class="row"><span class="dot" style="background:#52c41a"></span>安全区 (<40)</div>`;
  }

  /* ===== 专题公共渲染 ===== */
  async function renderScenario(key) {
    const data = SCENARIO_DATA[key];
    if (!data) return;

    // 应用专题差异化布局（栏宽按业务配置）
    const layout = SCENARIO_LAYOUT[key] || {};
    const layoutEl = document.getElementById('scenario-layout');
    if (layoutEl && layout.cols) layoutEl.style.gridTemplateColumns = layout.cols;

    // 更新中间地图
    await MapLayer.render('scenario-map', { city: null });
    const legendEl = document.getElementById('scenario-map-legend');
    legendEl.innerHTML = `
      <div style="color:var(--cyan);margin-bottom:4px;font-weight:600">${data.name} · 地图图例</div>
      <div class="row"><span class="dot" style="background:#ff4d4f"></span>红色风险点位</div>
      <div class="row"><span class="dot" style="background:#ffa940"></span>橙色风险点位</div>
      <div class="row"><span class="dot" style="background:#00e5ff"></span>监测设备/场站</div>
      <div class="row"><span class="dot" style="background:#7c4dff"></span>在建/重点区域</div>`;

    // 左侧：核心指标 + 专题专属附加面板 + 风险分布 + 业务模块
    const leftEl = document.getElementById('scenario-left');
    let leftHTML = `
      <div class="panel panel-auto">
        <div class="panel-title"><i>◎</i> ${data.name} · 核心指标</div>
        <div class="metrics-grid">
          ${data.metrics.map(m => `
            <a class="metric-card" href="#/${key}/m0" title="点击进入基础底数">
              <div class="num">${m.num}<span class="unit">${m.unit}</span></div>
              <div class="label">${m.label}</div>
              <div class="trend-up">${m.trend}</div>
            </a>`).join('')}
        </div>
      </div>`;

    // 专题专属附加面板（差异化信息维度）
    leftHTML += renderLeftExtra(key);

    // 如果有风险分布数据
    if (data.riskDist) {
      leftHTML += `
        <div class="panel">
          <div class="panel-title"><i>📊</i> 风险等级分布</div>
          <div id="scenario-risk-pie" class="chart-box"></div>
        </div>`;
    }

    // 业务模块入口（点击进入二级页面）
    leftHTML += `
      <div class="panel">
        <div class="panel-title"><i>▤</i> 业务功能模块</div>
        <div class="module-grid">
          ${data.modules.map((m, i) => `
            <a class="module-btn ${i === 0 ? 'active' : ''}" href="#/${key}/m${i}" title="${MODULE_DESC[m] || ''}">${m}</a>`).join('')}
        </div>
        <div class="module-hint" id="module-hint">点击模块进入对应二级业务页面 ›</div>
      </div>`;

    leftEl.innerHTML = leftHTML;

    if (data.riskDist) {
      renderRiskDistPie('#scenario-risk-pie', data.riskDist);
    }

    // 右侧：模块导航 + 图表 + 列表（根据专题类型动态渲染）
    const rightEl = document.getElementById('scenario-right');
    rightEl.innerHTML = renderScenarioRight(key, data);

    // 底部：专题特色全宽条带（差异化布局组件）
    renderBottomStrip(key, data);

    // 绑定地图toolbar
    bindMapToolbar();

    // 渲染右侧图表（如果有的话）
    setTimeout(() => {
      renderScenarioCharts(key, data);
      renderBottomStripCharts(key, data);
      // 再延迟resize所有图表，防止flex容器未完成布局
      setTimeout(() => {
        document.querySelectorAll('.chart-box').forEach(el => {
          const inst = echarts.getInstanceByDom(el);
          if (inst) inst.resize();
        });
      }, 150);
    }, 80);
  }

  /* ===== 左栏专题附加面板 ===== */
  function renderLeftExtra(key) {
    const cfg = LEFT_EXTRA[(SCENARIO_LAYOUT[key] || {}).leftExtra];
    if (!cfg) return '';
    let body = '';
    if (cfg.rows) {
      body = `<div class="indicator-list extra-rows">${cfg.rows.map(r => `
        <div class="indicator-row"><span>${r[0]}</span><span><span class="val" style="margin-right:6px;font-size:12px">${r[1]}</span><span class="tag tag-${r[3]}">${r[2]}</span></span></div>`).join('')}</div>`;
    } else if (cfg.bars) {
      body = `<div class="mini-bars">${cfg.bars.map(b => `
        <div class="mini-bar-row"><span class="mb-label">${b[0]}</span><div class="mb-track"><div class="mb-fill" style="width:${b[1]}%"></div></div><span class="mb-val">${b[1]}%</span></div>`).join('')}</div>`;
    }
    if (cfg.foot) body += `<div class="panel-foot-note">${cfg.foot}</div>`;
    return `<div class="panel" style="flex:1.25"><div class="panel-title"><i>✦</i> ${cfg.title}</div>${body}</div>`;
  }

  /* ===== 底部特色条带（HTML 部分） ===== */
  function renderBottomStrip(key, data) {
    const wrap = document.getElementById('scenario-bottom');
    const layoutEl = document.getElementById('scenario-layout');
    const layout = SCENARIO_LAYOUT[key] || {};
    if (!wrap) return;
    if (!layout.bottom) {
      wrap.style.display = 'none';
      if (layoutEl) layoutEl.classList.remove('has-bottom');
      return;
    }
    wrap.style.display = 'block';
    if (layoutEl) layoutEl.classList.add('has-bottom');
    const ext = SCENARIO_EXT[key] || {};

    if (layout.bottom === 'steps') {
      // 瓶装气：全流程步进追溯条
      wrap.innerHTML = `
        <div class="panel">
          <div class="panel-title"><i>🔗</i> 气瓶全流程追溯 · 今日各环节流转量（扫码一瓶一码）</div>
          <div class="sb-body"><div class="step-flow">
            ${ext.funnel.map((f, i) => `
              <div class="step-node"><div class="step-box">
                <div class="step-name">${f.name}</div>
                <div class="step-val">${f.value.toLocaleString()}</div>
                <div class="step-sub">环节${i + 1}/${ext.funnel.length} · 追溯率 ${(99.4 - i * 0.6).toFixed(1)}%</div>
              </div></div>`).join('')}
          </div></div>
        </div>`;
    } else if (layout.bottom === 'bridgeList') {
      // 桥梁：重点桥梁监测表（点击进入 CIM 详情）
      wrap.innerHTML = `
        <div class="panel">
          <div class="panel-title"><i>🌉</i> 重点桥梁健康监测一览（点击行进入 CIM 三维详情）</div>
          <div class="sb-body" style="overflow-y:auto">
            <table class="sb-table">
              <tr><th>桥梁名称</th><th>地市</th><th>桥型</th><th>跨径</th><th>状态</th><th>健康度</th><th>操作</th></tr>
              ${data.bridges.map(b => `
                <tr class="clickable" onclick="location.hash='#/bridge/${b.id}'">
                  <td class="td-name">${b.name}</td><td>${b.city}</td><td>${b.type}</td><td>${b.span}</td>
                  <td><span class="tag ${b.status === '运行中' ? 'tag-green' : b.status === '重点关注' ? 'tag-red' : 'tag-orange'}">${b.status}</span></td>
                  <td>${(SCENARIO_EXT.bridge.healthRank.find(h => h.name === b.name) || {}).value || (85 + b.level * 2)} 分</td>
                  <td><a href="#/bridge/${b.id}" style="color:var(--cyan)">CIM ›</a></td>
                </tr>`).join('')}
            </table>
          </div>
        </div>`;
    } else {
      // 图表型条带
      const titles = {
        capability: ['�', '各地市排水能力对比（管网里程 × 泵站数量）'],
        energy:     ['⚡', '24小时隧道能耗曲线（照明 / 通风 kW·h）'],
        supply:     ['🚰', '24小时全市供水量曲线（万m³）'],
        load:       ['♨️', '24小时热源负荷率 × 室温达标率（%）'],
        cabin:      ['🧱', '重点舱室运行状态（温度℃ × 今日报警数）'],
      };
      const [icon, title] = titles[layout.bottom];
      wrap.innerHTML = `
        <div class="panel">
          <div class="panel-title"><i>${icon}</i> ${title}</div>
          <div class="sb-body"><div id="sb-chart-${layout.bottom}" class="sb-chart chart-box"></div></div>
        </div>`;
    }
  }

  /* ===== 底部特色条带（图表渲染，需在 DOM 就绪后调用） ===== */
  function renderBottomStripCharts(key, data) {
    const layout = SCENARIO_LAYOUT[key] || {};
    const ext = SCENARIO_EXT[key] || {};
    const AX = { lineStyle: { color: '#5f7f9f' } };
    const mk = (id, option) => {
      const el = document.getElementById(id);
      if (!el) return;
      const inst = echarts.getInstanceByDom(el);
      if (inst) inst.dispose();
      echarts.init(el).setOption(option);
    };
    const baseGrid = { left: 46, right: 46, top: 26, bottom: 22 };
    const baseAxis = (name) => ({
      type: 'value', name, nameTextStyle: { color: '#5f7f9f', fontSize: 10 },
      axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(64,158,255,.1)' } },
    });

    switch (layout.bottom) {
      case 'capability':
        mk('sb-chart-capability', {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } },
          legend: { textStyle: { color: '#9cc4e6', fontSize: 10 }, top: 0, right: 8, itemWidth: 14 },
          grid: baseGrid,
          xAxis: { type: 'category', data: ext.capability.cities, axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 } },
          yAxis: [baseAxis('管网km'), { ...baseAxis('泵站座'), splitLine: { show: false } }],
          series: [
            { name: '排水管网里程', type: 'bar', data: ext.capability.pipeKm, barWidth: '42%', barMaxWidth: 44,
              itemStyle: { borderRadius: [2, 2, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00e5ff' }, { offset: 1, color: 'rgba(41,121,255,.35)' }] } } },
            { name: '排水泵站', type: 'line', yAxisIndex: 1, data: ext.capability.pumps, smooth: true, symbolSize: 6, lineStyle: { color: '#ffa940', width: 2.5, shadowColor: '#ffa940', shadowBlur: 8 }, itemStyle: { color: '#ffa940' } },
          ],
        });
        break;
      case 'energy':
        mk('sb-chart-energy', {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } },
          legend: { textStyle: { color: '#9cc4e6', fontSize: 10 }, top: 0, right: 8, itemWidth: 14 },
          grid: { ...baseGrid, right: 20 },
          xAxis: { type: 'category', data: ext.energy.hours.map(h => h + ':00'), axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 }, boundaryGap: false },
          yAxis: { ...baseAxis('kW·h'), min: 200, max: 550 },
          series: [
            { name: '照明能耗', type: 'line', data: ext.energy.lighting, smooth: true, symbolSize: 5, lineStyle: { color: '#00e5ff', width: 2.5, shadowColor: '#00e5ff', shadowBlur: 8 }, itemStyle: { color: '#00e5ff' },
              areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,229,255,.28)' }, { offset: 1, color: 'rgba(0,229,255,0)' }] } } },
            { name: '通风能耗', type: 'line', data: ext.energy.ventil, smooth: true, symbolSize: 5, lineStyle: { color: '#7c4dff', width: 2.5 }, itemStyle: { color: '#7c4dff' },
              areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(124,77,255,.22)' }, { offset: 1, color: 'rgba(124,77,255,0)' }] } } },
          ],
        });
        break;
      case 'supply': {
        const avg = (ext.supplyDay.val.reduce((a, b) => a + b, 0) / ext.supplyDay.val.length).toFixed(1);
        mk('sb-chart-supply', {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } },
          grid: { ...baseGrid, right: 20 },
          xAxis: { type: 'category', data: ext.supplyDay.hours.map(h => h + ':00'), axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 }, boundaryGap: false },
          yAxis: { ...baseAxis('万m³'), min: 10, max: 32 },
          series: [{ name: '供水量', type: 'line', data: ext.supplyDay.val, smooth: true, symbolSize: 6,
            lineStyle: { color: '#00e5ff', width: 2.5, shadowColor: '#00e5ff', shadowBlur: 10 }, itemStyle: { color: '#00e5ff' },
            areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,229,255,.35)' }, { offset: 1, color: 'rgba(0,229,255,0)' }] } },
            markLine: { symbol: 'none', data: [{ yAxis: avg, lineStyle: { color: '#ffec3d', type: 'dashed' }, label: { color: '#ffec3d', fontSize: 10, formatter: `日均 ${avg}` } }] },
          }],
        });
        break;
      }
      case 'load':
        mk('sb-chart-load', {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } },
          legend: { textStyle: { color: '#9cc4e6', fontSize: 10 }, top: 0, right: 8, itemWidth: 14 },
          grid: baseGrid,
          xAxis: { type: 'category', data: ext.loadCurve.hours.map(h => h + ':00'), axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 } },
          yAxis: [{ ...baseAxis('负荷率%'), min: 50, max: 100 }, { ...baseAxis('达标率%'), min: 95, max: 100, splitLine: { show: false } }],
          series: [
            { name: '热源负荷率', type: 'bar', data: ext.loadCurve.load, barWidth: '42%', barMaxWidth: 44,
              itemStyle: { borderRadius: [2, 2, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ff4081' }, { offset: 1, color: 'rgba(255,64,129,.25)' }] } } },
            { name: '室温达标率', type: 'line', yAxisIndex: 1, data: ext.loadCurve.roomPass, smooth: true, symbolSize: 6, lineStyle: { color: '#52c41a', width: 2.5, shadowColor: '#52c41a', shadowBlur: 8 }, itemStyle: { color: '#52c41a' } },
          ],
        });
        break;
      case 'cabin':
        mk('sb-chart-cabin', {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } },
          legend: { textStyle: { color: '#9cc4e6', fontSize: 10 }, top: 0, right: 8, itemWidth: 14 },
          grid: baseGrid,
          xAxis: { type: 'category', data: ext.cabinStat.map(c => c.name), axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10, interval: 0 } },
          yAxis: [{ ...baseAxis('温度℃'), min: 15, max: 22 }, { ...baseAxis('报警数'), min: 0, max: 6, splitLine: { show: false } }],
          series: [
            { name: '舱内温度', type: 'bar', data: ext.cabinStat.map(c => c.temp), barWidth: '38%', barMaxWidth: 44,
              itemStyle: { borderRadius: [2, 2, 0, 0], color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#ffa940' }, { offset: 1, color: 'rgba(255,169,64,.25)' }] } } },
            { name: '今日报警', type: 'line', yAxisIndex: 1, data: ext.cabinStat.map(c => c.alarms), symbolSize: 7, lineStyle: { color: '#ff4d4f', width: 2.5, shadowColor: '#ff4d4f', shadowBlur: 8 }, itemStyle: { color: '#ff4d4f' } },
          ],
        });
        break;
    }
  }

  /* ===== 各专题右侧渲染 ===== */
  function renderScenarioRight(key, data) {
    switch (key) {
      case 'gas':     return renderGasRight(data);
      case 'lpg':     return renderLpgRight(data);
      case 'drainage':return renderDrainageRight(data);
      case 'bridge':  return renderBridgeRight(data);
      case 'tunnel':  return renderTunnelRight(data);
      case 'water':   return renderWaterRight(data);
      case 'heating': return renderHeatingRight(data);
      case 'corridor':return renderCorridorRight(data);
      default: return `<div class="panel"><div class="panel-title">建设内容</div><p>开发中...</p></div>`;
    }
  }

  /* ---------- 管道燃气 ---------- */
  function renderGasRight(data) {
    return `
      <div class="panel">
        <div class="panel-title"><i>🏭</i> 场站设施实时状态</div>
        <div class="indicator-list">
          ${data.stations.map(s => `
            <div class="indicator-row">
              <span>${s.name} <span style="color:var(--text-muted);font-size:11px">(${s.city})</span></span>
              <span class="tag ${s.status === '运行中' ? 'tag-green' : 'tag-orange'}">${s.status}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>⚠️</i> 隐患分级统计</div>
        <div id="gas-hazard-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🔥</i> 燃气泄漏风险处置</div>
        <div class="indicator-list">
          <div class="indicator-row"><span>泄漏处置响应时间</span><span class="val">平均 12 min</span></div>
          <div class="indicator-row"><span>泄漏源定位精度</span><span class="val">± 5 m</span></div>
          <div class="indicator-row"><span>第三方开挖报警</span><span class="val">今日 18 起</span></div>
          <div class="indicator-row"><span>阴极保护覆盖率</span><span class="val">98.2%</span></div>
          <div class="indicator-row"><span>泄漏扩散模型运行</span><span class="tag tag-green">实时</span></div>
        </div>
      </div>`;
  }

  /* ---------- 瓶装液化气：全链条追溯专题 ---------- */
  function renderLpgRight(data) {
    const ext = SCENARIO_EXT.lpg;
    return `
      <div class="panel">
        <div class="panel-title"><i>🛢️</i> 气瓶全流程追溯（今日流转量 / 瓶）</div>
        <div id="lpg-funnel-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>📈</i> 今日充装 / 配送分时趋势</div>
        <div id="lpg-trend-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🏪</i> 充装站安全检查评级</div>
        <div class="indicator-list">
          ${ext.stations.map(s => `
            <div class="indicator-row">
              <span>${s.name}</span>
              <span><span class="tag ${s.rate === 'A' ? 'tag-green' : 'tag-orange'}">${s.rate} 级</span>
              <span class="val" style="margin-left:6px">${s.today} 瓶</span>
              <span class="tag ${s.status === '合规' ? 'tag-blue' : 'tag-red'}" style="margin-left:6px">${s.status}</span></span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🚨</i> 临期 / 违规预警</div>
        <div class="alert-list">
          ${ext.overdue.map(o => `
            <div class="alert-item ${o.days > 7 ? 'level-red' : o.days > 3 ? 'level-orange' : 'level-yellow'}">
              <div class="time">${o.days}天</div>
              <div class="content"><div class="title">${o.type} · ${o.id}</div><div class="loc">📍 ${o.loc}</div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- 城市排水：防汛防涝专题 ---------- */
  function renderDrainageRight(data) {
    const ext = SCENARIO_EXT.drainage;
    return `
      <div class="panel">
        <div class="panel-title"><i>🌧️</i> 近24h 雨量 - 管网水位联动</div>
        <div id="drainage-rain-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>💦</i> 易积水点实时水位 TOP5</div>
        <div class="indicator-list">
          ${ext.hotspots.map(h => `
            <div class="indicator-row">
              <span>${h.name}</span>
              <span><span class="val" style="color:${h.level === 'orange' ? 'var(--orange)' : h.level === 'yellow' ? '#ffec3d' : 'var(--cyan)'}">${h.water} ${h.trend}</span>
              <span class="tag tag-${h.level === 'orange' ? 'orange' : h.level === 'yellow' ? 'yellow' : 'blue'}" style="margin-left:6px">${h.status}</span></span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🏭</i> 排水泵站运行状态</div>
        <div class="indicator-list">
          ${ext.pumps.map(p => `
            <div class="indicator-row">
              <span>${p.name}</span>
              <span><span class="val">机组 ${p.units}</span>
              <span class="tag ${p.status === '运行中' ? 'tag-green' : p.status === '检修' ? 'tag-red' : 'tag-blue'}" style="margin-left:6px">${p.status}</span></span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- 桥梁安全：结构健康专题 ---------- */
  function renderBridgeRight(data) {
    const ext = SCENARIO_EXT.bridge;
    return `
      <div class="panel">
        <div class="panel-title"><i>🌉</i> 重点桥梁 · 点击查看 CIM 详情</div>
        <div class="indicator-list">
          ${data.bridges.map(b => `
            <div class="bridge-point-card" onclick="Scenarios.goBridgeDetail('${b.id}')">
              <div class="b-icon">🌉</div>
              <div class="b-info">
                <div class="b-name">${b.name}</div>
                <div class="b-meta">${b.city} · ${b.type} · ${b.span}</div>
              </div>
              <div class="b-status ${b.status === '重点关注' ? 'tag-red' : b.status === '维护中' ? 'tag-orange' : 'tag-green'}">${b.status}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>📊</i> 桥梁结构类型分布（座）</div>
        <div id="bridge-type-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🩺</i> 健康度关注排行</div>
        <div id="bridge-health-chart" class="chart-box"></div>
      </div>`;
  }

  /* ---------- 隧道安全：运营环境专题 ---------- */
  function renderTunnelRight(data) {
    const ext = SCENARIO_EXT.tunnel;
    return `
      <div class="panel">
        <div class="panel-title"><i>🩺</i> 重点隧道健康度排行</div>
        <div id="tunnel-health-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🚗</i> 分时车流量 / 平均车速</div>
        <div id="tunnel-traffic-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🌬️</i> 洞内环境实时指标</div>
        <div class="indicator-list">
          ${ext.env.map(e => `
            <div class="indicator-row">
              <span>${e.name} <span style="color:var(--text-muted);font-size:11px">限值 ${e.limit}</span></span>
              <span class="val" style="color:${e.ok ? 'var(--green)' : 'var(--red)'}">${e.value}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>⚠️</i> 今日隧道事件</div>
        <div class="alert-list">
          ${ext.events.map(e => `
            <div class="alert-item level-${e.level}">
              <div class="time">${e.time}</div>
              <div class="content"><div class="title">${e.name}</div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- 城市供水：水质漏损专题 ---------- */
  function renderWaterRight(data) {
    const ext = SCENARIO_EXT.water;
    return `
      <div class="panel">
        <div class="panel-title"><i>🧪</i> 水质实时监测（浊度 / 余氯 / pH）</div>
        <div id="water-quality-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>📉</i> 管网压力 24h 曲线（MPa）</div>
        <div id="water-pressure-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🚰</i> DMA 漏损率排行（%）</div>
        <div id="water-dma-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🏭</i> 重点水厂产能负荷</div>
        <div class="indicator-list">
          ${ext.plants.map(p => `
            <div class="indicator-row" style="flex-direction:column;align-items:stretch;gap:4px">
              <div style="display:flex;justify-content:space-between"><span>${p.name}</span><span class="val">${p.cap} · ${p.load}%</span></div>
              <div style="height:6px;background:rgba(64,158,255,.12);border-radius:3px"><div style="height:100%;width:${p.load}%;border-radius:3px;background:linear-gradient(90deg,#2979ff,#00e5ff)"></div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- 城市供热：温度达标专题 ---------- */
  function renderHeatingRight(data) {
    const ext = SCENARIO_EXT.heating;
    return `
      <div class="panel">
        <div class="panel-title"><i>♨️</i> 供 / 回水温度曲线（℃）</div>
        <div id="heating-temp-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🏠</i> 用户室温分布（户）</div>
        <div id="heating-room-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🔄</i> 热力站运行参数</div>
        <div class="indicator-list">
          ${ext.stations.map(s => `
            <div class="indicator-row">
              <span>${s.name}</span>
              <span><span class="val">${s.temp}</span> <span style="color:var(--text-muted);font-size:11px">${s.press}</span>
              <span class="tag ${s.status === '正常' ? 'tag-green' : 'tag-orange'}" style="margin-left:6px">${s.status}</span></span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🔥</i> 热源厂负荷率</div>
        <div class="indicator-list">
          ${ext.sourceLoad.map(s => `
            <div class="indicator-row" style="flex-direction:column;align-items:stretch;gap:4px">
              <div style="display:flex;justify-content:space-between"><span>${s.name}</span><span class="val">${s.value}%</span></div>
              <div style="height:6px;background:rgba(255,169,64,.12);border-radius:3px"><div style="height:100%;width:${s.value}%;border-radius:3px;background:linear-gradient(90deg,#ffa940,#ff4d4f)"></div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ---------- 综合管廊：舱室环境专题 ---------- */
  function renderCorridorRight(data) {
    const ext = SCENARIO_EXT.corridor;
    return `
      <div class="panel">
        <div class="panel-title"><i>🔧</i> 入廊管线构成（%）</div>
        <div id="corridor-pipe-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🌡️</i> 舱室环境多参数曲线</div>
        <div id="corridor-env-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>🧱</i> 重点舱段运行状态</div>
        <div class="indicator-list">
          ${ext.cabins.map(c => `
            <div class="indicator-row">
              <span>${c.name} <span style="color:var(--text-muted);font-size:11px">${c.len} · ${c.pipes}</span></span>
              <span class="tag ${c.status === '正常' ? 'tag-green' : 'tag-orange'}">${c.status}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>⚠️</i> 今日管廊告警</div>
        <div class="alert-list">
          ${ext.alarms.map(a => `
            <div class="alert-item level-${a.level}">
              <div class="time">${a.time}</div>
              <div class="content"><div class="title">${a.name}</div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ===== 桥梁CIM详情页 ===== */
  function renderBridgeDetail(bridgeId) {
    const bridge = SCENARIO_DATA.bridge.bridges.find(b => b.id === bridgeId);
    if (!bridge) { location.hash = '#/bridge'; return; }

    document.getElementById('bridge-detail-name').textContent = bridge.name;

    // CIM：Three.js 真 3D 斜拉桥场景
    const cimEl = document.getElementById('bridge-cim-canvas');
    initBridge3D(bridge, cimEl);

    // 右侧面板
    const panelsEl = document.getElementById('bridge-cim-panels');
    panelsEl.innerHTML = `
      <div class="panel">
        <div class="panel-title"><i>🌉</i> 桥梁基本信息</div>
        <div class="indicator-list">
          <div class="indicator-row"><span>桥梁名称</span><span class="val">${bridge.name}</span></div>
          <div class="indicator-row"><span>所在城市</span><span class="val">${bridge.city}</span></div>
          <div class="indicator-row"><span>结构类型</span><span class="val">${bridge.type}</span></div>
          <div class="indicator-row"><span>主跨长度</span><span class="val">${bridge.span}</span></div>
          <div class="indicator-row"><span>服役状态</span><span class="tag ${bridge.level <= 2 ? 'tag-red' : bridge.level === 3 ? 'tag-orange' : 'tag-green'}">${bridge.status}</span></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>📊</i> 实时监测数据 <span id="bridge-rt-sub" style="margin-left:auto;color:var(--cyan);font-size:11px;font-weight:400">综合概览 · 点击模型测点切换</span></div>
        <div id="bridge-realtime-chart" class="chart-box"></div>
      </div>
      <div class="panel">
        <div class="panel-title"><i>⚠️</i> 最近预警记录</div>
        <div class="alert-list">
          <div class="alert-item level-yellow"><div class="time">09:28</div><div class="content"><div class="title">结构应变异常</div></div></div>
          <div class="alert-item level-blue"><div class="time">昨日</div><div class="content"><div class="title">振动频率偏移</div></div></div>
          <div class="alert-item level-blue"><div class="time">3天前</div><div class="content"><div class="title">温度监测报警</div></div></div>
        </div>
      </div>`;

    setTimeout(() => {
      // 实时数据图（默认综合概览，点击CIM测点后切换为该测点24h曲线）
      const rtEl = document.getElementById('bridge-realtime-chart');
      const realtimeChart = echarts.init(rtEl);
      window._bridgeRealtimeChart = realtimeChart;
      realtimeChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#9cc4e6' }, top: 5 },
        grid: { top: 35, left: 40, right: 15, bottom: 30 },
        xAxis: { type: 'category', data: ['00','04','08','12','16','20','24'], axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6' } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,0.15)' } } },
        series: [
          { name: '主梁挠度(mm)', type: 'line', smooth: true, data: [2.8, 3.1, 3.5, 5.2, 6.8, 5.8, 4.2], itemStyle: { color: '#00e5ff' }, areaStyle: { color: 'rgba(0,229,255,0.15)' } },
          { name: '塔柱倾斜(‰)', type: 'line', smooth: true, data: [0.12, 0.14, 0.18, 0.25, 0.32, 0.28, 0.20], itemStyle: { color: '#7c4dff' }, areaStyle: { color: 'rgba(124,77,255,0.12)' } },
          { name: '索力变化(%)', type: 'line', smooth: true, data: [-1.2, -0.8, 0.5, 2.1, 3.2, 1.8, 0.6], itemStyle: { color: '#ffa940' } },
        ],
      });
      // 测点联动：由 initBridge3D 点击测点时调用
      window._selectBridgeSensor = (def) => {
        const sub = document.getElementById('bridge-rt-sub');
        if (sub) sub.textContent = `${def.name} · ${def.metric} · 24h`;
        const colorHex = '#' + def.color.toString(16).padStart(6, '0');
        realtimeChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          legend: { show: false },
          grid: { top: 35, left: 46, right: 20, bottom: 30 },
          xAxis: { type: 'category', data: ['00','04','08','12','16','20','24'], axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6' } },
          yAxis: { type: 'value', name: def.unit, nameTextStyle: { color: '#9cc4e6' }, scale: true,
            axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6' },
            splitLine: { lineStyle: { color: 'rgba(64,158,255,0.15)' } } },
          series: [{
            name: def.metric, type: 'line', smooth: true, data: def.trend, symbolSize: 6,
            itemStyle: { color: colorHex }, lineStyle: { width: 2.5, shadowColor: colorHex, shadowBlur: 8 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorHex + '55' }, { offset: 1, color: colorHex + '00' }]) },
            markLine: def.threshold != null ? {
              symbol: 'none', label: { color: '#ff4d4f', fontSize: 10, formatter: `阈值 ${def.threshold}${def.unit}` },
              lineStyle: { color: '#ff4d4f', type: 'dashed' }, data: [{ yAxis: def.threshold }],
            } : undefined,
          }],
        }, { replaceMerge: ['series', 'yAxis'] });
      };
    }, 50);
  }

  /* ===== 桥梁 CIM：Three.js 真 3D（多桥型 + 周边环境） ===== */
  function initBridge3D(bridge, container) {
    // 清理旧实例
    if (window._bridge3D) { window._bridge3D.dispose(); window._bridge3D = null; }

    // 桥型判定：斜拉 / 拱 / 梁（连续梁·钢构·梁桥·预应力梁桥统一按梁式桥渲染）
    const t = bridge.type || '';
    const modelKind = t.indexOf('斜拉') >= 0 ? 'cable' : (t.indexOf('拱') >= 0 ? 'arch' : 'girder');
    const KIND_NAME = { cable: '斜拉桥', arch: '拱桥', girder: '梁式桥' };

    container.innerHTML = `
      <div class="bridge-cim-overlay">
        <div style="font-weight:600;color:var(--cyan);font-size:13px;margin-bottom:6px">🏗️ ${bridge.name} · 三维 CIM 模型</div>
        <div>结构类型：${bridge.type} | 主跨：${bridge.span} | 模型：${KIND_NAME[modelKind]}</div>
        <div style="margin-top:4px;color:var(--text-muted)">🖱️ 拖拽旋转 · 滚轮缩放 · 点击发光测点查看24h监测曲线</div>
      </div>
      <div class="sensor-tip" id="sensor-tip" style="display:none"></div>`;

    const W = container.clientWidth, H = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050d1d);
    scene.fog = new THREE.FogExp2(0x050d1d, 0.0011);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 4000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 灯光
    scene.add(new THREE.AmbientLight(0x4a6a9a, 0.95));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(200, 300, 150);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x2979ff, 0.5);
    fillLight.position.set(-200, 150, -200);
    scene.add(fillLight);

    const DECK_Y = 0, DECK_LEN = 400, DECK_W = 16;
    const TOWER_X = 80, TOWER_H = 90;

    // ===== 材质 =====
    const matDeck  = new THREE.MeshPhongMaterial({ color: 0x2456a0, emissive: 0x0a1a3a, shininess: 60 });
    const matRoad  = new THREE.MeshPhongMaterial({ color: 0x1c2733, shininess: 10 });
    const matTower = new THREE.MeshPhongMaterial({ color: 0x8a9ab5, emissive: 0x1a2a4a, shininess: 80, specular: 0x88aaff });
    const matPier  = new THREE.MeshPhongMaterial({ color: 0x5a6a85, shininess: 30 });
    const matCyanGlow = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const matCable = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });

    // ===== 地面网格 & 水面（含反光波纹） =====
    const grid = new THREE.GridHelper(1100, 55, 0x1a5a9a, 0x0d2a4a);
    grid.position.y = -30;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(1100, 1400),
      new THREE.MeshPhongMaterial({ color: 0x0a3a6a, transparent: true, opacity: 0.82, shininess: 160, specular: 0x33aaff })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -29;
    scene.add(water);
    // 水面反光波纹（移动光带）
    const ripples = [];
    for (let i = 0; i < 7; i++) {
      const r = new THREE.Mesh(
        new THREE.PlaneGeometry(60 + Math.random() * 120, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending })
      );
      r.rotation.x = -Math.PI / 2;
      r.position.set((Math.random() - 0.5) * 700, -28.6, (Math.random() - 0.5) * 900);
      r.userData = { vx: 0.25 + Math.random() * 0.5 };
      ripples.push(r); scene.add(r);
    }

    // ===== 周边环境：两岸陆地（仿卫星纹理）+ 楼群 + 远山 =====
    function makeGroundTexture() {
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#16301f'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 900; i++) {
        const g = 50 + Math.random() * 60;
        ctx.fillStyle = `rgba(${18 + Math.random() * 30},${g},${25 + Math.random() * 35},${0.25 + Math.random() * 0.4})`;
        const r = 2 + Math.random() * 12;
        ctx.beginPath(); ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, 7); ctx.fill();
      }
      // 仿道路
      ctx.strokeStyle = 'rgba(120,125,110,0.55)'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, 0);
        ctx.lineTo(Math.random() * 512, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * 512);
        ctx.lineTo(512, Math.random() * 512);
        ctx.stroke();
      }
      // 仿河流冲积滩
      ctx.fillStyle = 'rgba(140,130,95,0.25)';
      for (let i = 0; i < 120; i++) {
        ctx.beginPath(); ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 0, 7); ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 3);
      return tex;
    }
    const groundTex = makeGroundTexture();
    const matGround = new THREE.MeshPhongMaterial({ map: groundTex, color: 0x9fb89f, shininess: 5 });
    [-1, 1].forEach(side => {
      const g = new THREE.Mesh(new THREE.BoxGeometry(700, 4, 1400), matGround);
      g.position.set(side * (DECK_LEN / 2 + 350), -28, 0);
      scene.add(g);
    });
    // 两岸楼群（夜景亮窗）
    const bldgMat = new THREE.MeshPhongMaterial({ color: 0x2a3a55, emissive: 0x0a1226, shininess: 40 });
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffd97a, transparent: true, opacity: 0.85 });
    const bldgs = [];
    for (let i = 0; i < 26; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const bx = side * (DECK_LEN / 2 + 60 + Math.random() * 260);
      const bz = (Math.random() - 0.5) * 800;
      if (Math.abs(bz) < 60 && Math.abs(bx) < DECK_LEN / 2 + 120) continue;
      const bw = 14 + Math.random() * 18, bh = 20 + Math.random() * 55, bd = 14 + Math.random() * 18;
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bldgMat);
      b.position.set(bx, -26 + bh / 2, bz);
      scene.add(b); bldgs.push(b);
      // 顶部发光条
      const top = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.9, 0.6, bd * 0.9), matCyanGlow);
      top.position.set(bx, -26 + bh + 0.3, bz);
      scene.add(top);
      // 随机亮窗贴片
      for (let w = 0; w < 5; w++) {
        if (Math.random() < 0.4) continue;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.5, bh * 0.12), winMat);
        win.position.set(bx + (bw / 2 + 0.1) * (bz > 0 ? 0 : 0), -26 + bh * (0.25 + Math.random() * 0.6), bz + (bd / 2 + 0.1) * (Math.random() < 0.5 ? 1 : -1));
        if (win.position.z > bz) win.rotation.y = 0; else win.rotation.y = Math.PI;
        scene.add(win);
      }
    }
    // 远山（低多边形锥体，雾中剪影）
    const hillMat = new THREE.MeshPhongMaterial({ color: 0x1c3a2e, emissive: 0x081410, shininess: 2, flatShading: true });
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const coneH = 90 + Math.random() * 120;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(120 + Math.random() * 120, coneH, 5), hillMat);
      cone.position.set(side * (300 + Math.random() * 400), -29 + coneH / 2 - 4, (Math.random() < 0.5 ? -1 : 1) * (520 + Math.random() * 260));
      cone.rotation.y = Math.random() * Math.PI;
      scene.add(cone);
    }

    // ===== 主梁（箱梁）与桥面（公共） =====
    const deck = new THREE.Mesh(new THREE.BoxGeometry(DECK_LEN, 3.5, DECK_W), matDeck);
    deck.position.y = DECK_Y;
    scene.add(deck);
    const road = new THREE.Mesh(new THREE.BoxGeometry(DECK_LEN, 0.3, DECK_W - 2.4), matRoad);
    road.position.y = DECK_Y + 1.9;
    scene.add(road);
    const edgeGeom = new THREE.BoxGeometry(DECK_LEN, 0.35, 0.35);
    [-DECK_W / 2, DECK_W / 2].forEach(z => {
      const edge = new THREE.Mesh(edgeGeom, matCyanGlow);
      edge.position.set(0, DECK_Y + 1.75, z);
      scene.add(edge);
    });
    for (let x = -DECK_LEN / 2 + 4; x < DECK_LEN / 2 - 4; x += 10) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xffec3d }));
      dash.position.set(x, DECK_Y + 2.08, 0);
      scene.add(dash);
    }
    const postGeom = new THREE.BoxGeometry(0.18, 1.1, 0.18);
    const postMat = new THREE.MeshPhongMaterial({ color: 0x3a5a8a });
    for (let x = -DECK_LEN / 2 + 5; x <= DECK_LEN / 2 - 5; x += 10) {
      [-DECK_W / 2 + 0.5, DECK_W / 2 - 0.5].forEach(z => {
        const p = new THREE.Mesh(postGeom, postMat);
        p.position.set(x, DECK_Y + 2.6, z);
        scene.add(p);
      });
    }

    // ===== 桥塔警示灯（斜拉桥用） =====
    let towerLightL = null, towerLightR = null;

    // ===== 上部结构：按桥型分派 =====
    if (modelKind === 'cable') {
      // 塔顶警示灯
      towerLightL = new THREE.PointLight(0xff4d4f, 1.2, 120);
      towerLightL.position.set(-TOWER_X, 92, 0); scene.add(towerLightL);
      towerLightR = new THREE.PointLight(0xff4d4f, 1.2, 120);
      towerLightR.position.set(TOWER_X, 92, 0);
      scene.add(towerLightR);

      function buildTower(tx) {
        const g = new THREE.Group();
        const legGeom = new THREE.BoxGeometry(3, TOWER_H, 2.6);
        [-6, 6].forEach(z => {
          const leg = new THREE.Mesh(legGeom, matTower);
          leg.position.set(0, DECK_Y + TOWER_H / 2, z);
          g.add(leg);
        });
        const beamTop = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 14.6), matTower);
        beamTop.position.set(0, DECK_Y + TOWER_H - 12, 0);
        g.add(beamTop);
        const beamLow = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3, 14.6), matTower);
        beamLow.position.set(0, DECK_Y + 4, 0);
        g.add(beamLow);
        [-6, 6].forEach(z => {
          const cap = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 3), matTower);
          cap.position.set(0, DECK_Y + TOWER_H + 0.6, z);
          g.add(cap);
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xff4d4f }));
          beacon.position.set(0, DECK_Y + TOWER_H + 1.8, z);
          g.add(beacon);
        });
        [-6, 6].forEach(z => {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(0.15, TOWER_H - 6, 0.15), matCyanGlow);
          strip.position.set(1.55, DECK_Y + TOWER_H / 2, z);
          g.add(strip);
        });
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.2, 32, 12), matPier);
        pier.position.set(0, DECK_Y - 15, 0);
        g.add(pier);
        g.position.x = tx;
        scene.add(g);
      }
      buildTower(-TOWER_X);
      buildTower(TOWER_X);
      [-196, 196].forEach(x => {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 30, 10), matPier);
        pier.position.set(x, DECK_Y - 14, 0);
        scene.add(pier);
      });
      // 斜拉索（扇形）
      function addCable(x1, y1, z1, x2, y2, z2) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)]);
        scene.add(new THREE.Line(geom, matCable));
      }
      [-TOWER_X, TOWER_X].forEach(tx => {
        const topY = DECK_Y + TOWER_H - 4;
        for (let i = 0; i < 9; i++) {
          const dx = 12 + i * 9;
          const cableY = topY - i * 4.5;
          [-1, 1].forEach(dir => {
            const ax = tx + dx * dir;
            if (ax < -DECK_LEN / 2 + 6 || ax > DECK_LEN / 2 - 6) return;
            [-5.4, 5.4].forEach(z => {
              addCable(tx, cableY, z * 0.85, ax, DECK_Y + 1.8, z);
            });
          });
        }
      });
    } else if (modelKind === 'arch') {
      // 拱桥：双拱肋 + 吊杆 + 拱脚墩
      const ARCH_L = 168, ARCH_H = 58;
      function archY(x) { return DECK_Y - 2 + ARCH_H * (1 - (x / ARCH_L) * (x / ARCH_L)); }
      [-6.5, 6.5].forEach(z => {
        const pts = [];
        for (let i = 0; i <= 48; i++) {
          const x = -ARCH_L + (2 * ARCH_L) * (i / 48);
          pts.push(new THREE.Vector3(x, archY(x), z));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 1.8, 8, false), matTower);
        scene.add(tube);
        // 拱肋发光轮廓线
        const glowPts = [];
        for (let i = 0; i <= 48; i++) {
          const x = -ARCH_L + (2 * ARCH_L) * (i / 48);
          glowPts.push(new THREE.Vector3(x, archY(x) + 2.0, z));
        }
        const glowGeom = new THREE.BufferGeometry().setFromPoints(glowPts);
        scene.add(new THREE.Line(glowGeom, matCable));
      });
      // 吊杆
      for (let i = 1; i < 14; i++) {
        const x = -ARCH_L + (2 * ARCH_L) * (i / 14);
        const yTop = archY(x);
        if (yTop < DECK_Y + 4) continue;
        [-6.5, 6.5].forEach(z => {
          const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, yTop - DECK_Y - 2, 6), matTower);
          hanger.position.set(x, (yTop + DECK_Y + 2) / 2, z);
          scene.add(hanger);
        });
      }
      // 拱脚墩（大体积）
      [-ARCH_L, ARCH_L].forEach(x => {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 8, 34, 12), matPier);
        pier.position.set(x, DECK_Y - 14, 0);
        scene.add(pier);
      });
      // 桥面横梁撑
      for (let x = -ARCH_L + 20; x <= ARCH_L - 20; x += 24) {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, DECK_W + 2), matTower);
        cross.position.set(x, DECK_Y - 2.2, 0);
        scene.add(cross);
      }
    } else {
      // 梁式桥：多桥墩 + 墩顶箱梁加高（变截面连续梁效果）
      const PIER_GAP = 50;
      for (let x = -DECK_LEN / 2 + 30; x <= DECK_LEN / 2 - 30; x += PIER_GAP) {
        // 花瓶墩：墩身 + 顶部展开帽梁
        const body = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 30, 10), matPier);
        body.position.set(x, DECK_Y - 16, 0);
        scene.add(body);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, DECK_W - 1), matPier);
        cap.position.set(x, DECK_Y - 2.9, 0);
        scene.add(cap);
        // 墩顶箱梁局部加高（变截面）
        const haunch = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, DECK_W - 1.2), matDeck);
        haunch.position.set(x, DECK_Y - 2.6, 0);
        scene.add(haunch);
      }
      // 梁底纵向发光检修灯带
      [-DECK_W / 2 + 1, DECK_W / 2 - 1].forEach(z => {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(DECK_LEN, 0.18, 0.18),
          new THREE.MeshBasicMaterial({ color: 0x2979ff }));
        strip.position.set(0, DECK_Y - 1.85, z);
        scene.add(strip);
      });
    }

    // ===== 车流（发光小车） =====
    const cars = [];
    const carGeom = new THREE.BoxGeometry(4, 1.2, 1.8);
    for (let i = 0; i < 10; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const color = dir > 0 ? 0xcfefff : 0xff6b6b;
      const car = new THREE.Mesh(carGeom, new THREE.MeshBasicMaterial({ color }));
      car.position.set((Math.random() - 0.5) * DECK_LEN * 0.9, DECK_Y + 2.7, dir * 3.6);
      car.userData = { speed: dir * (0.35 + Math.random() * 0.3) };
      cars.push(car);
      scene.add(car);
    }

    // ===== 监测传感器（按桥型布置 + 24h 趋势数据） =====
    const SENSOR_DEFS = {
      cable: [
        { name: 'S01 应变测点', metric: '主梁应变',   unit: 'με',   value: '1862 με',   status: '预警', color: 0xff4d4f, pos: [-130, DECK_Y + 2.2, 0], threshold: 2000, trend: [1620, 1580, 1720, 1862, 1940, 1780, 1660] },
        { name: 'D02 挠度测点', metric: '跨中挠度',   unit: 'mm',   value: '5.2 mm',    status: '关注', color: 0xffa940, pos: [0, DECK_Y + 2.2, 0],    threshold: 8,    trend: [2.8, 3.1, 3.5, 5.2, 6.8, 5.8, 4.2] },
        { name: 'V03 振动测点', metric: '振动加速度', unit: 'm/s²', value: '0.85 m/s²', status: '正常', color: 0x00e5ff, pos: [130, DECK_Y + 2.2, 0],  threshold: 1.5,  trend: [0.62, 0.58, 0.71, 0.85, 0.92, 0.78, 0.66] },
        { name: 'T04 塔偏测点', metric: '塔顶偏位',   unit: '‰',    value: '0.28 ‰',    status: '正常', color: 0x00e5ff, pos: [-TOWER_X, DECK_Y + TOWER_H + 3, 0], threshold: 0.5, trend: [0.12, 0.14, 0.18, 0.25, 0.32, 0.28, 0.20] },
        { name: 'C05 索力测点', metric: '索力变化',   unit: '%',    value: '+2.1 %',    status: '关注', color: 0xffa940, pos: [TOWER_X + 30, DECK_Y + 22, 5.4], threshold: 5, trend: [-1.2, -0.8, 0.5, 2.1, 3.2, 1.8, 0.6] },
        { name: 'B06 支座测点', metric: '支座位移',   unit: 'mm',   value: '1.2 mm',    status: '正常', color: 0x00e5ff, pos: [196, DECK_Y - 2, 0],    threshold: 3,    trend: [0.8, 0.9, 1.0, 1.2, 1.3, 1.1, 1.0] },
      ],
      arch: [
        { name: 'A01 拱肋应力', metric: '拱肋应力',   unit: 'MPa',  value: '86.4 MPa',  status: '关注', color: 0xffa940, pos: [0, DECK_Y + 58, 6.5],   threshold: 120,  trend: [72, 74, 79, 86, 91, 84, 78] },
        { name: 'D02 挠度测点', metric: '桥面挠度',   unit: 'mm',   value: '3.8 mm',    status: '正常', color: 0x00e5ff, pos: [0, DECK_Y + 2.2, 0],    threshold: 6,    trend: [2.2, 2.5, 2.9, 3.8, 4.4, 3.9, 3.1] },
        { name: 'V03 振动测点', metric: '振动加速度', unit: 'm/s²', value: '0.62 m/s²', status: '正常', color: 0x00e5ff, pos: [-84, DECK_Y + 2.2, 0],  threshold: 1.5,  trend: [0.45, 0.42, 0.55, 0.62, 0.70, 0.58, 0.49] },
        { name: 'H04 吊杆索力', metric: '吊杆索力',   unit: '%',    value: '+1.6 %',    status: '正常', color: 0x00e5ff, pos: [72, DECK_Y + 26, -6.5], threshold: 5,    trend: [-0.6, -0.2, 0.8, 1.6, 2.2, 1.4, 0.7] },
        { name: 'F05 拱脚位移', metric: '拱脚水平位移', unit: 'mm', value: '0.9 mm',    status: '正常', color: 0x00e5ff, pos: [-168, DECK_Y - 2, 0],   threshold: 2.5,  trend: [0.5, 0.6, 0.7, 0.9, 1.0, 0.8, 0.7] },
        { name: 'S06 应变测点', metric: '系梁应变',   unit: 'με',   value: '1280 με',   status: '预警', color: 0xff4d4f, pos: [84, DECK_Y + 2.2, 0],   threshold: 1500, trend: [1080, 1120, 1190, 1280, 1360, 1260, 1170] },
      ],
      girder: [
        { name: 'S01 应变测点', metric: '跨中应变',   unit: 'με',   value: '1642 με',   status: '预警', color: 0xff4d4f, pos: [0, DECK_Y + 2.2, 0],    threshold: 1800, trend: [1420, 1380, 1520, 1642, 1740, 1580, 1460] },
        { name: 'D02 挠度测点', metric: '跨中挠度',   unit: 'mm',   value: '4.6 mm',    status: '关注', color: 0xffa940, pos: [-100, DECK_Y + 2.2, 0], threshold: 7,    trend: [2.5, 2.8, 3.2, 4.6, 5.9, 5.0, 3.8] },
        { name: 'V03 振动测点', metric: '振动加速度', unit: 'm/s²', value: '0.74 m/s²', status: '正常', color: 0x00e5ff, pos: [100, DECK_Y + 2.2, 0],  threshold: 1.5,  trend: [0.55, 0.50, 0.62, 0.74, 0.83, 0.69, 0.58] },
        { name: 'T07 温度测点', metric: '梁体温度',   unit: '℃',    value: '23.6 ℃',    status: '正常', color: 0x00e5ff, pos: [50, DECK_Y - 2.0, 6],   threshold: 40,   trend: [17.2, 16.8, 19.5, 23.6, 26.1, 24.2, 20.5] },
        { name: 'P08 墩顶位移', metric: '墩顶位移',   unit: 'mm',   value: '0.7 mm',    status: '正常', color: 0x00e5ff, pos: [-50, DECK_Y - 4, 0],    threshold: 2,    trend: [0.4, 0.4, 0.5, 0.7, 0.8, 0.6, 0.5] },
        { name: 'B06 支座测点', metric: '支座位移',   unit: 'mm',   value: '1.0 mm',    status: '正常', color: 0x00e5ff, pos: [180, DECK_Y - 2, 0],    threshold: 3,    trend: [0.7, 0.8, 0.9, 1.0, 1.2, 1.0, 0.9] },
      ],
    };
    const sensorDefs = SENSOR_DEFS[modelKind];

    const sensors = [];
    function makeLabel(text, color) {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 56;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(6,14,31,0.85)';
      ctx.fillRect(0, 0, 256, 56);
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 254, 54);
      ctx.font = '22px Microsoft YaHei';
      ctx.fillStyle = color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 29);
      const tex = new THREE.CanvasTexture(c);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      sp.scale.set(26, 5.7, 1);
      return sp;
    }
    sensorDefs.forEach(def => {
      const colorHex = '#' + def.color.toString(16).padStart(6, '0');
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 12, 12),
        new THREE.MeshBasicMaterial({ color: def.color, transparent: true })
      );
      m.position.set(...def.pos);
      m.userData = { sensor: def, phase: Math.random() * Math.PI * 2 };
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(1.6, 2.1, 24),
        new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      halo.position.copy(m.position);
      halo.rotation.x = -Math.PI / 2;
      halo.userData = { isHalo: true, phase: m.userData.phase };
      scene.add(halo);
      const label = makeLabel(def.name, colorHex);
      label.position.set(def.pos[0], def.pos[1] + 5.5, def.pos[2]);
      scene.add(label);
      sensors.push(m);
      scene.add(m);
    });

    // ===== 交互：轨道控制 + 测点点击（联动右栏图表） =====
    let theta = 0.75, phi = 0.52, radius = 400;
    let dragging = false, lastX = 0, lastY = 0, autoRotate = true;
    let moved = 0;
    const dom = renderer.domElement;
    function onDown(e) { dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; autoRotate = false; }
    function onMove(e) {
      if (dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        theta -= dx * 0.005;
        phi = Math.max(0.08, Math.min(1.35, phi - dy * 0.004));
        lastX = e.clientX; lastY = e.clientY;
      } else {
        const hit = pickSensor(e);
        dom.style.cursor = hit ? 'pointer' : 'grab';
      }
    }
    function onUp() { dragging = false; setTimeout(() => { autoRotate = true; }, 3000); }
    function onWheel(e) {
      e.preventDefault();
      radius = Math.max(140, Math.min(650, radius + e.deltaY * 0.25));
    }
    let selectedSensor = null;
    function onClick(e) {
      if (moved > 5) return;
      const hit = pickSensor(e);
      const tip = document.getElementById('sensor-tip');
      if (!tip) return;
      if (hit) {
        const d = hit.userData.sensor;
        const colorHex = '#' + d.color.toString(16).padStart(6, '0');
        tip.innerHTML = `<div style="color:${colorHex};font-weight:600">${d.name} · ${d.metric}</div>
          <div>实时值：<b style="color:${colorHex}">${d.value}</b>　状态：${d.status}</div>
          <div style="color:var(--text-muted);font-size:11px;margin-top:2px">右栏图表已切换为该测点 24h 曲线</div>`;
        tip.style.display = 'block';
        // 选中高亮：放大 + 白色描边环
        if (selectedSensor && selectedSensor !== hit) selectedSensor.scale.setScalar(1);
        selectedSensor = hit;
        // 联动右栏实时监测图表
        if (typeof window._selectBridgeSensor === 'function') window._selectBridgeSensor(d);
      } else {
        tip.style.display = 'none';
        if (selectedSensor) { selectedSensor.scale.setScalar(1); selectedSensor = null; }
      }
    }
    const raycaster = new THREE.Raycaster();
    function pickSensor(e) {
      const rect = dom.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
      const hits = raycaster.intersectObjects(sensors);
      return hits.length ? hits[0].object : null;
    }
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // ===== 动画循环 =====
    let rafId = 0;
    const clock = new THREE.Clock();
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (autoRotate) theta += 0.0016;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 25, 0);
      // 传感器脉动
      sensors.forEach(s => {
        if (s === selectedSensor) return;
        const k = 1 + 0.35 * Math.sin(t * 3 + s.userData.phase);
        s.scale.setScalar(k);
      });
      if (selectedSensor) selectedSensor.scale.setScalar(1.8 + 0.2 * Math.sin(t * 5));
      // 塔顶警示灯闪烁
      if (towerLightL && towerLightR) {
        const blink = (Math.sin(t * 4) > 0) ? 1.6 : 0.4;
        towerLightL.intensity = blink;
        towerLightR.intensity = blink;
      }
      // 水面波纹漂移
      ripples.forEach(r => {
        r.position.x += r.userData.vx;
        if (r.position.x > 550) r.position.x = -550;
        r.material.opacity = 0.06 + 0.05 * Math.sin(t * 1.5 + r.position.z);
      });
      // 车流
      cars.forEach(c => {
        c.position.x += c.userData.speed;
        if (c.position.x > DECK_LEN / 2) c.position.x = -DECK_LEN / 2;
        if (c.position.x < -DECK_LEN / 2) c.position.x = DECK_LEN / 2;
      });
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    window._bridge3D = {
      dispose() {
        cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      },
      resize: onResize,
    };
    setTimeout(onResize, 60);
  }

  /* ===== 绑定地图 toolbar（三个图层可独立勾选、叠加显示） ===== */
  function bindMapToolbar() {
    const buttons = document.querySelectorAll('#scenario-center .map-btn, #page-home .map-btn');
    const syncButtons = (state) => {
      buttons.forEach(btn => {
        const checked = Boolean(state[btn.dataset.layer]);
        btn.classList.toggle('active', checked);
        btn.setAttribute('aria-pressed', String(checked));
        btn.title = '点击' + (checked ? '取消' : '勾选') + '，可与其他图层叠加';
      });
    };
    buttons.forEach(btn => {
      btn.onclick = () => syncButtons(MapLayer.switchLayer(btn.dataset.layer));
    });
    syncButtons(MapLayer.getLayerState());
  }

  /* ===== 首页列表自动滚动（保留原生滚动条，悬停/手动操作时暂停） ===== */
  function initHomeAutoScroll() {
    ['home-topic-status', 'home-alert-list', 'home-weather-list'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el._autoScrollTimer) clearInterval(el._autoScrollTimer);
      el.scrollTop = 0;
      el._autoScrollReset = false;
      el._autoScrollHoldUntil = Date.now() + 1000;
      if (!el._autoScrollBound) {
        const pauseForManual = () => { el._autoScrollHoldUntil = Date.now() + 2500; };
        el.addEventListener('wheel', pauseForManual, { passive: true });
        el.addEventListener('pointerdown', pauseForManual);
        el.addEventListener('touchstart', pauseForManual, { passive: true });
        el._autoScrollBound = true;
      }
      el._autoScrollTimer = setInterval(() => {
        if (!el.isConnected) {
          clearInterval(el._autoScrollTimer);
          return;
        }
        const page = el.closest('.page');
        if ((page && !page.classList.contains('active')) || el.matches(':hover')) return;
        if (Date.now() < el._autoScrollHoldUntil) return;
        const maxTop = el.scrollHeight - el.clientHeight;
        if (maxTop <= 2) return;
        if (el._autoScrollReset) {
          el.scrollTop = 0;
          el._autoScrollReset = false;
          el._autoScrollHoldUntil = Date.now() + 800;
          return;
        }
        el.scrollTop += 1;
        if (el.scrollTop >= maxTop - 1) {
          el.scrollTop = maxTop;
          el._autoScrollReset = true;
          el._autoScrollHoldUntil = Date.now() + 1600;
        }
      }, 40);
    });
  }

  /* ===== 专题右侧图表（与 renderXxxRight 的 DOM id 一一对应） ===== */
  const AXIS_LINE = { lineStyle: { color: '#5f7f9f' } };
  const AXIS_LABEL = { color: '#9cc4e6', fontSize: 11 };
  const SPLIT_LINE = { lineStyle: { color: 'rgba(64,158,255,0.12)' } };
  function areaGrad(hex, a1, a2) {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: `rgba(${hex},${a1})` }, { offset: 1, color: `rgba(${hex},${a2})` }]);
  }

  function renderScenarioCharts(key, data) {
    const ext = (typeof SCENARIO_EXT !== 'undefined') ? SCENARIO_EXT[key] : null;
    switch (key) {
      case 'gas':
        renderBar('#gas-hazard-chart', data.hazards.map(h => ({ name: h.type, value: h.count })));
        break;

      /* ---------- 瓶装液化气 ---------- */
      case 'lpg': {
        if (!ext) break;
        // 全流程漏斗
        const funnelEl = document.querySelector('#lpg-funnel-chart');
        if (funnelEl) {
          echarts.init(funnelEl).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item', formatter: '{b}: {c} 瓶' },
            series: [{
              type: 'funnel', left: '8%', right: '8%', top: 8, bottom: 8,
              minSize: '32%', maxSize: '100%', gap: 3, sort: 'descending',
              label: { color: '#e6f4ff', fontSize: 11, formatter: '{b}\n{c} 瓶' },
              itemStyle: { borderColor: 'rgba(0,229,255,.35)', borderWidth: 1 },
              data: ext.funnel.map((f, i) => ({
                ...f,
                itemStyle: { color: ['#00e5ff', '#2979ff', '#7c4dff', '#52c41a', '#ffa940'][i] },
              })),
            }],
          });
        }
        // 充装/配送分时趋势
        const trendEl = document.querySelector('#lpg-trend-chart');
        if (trendEl) {
          echarts.init(trendEl).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['充装量', '配送量'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5 },
            grid: { top: 26, left: 42, right: 14, bottom: 22 },
            xAxis: { type: 'category', data: ext.trend.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: { type: 'value', axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
            series: [
              { name: '充装量', type: 'line', smooth: true, data: ext.trend.fill,
                itemStyle: { color: '#00e5ff' }, areaStyle: { color: areaGrad('0,229,255', 0.28, 0) }, symbolSize: 4 },
              { name: '配送量', type: 'line', smooth: true, data: ext.trend.deliver,
                itemStyle: { color: '#ffa940' }, areaStyle: { color: areaGrad('255,169,64', 0.22, 0) }, symbolSize: 4 },
            ],
          });
        }
        break;
      }

      /* ---------- 城市排水 ---------- */
      case 'drainage': {
        if (!ext) break;
        const el = document.querySelector('#drainage-rain-chart');
        if (el) {
          echarts.init(el).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['降雨量(mm)', '管网水位(m)'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5 },
            grid: { top: 26, left: 40, right: 42, bottom: 22 },
            xAxis: { type: 'category', data: ext.rainLevel.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: [
              { type: 'value', name: 'mm', nameTextStyle: { color: '#9cc4e6' }, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
              { type: 'value', name: 'm', nameTextStyle: { color: '#9cc4e6' }, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: { show: false } },
            ],
            series: [
              { name: '降雨量(mm)', type: 'bar', data: ext.rainLevel.rain, barWidth: 10,
                itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2979ff' }, { offset: 1, color: 'rgba(41,121,255,0.25)' }]),
                  borderRadius: [2, 2, 0, 0] } },
              { name: '管网水位(m)', type: 'line', yAxisIndex: 1, smooth: true, data: ext.rainLevel.level,
                itemStyle: { color: '#00e5ff' }, lineStyle: { width: 2 }, areaStyle: { color: areaGrad('0,229,255', 0.2, 0) }, symbolSize: 4 },
            ],
          });
        }
        break;
      }

      /* ---------- 桥梁 ---------- */
      case 'bridge':
        if (!ext) break;
        renderRiskDistPie('#bridge-type-chart', ext.typePie);
        renderRank('#bridge-health-chart', ext.healthRank);
        break;

      /* ---------- 隧道 ---------- */
      case 'tunnel': {
        if (!ext) break;
        renderRank('#tunnel-health-chart', ext.healthRank);
        const el = document.querySelector('#tunnel-traffic-chart');
        if (el) {
          echarts.init(el).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['车流量(辆/h)', '平均车速(km/h)'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5 },
            grid: { top: 26, left: 52, right: 46, bottom: 22 },
            xAxis: { type: 'category', data: ext.traffic.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: [
              { type: 'value', axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
              { type: 'value', min: 0, max: 100, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: { show: false } },
            ],
            series: [
              { name: '车流量(辆/h)', type: 'bar', data: ext.traffic.flow, barWidth: 10,
                itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#7c4dff' }, { offset: 1, color: 'rgba(124,77,255,0.25)' }]),
                  borderRadius: [2, 2, 0, 0] } },
              { name: '平均车速(km/h)', type: 'line', yAxisIndex: 1, smooth: true, data: ext.traffic.speed,
                itemStyle: { color: '#00e5ff' }, lineStyle: { width: 2 }, symbolSize: 4 },
            ],
          });
        }
        break;
      }

      /* ---------- 城市供水 ---------- */
      case 'water': {
        if (!ext) break;
        // 水质三仪表盘
        const qEl = document.querySelector('#water-quality-chart');
        if (qEl) {
          const gauges = ext.quality.map((q, i) => ({
            name: q.name, type: 'gauge',
            center: [`${18 + i * 32}%`, '58%'], radius: '52%',
            min: 0, max: q.max, splitNumber: 4,
            axisLine: { lineStyle: { width: 8, color: [[q.value / q.max, '#00e5ff'], [1, 'rgba(64,158,255,0.15)']] } },
            pointer: { length: '55%', width: 3, itemStyle: { color: '#e6f4ff' } },
            axisTick: { distance: -8, length: 3, lineStyle: { color: '#9cc4e6', width: 1 } },
            splitLine: { distance: -8, length: 8, lineStyle: { color: '#9cc4e6', width: 1 } },
            axisLabel: { distance: -4, color: '#9cc4e6', fontSize: 9 },
            anchor: { show: false },
            title: { offsetCenter: [0, '88%'], color: '#9cc4e6', fontSize: 11 },
            detail: { valueAnimation: true, offsetCenter: [0, '118%'], color: '#00e5ff', fontSize: 13,
              formatter: (v) => `${v}${q.unit}` },
            data: [{ value: q.value, name: `${q.name} 限值${q.limit}` }],
          }));
          echarts.init(qEl).setOption({ backgroundColor: 'transparent', series: gauges });
        }
        // 压力曲线
        const pEl = document.querySelector('#water-pressure-chart');
        if (pEl) {
          echarts.init(pEl).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { top: 22, left: 44, right: 14, bottom: 22 },
            xAxis: { type: 'category', data: ext.pressure.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: { type: 'value', min: 0.2, max: 0.5, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
            series: [
              { name: '管网压力', type: 'line', smooth: true, data: ext.pressure.val,
                itemStyle: { color: '#00e5ff' }, lineStyle: { width: 2 },
                areaStyle: { color: areaGrad('0,229,255', 0.3, 0) }, symbolSize: 5,
                markLine: { symbol: 'none', label: { color: '#ff4d4f', fontSize: 10 },
                  lineStyle: { color: '#ff4d4f', type: 'dashed' },
                  data: [{ yAxis: 0.25, label: { formatter: '低压告警 0.25' } }] } },
            ],
          });
        }
        // DMA 漏损率
        renderBar('#water-dma-chart', ext.dma);
        break;
      }

      /* ---------- 城市供热 ---------- */
      case 'heating': {
        if (!ext) break;
        const tEl = document.querySelector('#heating-temp-chart');
        if (tEl) {
          echarts.init(tEl).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['供水温度', '回水温度'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5 },
            grid: { top: 26, left: 40, right: 14, bottom: 22 },
            xAxis: { type: 'category', data: ext.tempCurve.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: { type: 'value', min: 40, max: 85, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
            series: [
              { name: '供水温度', type: 'line', smooth: true, data: ext.tempCurve.supply,
                itemStyle: { color: '#ff4d4f' }, areaStyle: { color: areaGrad('255,77,79', 0.25, 0) }, symbolSize: 4 },
              { name: '回水温度', type: 'line', smooth: true, data: ext.tempCurve.back,
                itemStyle: { color: '#00e5ff' }, areaStyle: { color: areaGrad('0,229,255', 0.2, 0) }, symbolSize: 4 },
            ],
          });
        }
        const rEl = document.querySelector('#heating-room-chart');
        if (rEl) {
          echarts.init(rEl).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { top: 18, left: 60, right: 14, bottom: 24 },
            xAxis: { type: 'category', data: ext.roomTempDist.map(r => r.name), axisLine: AXIS_LINE,
              axisLabel: { ...AXIS_LABEL, interval: 0, fontSize: 10 } },
            yAxis: { type: 'value', axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
            series: [{
              type: 'bar', data: ext.roomTempDist.map(r => r.value), barWidth: 16,
              itemStyle: {
                color: (p) => ['#2979ff', '#00b8d4', '#00e5ff', '#52c41a', '#ffa940', '#ff4d4f'][p.dataIndex],
                borderRadius: [3, 3, 0, 0],
              },
              label: { show: true, position: 'top', color: '#e6f4ff', fontSize: 10 },
            }],
          });
        }
        break;
      }

      /* ---------- 综合管廊 ---------- */
      case 'corridor': {
        if (!ext) break;
        renderRiskDistPie('#corridor-pipe-chart', ext.pipePie);
        const el = document.querySelector('#corridor-env-chart');
        if (el) {
          echarts.init(el).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            legend: { data: ['温度(℃)', '湿度(%RH)', '氧含量(%)'], textStyle: { color: '#9cc4e6', fontSize: 11 }, top: 0, right: 5 },
            grid: { top: 26, left: 40, right: 40, bottom: 22 },
            xAxis: { type: 'category', data: ext.envCurve.hours, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL },
            yAxis: [
              { type: 'value', name: '℃/%', nameTextStyle: { color: '#9cc4e6' }, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
              { type: 'value', name: 'O₂%', min: 19.5, max: 21.5, nameTextStyle: { color: '#9cc4e6' }, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, splitLine: { show: false } },
            ],
            series: [
              { name: '温度(℃)', type: 'line', smooth: true, data: ext.envCurve.temp, itemStyle: { color: '#ffa940' }, symbolSize: 4 },
              { name: '湿度(%RH)', type: 'line', smooth: true, data: ext.envCurve.humi, itemStyle: { color: '#00e5ff' }, symbolSize: 4 },
              { name: '氧含量(%)', type: 'line', yAxisIndex: 1, smooth: true, data: ext.envCurve.o2,
                itemStyle: { color: '#52c41a' }, lineStyle: { width: 2 }, symbolSize: 4 },
            ],
          });
        }
        break;
      }
    }
  }

  /* ===== 通用图表 ===== */
  function renderBar(selector, data) {
    const el = document.querySelector(selector);
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { top: 15, left: 10, right: 20, bottom: 30, containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#5f7f9f' } },
        axisLabel: { color: '#9cc4e6' },
        splitLine: { lineStyle: { color: 'rgba(64,158,255,0.12)' } },
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#5f7f9f' } },
        axisLabel: { color: '#9cc4e6', fontSize: 11 },
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.value),
        barWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#2979ff' },
            { offset: 1, color: '#00e5ff' },
          ]),
          borderRadius: [0, 3, 3, 0],
        },
        label: { show: true, position: 'right', color: '#e6f4ff', fontSize: 11 },
      }],
    });
  }

  function renderRank(selector, data) {
    const el = document.querySelector(selector);
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { top: 10, left: 10, right: 25, bottom: 30, containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#9cc4e6' },
        splitLine: { lineStyle: { color: 'rgba(64,158,255,0.12)' } },
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name).reverse(),
        axisLine: { lineStyle: { color: '#5f7f9f' } },
        axisLabel: { color: '#e6f4ff', fontSize: 11 },
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.value).reverse(),
        barWidth: 12,
        itemStyle: {
          color: (p) => {
            const colors = ['#ff4d4f', '#ffa940', '#00e5ff', '#7c4dff', '#2979ff', '#2979ff', '#2979ff'];
            return colors[p.dataIndex] || '#2979ff';
          },
          borderRadius: [0, 3, 3, 0],
        },
        label: { show: true, position: 'right', color: '#e6f4ff', fontSize: 11 },
      }],
    });
  }

  function renderRiskPie(selector, cities) {
    const el = document.querySelector(selector);
    if (!el) return;
    const buckets = { '高风险(>100)': 0, '中风险(70-100)': 0, '低风险(40-70)': 0, '安全区(<40)': 0 };
    cities.forEach(c => {
      if (c.risk > 100) buckets['高风险(>100)']++;
      else if (c.risk > 70) buckets['中风险(70-100)']++;
      else if (c.risk > 40) buckets['低风险(40-70)']++;
      else buckets['安全区(<40)']++;
    });
    const chart = echarts.init(el);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { textStyle: { color: '#9cc4e6', fontSize: 11 }, bottom: 5 },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '40%'],
        label: { color: '#e6f4ff', fontSize: 11, formatter: '{b}: {c}' },
        data: [
          { value: buckets['高风险(>100)'], name: '高风险', itemStyle: { color: '#ff4d4f' } },
          { value: buckets['中风险(70-100)'], name: '中风险', itemStyle: { color: '#ffa940' } },
          { value: buckets['低风险(40-70)'], name: '低风险', itemStyle: { color: '#ffec3d' } },
          { value: buckets['安全区(<40)'], name: '安全区', itemStyle: { color: '#52c41a' } },
        ],
      }],
    });
  }

  function renderRiskDistPie(selector, riskDist) {
    const el = document.querySelector(selector);
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { textStyle: { color: '#9cc4e6', fontSize: 11 }, bottom: 5 },
      series: [{
        type: 'pie', radius: ['35%', '65%'], center: ['50%', '42%'],
        label: { color: '#e6f4ff', fontSize: 11 },
        data: riskDist.map(r => ({ value: r.value, name: r.name, itemStyle: { color: r.color } })),
      }],
    });
  }

  function renderMultiLine(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { top: 15, left: 35, right: 15, bottom: 25 },
      xAxis: { type: 'category', data: ['00','04','08','12','16','20','24'], axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6', fontSize: 11 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#5f7f9f' } }, axisLabel: { color: '#9cc4e6' }, splitLine: { lineStyle: { color: 'rgba(64,158,255,0.15)' } } },
      series: [
        { name: '监测值A', type: 'line', smooth: true, data: [28, 32, 45, 58, 52, 40, 35], itemStyle: { color: '#00e5ff' }, areaStyle: { color: 'rgba(0,229,255,0.15)' } },
        { name: '阈值', type: 'line', data: [50,50,50,50,50,50,50], itemStyle: { color: '#ff4d4f' }, lineStyle: { type: 'dashed' } },
      ],
    });
  }

  /* ===== 对外暴露 ===== */
  const api = {
    renderHome,
    renderScenario,
    renderBridgeDetail,
    goBridgeDetail: (id) => { location.hash = `#/bridge/${id}`; },
  };
  // 挂载到window，供HTML onclick使用
  window.Scenarios = api;
  window.goBridgeDetail = api.goBridgeDetail;
  return api;
})();
