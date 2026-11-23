/* ============================================================
   陕西省城市生命线 - 模拟数据
   ============================================================ */

// 陕西省各地市坐标
const SHAANXI_CITIES = [
  { name: '西安市',  value: [108.93, 34.27, 8560], risk: 128, online: 4280, level: 2 },
  { name: '铜川市',  value: [108.95, 34.89, 1280], risk: 42,  online: 680,  level: 3 },
  { name: '宝鸡市',  value: [107.24, 34.36, 3560], risk: 86,  online: 1720, level: 2 },
  { name: '咸阳市',  value: [108.72, 34.33, 4280], risk: 98,  online: 2180, level: 2 },
  { name: '渭南市',  value: [109.50, 34.50, 3860], risk: 72,  online: 1960, level: 3 },
  { name: '延安市',  value: [109.49, 36.60, 2480], risk: 58,  online: 1240, level: 3 },
  { name: '汉中市',  value: [107.02, 33.08, 2120], risk: 65,  online: 1060, level: 3 },
  { name: '榆林市',  value: [109.73, 38.28, 3680], risk: 92,  online: 1840, level: 2 },
  { name: '安康市',  value: [109.02, 32.68, 1520], risk: 38,  online: 760,  level: 3 },
  { name: '商洛市',  value: [109.94, 33.87, 860],  risk: 22,  online: 430,  level: 4 },
  { name: '杨凌示范区', value: [108.07, 34.30, 320], risk: 8, online: 160,  level: 4 },
];

