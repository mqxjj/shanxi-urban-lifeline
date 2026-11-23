/* ============================================================
   陕西省城市生命线 - 专题二级页面渲染器
   路由：#/{topicKey}/m{moduleIndex}
   ============================================================ */

const SubPages = (() => {

  // 确定性伪随机（按种子生成，避免每次进入页面数据抖动）
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }
  function series(n, base, amp, seed) {
    const r = seeded(seed);
    return Array.from({ length: n }, (_, i) => Math.round((base + Math.sin(i / 2.2) * amp * 0.5 + r() * amp * 0.5) * 10) / 10);
  }
  const H7 = ['00', '04', '08', '12', '16', '20', '24'];
  const D7 = ['10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25'];

  /* ===== 内容生成：按模块类型产出面板配置 ===== */
  function buildContent(key, moduleName) {
    const data = SCENARIO_DATA[key];
    const ext = SCENARIO_EXT[key] || {};
    const name = data.name;
    const kpis = data.metrics.slice(0, 4);

    // 通用：风险四色
    const riskPie = {
      icon: '🎯', title: `${name} · 风险四色分布`, type: 'pie',
      items: (data.riskDist || [
        { name: '红色区', value: 6, color: '#ff4d4f' }, { name: '橙色区', value: 18, color: '#ffa940' },
        { name: '黄色区', value: 32, color: '#ffec3d' }, { name: '蓝色区', value: 26, color: '#00e5ff' },
      ]),
    };
    const alertTrend = {
      icon: '📈', title: '近7日预警量与处置量', type: 'line',
      cats: D7, series: [
        { name: '新增预警', data: ALERT_TREND_7D.total.map(v => Math.round(v / 6)), color: '#ffa940' },
        { name: '已处置', data: ALERT_TREND_7D.handled.map(v => Math.round(v / 6)), color: '#00e5ff' },
      ],
    };
    const closeLoop = {
      icon: '🔁', title: '风险处置闭环流程', type: 'rows',
      items: [
        ['风险自动发现', '物联感知 + 视频AI + 人工巡查', '实时', 'green'],
        ['智能派单', '按属地与责任网格自动分派', '≤ 5 min', 'green'],
        ['现场处置', '处置时限分级管控（红2h/橙8h/黄24h）', '执行中', 'yellow'],
        ['复核销号', '处置结果现场复核后销号归档', '闭环率 96.4%', 'green'],
      ],
    };

    switch (moduleName) {
      case '基础底数': return {
        kpis,
        panels: [
          ledgerBar(key, ext, data),
          ledgerTable(key, ext, data),
          { icon: '📡', title: '物联感知设备接入趋势', type: 'line', cats: D7, series: [{ name: '在线设备(百台)', data: series(7, 40, 22, key.length * 7 + 3), color: '#00e5ff' }] },
          { icon: '🗂️', title: '一设施一档 · 档案完整率', type: 'rows', items: [
            ['设施基础档案', '字段完整率', '98.6%', 'green'],
            ['地理信息测绘', '坐标采集率', '96.2%', 'green'],
            ['权属单位关联', '责任单位挂接', '93.8%', 'yellow'],
            ['竣工图纸归档', '电子化归档率', '88.4%', 'yellow'],
          ]},
        ],
      };

      case '动态风险防控': return {
        kpis: [
          { num: String(data.riskDist ? data.riskDist.reduce((s, x) => s + x.value, 0) : 128), unit: '处', label: '在管风险区' },
          { num: data.metrics[5] ? data.metrics[5].num : '42', unit: '条', label: '今日预警' },
          { num: '96.4', unit: '%', label: '处置闭环率' },
          { num: '12', unit: 'min', label: '平均响应时间' },
        ],
        panels: [riskPie, alertTrend, closeLoop, riskList(key)],
      };

      case '隐患整治': return {
        kpis: [
          { num: data.hazards ? String(data.hazards.reduce((s, h) => s + h.count, 0)) : '286', unit: '处', label: '隐患总数' },
          { num: '62.4', unit: '%', label: '整改完成率' },
          { num: '18', unit: '处', label: '超期未整改' },
          { num: '3.2', unit: '天', label: '平均整改周期' },
        ],
        panels: [
          { icon: '🧯', title: '隐患类型分布（处）', type: 'bar',
            cats: (data.hazards || [{ type: '设备老化', count: 34 }, { type: '占压', count: 15 }, { type: '腐蚀', count: 26 }, { type: '积水', count: 12 }]).slice(0, 6).map(h => h.type),
            vals: (data.hazards || [{ count: 34 }, { count: 15 }, { count: 26 }, { count: 12 }]).slice(0, 6).map(h => h.count) },
          { icon: '⏱️', title: '整改进度（分级）', type: 'rows', items: [
            ['红色隐患', '限期 2 日内整改', '已整改 12/18 处', 'red'],
            ['橙色隐患', '限期 1 周内整改', '已整改 46/68 处', 'orange'],
            ['黄色隐患', '限期 1 月内整改', '已整改 96/124 处', 'yellow'],
            ['蓝色隐患', '纳入日常巡查', '已整改 62/76 处', 'blue'],
          ]},
          { icon: '📊', title: '近7日隐患新增 / 销号', type: 'line', cats: D7, series: [
            { name: '新增隐患', data: series(7, 18, 10, 11), color: '#ffa940' },
            { name: '销号隐患', data: series(7, 20, 10, 23), color: '#52c41a' },
          ]},
          { icon: '📋', title: '超期隐患督办清单', type: 'table',
            cols: ['隐患编号', '类型', '属地', '超期天数', '督办层级'],
            rows: [
              ['YH-6101-0082', '第三方施工占压', '西安市', '4 天', '省级督办'],
              ['YH-6103-0026', '管道腐蚀', '宝鸡市', '2 天', '市级督办'],
              ['YH-6108-0058', '阀井积水', '榆林市', '3 天', '市级督办'],
              ['YH-6106-0019', '设备老化', '延安市', '1 天', '市级督办'],
              ['YH-6102-0033', '标识缺失', '咸阳市', '6 天', '省级督办'],
            ]},
        ],
      };

      case '行业监管': return {
        kpis: [
          { num: '856', unit: '家', label: '监管企业' },
          { num: '96.8', unit: '%', label: '许可持证率' },
          { num: '128', unit: '次', label: '本月监督检查' },
          { num: '16', unit: '起', label: '行政处罚案件' },
        ],
        panels: [
          { icon: '🏅', title: '企业信用评级分布', type: 'pie', items: [
            { name: 'A 级(优秀)', value: 326, color: '#52c41a' },
            { name: 'B 级(良好)', value: 402, color: '#00e5ff' },
            { name: 'C 级(一般)', value: 96, color: '#ffa940' },
            { name: 'D 级(较差)', value: 32, color: '#ff4d4f' },
          ]},
          { icon: '🔍', title: '监督检查类型统计（次）', type: 'bar', cats: ['日常检查', '专项检查', '双随机', '联合执法', '复查'], vals: [62, 28, 22, 8, 8] },
          { icon: '🏢', title: '重点监管企业清单', type: 'table',
            cols: ['企业名称', '属地', '信用等级', '从业人数', '状态'],
            rows: enterpriseRows(key) },
          { icon: '📜', title: '近期行政处罚公示', type: 'rows', items: [
            ['未按规定巡检', '陕西某某燃气有限公司', '罚款 5 万元', 'red'],
            ['从业人员无证上岗', '某某液化气储配站', '停业整顿', 'red'],
            ['台账记录不全', '某某热力有限公司', '限期整改', 'orange'],
            ['检测报告逾期', '某某桥梁养护公司', '警告', 'yellow'],
          ]},
        ],
      };

      case '全流程监管': return { // 瓶装气
        kpis,
        panels: [
          { icon: '🔗', title: '气瓶流转漏斗（今日/瓶）', type: 'funnel', items: ext.funnel || [] },
          { icon: '📈', title: '充装 / 配送分时趋势', type: 'line', cats: (ext.trend || {}).hours || H7, series: [
            { name: '充装量', data: (ext.trend || {}).fill || [], color: '#7c4dff' },
            { name: '配送量', data: (ext.trend || {}).deliver || [], color: '#00e5ff' },
          ]},
          { icon: '⚠️', title: '异常气瓶追溯清单', type: 'table',
            cols: ['气瓶编码', '异常类型', '所在位置', '滞留天数'],
            rows: (ext.overdue || []).map(o => [o.id, o.type, o.loc, o.days + ' 天']) },
          { icon: '🏪', title: '充装站点今日监管', type: 'table',
            cols: ['站点名称', '评级', '今日充装', '状态'],
            rows: (ext.stations || []).map(s => [s.name, s.rate + ' 级', s.today + ' 瓶', s.status]) },
        ],
      };

      case '健康监测': return { // 桥梁
        kpis: [
          { num: '1,280', unit: '台', label: '监测传感器' },
          { num: '12', unit: '座', label: '重点关注桥梁' },
          { num: '86.4', unit: '分', label: '平均健康度' },
          { num: '24', unit: '条', label: '今日监测预警' },
        ],
        panels: [
          { icon: '🌉', title: '重点桥梁健康度（分）', type: 'bar', cats: (ext.healthRank || []).map(h => h.name), vals: (ext.healthRank || []).map(h => h.value), color: '#00e5ff' },
          { icon: '📐', title: '监测指标类型构成', type: 'pie', items: [
            { name: '位移/挠度', value: 326, color: '#00e5ff' },
            { name: '应变', value: 286, color: '#2979ff' },
            { name: '振动加速度', value: 218, color: '#7c4dff' },
            { name: '索力', value: 126, color: '#ffa940' },
            { name: '支座位移', value: 168, color: '#52c41a' },
            { name: '温度/腐蚀', value: 156, color: '#ff4081' },
          ]},
          { icon: '📉', title: '主跨挠度 24h 监测曲线（mm）', type: 'line', cats: H7, series: [
            { name: '跨中挠度', data: series(7, 12, 6, 7), color: '#ffa940' },
            { name: '预警阈值', data: H7.map(() => 18), color: '#ff4d4f' },
          ]},
          { icon: '📋', title: '监测预警处置记录', type: 'table',
            cols: ['时间', '桥梁', '指标', '数值', '级别'],
            rows: [
              ['14:28', '西安绕城高速特大桥', '主梁位移', '18.6mm', '橙色'],
              ['12:48', '延安延河大桥', '振动加速度', '0.42g', '红色'],
              ['10:16', '渭河大桥', '索力', '偏差 6.8%', '黄色'],
              ['08:30', '宝鸡清姜河大桥', '支座位移', '4.2mm', '蓝色'],
            ]},
        ],
      };

      case '运营监测': return { // 隧道 / 管廊
        kpis,
        panels: key === 'corridor' ? [
          { icon: '🧱', title: '入廊管线构成', type: 'pie', items: ext.pipePie || [] },
          { icon: '🌡️', title: '舱室环境 24h 曲线', type: 'line', cats: (ext.envCurve || {}).hours || H7, series: [
            { name: '温度℃', data: (ext.envCurve || {}).temp || [], color: '#ffa940' },
            { name: '湿度%', data: (ext.envCurve || {}).humi || [], color: '#00e5ff' },
          ]},
          { icon: '🚪', title: '在运舱室状态', type: 'table', cols: ['舱室', '长度', '入廊管线', '状态'],
            rows: (ext.cabins || []).map(c => [c.name, c.len, c.pipes, c.status]) },
          { icon: '🔔', title: '舱室报警记录', type: 'rows', items: (ext.alarms || []).map(a => [a.time, a.name, a.level === 'orange' ? '橙色' : a.level === 'yellow' ? '黄色' : '蓝色', a.level === 'orange' ? 'orange' : a.level === 'yellow' ? 'yellow' : 'blue']) },
        ] : [
          { icon: '🌬️', title: '洞内环境实时指标', type: 'rows', items: (ext.env || []).map(e => [e.name + '（限值 ' + e.limit + '）', e.value, e.ok ? '正常' : '超限', e.ok ? 'green' : 'red']) },
          { icon: '🚗', title: '车流量 / 车速 24h 曲线', type: 'line', cats: (ext.traffic || {}).hours || H7, series: [
            { name: '车流量(百辆)', data: ((ext.traffic || {}).flow || []).map(v => Math.round(v / 100)), color: '#7c4dff' },
            { name: '车速km/h', data: (ext.traffic || {}).speed || [], color: '#00e5ff' },
          ]},
          { icon: '🏥', title: '重点隧道健康度（分）', type: 'bar', cats: (ext.healthRank || []).map(h => h.name), vals: (ext.healthRank || []).map(h => h.value) },
          { icon: '🔔', title: '运营事件记录', type: 'rows', items: (ext.events || []).map(e => [e.time, e.name, e.level === 'orange' ? '橙色' : e.level === 'yellow' ? '黄色' : '蓝色', e.level]) },
        ],
      };

      case '水质监管': return { // 供水
        kpis: [
          { num: '99.8', unit: '%', label: '水质综合达标率' },
          { num: '1,286', unit: '处', label: '水质在线监测点' },
          { num: '42', unit: '项', label: '日检指标' },
          { num: '0', unit: '起', label: '今日水质事故' },
        ],
        panels: [
          { icon: '🧪', title: '关键水质指标实时值', type: 'rows', items: (ext.quality || []).map(q => [q.name + '（限值 ' + q.limit + '）', q.value + ' ' + q.unit, '达标', 'green']) },
          { icon: '📈', title: '浊度 / 余氯 24h 趋势', type: 'line', cats: H7, series: [
            { name: '浊度(×0.1NTU)', data: series(7, 3, 1.5, 31), color: '#00e5ff' },
            { name: '余氯(×0.1mg/L)', data: series(7, 5.5, 1.2, 47), color: '#52c41a' },
          ]},
          { icon: '🏭', title: '水厂运行负荷', type: 'table', cols: ['水厂', '设计能力', '当前负荷'],
            rows: (ext.plants || []).map(p => [p.name, p.cap, p.load + '%']) },
          { icon: '🚰', title: '管网末梢水质抽检', type: 'table', cols: ['点位', '浊度', '余氯', '判定'],
            rows: [
              ['西安雁塔区末梢点', '0.28 NTU', '0.42 mg/L', '合格'],
              ['咸阳秦都区末梢点', '0.31 NTU', '0.38 mg/L', '合格'],
              ['宝鸡渭滨区末梢点', '0.26 NTU', '0.45 mg/L', '合格'],
              ['渭南临渭区末梢点', '0.35 NTU', '0.33 mg/L', '合格'],
            ]},
        ],
      };

      case '雨水监督': return { // 排水
        kpis: [
          { num: '896', unit: '处', label: '易积水点' },
          { num: '42', unit: 'mm', label: '今日最大小时雨量' },
          { num: '682', unit: '座', label: '排水泵站' },
          { num: '12', unit: '处', label: '当前积水超警点' },
        ],
        panels: [
          { icon: '🌧️', title: '降雨量 / 水位 24h 联动', type: 'line', cats: (ext.rainLevel || {}).hours || H7, series: [
            { name: '降雨量mm', data: (ext.rainLevel || {}).rain || [], color: '#2979ff' },
            { name: '水位m', data: (ext.rainLevel || {}).level || [], color: '#00e5ff' },
          ]},
          { icon: '💧', title: '重点易积水点实时水位', type: 'table', cols: ['点位', '水位', '趋势', '级别'],
            rows: (ext.hotspots || []).map(h => [h.name, h.water, h.trend, h.status]) },
          { icon: '🏗️', title: '泵站运行状态', type: 'table', cols: ['泵站', '开启机组', '状态'],
            rows: (ext.pumps || []).map(p => [p.name, p.units, p.status]) },
          { icon: '🚨', title: '防汛应急响应', type: 'rows', items: [
            ['当前响应等级', 'IV 级（蓝色）', '生效中', 'blue'],
            ['前置排涝队伍', '32 支 / 486 人', '已到位', 'green'],
            ['移动泵车', '86 台待命', '待命', 'green'],
            ['下穿通道管控', '预置警示 26 处', '已布设', 'yellow'],
          ]},
        ],
      };

      case '污水监督': return { // 排水
        kpis: [
          { num: '486', unit: '万m³/日', label: '污水处理能力' },
          { num: '92.6', unit: '%', label: '污水收集率' },
          { num: '18', unit: '处', label: '溢流风险点' },
          { num: '6', unit: '起', label: '今日异常排放' },
        ],
        panels: [
          { icon: '🌊', title: '污水管网液位 24h 曲线（m）', type: 'line', cats: H7, series: [
            { name: '主干管液位', data: series(7, 2.6, 0.8, 53), color: '#7c4dff' },
            { name: '警戒液位', data: H7.map(() => 3.2), color: '#ff4d4f' },
          ]},
          { icon: '🧫', title: '污水处理厂出水水质', type: 'table', cols: ['污水厂', 'COD', '氨氮', '总磷', '判定'],
            rows: [
              ['西安北石桥污水厂', '18 mg/L', '0.8 mg/L', '0.2 mg/L', '达标'],
              ['宝鸡十里铺污水厂', '22 mg/L', '1.1 mg/L', '0.3 mg/L', '达标'],
              ['咸阳东郊污水厂', '26 mg/L', '1.4 mg/L', '0.4 mg/L', '达标'],
              ['渭南城区污水厂', '28 mg/L', '1.8 mg/L', '0.4 mg/L', '关注'],
            ]},
          { icon: '🔀', title: '雨污混接排查整治', type: 'rows', items: [
            ['疑似混接点位', '累计排查 1,286 处', '确认 286 处', 'orange'],
            ['已完成改造', '196 处', '改造率 68.5%', 'yellow'],
            ['本季度计划', '60 处', '推进中', 'blue'],
            ['违规排放查处', '今日 6 起', '已立案 4 起', 'red'],
          ]},
          { icon: '🕳️', title: '溢流风险点监控', type: 'table', cols: ['点位', '液位状态', '风险', '措施'],
            rows: [
              ['西安皂河截污闸', '2.86 m', '中', '闸联控调'],
              ['咸阳渭河排放口', '2.62 m', '低', '常规监测'],
              ['宝鸡金陵河节点', '3.05 m', '高', '限流调度'],
              ['汉中汉江截污管', '2.41 m', '低', '日常巡查'],
            ]},
        ],
      };

      case '专题屏': return {
        kpis,
        panels: [
          { icon: '🖥️', title: '专题屏说明', type: 'rows', items: [
            ['页面定位', MODULE_DESC['专题屏'], '', 'blue'],
            ['入口', `顶部导航「${name}」按钮即为本专题屏`, '', 'green'],
            ['数据刷新', '物联感知数据实时接入，统计指标分钟级刷新', '', 'green'],
            ['展示终端', '适配 1920×1080 大屏 / 指挥中心 LED 拼接屏', '', 'blue'],
          ]},
          alertTrend, riskPie,
          { icon: '⬅️', title: '返回专题驾驶舱', type: 'rows', items: [
            ['点击左侧导航', '可切换本专题其他业务模块', '', 'blue'],
            ['点击顶部专题按钮', '返回本专题驾驶舱主页面', '', 'green'],
            ['点击顶部标题', '返回省级综合监管驾驶舱', '', 'green'],
          ]},
        ],
      };

      default: return { kpis, panels: [riskPie, alertTrend] };
    }
  }

  /* ===== 台账类面板（基础底数） ===== */
  function ledgerBar(key, ext, data) {
    const m = {};
    data.metrics.forEach(x => { m[x.label] = x.num; });
    const cats = data.metrics.slice(0, 5).map(x => x.label);
    const vals = data.metrics.slice(0, 5).map(x => parseFloat(String(x.num).replace(/,/g, '')) || 0);
    return { icon: '📊', title: `${data.name} · 设施底数一览`, type: 'bar', cats, vals };
  }
  function ledgerTable(key, ext, data) {
    if (key === 'lpg') return { icon: '🏪', title: '充装 / 供应站点台账', type: 'table', cols: ['站点', '评级', '今日量', '状态'], rows: (ext.stations || []).map(s => [s.name, s.rate + ' 级', s.today + ' 瓶', s.status]) };
    if (key === 'drainage') return { icon: '🏗️', title: '排水泵站台账', type: 'table', cols: ['泵站', '机组', '状态'], rows: (ext.pumps || []).map(p => [p.name, p.units, p.status]) };
    if (key === 'water') return { icon: '🏭', title: '水厂台账', type: 'table', cols: ['水厂', '能力', '负荷'], rows: (ext.plants || []).map(p => [p.name, p.cap, p.load + '%']) };
    if (key === 'bridge') return { icon: '🌉', title: '在册重点桥梁台账', type: 'table', cols: ['桥梁', '地市', '桥型', '跨径'], rows: (data.bridges || []).map(b => [b.name, b.city, b.type, b.span]) };
    if (key === 'tunnel') return { icon: '🚇', title: '重点隧道台账', type: 'table', cols: ['隧道', '健康度', '状态'], rows: (ext.healthRank || []).map(h => [h.name, h.value + ' 分', h.value > 80 ? '良好' : '关注']) };
    if (key === 'heating') return { icon: '🔥', title: '热力站台账', type: 'table', cols: ['热力站', '供/回水温', '压力', '状态'], rows: (ext.stations || []).map(s => [s.name, s.temp, s.press, s.status]) };
    if (key === 'corridor') return { icon: '🧱', title: '在运管廊台账', type: 'table', cols: ['舱室', '长度', '入廊管线', '状态'], rows: (ext.cabins || []).map(c => [c.name, c.len, c.pipes, c.status]) };
    return { icon: '📋', title: '设施台账', type: 'table', cols: ['名称', '数值'], rows: data.metrics.map(x => [x.label, x.num + ' ' + x.unit]) };
  }
  function riskList(key) {
    const data = SCENARIO_DATA[key];
    // 各专题默认重点风险源（SCENARIO_DATA.hazards 优先）
    const fallback = {
      lpg:      [['超期未检气瓶', '存量 1,286 只', '整改中'], ['非法充装黑点', '存量 12 处', '取缔中'], ['运输车辆违规', '存量 28 起', '处置中'], ['供应站超量存放', '存量 46 处', '整改中'], ['餐饮用户软管老化', '存量 856 处', '排查中']],
      drainage: [['管网淤堵段', '存量 68 处', '清淤中'], ['泵站设备老化', '存量 22 座', '改造中'], ['易积水点', '存量 126 处', '一点一策'], ['雨污混接点', '存量 96 处', '整改中'], ['检查井防坠缺失', '存量 128 处', '补装中']],
      bridge: [['支座老化桥梁', '存量 38 座', '监测中'], ['伸缩缝病害', '存量 52 处', '维修中'], ['超载超限通行', '今日 26 起', '联动执法'], ['独柱墩抗倾覆', '存量 12 座', '加固中'], ['桥下空间占用', '存量 18 处', '清理中']],
      tunnel: [['衬砌裂缝病害', '存量 28 处', '监测中'], ['渗水漏水点', '存量 42 处', '处置中'], ['消防设施老化', '存量 16 座', '改造中'], ['机电设备故障', '今日 8 起', '抢修中'], ['危险品车辆通行', '今日 12 起', '联动管控']],
      water: [['管网漏损高发段', '存量 56 处', '修漏中'], ['二次供水设施', '存量 128 座', '监管中'], ['水源保护区隐患', '存量 12 处', '整治中'], ['老旧管网段', '存量 86 公里', '改造中'], ['水厂设备超期', '存量 8 座', '检修中']],
      heating: [['老旧管网泄漏', '存量 42 处', '抢修中'], ['换热站水力失调', '存量 68 座', '调节中'], ['末端室温不达标', '今日 12 件', '处置中'], ['热源备用不足', '存量 6 处', '改造中'], ['管网保温破损', '存量 96 处', '修补中']],
      corridor: [['燃气舱泄漏风险', '存量 8 处', '重点监控'], ['舱内积水', '存量 12 处', '抽排中'], ['通风系统故障', '今日 3 起', '抢修中'], ['人员非法入侵', '今日 1 起', '已复核'], ['附属设备老化', '存量 26 处', '改造中']],
    };
    let rows = (data.hazards || []).slice(0, 6).map(h => [h.type, '存量 ' + h.count + ' 处', h.status]);
    if (!rows.length) rows = fallback[key] || fallback.water;
    return { icon: '⚠️', title: '重点风险源清单', type: 'table', cols: ['风险类型', '存量', '状态'], rows };
  }
  function enterpriseRows(key) {
    const map = {
      lpg: [['西安沣东液化气场站', '西安市', 'A', '126 人', '正常'], ['宝鸡陈仓充装站', '宝鸡市', 'A', '86 人', '正常'], ['咸阳秦都供应站', '咸阳市', 'B', '64 人', '整改中'], ['榆林榆阳充装站', '榆林市', 'A', '58 人', '正常']],
      water: [['西安水务集团', '西安市', 'A', '2,860 人', '正常'], ['宝鸡自来水公司', '宝鸡市', 'A', '860 人', '正常'], ['咸阳供水集团', '咸阳市', 'B', '720 人', '正常'], ['渭南水务公司', '渭南市', 'B', '486 人', '整改中']],
      heating: [['西安热力集团', '西安市', 'A', '3,200 人', '正常'], ['宝鸡热力公司', '宝鸡市', 'A', '680 人', '正常'], ['咸阳热能公司', '咸阳市', 'B', '560 人', '正常'], ['榆林能源供热', '榆林市', 'B', '520 人', '整改中']],
      drainage: [['西安市政排水公司', '西安市', 'A', '1,860 人', '正常'], ['宝鸡市政养护', '宝鸡市', 'B', '620 人', '正常'], ['咸阳排水公司', '咸阳市', 'B', '540 人', '正常'], ['汉中市政公司', '汉中市', 'C', '380 人', '整改中']],
    };
    return map[key] || map.water;
  }

  /* ===== HTML 渲染 ===== */
  function render(topicKey, subKey) {
    const data = SCENARIO_DATA[topicKey];
    if (!data) return;
    const idx = parseInt(subKey.replace('m', ''), 10) || 0;
    const moduleName = data.modules[idx] || data.modules[0];
    const content = buildContent(topicKey, moduleName);

    // 左侧导航
    const sideEl = document.getElementById('sub-side');
    sideEl.innerHTML = `
      <a class="sub-back" href="#/${topicKey}">← 返回${data.name}专题</a>
      <div class="sub-topic-name">${data.name}</div>
      <div class="sub-topic-sub">陕西省城市生命线安全监管</div>
      <nav class="sub-nav">
        ${data.modules.map((m, i) => `
          <a class="sub-nav-item ${i === idx ? 'active' : ''}" href="#/${topicKey}/m${i}">${m}</a>`).join('')}
      </nav>
      <div style="flex:1"></div>
      <div class="panel-foot-note">数据更新：实时<br>责任单位：省住建厅 ${data.name}专班</div>`;

    // 主区域
    const mainEl = document.getElementById('sub-main');
    mainEl.innerHTML = `
      <div class="sub-head">
        <div class="sub-crumb"><a href="#/home">综合监管</a> › <a href="#/${topicKey}">${data.name}</a> › ${moduleName}</div>
        <div class="sub-title">${data.name} · ${moduleName}</div>
        <div class="sub-desc">${MODULE_DESC[moduleName] || ''}</div>
      </div>
      <div class="sub-kpis">
        ${content.kpis.map(k => `
          <div class="metric-card" style="cursor:default">
            <div class="num">${k.num}<span class="unit">${k.unit}</span></div>
            <div class="label">${k.label}</div>
          </div>`).join('')}
      </div>
      <div class="sub-grid">
        ${content.panels.slice(0, 4).map((p, i) => panelHTML(p, `sub-chart-${i}`)).join('')}
      </div>`;

    // 渲染图表
    setTimeout(() => {
      content.panels.slice(0, 4).forEach((p, i) => renderPanelChart(`sub-chart-${i}`, p));
      document.querySelectorAll('#sub-main .chart-box').forEach(el => {
        const inst = echarts.getInstanceByDom(el);
        if (inst) inst.resize();
      });
    }, 80);
  }

  function panelHTML(p, chartId) {
    if (p.type === 'table') {
      return `<div class="panel">
        <div class="panel-title"><i>${p.icon}</i> ${p.title}</div>
        <div class="sub-table-wrap"><table class="sb-table">
          <tr>${p.cols.map(c => `<th>${c}</th>`).join('')}</tr>
          ${p.rows.map(r => `<tr>${r.map((c, ci) => `<td class="${ci === 0 ? 'td-name' : ''}">${c}</td>`).join('')}</tr>`).join('')}
        </table></div>
      </div>`;
    }
    if (p.type === 'rows') {
      return `<div class="panel">
        <div class="panel-title"><i>${p.icon}</i> ${p.title}</div>
        <div class="indicator-list" style="flex:1;overflow-y:auto">
          ${p.items.map(it => `<div class="indicator-row"><span>${it[0]}${it[1] ? `<span style="color:var(--text-muted);font-size:11px"> ${it[1]}</span>` : ''}</span>${it[2] ? `<span class="tag tag-${it[3] || 'blue'}">${it[2]}</span>` : ''}</div>`).join('')}
        </div>
      </div>`;
    }
    return `<div class="panel">
      <div class="panel-title"><i>${p.icon}</i> ${p.title}</div>
      <div id="${chartId}" class="chart-box"></div>
    </div>`;
  }

  /* ===== 图表渲染 ===== */
  function renderPanelChart(domId, p) {
    if (!['bar', 'line', 'pie', 'funnel'].includes(p.type)) return;
    const el = document.getElementById(domId);
    if (!el) return;
    const old = echarts.getInstanceByDom(el);
    if (old) old.dispose();
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      // 容器未布局完成时延迟重试，避免 0×0 画布绘制异常
      setTimeout(() => renderPanelChart(domId, p), 120);
      return;
    }
    const chart = echarts.init(el);
    const AX = { lineStyle: { color: '#5f7f9f' } };
    const TT = { backgroundColor: 'rgba(10,26,51,.92)', borderColor: '#00e5ff', textStyle: { color: '#e6f4ff' } };

    if (p.type === 'bar') {
      chart.setOption({
        backgroundColor: 'transparent', tooltip: { trigger: 'axis', ...TT },
        grid: { left: 8, right: 16, top: 18, bottom: 4, containLabel: true },
        xAxis: { type: 'category', data: p.cats, axisLine: AX, axisLabel: { color: '#9cc4e6', fontSize: 10, interval: 0, rotate: p.cats.length > 5 ? 18 : 0 } },
        yAxis: { type: 'value', axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(64,158,255,.1)' } } },
        series: [{ type: 'bar', data: p.vals, barWidth: '46%',
          itemStyle: { borderRadius: [3, 3, 0, 0], color: p.color || { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00e5ff' }, { offset: 1, color: 'rgba(41,121,255,.35)' }] } },
          label: { show: true, position: 'top', color: '#9cc4e6', fontSize: 10 } }],
      });
    } else if (p.type === 'line') {
      chart.setOption({
        backgroundColor: 'transparent', tooltip: { trigger: 'axis', ...TT },
        legend: { textStyle: { color: '#9cc4e6', fontSize: 10 }, top: 0, right: 6, itemWidth: 14 },
        grid: { left: 8, right: 12, top: 26, bottom: 4, containLabel: true },
        xAxis: { type: 'category', data: p.cats, axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 }, boundaryGap: false },
        yAxis: { type: 'value', axisLine: AX, axisLabel: { color: '#5f7f9f', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(64,158,255,.1)' } } },
        series: p.series.map(s => ({ name: s.name, type: 'line', data: s.data, smooth: true, symbolSize: 4,
          lineStyle: { color: s.color, width: 2, shadowColor: s.color, shadowBlur: 6 }, itemStyle: { color: s.color } })),
      });
    } else if (p.type === 'pie') {
      chart.setOption({
        backgroundColor: 'transparent', tooltip: { trigger: 'item', ...TT },
        legend: { orient: 'vertical', right: 6, top: 'center', textStyle: { color: '#9cc4e6', fontSize: 11 }, itemWidth: 12, itemHeight: 8 },
        series: [{ type: 'pie', radius: ['42%', '66%'], center: ['38%', '52%'],
          label: { color: '#e6f4ff', fontSize: 11, formatter: '{c}' },
          itemStyle: { borderColor: '#060e1f', borderWidth: 2 },
          data: p.items.map(i => ({ name: i.name, value: i.value, itemStyle: { color: i.color } })) }],
      });
    } else if (p.type === 'funnel') {
      chart.setOption({
        backgroundColor: 'transparent', tooltip: { trigger: 'item', ...TT },
        series: [{ type: 'funnel', left: '10%', right: '10%', top: 8, bottom: 8, sort: 'descending', gap: 3,
          label: { color: '#e6f4ff', fontSize: 11, formatter: '{b} {c}' },
          itemStyle: { borderColor: 'rgba(0,229,255,.3)', borderWidth: 1 },
          data: p.items.map((f, i) => ({ name: f.name, value: f.value, itemStyle: { color: ['#00e5ff', '#2979ff', '#7c4dff', '#ff4081', '#ffa940'][i % 5] } })) }],
      });
    }
  }

  return { render };
})();
