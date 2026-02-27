const $ = (id) => document.getElementById(id);

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function pick(arr, idx){ return arr[idx % arr.length]; }
function sum(arr){ return arr.reduce((a,b)=>a+b,0); }

function splitHints(text){
  return (text || "")
    .split(/[，,、\n]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function budgetSplit(goal){
  // 合计 100
  if(goal === "拉新") return [
    {channel:"信息流/短视频", ratio:45},
    {channel:"搜索/关键词", ratio:35},
    {channel:"LBS/本地推荐", ratio:20},
  ];
  if(goal === "提升转化") return [
    {channel:"搜索/关键词", ratio:45},
    {channel:"重定向/再营销", ratio:30},
    {channel:"信息流/短视频", ratio:25},
  ];
  if(goal === "提高复购") return [
    {channel:"私域/会员触达", ratio:40},
    {channel:"再营销/召回", ratio:35},
    {channel:"搜索/关键词", ratio:25},
  ];
  return [
    {channel:"信息流/短视频", ratio:40},
    {channel:"LBS/本地推荐", ratio:35},
    {channel:"搜索/关键词", ratio:25},
  ];
}

function personasByIndustry(industry, audienceHints, goal){
  const hints = audienceHints.length ? audienceHints : ["目标用户"];
  const base = [
    {
      name: "价格敏感型",
      who: `在${pick(hints,0)}中偏“看性价比”的用户`,
      pain_points: ["怕踩雷", "预算有限", "不清楚值不值"],
      triggers: ["限时优惠", "口碑评分", "朋友推荐/探店"]
    },
    {
      name: "效率优先型",
      who: `在${pick(hints,1)}中偏“省时间/省心”的用户`,
      pain_points: ["时间碎片化", "选择困难", "排队/流程麻烦"],
      triggers: ["快速下单", "到店即取/即用", "明确的服务承诺"]
    },
    {
      name: "体验驱动型",
      who: `在${pick(hints,2)}中偏“追求体验/氛围”的用户`,
      pain_points: ["想要惊喜", "怕同质化", "需要仪式感/社交价值"],
      triggers: ["新品/限定", "场景化卖点", "内容种草/达人背书"]
    }
  ];

  // 行业微调
  if(industry.includes("餐饮")){
    base[0].triggers.push("工作日午市套餐");
    base[1].pain_points.push("午休时间短");
    base[2].triggers.push("周末打卡/拍照");
  } else if(industry.includes("教育")){
    base[0].pain_points.push("担心没效果");
    base[1].triggers.push("免费试听/测评");
    base[2].triggers.push("名师/上岸案例");
  } else if(industry.includes("电商")){
    base[0].triggers.push("满减/包邮");
    base[1].triggers.push("当日达/次日达");
    base[2].triggers.push("开箱评测/对比");
  } else if(industry.includes("ToB")){
    base[0].pain_points.push("预算审批难");
    base[1].triggers.push("可快速试用/PoC");
    base[2].triggers.push("案例/ROI 证明");
  }

  // 目标微调
  if(goal === "清库存/淡季促销"){
    base[0].triggers.push("清仓/限量");
    base[1].triggers.push("低门槛优惠券");
  }

  return base;
}

function makePositioning(product, price, uspList, goal){
  const coreValue = `${product}：用更低决策成本获得“${pick(uspList,0) || "更高性价比/更好体验"}”`;
  const proof = [
    uspList[0] ? `卖点证明：${uspList[0]}` : "卖点证明：真实用户评价/口碑",
    uspList[1] ? `体验证明：${uspList[1]}` : "体验证明：流程/时效/服务承诺",
    uspList[2] ? `场景证明：${uspList[2]}` : "场景证明：适配午市/周末/家庭等场景"
  ];
  const diff = [
    "把优势写成可验证的承诺（时间/数量/范围）",
    "用“场景+人群+收益”表达，而不是空泛形容词",
    `主推一个明确的转化钩子（例如：${price} / 限时赠品 / 免预约）`
  ];
  return {
    core_value: coreValue,
    proof_points: proof,
    differentiation: diff,
    offer: `主推：${price}（可叠加：限时券/到店礼/赠品）`,
    tone: "清晰、可验证、场景化、避免夸大",
    why_now: goal === "清库存/淡季促销" ? "淡季/库存压力，需要用强刺激提升短期转化" : "用户注意力分散，需要更明确的价值主张减少犹豫"
  };
}

function channelDetails(plan, city, goal, uspList){
  const map = {
    "信息流/短视频": {
      targeting: ["同城", "兴趣：美食/生活方式/亲子/学习", "近7天活跃人群"],
      angles: ["3秒讲清卖点", "场景化：午休/周末/下班", `用可验证承诺：${pick(uspList,1) || "到店即用"}`]
    },
    "搜索/关键词": {
      targeting: [`关键词：${city}+${goal.includes("复购")?"优惠":"推荐"}`, "竞品/类目词（不点名）", "高意向词：附近/评价/套餐/预约"],
      angles: ["解决“我现在就要”的需求", "价格/口碑/距离三要素", `强化钩子：${pick(uspList,0) || "限时福利"}`]
    },
    "LBS/本地推荐": {
      targeting: ["1-3km 圈选", "商圈/写字楼/地铁口", "到店便利人群"],
      angles: ["距离优势", "即时性优惠券", "到店路径清晰（地图/停车/排队）"]
    },
    "重定向/再营销": {
      targeting: ["看过视频/点过落地页未转化", "加购/收藏未下单", "老客近30天未回访"],
      angles: ["降低门槛（券/赠品）", "消除疑虑（FAQ/评价）", "紧迫感（限量/限时）"]
    },
    "私域/会员触达": {
      targeting: ["已购用户", "会员分层（高频/沉睡）", "评价用户/高NPS"],
      angles: ["专属福利", "复购理由（新品/组合）", "仪式感与关怀"]
    }
  };
  return plan.map(p => ({
    channel: p.channel,
    budget_ratio: p.ratio,
    targeting: (map[p.channel]?.targeting || ["同城", "高意向人群"]).slice(0,4),
    message_angle: (map[p.channel]?.angles || ["卖点直给", "场景化表达"]).slice(0,4)
  }));
}

function genTitles(product, price, uspList, city, goal){
  const u0 = uspList[0] || "口碑推荐";
  const u1 = uspList[1] || "限时福利";
  const u2 = uspList[2] || "到店方便";
  const templates = [
    `${city}人都在搜的${product}，${price}值不值？`,
    `别再踩雷！${product}用${u0}说话`,
    `午休/下班就吃这个：${product}，${u1}`,
    `同城必看：${product}怎么选才不亏`,
    `3秒讲清楚：${product}为什么更划算`,
    `想${goal}？这份${product}方案直接抄`,
    `不排队也能吃好：${product}（${u2}）`,
    `${price}拿下${product}，还送${u1}`,
    `第一次来怎么点？${product}“不踩雷”攻略`,
    `真心话：${product}适合这3类人`
  ];
  return templates.slice(0, 10);
}

function genAdCopies(product, price, uspList, goal){
  const u = uspList.filter(Boolean);
  const a = u[0] || "真实口碑";
  const b = u[1] || "更省时间";
  const c = u[2] || "到店方便";
  return [
    `【${product}】${price}，主打“${a}”。适合：想${goal}但不想踩雷的人。现在下单：限时福利/赠品（以页面为准）。`,
    `你要的不是“更便宜”，是“更值”。${product}把优势写明白：${a}、${b}、${c}。点击查看推荐点单/使用方式。`,
    `选择困难？直接给你答案：${product}怎么选最不亏。${price}起，包含${a}，到店流程更省心。`,
    `同样预算，体验差很大。${product}用${a}做背书，附常见问题与真实评价。现在就去看看。`,
    `别等饿/急/赶时间才随便选。${product}适配午休/下班/周末场景，${price}可入，${b}更友好。`
  ];
}

function genScripts(product, price, uspList, city){
  const u0 = uspList[0] || "口碑不错";
  const u1 = uspList[1] || "出品快";
  const u2 = uspList[2] || "位置方便";
  return [
    `（镜头：门头/环境）在${city}想吃点靠谱的？我最近常来这家。主打【${product}】${price}。亮点就三句：${u0}、${u1}、${u2}。不想踩雷的，照我这个点。`,
    `（镜头：产品特写）很多人问值不值：看你要什么。如果你要“省心+不踩雷”，这份【${product}】很稳。${price}，而且${u1}。想要体验更好，记得按这个顺序吃/用。`,
    `（镜头：流程）我最怕排队和麻烦。这家${u1}，到店很顺。${product} ${price}，适合午休/下班来一份。你在${city}附近的话，可以直接冲。`
  ];
}

function genLandingPoints(product, uspList, price){
  const u = uspList.filter(Boolean);
  return [
    `首屏：一句话讲清【${product}】的核心价值（配价格：${price}）`,
    "第二屏：3个卖点卡片（每个卖点都写“可验证”的事实/范围/条件）",
    "第三屏：适合人群与场景（午休/周末/家庭/办公等）",
    "第四屏：真实评价/案例（截图/评分/数量）+ 常见问题FAQ",
    "第五屏：转化按钮 + 领券/预约/下单路径，减少跳转与输入"
  ];
}

function genRisks(industry){
  const common = [
    "避免夸大宣传：如“全网第一/100%有效/永久”等绝对化用语",
    "避免虚构对比：不直接点名竞品品牌，不做无依据的贬低",
    "价格与赠品要写清规则：时间/数量/使用门槛，避免误导",
    "涉及健康/功效/金融收益等敏感承诺需谨慎，必要时走资质审核",
    "素材不得使用未授权图片/肖像/音乐，避免侵权"
  ];
  if(industry.includes("教育")){
    common.push("教育培训避免“包过/保分/名校直通”等违规承诺，案例需可证明");
  }
  if(industry.includes("ToB")){
    common.push("ToB宣传避免泄露客户信息；案例需客户授权或匿名化处理");
  }
  return common;
}

function genMetrics(){
  return {
    CTR: "点击率 = 点击 / 曝光（衡量素材吸引力与定向匹配）",
    CVR: "转化率 = 转化 / 点击（衡量落地页与供给是否匹配）",
    CPA: "获客成本 = 花费 / 转化（衡量效率）",
    ROI: "投资回报 = 收入 / 花费（衡量整体生意）"
  };
}

function genIterations(){
  return [
    "CTR 低：标题改成“场景+收益+价格/福利”，前3秒直给卖点；做A/B 10条标题",
    "CTR 低：缩窄定向（同城+高意向词/兴趣），排除低相关人群",
    "CVR 低：落地页首屏加“价格+核心卖点+强按钮”，减少滚动成本",
    "CVR 低：补 FAQ（价格规则/使用限制/到店路径/售后），消除犹豫点",
    "CPA 高：先把预算集中在 1-2 个高意向渠道，其他降到测试预算",
    "ROI 低：提高客单/毛利（加购/组合/升档），不是一味降价",
    "复购低：做会员分层触达（新客7天/老客30天沉睡），给理由（新品/专属券）",
    "本地到店差：加强 LBS 圈选+路线指引+高峰避堵提示",
    "评论差：把差评原因写入服务承诺与流程优化（排队/等待/沟通）",
    "数据波动大：固定口径看板（同一归因窗口），每周复盘一次再调整"
  ];
}

function render(data){
  // 状态 chips
  const chips = [];
  chips.push(`<span class="chip">画像：${data.personas.length}类</span>`);
  chips.push(`<span class="chip">渠道：${data.channel_plan.length}个</span>`);
  chips.push(`<span class="chip">标题：${data.creatives.titles.length}条</span>`);
  chips.push(`<span class="chip">口播：${data.creatives.short_video_scripts.length}条</span>`);
  $("statusChips").innerHTML = chips.join("");

  // personas
  $("personas").innerHTML = data.personas.map(p => `
    <div class="card" style="padding:10px;margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:10px">
        <b>${p.name}</b><span class="muted small">${p.who}</span>
      </div>
      <div class="hr"></div>
      <div class="small"><span class="muted">痛点：</span>${p.pain_points.join("；")}</div>
      <div class="small" style="margin-top:6px"><span class="muted">触发：</span>${p.triggers.join("；")}</div>
    </div>
  `).join("");

  // positioning
  const pos = data.positioning;
  $("positioning").innerHTML = `
    <div class="small"><span class="muted">核心价值：</span><b>${pos.core_value}</b></div>
    <div class="hr"></div>
    <div class="small"><span class="muted">证据点：</span><ul class="list">${pos.proof_points.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="small"><span class="muted">差异化：</span><ul class="list">${pos.differentiation.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="small"><span class="muted">主推钩子：</span>${pos.offer}</div>
    <div class="small"><span class="muted">语气：</span>${pos.tone}</div>
    <div class="small"><span class="muted">为什么现在：</span>${pos.why_now}</div>
  `;

  // landing
  $("landing").innerHTML = data.landing_page.map(x=>`<li>${x}</li>`).join("");

  // channels
  const rows = data.channel_plan.map(c => `
    <div class="card" style="padding:10px;margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <b>${c.channel}</b>
        <span class="chip">${c.budget_ratio}%</span>
      </div>
      <div class="hr"></div>
      <div class="small"><span class="muted">定向：</span>${c.targeting.join(" / ")}</div>
      <div class="small" style="margin-top:6px"><span class="muted">沟通角度：</span>${c.message_angle.join(" / ")}</div>
    </div>
  `).join("");
  $("channels").innerHTML = rows;

  // kpis
  const m = data.metrics;
  $("kpis").innerHTML = Object.keys(m).map(k => `
    <div class="box">
      <b>${k}</b>
      <div class="small muted">${m[k]}</div>
    </div>
  `).join("");

  // creatives
  $("creatives").innerHTML = `
    <div class="small"><b>标题</b><ul class="list">${data.creatives.titles.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="hr"></div>
    <div class="small"><b>广告文案</b><ul class="list">${data.creatives.ad_copies.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="hr"></div>
    <div class="small"><b>短视频口播脚本</b><ul class="list">${data.creatives.short_video_scripts.map(x=>`<li>${x}</li>`).join("")}</ul></div>
  `;

  // risks
  $("risks").innerHTML = data.risks_and_compliance.map(x=>`<li>${x}</li>`).join("");

  // iters
  $("iters").innerHTML = data.iteration_suggestions.map(x=>`<li>${x}</li>`).join("");

  // json
  $("jsonBox").textContent = JSON.stringify(data, null, 2);
}

function generate(){
  const industry = $("industry").value;
  const city = $("city").value.trim() || "本地";
  const budget = clamp(parseInt($("budget").value || "300", 10), 50, 999999);
  const product = $("product").value.trim() || "产品/服务";
  const price = $("price").value.trim() || "价格";
  const goal = $("goal").value;
  const uspList = splitHints($("usp").value);
  const audList = splitHints($("audience").value);
  const constraints = splitHints($("constraints").value);

  const plan = budgetSplit(goal);
  const personas = personasByIndustry(industry, audList, goal);
  const positioning = makePositioning(product, price, uspList, goal);
  const channel_plan = channelDetails(plan, city, goal, uspList);

  // 保障预算合计 100
  const s = sum(channel_plan.map(x=>x.budget_ratio));
  if(s !== 100){
    const diff = 100 - s;
    channel_plan[0].budget_ratio = clamp(channel_plan[0].budget_ratio + diff, 0, 100);
  }

  const data = {
    meta: {
      version: "offline-demo-1.0",
      generated_at: new Date().toISOString(),
      note: "离线规则/模板生成。面试可讲：规则兜底 + 后续接入大模型增强（结构化JSON输出）。"
    },
    input: {
      industry, city, budget_per_day: budget, product, price, goal,
      usp: uspList, audience_hint: audList, constraints
    },
    personas,
    positioning,
    channel_plan,
    creatives: {
      titles: genTitles(product, price, uspList, city, goal),
      ad_copies: genAdCopies(product, price, uspList, goal),
      short_video_scripts: genScripts(product, price, uspList, city)
    },
    landing_page: genLandingPoints(product, uspList, price),
    risks_and_compliance: genRisks(industry).concat(
      constraints.length ? [`额外限制：${constraints.join("；")}`] : []
    ),
    metrics: genMetrics(),
    iteration_suggestions: genIterations()
  };

  render(data);
  window.__LAST_JSON__ = data;
}

function copyJSON(){
  const txt = $("jsonBox").textContent;
  navigator.clipboard.writeText(txt).then(()=>{
    alert("已复制 JSON 到剪贴板");
  }).catch(()=>{
    alert("复制失败（可能是浏览器权限限制），你可以手动全选复制。");
  });
}

function downloadJSON(){
  const data = window.__LAST_JSON__ || {};
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ctm_ai_demo_output.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetExample(){
  $("industry").value = "本地生活-餐饮";
  $("city").value = "北京";
  $("budget").value = 300;
  $("product").value = "午市双人套餐";
  $("price").value = "99元";
  $("goal").value = "拉新";
  $("usp").value = "3分钟出餐、限时赠饮、评价4.8分、地铁口200米";
  $("audience").value = "附近上班族、周末情侣、家庭聚餐";
  $("constraints").value = "不夸大宣传；不使用竞品品牌名；不暗示医疗功效";
  generate();
}

$("genBtn").addEventListener("click", generate);
$("copyBtn").addEventListener("click", copyJSON);
$("downloadBtn").addEventListener("click", downloadJSON);
$("resetBtn").addEventListener("click", resetExample);

// 首次自动生成一版
resetExample();