// 专题核心数据
const SCENARIO_DATA = {
  gas: {
    key: 'gas', name: '管道燃气',
    metrics: [
      { num: '2,856,420', unit: '户',   label: '管道燃气用户', trend: '↑ 2.8%' },
      { num: '12,486',   unit: '公里', label: '管网总长',     trend: '↑ 1.5%' },
      { num: '3,562',    unit: '座',   label: '场站设施',     trend: '↑ 4.2%' },
      { num: '28,460',   unit: '台',   label: '物联设备',     trend: '↑ 8.6%' },
      { num: '128',      unit: '处',   label: '风险区',       trend: '↓ 5.3%' },
      { num: '96',       unit: '条',   label: '今日预警',     trend: '↑ 12%' },
    ],
    riskDist: [
      { name: '红色区', value: 18, color: '#ff4d4f' },
      { name: '橙色区', value: 32, color: '#ffa940' },
      { name: '黄色区', value: 46, color: '#ffec3d' },
      { name: '蓝色区', value: 32, color: '#00e5ff' },
    ],
    hazards: [
      { type: '第三方施工破坏', count: 18, status: '整改中', level: 'red' },
      { type: '管道腐蚀',       count: 26, status: '整改中', level: 'orange' },
      { type: '阀井积水',       count: 12, status: '已整改', level: 'yellow' },
      { type: '设备老化',       count: 34, status: '待处理', level: 'orange' },
      { type: '标识缺失',       count: 42, status: '整改中', level: 'blue' },
      { type: '占压管线',       count: 15, status: '整改中', level: 'red' },
      { type: '法兰渗漏',       count: 8,  status: '已整改', level: 'orange' },
      { type: '阴极保护失效',   count: 22, status: '整改中', level: 'orange' },
    ],
    stations: [
      { name: '西安门站',   city: '西安', status: '运行中', flow: 12800 },
      { name: '北郊门站',   city: '西安', status: '运行中', flow: 9600 },
      { name: '宝鸡门站',   city: '宝鸡', status: '运行中', flow: 6400 },
      { name: '咸阳门站',   city: '咸阳', status: '运行中', flow: 8200 },
      { name: '渭南调压站', city: '渭南', status: '维护中', flow: 0 },
      { name: '榆林门站',   city: '榆林', status: '运行中', flow: 5800 },
    ],
    modules: ['基础底数', '动态风险防控', '隐患整治', '行业监管', '专题屏'],
  },
  lpg: {
    key: 'lpg', name: '瓶装液化气',
    metrics: [
      { num: '1,856,230', unit: '瓶',   label: '在用气瓶',     trend: '↑ 1.2%' },
      { num: '856',       unit: '家',   label: '充装企业',     trend: '↑ 3.5%' },
      { num: '42',        unit: '家',   label: '运输企业',     trend: '↓ 1.8%' },
      { num: '386',       unit: '辆',   label: '运输车辆',     trend: '↑ 2.1%' },
      { num: '12,480',    unit: '个',   label: '供应站点',     trend: '↑ 5.6%' },
      { num: '68',        unit: '起',   label: '今日预警',     trend: '↑ 8%' },
    ],
    modules: ['基础底数', '动态风险防控', '全流程监管', '行业监管', '专题屏'],
  },
  drainage: {
    key: 'drainage', name: '城市排水',
    metrics: [
      { num: '18,560', unit: '公里', label: '排水管网总长', trend: '↑ 2.3%' },
      { num: '682',    unit: '座',   label: '排水泵站',     trend: '↑ 1.6%' },
      { num: '896',    unit: '处',   label: '易积水点',     trend: '↓ 8.5%' },
      { num: '5,420',  unit: '台',   label: '监测设备',     trend: '↑ 15.2%' },
      { num: '126',    unit: '条',   label: '今日预警',     trend: '↑ 22%' },
      { num: '98.6',   unit: '%',    label: '管网覆盖率',   trend: '↑ 1.2%' },
    ],
    modules: ['基础底数', '隐患整治', '动态风险防控', '雨水监督', '污水监督', '专题屏'],
  },
  bridge: {
    key: 'bridge', name: '桥梁安全',
    metrics: [
      { num: '8,562', unit: '座',   label: '在册桥梁',     trend: '↑ 0.5%' },
      { num: '286',   unit: '座',   label: '特殊结构桥',   trend: '↑ 2.8%' },
      { num: '1,280', unit: '台',   label: '监测设备',     trend: '↑ 12.5%' },
      { num: '68',    unit: '座',   label: '检测中桥梁',   trend: '↓ 5.3%' },
      { num: '12',    unit: '座',   label: '重点关注桥',   trend: '↓ 14%' },
      { num: '24',    unit: '条',   label: '今日预警',     trend: '↑ 8%' },
    ],
    modules: ['基础底数', '动态风险防控', '健康监测', '专题屏'],
    bridges: [
      { id: 'b001', name: '西安绕城高速特大桥', city: '西安', type: '预应力混凝土连续梁', span: '480m', status: '运行中', level: 2 },
      { id: 'b002', name: '渭河大桥',         city: '西安', type: '斜拉桥',         span: '820m', status: '运行中', level: 2 },
      { id: 'b003', name: '秦岭终南山公路桥', city: '西安', type: '连续钢构桥',     span: '620m', status: '维护中', level: 3 },
      { id: 'b004', name: '宝鸡清姜河大桥',   city: '宝鸡', type: '拱桥',           span: '360m', status: '运行中', level: 3 },
      { id: 'b005', name: '咸阳湖大桥',       city: '咸阳', type: '梁桥',           span: '280m', status: '运行中', level: 4 },
      { id: 'b006', name: '渭南渭河大桥',     city: '渭南', type: '预应力梁桥',     span: '420m', status: '运行中', level: 3 },
      { id: 'b007', name: '榆林榆溪河大桥',   city: '榆林', type: '梁桥',           span: '200m', status: '运行中', level: 4 },
      { id: 'b008', name: '延安延河大桥',     city: '延安', type: '拱桥',           span: '180m', status: '重点关注', level: 2 },
    ],
  },
  tunnel: {
    key: 'tunnel', name: '隧道安全',
    metrics: [
      { num: '2,860', unit: '座',   label: '在册隧道',     trend: '↑ 1.2%' },
      { num: '856',   unit: '公里', label: '隧道总长',     trend: '↑ 3.5%' },
      { num: '3,620', unit: '台',   label: '监测设备',     trend: '↑ 18.2%' },
      { num: '128',   unit: '座',   label: '重点隧道',     trend: '↑ 4.2%' },
      { num: '36',    unit: '条',   label: '今日预警',     trend: '↑ 6%' },
      { num: '68.5',  unit: '%',    label: '健康指数',     trend: '↑ 0.8%' },
    ],
    modules: ['基础底数', '动态风险防控', '运营监测', '专题屏'],
  },
  water: {
    key: 'water', name: '城市供水',
    metrics: [
      { num: '8,520',  unit: '公里', label: '供水管网总长', trend: '↑ 1.8%' },
      { num: '68',     unit: '座',   label: '水厂',         trend: '↑ 1.2%' },
      { num: '128',    unit: '座',   label: '加压泵站',     trend: '↑ 2.6%' },
      { num: '12,480', unit: '台',   label: '计量器具',     trend: '↑ 25%' },
      { num: '99.8',   unit: '%',    label: '水质达标率',   trend: '↑ 0.2%' },
      { num: '42',     unit: '条',   label: '今日预警',     trend: '↑ 5%' },
    ],
    modules: ['基础底数', '动态风险防控', '行业监管', '水质监管', '专题屏'],
  },
  heating: {
    key: 'heating', name: '城市供热',
    metrics: [
      { num: '6,820', unit: '公里', label: '供热管网总长', trend: '↑ 2.2%' },
      { num: '126',   unit: '座',   label: '热源厂',       trend: '↑ 3.5%' },
      { num: '1,280', unit: '座',   label: '热力站',       trend: '↑ 5.2%' },
      { num: '28.6',  unit: '亿㎡', label: '供热面积',     trend: '↑ 4.8%' },
      { num: '98.2',  unit: '%',    label: '室温达标率',   trend: '↑ 0.5%' },
      { num: '56',    unit: '条',   label: '今日预警',     trend: '↑ 15%' },
    ],
    modules: ['基础底数', '动态风险防控', '行业监管', '专题屏'],
  },
  corridor: {
    key: 'corridor', name: '综合管廊',
    metrics: [
      { num: '126',   unit: '公里', label: '已建成管廊',   trend: '↑ 12.5%' },
      { num: '58',    unit: '条',   label: '运营管廊',     trend: '↑ 8.6%' },
      { num: '6,820', unit: '台',   label: '监测设备',     trend: '↑ 28%' },
      { num: '286',   unit: '处',   label: '监测点位',     trend: '↑ 15%' },
      { num: '18',    unit: '条',   label: '今日预警',     trend: '↓ 5%' },
      { num: '100',   unit: '%',    label: '监控覆盖率',   trend: '↑ 2.0%' },
    ],
    modules: ['基础底数', '动态风险防控', '运营监测', '专题屏'],
  },
};

