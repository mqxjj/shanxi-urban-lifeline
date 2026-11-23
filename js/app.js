/* ============================================================
   陕西省城市生命线 - App 路由 & 初始化
   ============================================================ */

const App = (() => {
  // 本地专题页（隧道/供水/供热/管廊 改由专题大屏承接）
  const HASH_TO_KEY = {
    '#/lpg': 'lpg',
    '#/drainage': 'drainage',
    '#/bridge': 'bridge',
  };

  // 隧道/供水/供热/管廊 四个专题接入专题大屏（同伴实现），路由 → 其内部 topic key
  const TT_TOPIC = {
    '#/tunnel': 'tunnel',
    '#/water': 'water',
    '#/heating': 'heat',
    '#/corridor': 'corridor',
  };
  // 专题大屏顶部导航（其余四个专题 + 总览）点击后回到本系统对应页面
  const TT_NAV_BACK = {
    'nav-overview': '#/home',
    'nav-gas': '#/gas',
    'nav-lpg': '#/lpg',
    'nav-drain': '#/drainage',
    'nav-bridge': '#/bridge',
  };
  let ttReady = false;

  // 以 1920×1080 设计稿整体等比缩放，访客无需手动调整浏览器缩放比例
  function fitScreen() {
    const app = document.getElementById('app');
    if (!app) return;
    const scale = Math.max(0.1, Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    app.style.transform = `scale(${scale})`;
    app.style.left = Math.max(0, (window.innerWidth - 1920 * scale) / 2) + 'px';
    app.style.top = Math.max(0, (window.innerHeight - 1080 * scale) / 2) + 'px';
  }

  function init() {
    fitScreen();
    updateHeaderDate();
    window.addEventListener('hashchange', () => handleRoute());
    window.addEventListener('resize', () => {
      fitScreen();
      MapLayer.resize();
    });

    window.addEventListener('mapCityClick', (e) => {
      console.log('City clicked:', e.detail.name);
    });

    handleRoute();
  }

  // 打开专题大屏并切换到指定专题；首次加载后接管其它四个专题入口
  function openTopicScreen(topicKey) {
    const frame = document.getElementById('tt-iframe');
    if (!frame) return;
    if (!ttReady) {
      frame.onload = () => {
        ttReady = true;
        try {
          const doc = frame.contentDocument;
          // 嵌入时隐藏同伴大屏自己的标题栏，统一使用本系统首页标题与八大专题导航
          if (!doc.getElementById('lifeline-embed-style')) {
            const style = doc.createElement('style');
            style.id = 'lifeline-embed-style';
            style.textContent = '#top{display:none!important}#body{padding-top:10px!important}';
            doc.head.appendChild(style);
          }
          // 同伴页面顶部导航中，其余四个专题及总览为占位模块，改为跳回本系统对应页面
          Object.keys(TT_NAV_BACK).forEach(id => {
            const btn = doc.getElementById(id);
            if (!btn) return;
            btn.onclick = () => { parent.location.hash = TT_NAV_BACK[id]; };
            btn.title = '返回本系统对应页面';
          });
          frame.contentWindow.setTopic(topicKey);
          // 标题栏隐藏后内容高度发生变化，通知其图表重新计算尺寸
          setTimeout(() => {
            try { frame.contentWindow.dispatchEvent(new frame.contentWindow.Event('resize')); } catch (e) { /* 忽略 */ }
          }, 80);
        } catch (e) {
          console.warn('专题大屏初始化失败:', e);
        }
      };
      frame.src = 'tiantian/index.html?v=261113f';
    } else {
      setTimeout(() => {
        try { frame.contentWindow.setTopic(topicKey); } catch (e) { /* 忽略 */ }
      }, 30);
    }
  }

  function updateHeaderDate() {
    const now = new Date();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const str = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`;
    const el = document.getElementById('header-date');
    if (el) el.textContent = str;
  }

  async function handleRoute() {
    const hash = location.hash || '#/home';
    console.log('Route:', hash);

    // 隐藏所有page & 清除导航激活态 & 退出燃气全屏模式
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.body.classList.remove('mode-gas');

    // 离开桥梁详情页时释放 3D 资源（#/bridge/m{n} 为二级业务页，非详情页）
    const isBridgeDetail = /^#\/bridge\/(?!m\d+$)/.test(hash);
    if (!isBridgeDetail && window._bridge3D) {
      window._bridge3D.dispose();
      window._bridge3D = null;
    }

    try {
      // 专题二级页面：#/{topic}/m{idx}（需先于桥梁详情匹配，避免 m2 被当作桥梁ID）
      const subMatch = hash.match(/^#\/(\w+)\/(m\d+)$/);
      if (subMatch && HASH_TO_KEY['#/' + subMatch[1]]) {
        document.getElementById('page-sub').classList.add('active');
        document.querySelector(`.nav-btn[data-key="${subMatch[1]}"]`)?.classList.add('active');
        SubPages.render(subMatch[1], subMatch[2]);
        setTimeout(() => {
          document.querySelectorAll('#sub-main .chart-box').forEach(el => {
            const inst = echarts.getInstanceByDom(el);
            if (inst) inst.resize();
          });
        }, 150);
        return;
      }

      // 桥梁详情子路由
      if (hash.startsWith('#/bridge/')) {
        document.getElementById('page-bridge-detail').classList.add('active');
        const bridgeId = hash.replace('#/bridge/', '');
        Scenarios.renderBridgeDetail(bridgeId);
        document.querySelector('.nav-btn[data-key="bridge"]')?.classList.add('active');
        await Promise.resolve(); // 等待DOM更新后resize
        setTimeout(() => MapLayer.resize(), 100);
        return;
      }

      // 燃气专题：整页 iframe 嵌入 gas-demo（标题/地图已陕西化）
      if (hash === '#/gas') {
        document.body.classList.add('mode-gas');
        document.getElementById('page-gasframe').classList.add('active');
        document.querySelector('.nav-btn[data-key="gas"]')?.classList.add('active');
        // 懒加载：首次进入才加载 iframe，避免首页加载时白跑一遍 gas-demo
        const gasFrame = document.getElementById('gas-iframe');
        if (gasFrame && !gasFrame.src) gasFrame.src = gasFrame.dataset.src;
        return;
      }

      // 隧道/供水/供热/综合管廊：嵌入专题大屏（整合同伴实现）
      const ttKey = TT_TOPIC[hash];
      if (ttKey) {
        document.getElementById('page-ttframe').classList.add('active');
        document.querySelector(`.nav-btn[data-key="${hash.replace('#/', '')}"]`)?.classList.add('active');
        openTopicScreen(ttKey);
        return;
      }

      // 首页
      if (hash === '' || hash === '#/home') {
        document.getElementById('page-home').classList.add('active');
        await Scenarios.renderHome();
        setTimeout(() => MapLayer.resize(), 100);
        return;
      }

      // 各专题
      const key = HASH_TO_KEY[hash];
      if (key) {
        document.getElementById('page-scenario').classList.add('active');
        document.querySelector(`.nav-btn[data-key="${key}"]`)?.classList.add('active');
        await Scenarios.renderScenario(key);
        setTimeout(() => MapLayer.resize(), 100);
        return;
      }
    } catch (err) {
      console.error('Route error:', err);
    }

    // fallback
    location.hash = '#/home';
  }

  return { init };
})();

// 启动
document.addEventListener('DOMContentLoaded', App.init);
