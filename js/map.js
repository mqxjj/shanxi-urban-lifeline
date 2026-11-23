/* ============================================================
   陕西省地图组件 (ECharts)
   动态加载阿里云DataV GeoJSON
   ============================================================ */

const MapLayer = (() => {
  let currentChart = null;
  // 三个图层独立开关：遥感影像在最底层，风险区半透明叠加，矢量边界与标注在最上层
  const layerState = { vector: true, satellite: false, risk: false };
  let currentCity = null;
  let mapReady = false;

  // ===== 卫星遥感影像底图（Esri World Imagery export，等距圆柱投影与 ECharts geo 线性映射一致） =====
  // 范围需显著大于可视区域，否则地图漫游/缩放后影像会出现空白或只覆盖一部分
  const SAT_BBOX = { minLng: 99.50, minLat: 26.50, maxLng: 118.50, maxLat: 43.50 };
  const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export'
    + `?bbox=${SAT_BBOX.minLng},${SAT_BBOX.minLat},${SAT_BBOX.maxLng},${SAT_BBOX.maxLat}`
    + '&bboxSR=4326&imageSR=4326&size=2000,1789&format=jpg&f=image';

  // 创建/获取卫星影像底层（位于 ECharts 画布之下）
  function ensureSatLayer(container) {
    let wrap = container.querySelector('.map-sat-layer');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'map-sat-layer';
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;display:none;';
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.draggable = false;
      img.alt = '卫星遥感影像';
      img.style.cssText = 'position:absolute;transform-origin:0 0;opacity:.92;filter:brightness(.72) contrast(1.06) saturate(.85);';
      img.onerror = () => { wrap.dataset.failed = '1'; wrap.style.display = 'none'; };
      img.src = SAT_URL;
      wrap.appendChild(img);
      container.appendChild(wrap);
    }
    return wrap;
  }

  // 依据当前 geo 投影，把影像对齐到陕西经纬度包围盒
  function layoutSatLayer() {
    if (!currentChart) return;
    const wrap = currentChart.getDom().querySelector('.map-sat-layer');
    if (!wrap || wrap.dataset.failed || wrap.style.display === 'none') return;
    const img = wrap.firstChild;
    try {
      const p1 = currentChart.convertToPixel('geo', [SAT_BBOX.minLng, SAT_BBOX.maxLat]);
      const p2 = currentChart.convertToPixel('geo', [SAT_BBOX.maxLng, SAT_BBOX.minLat]);
      if (!p1 || !p2) return;
      img.style.left = p1[0] + 'px';
      img.style.top = p1[1] + 'px';
      img.style.width = (p2[0] - p1[0]) + 'px';
      img.style.height = (p2[1] - p1[1]) + 'px';
    } catch (e) { /* geo 尚未就绪 */ }
  }

  function setSatVisible(visible) {
    if (!currentChart) return;
    const wrap = ensureSatLayer(currentChart.getDom());
    if (wrap.dataset.failed) return;
    wrap.style.display = visible ? 'block' : 'none';
    if (visible) {
      // 影像在 ECharts 容器 DOM 末尾，需压到画布之下
      const dom = currentChart.getDom();
      dom.insertBefore(wrap, dom.firstChild);
      layoutSatLayer();
    }
  }

  // 各地市标签方向与偏移（缓解关中城市群标签重叠）
  const LABEL_POS = {
    '西安市': 'left',
    '咸阳市': 'bottom',
    '渭南市': 'right',
    '铜川市': 'left',
    '宝鸡市': 'left',
    '汉中市': 'bottom',
    '安康市': 'bottom',
    '商洛市': 'right',
    '延安市': 'right',
    '榆林市': 'right',
    '杨凌示范区': 'bottom',
  };
  const LABEL_OFFSET = {
    '西安市': [-34, -20],
    '咸阳市': [6, 24],
    '渭南市': [34, 0],
    '铜川市': [-30, -12],
    '杨凌示范区': [-10, 30],
  };

  // 加载陕西省地图GeoJSON并注册（内置变量优先，避免任何网络/file协议限制）
  async function ensureMap() {
    if (mapReady) return true;

    // 1) 优先使用内联的 GeoJSON 变量（assets/shaanxi-geo.js）
    if (window.SHAANXI_GEO && window.SHAANXI_GEO.features) {
      echarts.registerMap('陕西', window.SHAANXI_GEO);
      mapReady = true;
      console.log('陕西地图加载成功(内联):', window.SHAANXI_GEO.features.length, '个地市');
      return true;
    }

    // 2) 回退：本地 json / 远程源
    const sources = [
      'assets/shaanxi.json',
      'https://geo.datav.aliyun.com/areas_v3/bound/610000_full.json',
    ];
    for (const url of sources) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const geoJson = await resp.json();
        if (!geoJson || !geoJson.features) throw new Error('GeoJSON格式异常');
        echarts.registerMap('陕西', geoJson);
        mapReady = true;
        console.log('陕西地图加载成功:', url, geoJson.features.length, '个地市');
        return true;
      } catch (e) {
        console.warn('地图数据加载失败，尝试下一个源:', url, e.message);
      }
    }
    console.error('所有陕西地图数据源均失败');
    return false;
  }

  // 渲染陕西地图
  async function render(containerId, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    await ensureMap();
    if (!mapReady) {
      container.innerHTML = '<div style="color:#ff4d4f;padding:20px;text-align:center">⚠️ 陕西地图数据加载失败，请检查网络连接</div>';
      return null;
    }

    // 等待容器布局完成：0×0 容器 init 会产生零尺寸画布，绘制时报 drawImage 异常
    // 用 setTimeout 轮询而非 rAF（后台/自动化浏览器中 rAF 可能被暂停）
    for (let i = 0; i < 30 && (container.clientWidth === 0 || container.clientHeight === 0); i++) {
      await new Promise(r => setTimeout(r, 100));
    }
    // 兜底：布局仍未就绪时按视口显式给尺寸，保证图表可初始化
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      container.style.width = '100%';
      container.style.height = Math.max(420, window.innerHeight - 420) + 'px';
    }

    // 关键修复：容器上可能残留旧 echarts 实例属性（innerHTML 清不掉），
    // 直接 init 会返回画布已被清空的旧实例，导致地图空白/显示错乱
    const stale = echarts.getInstanceByDom(container);
    if (stale) stale.dispose();
    // 上一个页面的地图实例也一并释放，避免多实例互相干扰
    if (currentChart && currentChart.getDom && currentChart.getDom() !== container && !currentChart.isDisposed()) {
      currentChart.dispose();
    }
    container.innerHTML = '';
    container.style.position = 'relative';

    currentCity = opts.city || null;
    try {
      currentChart = echarts.init(container);
    } catch (e) {
      console.error('地图初始化失败:', e);
      return null;
    }
    ensureSatLayer(container);

    const baseOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(10, 26, 51, 0.92)',
        borderColor: '#00e5ff',
        textStyle: { color: '#e6f4ff' },
        formatter: (p) => {
          if (p.seriesType === 'effectScatter' || p.seriesType === 'scatter') {
            const v = p.value || [];
            return `<b>${p.name}</b><br/>📍 设备数: ${v[2] || '-'}<br/>⚠️ 风险值: ${p.data?.risk || '-'}<br/>✅ 在线设备: ${p.data?.online || '-'}`;
          }
          return `<b>${p.name}</b>`;
        },
      },
      geo: {
        map: '陕西',
        roam: true,
        zoom: 1,
        center: [108.9, 35.6],
        scaleLimit: { min: 0.6, max: 4 },
        itemStyle: {
          normal: {
            areaColor: '#0b2a55',
            borderColor: '#00e5ff',
            borderWidth: 1.2,
          },
          emphasis: {
            areaColor: '#1565c0',
            borderColor: '#00e5ff',
            borderWidth: 2,
            shadowBlur: 20,
            shadowColor: 'rgba(0, 229, 255, 0.5)',
          },
        },
        label: {
          show: true,
          color: '#9cc4e6',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '地市设备',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: SHAANXI_CITIES.map(c => ({
            name: c.name,
            value: c.value,
            risk: c.risk,
            online: c.online,
            symbolSize: Math.max(10, c.value[2] / 600),
            itemStyle: {
              color: riskColor(c.level),
              shadowBlur: 15,
              shadowColor: riskColor(c.level),
            },
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke',
              scale: 3,
              period: 4,
            },
            // 按地市错开标签方向，避免关中城市群重叠
            label: {
              show: true,
              position: LABEL_POS[c.name] || 'right',
              offset: LABEL_OFFSET[c.name] || [0, 0],
              distance: 6,
            },
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            color: '#e6f4ff',
            fontSize: 11,
            textBorderColor: 'rgba(6, 14, 31, 0.9)',
            textBorderWidth: 3,
          },
          labelLayout: { moveOverlap: 'shiftY' },
        },
        {
          name: '数据流向',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: true,
            period: 5,
            trailLength: 0.3,
            symbol: 'arrow',
            symbolSize: 6,
            color: '#00e5ff',
          },
          lineStyle: {
            color: '#00e5ff',
            width: 1,
            opacity: 0.3,
            curveness: 0.2,
          },
          data: SHAANXI_CITIES.slice(1).map(c => ({
            coords: [SHAANXI_CITIES[0].value.slice(0, 2), c.value.slice(0, 2)],
          })),
        },
      ],
    };

    try {
      currentChart.setOption(baseOption);
    } catch (e) {
      // 绘制异常不应中断路由（容器尺寸异常时延迟重试一次）
      console.warn('地图首次绘制异常，延迟重试:', e.message);
      setTimeout(() => {
        try {
          if (!currentChart || currentChart.isDisposed()) return;
          currentChart.resize();
          currentChart.setOption(baseOption);
        } catch (e2) { console.error('地图重试绘制失败:', e2); }
      }, 300);
    }

    currentChart.off('click');
    currentChart.on('click', (p) => {
      if (p.name) {
        currentCity = p.name;
        const evt = new CustomEvent('mapCityClick', { detail: p });
        window.dispatchEvent(evt);
      }
    });

    // 漫游/缩放时同步影像底图位置
    currentChart.off('georoam');
    currentChart.on('georoam', () => layoutSatLayer());

    // 恢复当前各图层的勾选状态
    applyLayer();

    return currentChart;
  }

  // 统一合成图层：遥感影像 → 风险区 → 矢量边界/标注，三者可同时启用
  function applyLayer() {
    if (!currentChart) return;
    const { vector, satellite, risk } = layerState;
    const geo = {
      map: '陕西',
      roam: true,
      zoom: 1,
      center: [108.9, 35.6],
      scaleLimit: { min: 0.6, max: 4 },
      regions: [],
      label: {
        show: vector,
        color: satellite ? '#e6f4ff' : '#9cc4e6',
        fontSize: 11,
        textBorderColor: 'rgba(6, 14, 31, 0.9)',
        textBorderWidth: satellite ? 3 : 0,
      },
      itemStyle: {
        normal: {
          // 启用遥感时使用透明蒙版，避免矢量填充遮住影像
          areaColor: satellite ? 'rgba(8, 24, 48, 0.16)' : (vector ? '#0b2a55' : 'rgba(0,0,0,0)'),
          borderColor: risk ? '#ffa940' : (satellite ? 'rgba(190,230,255,0.9)' : '#00e5ff'),
          borderWidth: vector || risk ? 1.2 : 0,
        },
        emphasis: {
          areaColor: satellite ? 'rgba(0,229,255,0.20)' : '#1565c0',
          borderColor: risk ? '#ffa940' : '#00e5ff',
          borderWidth: 2,
          shadowBlur: 20,
          shadowColor: risk ? 'rgba(255,169,64,0.45)' : 'rgba(0,229,255,0.5)',
        },
      },
    };

    if (risk) {
      geo.regions = SHAANXI_CITIES.map(c => ({
        name: c.name,
        itemStyle: { areaColor: riskAreaColor(c.risk) },
      }));
    }

    setSatVisible(satellite);
    currentChart.setOption({ geo });
    if (satellite) setTimeout(layoutSatLayer, 60);
  }

  function switchLayer(layer) {
    if (!Object.prototype.hasOwnProperty.call(layerState, layer)) return { ...layerState };
    layerState[layer] = !layerState[layer];
    applyLayer();
    return { ...layerState };
  }

  function getLayerState() {
    return { ...layerState };
  }

  function resize() {
    if (currentChart) {
      currentChart.resize();
      if (layerState.satellite) setTimeout(layoutSatLayer, 50);
    }
  }

  function riskColor(level) {
    return ['#00e5ff', '#ff4d4f', '#ffa940', '#ffec3d', '#52c41a'][level] || '#00e5ff';
  }
  function riskAreaColor(risk) {
    if (risk > 100) return 'rgba(255, 77, 79, 0.6)';
    if (risk > 70) return 'rgba(255, 169, 64, 0.55)';
    if (risk > 40) return 'rgba(255, 236, 61, 0.45)';
    return 'rgba(82, 196, 26, 0.45)';
  }

  return { render, switchLayer, getLayerState, resize };
})();