// 首页顶部核心数字带（领导驾驶舱一屏总览）
const HOME_KPI_STRIP = [
  { num: '53,466',  unit: '公里', label: '管网监测里程', sub: '燃气/排水/供水/供热' },
  { num: '68,240',  unit: '台',   label: '接入物联设备', sub: '较昨日 +126 台' },
  { num: '96.8',    unit: '%',    label: '设备在线率',   sub: '离线 2,186 台' },
  { num: '426',     unit: '条',   label: '今日新增预警', sub: '红色 12 / 橙色 68' },
  { num: '94.2',    unit: '%',    label: '预警处置率',   sub: '今日已处置 401 条' },
  { num: '25',      unit: '条',   label: '待处置预警',   sub: '超期 3 条' },
  { num: '11',      unit: '地市', label: '接入地市',     sub: '全省全覆盖' },
  { num: 'A',       unit: '级',   label: '综合安全评级', sub: '较上月持平' },
];

// 八大专题运行状态（首页左栏）
const TOPIC_STATUS = [
  { key: 'gas',      icon: '🔥', name: '管道燃气',   devices: 28460, alerts: 96,  level: 'orange', status: '关注' },
  { key: 'lpg',      icon: '⛽', name: '瓶装液化气', devices: 12480, alerts: 68,  level: 'yellow', status: '正常' },
  { key: 'drainage', icon: '🌊', name: '城市排水',   devices: 5420,  alerts: 126, level: 'red',    status: '预警多' },
  { key: 'bridge',   icon: '🌉', name: '桥梁安全',   devices: 1280,  alerts: 24,  level: 'orange', status: '关注' },
  { key: 'tunnel',   icon: '🕳️', name: '隧道安全',   devices: 3620,  alerts: 36,  level: 'green',  status: '正常' },
  { key: 'water',    icon: '🚰', name: '城市供水',   devices: 12480, alerts: 42,  level: 'green',  status: '正常' },
  { key: 'heating',  icon: '♨️', name: '城市供热',   devices: 4260,  alerts: 56,  level: 'yellow', status: '正常' },
  { key: 'corridor', icon: '🧱', name: '综合管廊',   devices: 6820,  alerts: 18,  level: 'green',  status: '正常' },
];

