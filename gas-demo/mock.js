/* ============================================================
   mock.js · 陕西省智慧燃气监管 · 共享 Mock 数据（跨页唯一数据源）
   页面只读此处，禁止散落硬编码；签名贴近未来真实 API
   ============================================================ */
// 工具
const delay=(ms=400)=>new Promise(r=>setTimeout(r,ms));
const fmt=(n)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');

const DB={
  city:'陕西省',
  districts:['西安市','宝鸡市','咸阳市','渭南市','铜川市','延安市','榆林市','汉中市','安康市','商洛市','杨凌区'],
  // ====== 顶层 KPI（驾驶舱头部） ======
  kpi:{
    users:{val:6854200,u:'户',trend:+3.2,sub:'管道天然气用户'},
    pipe:{val:62850.6,u:'公里',trend:+1.8,sub:'燃气管网总长'},
    stations:{val:1286,u:'座',trend:+2,sub:'场站/调压设施'},
    devices:{val:86420,u:'台',trend:+5.6,sub:'物联感知设备'},
    online:{val:84136,u:'台',trend:+0.4,sub:'在线率 97.4%'},
    alarms30:{val:386,u:'起',trend:-12,sub:'近30日报警'},
    hidden:{val:127,u:'项',trend:-8,sub:'未整改隐患'},
    supply:{val:38.6,u:'亿m³',trend:+6.5,sub:'年供气量'},
  },
  // ====== 管网 ======
  pipelines:[
    {id:'GP-001',mat:'PE',dia:'DE160',len:12.4,press:'中压',year:'2018',dist:'西安市',status:'正常'},
    {id:'GP-002',mat:'PE',dia:'DE110',len:8.7,press:'中压',year:'2017',dist:'西安市',status:'正常'},
    {id:'GP-003',mat:'钢管',dia:'D219',len:15.2,press:'次高压',year:'2015',dist:'宝鸡市',status:'正常'},
    {id:'GP-004',mat:'PE',dia:'DE90',len:6.3,press:'低压',year:'2019',dist:'宝鸡市',status:'正常'},
    {id:'GP-005',mat:'钢管',dia:'D159',len:22.8,press:'次高压',year:'2014',dist:'榆林市',status:'关注'},
    {id:'GP-006',mat:'PE',dia:'DE160',len:9.1,press:'中压',year:'2020',dist:'榆林市',status:'正常'},
    {id:'GP-007',mat:'PE',dia:'DE110',len:5.4,press:'低压',year:'2016',dist:'延安市',status:'正常'},
    {id:'GP-008',mat:'钢管',dia:'D219',len:18.6,press:'次高压',year:'2013',dist:'延安市',status:'关注'},
    {id:'GP-009',mat:'PE',dia:'DE160',len:11.3,press:'中压',year:'2019',dist:'咸阳市',status:'正常'},
    {id:'GP-010',mat:'钢管',dia:'D273',len:26.5,press:'高压',year:'2012',dist:'咸阳市',status:'关注'},
    {id:'GP-011',mat:'PE',dia:'DE90',len:4.2,press:'低压',year:'2021',dist:'西安市',status:'正常'},
    {id:'GP-012',mat:'钢管',dia:'D159',len:14.7,press:'中压',year:'2016',dist:'汉中市',status:'正常'},
  ],
  // ====== 地理锚点（陕西省真实经纬度范围） ======
  geo:{
    center:[35.60,108.90],    // 陕西省几何中心偏西安
    bounds:[[31.70,105.48],[39.60,111.24]], // 陕西全域
    zoom:7,
    // 百分比(0-100) → 经纬度映射（lat南→北 / lng西→东）
    pctToLL(x,y){return[39.60-(y/100)*7.90,105.48+(x/100)*5.76]}
  },
  // ====== 场站（含真实经纬度 & 0-100% 定位双套） ======
  stations:[
    {id:'MS-01',name:'西安门站',type:'门站',x:59,y:66,lat:34.40,lng:108.85,dist:'西安市',status:'正常',head:'王建国',press:'0.40MPa'},
    {id:'MS-02',name:'西安LNG储备站',type:'储备站',x:61,y:68,lat:34.25,lng:109.00,dist:'西安市',status:'正常',head:'李志远',press:'1.60MPa'},
    {id:'MS-03',name:'咸阳门站',type:'门站',x:56,y:66,lat:34.42,lng:108.72,dist:'咸阳市',status:'正常',head:'张伟',press:'0.40MPa'},
    {id:'MS-04',name:'宝鸡门站',type:'门站',x:29,y:66,lat:34.42,lng:107.15,dist:'宝鸡市',status:'正常',head:'刘洋',press:'0.40MPa'},
    {id:'MS-05',name:'渭南调压站',type:'调压站',x:70,y:64,lat:34.55,lng:109.50,dist:'渭南市',status:'关注',head:'陈刚',press:'0.30MPa'},
    {id:'MS-06',name:'铜川调压站',type:'调压站',x:60,y:59,lat:34.95,lng:108.95,dist:'铜川市',status:'正常',head:'赵明',press:'0.30MPa'},
    {id:'MS-07',name:'延安门站',type:'门站',x:68,y:37,lat:36.65,lng:109.42,dist:'延安市',status:'正常',head:'孙强',press:'0.40MPa'},
    {id:'MS-08',name:'榆林门站',type:'门站',x:75,y:16,lat:38.30,lng:109.78,dist:'榆林市',status:'正常',head:'周涛',press:'0.40MPa'},
    {id:'MS-09',name:'榆林储备站',type:'储备站',x:72,y:18,lat:38.20,lng:109.60,dist:'榆林市',status:'正常',head:'吴磊',press:'1.60MPa'},
    {id:'MS-10',name:'汉中门站',type:'门站',x:27,y:82,lat:33.12,lng:107.05,dist:'汉中市',status:'正常',head:'郑斌',press:'0.40MPa'},
    {id:'MS-11',name:'安康调压站',type:'调压站',x:62,y:87,lat:32.72,lng:109.05,dist:'安康市',status:'正常',head:'黄宇',press:'0.30MPa'},
    {id:'MS-12',name:'商洛调压站',type:'调压站',x:78,y:72,lat:33.90,lng:109.98,dist:'商洛市',status:'关注',head:'林峰',press:'0.30MPa'},
    {id:'MS-13',name:'杨凌调压站',type:'调压站',x:45,y:67,lat:34.30,lng:108.08,dist:'杨凌区',status:'正常',head:'徐斌',press:'0.30MPa'},
    {id:'MS-14',name:'韩城门站',type:'门站',x:82,y:52,lat:35.48,lng:110.45,dist:'渭南市',status:'正常',head:'高鹏',press:'0.40MPa'},
  ],
  // ====== 危险源（LNG/CNG/高压储罐等，图层可切换） ======
  hazards:[
    {id:'HZ-01',name:'西安LNG储备站储罐区',type:'LNG储罐',level:'重大',x:61,y:68,lat:34.26,lng:109.01,cap:'2×150m³',dist:'西安市'},
    {id:'HZ-02',name:'榆林能源化工基地高压球罐',type:'高压球罐',level:'重大',x:72,y:18,lat:38.22,lng:109.62,cap:'4×5000m³',dist:'榆林市'},
    {id:'HZ-03',name:'延安石化LPG储配区',type:'LPG储罐',level:'较大',x:68,y:37,lat:36.62,lng:109.45,cap:'6×200m³',dist:'延安市'},
    {id:'HZ-04',name:'宝鸡CNG加气母站',type:'CNG母站',level:'较大',x:29,y:65,lat:34.45,lng:107.18,cap:'450kg/h',dist:'宝鸡市'},
    {id:'HZ-05',name:'汉中天然气调压柜',type:'高压设施',level:'一般',x:27,y:82,lat:33.15,lng:107.06,cap:'DN200',dist:'汉中市'},
    {id:'HZ-06',name:'西安未央LNG气化站',type:'LNG气化',level:'重大',x:60,y:66,lat:34.38,lng:108.90,cap:'2000Nm³/h',dist:'西安市'},
  ],
  // ====== 防护目标（学校/医院/居民区，图层可切换） ======
  protection:[
    {id:'PT-01',name:'西安市高新第一中学',type:'学校',x:59,y:69,lat:34.22,lng:108.88,people:3200,dist:'西安市'},
    {id:'PT-02',name:'交大一附院',type:'医院',x:60,y:68,lat:34.24,lng:108.95,people:1500,dist:'西安市'},
    {id:'PT-03',name:'延安市人民医院',type:'医院',x:68,y:37,lat:36.60,lng:109.44,people:1200,dist:'延安市'},
    {id:'PT-04',name:'榆林市第一中学',type:'学校',x:74,y:17,lat:38.29,lng:109.75,people:2600,dist:'榆林市'},
    {id:'PT-05',name:'宝鸡经二路商圈',type:'商业综合体',x:29,y:66,lat:34.38,lng:107.16,people:8000,dist:'宝鸡市'},
    {id:'PT-06',name:'咸阳湖大型居民区',type:'居民区',x:56,y:67,lat:34.32,lng:108.70,people:15000,dist:'咸阳市'},
    {id:'PT-07',name:'汉中中心广场',type:'商业综合体',x:27,y:83,lat:33.07,lng:107.03,people:6000,dist:'汉中市'},
    {id:'PT-08',name:'渭南信达广场商圈',type:'商业综合体',x:70,y:64,lat:34.49,lng:109.50,people:5000,dist:'渭南市'},
  ],
  // ====== 物联设备 ======
  devices:[
    {id:'DT-2024-001',type:'可燃气体探测器',loc:'西安市-未央区凤城八路',online:true,val:'0.08%LEL',bat:'92%',alarm:false},
    {id:'DT-2024-002',type:'压力变送器',loc:'西安市-西安门站',online:true,val:'0.31MPa',bat:'86%',alarm:false},
    {id:'DT-2024-003',type:'可燃气体探测器',loc:'宝鸡市-宝鸡门站',online:true,val:'0.12%LEL',bat:'78%',alarm:false},
    {id:'DT-2024-004',type:'流量计',loc:'咸阳市-咸阳门站',online:true,val:'1280m³/h',bat:'91%',alarm:false},
    {id:'DT-2024-005',type:'可燃气体探测器',loc:'榆林市-榆阳区长城路',online:false,val:'--',bat:'15%',alarm:false},
    {id:'DT-2024-006',type:'压力变送器',loc:'榆林市-榆林储备站',online:true,val:'0.29MPa',bat:'64%',alarm:true},
    {id:'DT-2024-007',type:'可燃气体探测器',loc:'延安市-宝塔区枣园路',online:true,val:'0.21%LEL',bat:'88%',alarm:true},
    {id:'DT-2024-008',type:'流量计',loc:'延安市-延安门站',online:true,val:'960m³/h',bat:'73%',alarm:false},
    {id:'DT-2024-009',type:'可燃气体探测器',loc:'汉中市-汉台区天汉大道',online:true,val:'0.06%LEL',bat:'95%',alarm:false},
    {id:'DT-2024-010',type:'压力变送器',loc:'渭南市-渭南调压站',online:true,val:'0.41MPa',bat:'81%',alarm:false},
    {id:'DT-2024-011',type:'温度变送器',loc:'西安市-西安LNG储备站',online:true,val:'28℃',bat:'90%',alarm:false},
    {id:'DT-2024-012',type:'可燃气体探测器',loc:'西安市-高新小区',online:true,val:'0.15%LEL',bat:'69%',alarm:true},
  ],
  // ====== 警情（实时） ======
  alarms:[
    {id:'A20260901-07',time:'09:41:22',loc:'延安市-宝塔区枣园路中段',type:'燃气浓度超标',lvl:'橙',status:'处置中',deal:'延安燃气公司'},
    {id:'A20260901-06',time:'09:38:05',loc:'榆林市-榆林储备站',type:'压力异常',lvl:'红',status:'处置中',deal:'榆林燃气公司'},
    {id:'A20260901-05',time:'09:30:47',loc:'西安市-高新小区3号楼',type:'疑似泄漏',lvl:'黄',status:'已派单',deal:'西安秦华燃气'},
    {id:'A20260901-04',time:'09:12:18',loc:'宝鸡市-宝鸡门站',type:'设备离线',lvl:'蓝',status:'已恢复',deal:'宝鸡燃气公司'},
    {id:'A20260901-03',time:'08:56:33',loc:'渭南市-渭南调压站',type:'流量波动',lvl:'黄',status:'处置中',deal:'渭南燃气公司'},
    {id:'A20260901-02',time:'08:30:09',loc:'杨凌区-杨凌调压站',type:'温度异常',lvl:'蓝',status:'已恢复',deal:'杨凌燃气公司'},
    {id:'A20260901-01',time:'08:15:42',loc:'咸阳市-咸阳门站',type:'压力异常',lvl:'橙',status:'已恢复',deal:'咸阳燃气公司'},
    {id:'A20260831-18',time:'23:48:11',loc:'榆林市-榆阳区长城路',type:'燃气浓度超标',lvl:'红',status:'已闭环',deal:'榆林燃气公司'},
    {id:'A20260831-17',time:'22:20:36',loc:'汉中市-汉中门站',type:'设备离线',lvl:'蓝',status:'已闭环',deal:'汉中燃气公司'},
    {id:'A20260831-16',time:'20:05:18',loc:'西安市-未央区凤城八路',type:'疑似泄漏',lvl:'黄',status:'已闭环',deal:'西安秦华燃气'},
  ],
  // ====== 隐患 ======
  hidden:[
    {id:'H-2401',type:'管道腐蚀',lvl:'红',loc:'咸阳市 GP-010',resp:'咸阳燃气公司',status:'整改中',due:'2026-09-05'},
    {id:'H-2402',type:'第三施工破坏',lvl:'橙',loc:'榆林市 GP-005',resp:'榆林燃气公司',status:'整改中',due:'2026-09-08'},
    {id:'H-2403',type:'阀井积水',lvl:'黄',loc:'延安市 GP-008',resp:'延安燃气公司',status:'待验收',due:'2026-09-03'},
    {id:'H-2404',type:'设备老化',lvl:'橙',loc:'西安市-西安门站',resp:'西安秦华燃气',status:'整改中',due:'2026-09-06'},
    {id:'H-2405',type:'标识缺失',lvl:'蓝',loc:'宝鸡市 GP-003',resp:'宝鸡燃气公司',status:'已整改',due:'2026-08-30'},
    {id:'H-2406',type:'占压管线',lvl:'黄',loc:'西安市-未央区凤城八路',resp:'西安秦华燃气',status:'整改中',due:'2026-09-10'},
    {id:'H-2407',type:'法兰渗漏',lvl:'红',loc:'榆林市-榆林储备站',resp:'榆林燃气公司',status:'整改中',due:'2026-09-04'},
    {id:'H-2408',type:'阴极保护失效',lvl:'黄',loc:'延安市 GP-008',resp:'延安燃气公司',status:'待审核',due:'2026-09-12'},
    {id:'H-2409',type:'安全间距不足',lvl:'橙',loc:'汉中市-汉中门站',resp:'汉中燃气公司',status:'整改中',due:'2026-09-09'},
    {id:'H-2410',type:'警示牌缺失',lvl:'蓝',loc:'宝鸡市 GP-004',resp:'宝鸡燃气公司',status:'已整改',due:'2026-08-29'},
  ],
  // ====== 风险评估（四色图） ======
  risks:[
    {area:'西安市-未央区',lvl:'红',score:82,segs:4},
    {area:'榆林市-榆阳区',lvl:'红',score:79,segs:3},
    {area:'延安市-宝塔区',lvl:'红',score:76,segs:2},
    {area:'咸阳市-秦都区',lvl:'橙',score:64,segs:5},
    {area:'宝鸡市-渭滨区',lvl:'橙',score:61,segs:3},
    {area:'西安市-高新区',lvl:'橙',score:58,segs:6},
    {area:'渭南市-临渭区',lvl:'黄',score:44,segs:7},
    {area:'汉中市-汉台区',lvl:'黄',score:41,segs:4},
    {area:'安康市-汉滨区',lvl:'黄',score:38,segs:5},
    {area:'商洛市-商州区',lvl:'蓝',score:24,segs:2},
  ],
  // ====== 应急资源 ======
  emergency:{
    vehicles:[{n:'抢修车',v:286,on:264},{n:'应急指挥车',v:32,on:32},{n:'消防车',v:126,on:118},{n:'救护车',v:86,on:82}],
    teams:[{n:'燃气抢险队',v:42},{n:'消防队',v:36},{n:'医疗救援',v:18},{n:'公安警戒',v:30}],
    materials:[{n:'堵漏夹具',v:1260},{n:'法兰盲板',v:3480},{n:'应急阀门',v:860},{n:'防护服',v:2400},{n:'气体检测仪',v:1620}],
    experts:[{n:'王国平',t:'燃气输配专家',o:'省住建厅'},{n:'李建华',t:'应急处置专家',o:'省消防救援总队'},{n:'张明远',t:'管网安全专家',o:'陕西燃气集团'},{n:'陈志刚',t:'风险评估专家',o:'省安科院'}],
  },
  // ====== 燃气企业 ======
  enterprises:[
    {name:'陕西省燃气集团有限公司',users:1864200,pipe:16200,stations:218,rate:'A',dist:'西安市'},
    {name:'西安秦华燃气集团有限公司',users:1580000,pipe:12400,stations:186,rate:'A',dist:'西安市'},
    {name:'宝鸡中燃城市燃气发展有限公司',users:583000,pipe:4800,stations:64,rate:'B',dist:'宝鸡市'},
    {name:'榆林燃气有限公司',users:641200,pipe:5600,stations:58,rate:'B',dist:'榆林市'},
    {name:'延安燃气有限公司',users:468000,pipe:5200,stations:46,rate:'A',dist:'延安市'},
  ],
  // ====== 用户结构 ======
  users:[
    {type:'城镇管道天然气',v:4862540,pct:70.9},
    {type:'农村管道天然气',v:1991660,pct:29.1},
  ],
  // ====== 供气趋势（近12月，亿m³） ======
  supplyTrend:[2.86,2.72,2.80,3.02,3.18,3.28,3.42,3.36,3.18,2.96,2.82,2.92],
  // ====== 报警趋势（近7日） ======
  alarmTrend:[36,28,32,24,30,26,18],
  // ====== 设备在线率（按地市） ======
  onlineByDist:[
    {dist:'西安市',total:28640,online:28186,rate:98.4},
    {dist:'宝鸡市',total:8980,online:8720,rate:97.1},
    {dist:'咸阳市',total:7260,online:6982,rate:96.2},
    {dist:'渭南市',total:5420,online:5268,rate:97.2},
    {dist:'榆林市',total:4860,online:4658,rate:95.8},
    {dist:'延安市',total:4320,online:4162,rate:96.3},
    {dist:'汉中市',total:3980,online:3886,rate:97.5},
    {dist:'安康市',total:3120,online:3058,rate:98.0},
    {dist:'商洛市',total:2460,online:2408,rate:97.9},
    {dist:'铜川市',total:1880,online:1856,rate:98.7},
  ],
  // ====== 巡查巡检 ======
  inspections:[
    {id:'X-260901-12',plan:'西安市9月入户安检',area:'西安市',period:'月',target:52000,done:31200,rate:60,state:'进行中'},
    {id:'X-260901-11',plan:'宝鸡市三季度巡线',area:'宝鸡市',period:'季',target:4800,done:4800,rate:100,state:'已完成'},
    {id:'X-260901-10',plan:'榆林市阀井检查',area:'榆林市',period:'月',target:860,done:540,rate:63,state:'进行中'},
    {id:'X-260901-09',plan:'延安市企业安检',area:'延安市',period:'季',target:420,done:380,rate:90,state:'进行中'},
    {id:'X-260901-08',plan:'汉中市隐患复查',area:'汉中市',period:'月',target:180,done:180,rate:100,state:'已完成'},
  ],
  // ====== 投诉处置 ======
  complaints:[
    {id:'C-260901-08',src:'12345热线',person:'刘女士',item:'疑似燃气味',trans:'西安秦华燃气',state:'办理中',time:'09:20'},
    {id:'C-260901-07',src:'微信小程序',person:'张先生',item:'表具异常',trans:'西安秦华燃气',state:'已办结',time:'08:42'},
    {id:'C-260901-06',src:'12345热线',person:'王女士',item:'气压不足',trans:'宝鸡燃气',state:'办理中',time:'08:05'},
    {id:'C-260831-15',src:'来电',person:'赵先生',item:'施工破坏',trans:'榆林燃气',state:'已办结',time:'昨日'},
    {id:'C-260831-14',src:'12345热线',person:'孙女士',item:'费用疑问',trans:'渭南燃气',state:'已办结',time:'昨日'},
  ],
  complaintStat:{total:2866,done:2684,rate:93.7},
  // ====== 考核评价 ======
  assess:[
    {ent:'陕西燃气集团',safety:92,hidden:88,complaint:95,deploy:90,total:91.5,rank:'A'},
    {ent:'西安秦华燃气',safety:90,hidden:90,complaint:92,deploy:88,total:90.0,rank:'A'},
    {ent:'宝鸡中燃',safety:84,hidden:80,complaint:88,deploy:82,total:83.5,rank:'B'},
    {ent:'榆林燃气',safety:91,hidden:86,complaint:90,deploy:89,total:89.0,rank:'A'},
    {ent:'延安燃气',safety:82,hidden:78,complaint:85,deploy:80,total:81.3,rank:'B'},
  ],
  // ====== 泄漏研判模型结果 ======
  leakModels:[
    {name:'泄漏溯源分析',desc:'结合压力/流量异常与GIS拓扑，追溯泄漏源管段',result:'GP-008 K2+180 处'},
    {name:'泄漏扩散分析',desc:'基于气象(风速2.1m/s 东南风)与燃气扩散模型',result:'影响半径 86m'},
    {name:'爆炸预测分析',desc:'可燃气体爆炸冲击波超压预测',result:'破坏半径 32m'},
  ],
  // ====== 知识/案例/专家库 ======
  knowledge:[
    {cat:'知识库',items:['城镇燃气管理条例','GB50028城镇燃气设计规范','CJJ51城镇燃气设施运行维护','燃气应急预案编制导则']},
    {cat:'案例库',items:['2019·某市第三方施工挖断中压管','2021·某小区入户管腐蚀泄漏','2023·调压站法兰渗漏处置']},
    {cat:'专家库',items:['王国平·燃气输配','李建华·应急处置','张明远·管网安全','陈志刚·风险评估']},
  ],
};

// ====== API 桩（签名贴近真实 API；// TODO: 替换为真实接口） ======
const API={
  // GET /api/cockpit/overview
  async overview(){await delay();return{code:0,data:{kpi:DB.kpi,enterprises:DB.enterprises,users:DB.users}}},
  // GET /api/pipelines
  async pipelines(){await delay();return{code:0,data:DB.pipelines,total:DB.pipelines.length}},
  // GET /api/stations
  async stations(){await delay();return{code:0,data:DB.stations,total:DB.stations.length}},
  // GET /api/devices
  async devices(){await delay();return{code:0,data:DB.devices,total:DB.devices.length}},
  // GET /api/alarms
  async alarms(){await delay();return{code:0,data:DB.alarms,total:DB.alarms.length}},
  // GET /api/hidden
  async hidden(){await delay();return{code:0,data:DB.hidden,total:DB.hidden.length}},
  // GET /api/risks
  async risks(){await delay();return{code:0,data:DB.risks,total:DB.risks.length}},
  // GET /api/emergency
  async emergency(){await delay();return{code:0,data:DB.emergency}},
};