// 近7日预警趋势
const ALERT_TREND_7D = {
  days: ['10-19', '10-20', '10-21', '10-22', '10-23', '10-24', '10-25'],
  total: [368, 402, 385, 436, 458, 412, 426],
  handled: [352, 389, 370, 418, 441, 398, 401],
};

// 八大专题今日预警分级（红/橙/黄/蓝）
const TOPIC_ALERT_STATS = {
  topics: ['燃气', '瓶装气', '排水', '桥梁', '隧道', '供水', '供热', '管廊'],
  red:    [3, 1, 4, 2, 0, 1, 1, 0],
  orange: [18, 9, 26, 6, 4, 6, 9, 2],
  yellow: [42, 28, 56, 10, 14, 16, 24, 7],
  blue:   [33, 30, 40, 6, 18, 19, 22, 9],
};

// 首页今日预警列表
const HOME_ALERTS = [
  { level: 'red',    time: '14:28', city: '西安',  title: '绕城高速特大桥位移监测异常',  loc: '绕城高速K12+800' },
  { level: 'orange', time: '13:56', city: '宝鸡',  title: '天然气压力超限报警',           loc: '宝鸡门站出站口' },
  { level: 'yellow', time: '13:42', city: '咸阳',  title: '供水管网压力波动较大',         loc: '咸阳市秦都区' },
  { level: 'orange', time: '13:15', city: '渭南',  title: '燃气阀井积水超限',             loc: '渭南高新区' },
  { level: 'red',    time: '12:48', city: '延安',  title: '延河大桥振动加速度异常',       loc: '延安市宝塔区' },
  { level: 'blue',   time: '12:20', city: '榆林',  title: '热力管网温度偏低',             loc: '榆林市榆阳区' },
  { level: 'yellow', time: '11:36', city: '西安',  title: '易积水点水位上升',             loc: '西安雁塔区小寨' },
  { level: 'blue',   time: '10:52', city: '汉中',  title: '综合管廊氧气浓度偏低',         loc: '汉中汉台区' },
];

// 首页极端天气预警
const HOME_WEATHER = [
  { city: '西安', level: 'l2', text: '雷电橙色预警' },
  { city: '宝鸡', level: 'l3', text: '大风黄色预警' },
  { city: '咸阳', level: 'l3', text: '高温黄色预警' },
  { city: '榆林', level: 'l2', text: '暴雨橙色预警' },
  { city: '延安', level: 'l1', text: '雷电红色预警' },
];

// 首页预警类型TOP5
const ALERT_TYPE_TOP5 = [
  { name: '燃气压力异常', value: 128 },
  { name: '桥梁结构监测', value: 86 },
  { name: '供水管网压力', value: 72 },
  { name: '热力温度波动', value: 58 },
  { name: '排水管网水位', value: 46 },
];

// ============================================================
// 各专题差异化扩展数据（按业务属性定制）
// ============================================================
const SCENARIO_EXT = {
  // 瓶装液化气：全链条追溯
  lpg: {
    funnel: [
      { name: '充装', value: 12860 }, { name: '运输', value: 11240 },
      { name: '仓储', value: 9860 }, { name: '配送', value: 8420 }, { name: '用户签收', value: 8180 },
    ],
    trend: { hours: ['00','04','08','12','16','20','24'], fill: [320,180,860,1420,1280,960,420], deliver: [80,60,420,1260,1480,1120,360] },
    stations: [
      { name: '西安沣东充装站', rate: 'A', today: 2860, status: '合规' },
      { name: '宝鸡陈仓充装站', rate: 'A', today: 1620, status: '合规' },
      { name: '咸阳秦都供应站', rate: 'B', today: 1180, status: '整改中' },
      { name: '榆林榆阳充装站', rate: 'A', today: 980,  status: '合规' },
      { name: '渭南临渭配送中心', rate: 'B', today: 860, status: '合规' },
    ],
    overdue: [
      { id: 'LPG-陕A88213', type: '气瓶超期未检', loc: '西安市雁塔区', days: 12 },
      { id: 'LPG-陕C55107', type: '钢瓶瓶阀泄漏', loc: '宝鸡市金台区', days: 3 },
      { id: 'LPG-陕K33021', type: '运输车辆超速', loc: '榆林市榆阳区', days: 1 },
      { id: 'LPG-陕A90155', type: '气瓶超期未检', loc: '咸阳市秦都区', days: 8 },
    ],
  },
  // 城市排水：防汛专题
  drainage: {
    rainLevel: {
      hours: ['00','03','06','09','12','15','18','21','24'],
      rain:  [2, 5, 18, 42, 36, 22, 8, 4, 2],
      level: [1.2, 1.3, 1.8, 2.6, 3.1, 2.8, 2.2, 1.8, 1.5],
    },
    hotspots: [
      { name: '西安小寨十字',     water: '0.42m', trend: '↑', status: '橙色', level: 'orange' },
      { name: '西安北客站南广场', water: '0.38m', trend: '↑', status: '橙色', level: 'orange' },
      { name: '宝鸡经二路下穿',   water: '0.31m', trend: '→', status: '黄色', level: 'yellow' },
      { name: '咸阳人民路立交',   water: '0.26m', trend: '↓', status: '黄色', level: 'yellow' },
      { name: '渭南朝阳大街',     water: '0.18m', trend: '↓', status: '蓝色', level: 'blue' },
    ],
    pumps: [
      { name: '西安皂河泵站',   units: '6/8',  status: '运行中' },
      { name: '西安浐河泵站',   units: '4/6',  status: '运行中' },
      { name: '宝鸡渭河泵站',   units: '5/5',  status: '运行中' },
      { name: '咸阳沣河泵站',   units: '3/4',  status: '检修' },
      { name: '渭南湭河泵站',   units: '4/4',  status: '运行中' },
      { name: '汉中汉江泵站',   units: '2/3',  status: '待机' },
    ],
    capability: {
      cities: ['西安', '咸阳', '宝鸡', '渭南', '榆林', '汉中', '延安'],
      pipeKm: [4860, 2380, 2120, 1960, 1860, 1420, 1240],
      pumps:  [126, 68, 62, 58, 52, 46, 38],
    },
  },
  // 隧道安全：运营环境
  tunnel: {
    healthRank: [
      { name: '秦岭终南山隧道', value: 62 },
      { name: '包家山隧道',     value: 74 },
      { name: '秦岭一号隧道',   value: 78 },
      { name: '宝鸡峡隧道',     value: 85 },
      { name: '延安宝塔山隧道', value: 88 },
      { name: '榆林榆阳隧道',   value: 92 },
    ],
    traffic: {
      hours: ['00','03','06','09','12','15','18','21','24'],
      flow:  [1200, 800, 2600, 5800, 4600, 5200, 6800, 3900, 1800],
      speed: [78, 82, 72, 55, 62, 58, 48, 66, 75],
    },
    env: [
      { name: 'CO 浓度',    value: '4.2 ppm',  limit: '≤ 24 ppm',  ok: true },
      { name: '能见度 VI',  value: '0.0072 1/m', limit: '≤ 0.012', ok: true },
      { name: '路面照度',   value: '86 lx',    limit: '≥ 50 lx',   ok: true },
      { name: '洞内风速',   value: '2.8 m/s',  limit: '≤ 10 m/s',  ok: true },
      { name: '结构温度',   value: '18.6 ℃',   limit: '-20~50 ℃',  ok: true },
    ],
    events: [
      { time: '14:12', name: '秦岭终南山隧道货车违停', level: 'orange' },
      { time: '11:40', name: '包家山隧道照度偏低',     level: 'yellow' },
      { time: '09:25', name: '秦岭一号隧道风机故障恢复', level: 'blue' },
    ],
    energy: {
      hours: ['00','03','06','09','12','15','18','21','24'],
      lighting: [486, 472, 488, 396, 342, 358, 420, 502, 486],
      ventil:  [286, 262, 310, 428, 392, 456, 486, 368, 298],
    },
  },
  // 城市供水：水质+漏损
  water: {
    quality: [
      { name: '浊度', value: 0.32, max: 1,   unit: 'NTU', limit: '≤1 NTU' },
      { name: '余氯', value: 0.55, max: 2,   unit: 'mg/L', limit: '0.3~2' },
      { name: 'pH',   value: 7.4,  max: 14,  unit: '',     limit: '6.5~8.5' },
    ],
    pressure: {
      hours: ['00','04','08','12','16','20','24'],
      val: [0.32, 0.30, 0.38, 0.42, 0.40, 0.44, 0.35],
    },
    dma: [
      { name: '西安雁塔DMA', value: 18.2 },
      { name: '西安碑林DMA', value: 16.8 },
      { name: '咸阳秦都DMA', value: 14.5 },
      { name: '宝鸡渭滨DMA', value: 12.1 },
      { name: '渭南临渭DMA', value: 10.6 },
      { name: '榆林榆阳DMA', value: 8.9 },
    ],
    plants: [
      { name: '西安南郊水厂', cap: '40万m³/日', load: 86 },
      { name: '西安北郊水厂', cap: '32万m³/日', load: 78 },
      { name: '宝鸡石坝河水厂', cap: '18万m³/日', load: 72 },
      { name: '咸阳羊毛湾水厂', cap: '15万m³/日', load: 65 },
    ],
    supplyDay: {
      hours: ['00','04','08','12','16','20','24'],
      val: [18.6, 16.2, 24.8, 26.5, 25.2, 27.8, 19.4],
    },
  },
  // 城市供热：温度专题
  heating: {
    tempCurve: {
      hours: ['00','04','08','12','16','20','24'],
      supply: [72, 70, 74, 76, 75, 77, 73],
      back:  [48, 47, 49, 51, 50, 52, 49],
    },
    stations: [
      { name: '西安太白热力站', temp: '72/49℃', press: '0.45MPa', status: '正常' },
      { name: '西安高新热力站', temp: '71/48℃', press: '0.42MPa', status: '正常' },
      { name: '宝鸡金台热力站', temp: '68/46℃', press: '0.40MPa', status: '正常' },
      { name: '咸阳渭城热力站', temp: '65/44℃', press: '0.36MPa', status: '偏低' },
      { name: '榆林榆阳热力站', temp: '74/50℃', press: '0.48MPa', status: '正常' },
    ],
    roomTempDist: [
      { name: '<16℃', value: 12 },  { name: '16~18℃', value: 68 },
      { name: '18~20℃', value: 326 }, { name: '20~22℃', value: 4860 },
      { name: '22~24℃', value: 2980 }, { name: '>24℃', value: 374 },
    ],
    sourceLoad: [
      { name: '西安热电', value: 82 }, { name: '宝鸡热电厂', value: 68 },
      { name: '咸阳热能', value: 74 }, { name: '榆林能源', value: 88 },
    ],
    loadCurve: {
      hours: ['00','04','08','12','16','20','24'],
      load: [72, 68, 78, 82, 80, 85, 74],
      roomPass: [97.2, 97.5, 98.1, 98.4, 98.3, 98.6, 98.0],
    },
  },
  // 综合管廊：舱室环境+入廊管线
  corridor: {
    pipePie: [
      { name: '电力电缆', value: 42, color: '#00e5ff' },
      { name: '通信光缆', value: 26, color: '#7c4dff' },
      { name: '给水管道', value: 14, color: '#2979ff' },
      { name: '中水管道', value: 8,  color: '#52c41a' },
      { name: '热力管道', value: 6,  color: '#ffa940' },
      { name: '燃气管道', value: 4,  color: '#ff4d4f' },
    ],
    envCurve: {
      hours: ['00','04','08','12','16','20','24'],
      temp: [17.8, 17.5, 18.2, 19.2, 19.8, 19.0, 18.2],
      humi: [56, 58, 55, 52, 50, 53, 56],
      o2:   [20.9, 20.9, 20.8, 20.8, 20.7, 20.8, 20.9],
    },
    cabins: [
      { name: '西安沣西综合舱',  len: '12.6km', pipes: '电力/通信/给水', status: '正常' },
      { name: '西安浐灞燃气舱',  len: '8.2km',  pipes: '燃气',          status: '关注' },
      { name: '宝鸡蟠龙综合舱',  len: '6.8km',  pipes: '电力/通信/热力', status: '正常' },
      { name: '咸阳文体综合舱',  len: '5.4km',  pipes: '电力/给水/中水', status: '正常' },
    ],
    alarms: [
      { time: '13:26', name: '浐灞燃气舱 CH₄ 浓度接近阈值 0.8%LEL', level: 'yellow' },
      { time: '10:18', name: '沣西综合舱 3# 分区水泵启动', level: 'blue' },
      { time: '08:42', name: '蟠龙综合舱门禁非法开启告警(已复核)', level: 'orange' },
    ],
    cabinStat: [
      { name: '沣西综合舱', temp: 18.6, humi: 55, alarms: 2 },
      { name: '浐灞燃气舱', temp: 19.4, humi: 52, alarms: 5 },
      { name: '蟠龙综合舱', temp: 18.2, humi: 56, alarms: 1 },
      { name: '文体综合舱', temp: 17.8, humi: 58, alarms: 0 },
      { name: '秦汉电力舱', temp: 18.9, humi: 53, alarms: 1 },
    ],
  },
  // 桥梁专题主页扩展
  bridge: {
    healthRank: [
      { name: '延安延河大桥', value: 68 },
      { name: '秦岭终南山公路桥', value: 76 },
      { name: '西安绕城高速特大桥', value: 82 },
      { name: '渭河大桥', value: 86 },
      { name: '宝鸡清姜河大桥', value: 88 },
      { name: '渭南渭河大桥', value: 90 },
    ],
    typePie: [
      { name: '梁桥', value: 4860, color: '#00e5ff' },
      { name: '连续梁桥', value: 2120, color: '#2979ff' },
      { name: '拱桥', value: 860, color: '#7c4dff' },
      { name: '斜拉桥', value: 286, color: '#ffa940' },
      { name: '悬索桥', value: 68, color: '#ff4d4f' },
      { name: '其他', value: 368, color: '#52c41a' },
    ],
  },
};

// 业务模块说明（对应方案中的二级建设内容）
const MODULE_DESC = {
  '基础底数': '汇聚管网、场站、设施、设备等基础台账数据，形成"一设施一档"，支撑底数查询、统计分析与导出。',
  '动态风险防控': '按"红橙黄蓝"四色图分级管控风险，联动监测预警与隐患处置，实现风险发现—派单—处置—复核闭环。',
  '隐患整治': '覆盖隐患上报、分级判定、整改派单、限期督办、复核销号全流程，支持整治进度与超期分析。',
  '行业监管': '面向企业许可、从业人员、运行服务质量等行业监管场景，提供信用评价与监督检查数据支撑。',
  '专题屏': '面向领导决策的专题可视化大屏，集中呈现核心指标、风险态势与预警处置情况。',
  '全流程监管': '贯通"充装—运输—仓储—配送—使用"全链条，实现气瓶流转可追溯、异常可预警。',
  '健康监测': '基于结构应变、挠度、振动、索力等监测数据，评估桥梁健康度并输出预警等级。',
  '运营监测': '对运行状态、环境参数、设备工况进行实时监测，异常自动报警并推送处置。',
  '水质监管': '在线监测浊度、余氯、pH、COD 等指标，超标自动预警并关联溯源分析。',
  '雨水监督': '监测雨水管网水位、流量与易积水点，支撑城市防涝调度与应急响应。',
  '污水监督': '监测污水管网液位、流量与排放口水质，识别雨污混接与异常排放。',
};

// ============================================================
// 专题页布局差异化配置
// cols: 三栏宽度；bottom: 全宽底部特色条带类型；leftExtra: 左栏附加面板类型
// ============================================================
const SCENARIO_LAYOUT = {
  lpg:      { cols: '420px 1fr 330px', bottom: 'steps',   leftExtra: 'lpgStaff' },
  drainage: { cols: '340px 1fr 400px', bottom: 'capability', leftExtra: 'drainProgress' },
  bridge:   { cols: '380px 1fr 360px', bottom: 'bridgeList', leftExtra: 'bridgeCheck' },
  tunnel:   { cols: '400px 1fr 340px', bottom: 'energy',  leftExtra: 'tunnelEquip' },
  water:    { cols: '360px 1fr 380px', bottom: 'supply',  leftExtra: 'waterSource' },
  heating:  { cols: '340px 1fr 400px', bottom: 'load',    leftExtra: 'heatComplaint' },
  corridor: { cols: '400px 1fr 340px', bottom: 'cabin',   leftExtra: 'cabinShare' },
};

// 左栏附加面板数据
const LEFT_EXTRA = {
  lpgStaff: { title: '从业人员持证上岗', rows: [
    ['充装作业人员', '8,642 人', '持证率 96.2%', 'green'],
    ['配送押运人员', '5,218 人', '持证率 97.2%', 'green'],
    ['安检维修人员', '2,860 人', '持证率 91.5%', 'yellow'],
    ['企业负责人',   '1,124 人', '培训率 100%', 'green'],
  ]},
  drainProgress: { title: '雨污分流改造进度', bars: [
    ['西安市', 86], ['宝鸡市', 78], ['咸阳市', 74], ['渭南市', 69], ['榆林市', 62], ['汉中市', 58],
  ], foot: '全省平均完成率 72.4%，年度目标 85%' },
  bridgeCheck: { title: '年度检测计划完成', rows: [
    ['定期检测', '已完成 6,842 / 8,562 座', '79.9%', 'green'],
    ['特殊检测', '已完成 218 / 286 座', '76.2%', 'yellow'],
    ['应急检测', '已完成 12 / 12 座', '100%', 'green'],
  ]},
  tunnelEquip: { title: '机电设备在线状态', rows: [
    ['通风风机', '1,286/1,302 台', '98.8%', 'green'],
    ['照明系统', '8,420/8,560 组', '98.4%', 'green'],
    ['消防栓泵', '986/992 处', '99.2%', 'green'],
    ['视频监控', '3,605/3,620 路', '99.6%', 'green'],
    ['紧急电话', '842/856 部', '98.4%', 'yellow'],
  ]},
  waterSource: { title: '水源地保护区状态', rows: [
    ['地表水水源地', '42 处', '全部达标', 'green'],
    ['地下水水源地', '68 处', '2 处关注', 'yellow'],
    ['应急备用水源', '26 处', '可用率 100%', 'green'],
  ]},
  heatComplaint: { title: '供热投诉热点小区 TOP5', rows: [
    ['西安 · 明德门小区', '室温 16.2℃', '12 件', 'orange'],
    ['咸阳 · 中华苑',     '室温 16.8℃', '9 件',  'orange'],
    ['宝鸡 · 石油社区',   '室温 17.1℃', '7 件',  'yellow'],
    ['渭南 · 朝阳小区',   '室温 17.4℃', '6 件',  'yellow'],
    ['榆林 · 西沙小区',   '室温 17.8℃', '5 件',  'yellow'],
  ]},
  cabinShare: { title: '管廊舱室类型分布', bars: [
    ['综合舱', 58], ['电力舱', 32], ['燃气舱', 18], ['热力舱', 12], ['雨水舱', 6],
  ], foot: '在建舱室 24 个，规划"十五五"新增 86 公里' },
};

