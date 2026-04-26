export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    if (url.pathname === '/api/game/background') {
      return handleBackground(body, env, headers);
    }
    if (url.pathname === '/api/game/generate') {
      return handleGenerate(body, env, headers);
    }
    if (url.pathname === '/api/game/session') {
      return Response.json({ sessionId: crypto.randomUUID() }, { headers });
    }
    if (url.pathname === '/api/game/talents') {
      return handleTalents(body, env, headers);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  },
};

interface Env {
  AI_API_KEY: string;
  AI_BASE_URL: string;
  AI_MODEL: string;
  AI_TEMPERATURE: string;
}

const AI_MODELS = [
  { id: 'glm-5', family: 'glm' as const },
  { id: 'qwen3.6-plus', family: 'qwen' as const },
  { id: 'qwen3-coder-plus', family: 'qwen' as const },
  { id: 'glm-4.7', family: 'glm' as const },
  { id: 'kimi-k2.5', family: 'kimi' as const },
  { id: 'MiniMax-M2.5', family: 'minimax' as const },
];

function getAIConfig(model?: string, env?: Env) {
  return {
    baseURL: env?.AI_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1',
    apiKey: env?.AI_API_KEY || '',
    model: model || env?.AI_MODEL || 'glm-5',
    temperature: parseFloat(env?.AI_TEMPERATURE || '0.8'),
  };
}

async function chatCompletion(
  config: ReturnType<typeof getAIConfig>,
  prompt: string,
  maxTokens: number,
  disableThinking?: boolean
): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: config.temperature,
    max_tokens: maxTokens,
  };

  if (disableThinking) {
    const modelFamily = AI_MODELS.find(m => m.id === config.model)?.family;
    if (modelFamily === 'qwen') {
      body.enable_thinking = false;
    } else if (modelFamily === 'glm') {
      body.thinking = { type: 'disabled' };
    }
  }

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'User-Agent': 'life-restart-app/1.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function handleBackground(body: any, env: Env, headers: Record<string, string>): Promise<Response> {
  const { world, identity, talents, attributes, model, disableThinking } = body;
  const apiKey = env.AI_API_KEY || '';

  if (!apiKey) {
    const fallback = `你出生在一个普通的家庭，在这个名为${world?.name || '这个世界'}的世界里，命运的齿轮开始转动。`;
    return new Response(JSON.stringify({ backstory: fallback }), { headers });
  }

  const prompt = buildBackgroundPrompt(world, identity, talents, attributes);
  const config = getAIConfig(model, env);

  try {
    const backstory = await chatCompletion(config, prompt, 600, disableThinking);
    return new Response(JSON.stringify({ backstory }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ backstory: `命运的齿轮开始转动，你的人生即将展开。`, error: e.message }), { headers });
  }
}

async function handleGenerate(body: any, env: Env, headers: Record<string, string>): Promise<Response> {
  const { age, attributes, talents, events, world, identity, resources, model, disableThinking, decision } = body;
  const apiKey = env.AI_API_KEY || '';

  if (!apiKey) {
    const fallback = `${age}岁，你在${world?.name || '这个世界'}度过了平淡的一年。`;
    return new Response(JSON.stringify({ content: fallback, attrChanges: {}, resources: {} }), { headers });
  }

  const prompt = buildEventPrompt(age, attributes, talents, events || [], world, identity, resources || { money: 0, career: '无业', social: 0 }, decision);
  const config = getAIConfig(model, env);

  try {
    const responseText = await chatCompletion(config, prompt, 500, disableThinking);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({
        content: parsed.content || '平凡地度过了这一年。',
        attrChanges: parsed.attrChanges || {},
        resources: parsed.resources || {},
        isDecision: parsed.isDecision || false,
        decision: parsed.decision || null,
      }), { headers });
    }
    return new Response(JSON.stringify({
      content: responseText.trim().slice(0, 100),
      attrChanges: {},
      resources: {},
    }), { headers });
  } catch (e: any) {
    return new Response(JSON.stringify({
      content: `${age}岁，命运的车轮继续向前转动。`,
      attrChanges: {},
      resources: {},
      error: e.message,
    }), { headers });
  }
}

function buildBackgroundPrompt(
  world: { name: string; description: string },
  identity: { gender: string; race: string; extraInfo: string; playingAs?: string },
  talents: { name: string }[],
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number }
) {
  const playingAsText = identity.playingAs
    ? `**你扮演的角色：${identity.playingAs}**。你就是这个角色，所有事件以你的视角展开，用"你"来叙述。`
    : '';
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成一段背景故事。

世界设定：${world.name} - ${world.description}
性别：${identity.gender}
种族：${identity.race}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}
初始属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
补充信息：${identity.extraInfo || '无'}
${playingAsText}

【文风要求】
采用"宏大的温暖"叙事风格——参考轻小说作家"青空乐章"的文风：
- 中长句为主，短句点睛：用40-80字的细腻句子铺景入情，关键处用极短句形成对比（如"起风了——"）
- 词汇偏好：温暖、柔软、轻盈、安宁、轻轻、慢慢、淡淡、安心、温馨、柔和、浅浅等温暖词汇
- 自然意象：风、阳光、月光、星光、溪水、草地、树叶、云朵等作为情感外化
- 身体感受：指尖、眼瞳、发丝、脸颊、手心等细节描写
- 语气轻柔但不软弱，常用"或许""大概""总觉得"但底色坚定
- 幽默适度：轻度自嘲+生活化吐槽，不可搞笑或无厘头，整体温暖可爱
- 避免：血腥、残酷、冷酷、搞笑、夸张搞笑的比喻

【长度硬约束——极其重要】
- 严格控制在50-80字，不要超过80字
- 不要写太长，短小精炼即可`;
}

function buildEventPrompt(
  age: number,
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number },
  talents: { name: string }[],
  events: { age: number; content: string }[],
  world: { name: string },
  identity: { gender: string; race: string; playingAs?: string },
  resources: { money: number; career: string; social: number },
  previousDecision?: { optionId: string; optionText: string; customInput: string }
) {
  const recentEvents = events.slice(-5).map((e: { age: number; content: string }) => `${e.age}岁：${e.content}`).join('\n');
  const decisionContext = previousDecision
    ? `上一次选择：玩家明确选择了 "${previousDecision.optionText}"。新事件必须明确反映这个选择的具体后果——绝对不能写成像是选了其他选项的结果。`
    : '';
  const playingAsText = identity.playingAs
    ? `**你扮演的角色：${identity.playingAs}**。事件必须围绕这个角色展开，以"你"的视角叙述，你就是${identity.playingAs}。**`
    : '';
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成这一年发生的事件。

当前年龄：${age}岁
世界设定：${world.name}
性别：${identity.gender}
种族：${identity.race}
${playingAsText}
当前属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}
**【属性变化规则——极其重要，事件内容必须与属性变化严格对应】每个事件必须在attrChanges中标注属性变化，变化必须与事件内容直接相关：**

- **智力**：学习、读书、拜师、解谜、思考、研究等 → 智力+1到+2；厌学、荒废、不思进取 → 智力-1
- **体质**：锻炼、练武、劳作、饮食规律 → 体质+1到+2；生病、受伤、挨饿、劳累过度 → 体质-1到-2
- **颜值**：遇到贵人指点仪态、精心打扮、获得美容奇遇 → 颜值+1；遭遇毁容事故、长期风吹日晒、不修边幅 → 颜值-1
- **家境**：获得遗产、投资成功、贵人资助、经商获利 → 家境+1到+2；家道中落、被骗、投资失败、灾祸 → 家境-1到-2

**强制要求：attrChanges中至少要有1个属性变化（除非是纯叙事性的过渡事件），且变化方向必须与事件内容逻辑一致——绝不能出现"生病卧床"却"体质+1"的矛盾情况。在attrChanges中如实反映。**
当前状态：金钱${resources.money} 职业${resources.career} 社交${resources.social}
之前的事件：${recentEvents || '无'}
${decisionContext}

【文风要求】
采用"宏大的温暖"叙事风格——参考轻小说作家"青空乐章"的文风：
- 叙事基调：温暖、真诚、细腻，读完让人觉得"这一生值得"
- 句式：中长句为主（40-80字），细腻铺景入情，关键转折处突然切换到极短句形成对比
- 温暖词汇：温暖、柔软、安宁、轻轻、慢慢、安心、淡淡、浅浅、温馨、柔和
- 自然意象：风、阳光、星光、月光、溪水、草地、树叶等作为情感锚点
- 身体细节：指尖、眼瞳、发丝、脸颊、手心等细微感受，让情感有落脚点
- 冲突写法：不写纯粹的恶，写"不同善良之间的碰撞"或"无奈与温柔的交织"
- 战斗/挫折：战斗本身不重要，战斗之后的情感落点才重要
- 幽默：轻度自嘲+生活化吐槽，适度即可，不可搞笑或无厘头，整体保持温暖的底色
- 避免：血腥、残酷、冷酷、血腥暴力、夸张搞笑、无厘头情节
- 情感落点：每个事件的结尾都落在一个温暖的画面上——一个目光、一个微笑、一阵风、一束光

【长度硬约束——极其重要】
- 事件内容严格控制在50-80字，不要超过80字

写作要求：
1. 生成1个事件的描述（中文，50-80字）
2. 事件要与年龄、属性、天赋、种族、之前的事件逻辑连贯
3. **如果上次有选择，新事件必须是该选择的直接后果**——承接上文的因果关系，不能脱节
4. 事件要真实、生动、有戏剧性，不要平淡过滤，但不可搞笑或荒诞
5. **死亡判定规则：除非玩家60岁以上（自然老死），否则死亡必须由重大抉择的后果驱动——玩家做出了高风险选择并失败才可能死亡，不能随机出现意外死亡。让玩家死得明明白白。**
6. 如果年龄较大（60岁以上），要考虑健康衰退和自然死亡
7. 在重要人生节点（如升学、就业、恋爱、结婚、创业、重大抉择等，约30%概率）生成选择事件
8. **选择事件的选项必须从当前事件中自然衍生**——选项是玩家对该事件不同应对方式，必须与事件情节直接相关，不能脱离上下文
9. 在末尾用JSON格式标注变化，格式如下：
{"content":"事件内容...","attrChanges":{},"resources":{"money":0,"career":"","social":0},"isDecision":false}

选择事件格式（仅在重要节点使用）：
{"content":"事件内容...","attrChanges":{},"resources":{},"isDecision":true,"decision":{"prompt":"你决定：","options":[{"id":"a","text":"选项A","hint":"对xxx有极高要求，成功后可能获得xxx，但若失败则可能xxx"},{"id":"b","text":"选项B","hint":"对xxx有xxx要求，成功后可能获得xxx，但若失败则可能xxx"},{"id":"c","text":"选项C","hint":"对xxx有xxx要求，成功后可能获得xxx，但若失败则可能xxx"}],"allowFreeInput":true}}

**选项hint写法要求（极其重要）：hint必须用模糊、含蓄的描述，绝对不能写具体数值！**
- 错误示例："成功奖励：智力+2 | 要求：体质≥5 | 失败代价：-1体质" ← 禁止这种格式
- 正确示例："对体质有极高要求，成功后可能获得巨额财富，但若失败则可能元气大伤"
- 正确示例："需要不俗的胆识，或许能赢得美人的芳心，若不成便徒留遗憾"
- 用"极高/较高/一般/较低"描述要求难度
- 用"巨额/丰厚/微薄的回报"描述奖励
- 用"元气大伤/损失惨重/略有损失/徒留遗憾"描述代价
- 整体风格要含蓄有韵味，像在暗示一个可能的命运走向

attrChanges只写变化的值（正负均可），不变的不写。
resources中career为空字符串表示不变，money和social写变化量。

只返回JSON，不要其他内容。`;
}

async function handleTalents(body: any, env: Env, headers: Record<string, string>): Promise<Response> {
  const { world, gender, race, model, disableThinking } = body;
  const apiKey = env.AI_API_KEY || '';

  if (!apiKey) {
    const fallback = [
      { id: 'fallback_1', name: '命运之子', description: '全属性+1，天生好命', rarity: 'legendary' },
      { id: 'fallback_2', name: '过目不忘', description: '学习能力超群', rarity: 'rare' },
      { id: 'fallback_3', name: '幸运星', description: '随机正面事件触发率增加', rarity: 'common' },
    ];
    return new Response(JSON.stringify({ talents: fallback }), { headers });
  }

  const prompt = buildTalentPrompt(world, gender, race);
  const config = getAIConfig(model, env);

  try {
    const responseText = await chatCompletion(config, prompt, 600, disableThinking);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const talents = (parsed.talents || []).map((t: any, i: number) => ({
        id: `ai_talent_${Date.now()}_${i}`,
        name: t.name || '未知天赋',
        description: t.description || '',
        rarity: (['legendary', 'epic', 'rare', 'common'].includes(t.rarity) ? t.rarity : 'common') as string,
      }));
      if (talents.length === 0) throw new Error('AI returned empty talents');
      return new Response(JSON.stringify({ talents }), { headers });
    }
    throw new Error('No JSON found in response');
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

function buildTalentPrompt(world: { name: string; description: string }, gender: string, race: string) {
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成天赋卡牌。

世界设定：${world.name} - ${world.description}
性别：${gender}
种族：${race}

【核心原则——极其重要】
天赋必须严格匹配世界设定和种族！不同世界观之间绝不能混杂：
- 修仙/武侠世界：只能写修炼、功法、灵根、剑道、丹药、悟性等，绝对不要出现赛博义体、基因改造、二次元、ACG、黑客等现代/科幻词汇
- 赛博朋克世界：只能写义体、植入物、骇客、AI适配、脑机接口、公司血统等，绝对不要出现修仙、灵根、功法等
- 宫斗/古代世界：只能写出身高贵、琴棋书画、察言观色、宫斗天赋、御兽等
- 科幻/星际世界：只能写星舰驾驶、基因编辑、外星语通晓、量子计算等
- 魔法/西幻世界：只能写魔法亲和、龙族血脉、精灵感知、圣光祝福等
- 废土世界：只能写辐射抗性、拾荒直觉、变异适应、机械修理等
- 现代世界：可写学习天赋、社交直觉、运动天赋、艺术感知等

要求：
1. 生成3个天赋，每个天赋包含 name（中文名，2-5字）、description（一句话描述效果，10-20字）、rarity（稀有度：common/rare/epic/legendary 之一）
2. 天赋必须与世界设定、种族强相关——修仙世界写灵根修炼，赛博世界写义体骇客，绝不混杂
3. 稀有度分布：1-2个common/rare，0-1个epic/legendary，保证多样性
4. 天赋名称要有创意、有意境，不要千篇一律
5. 天赋描述要具体，说明它如何影响人生走向
6. 如果种族是非人类（如龙、兽人、精灵等），天赋要体现种族特色

只返回JSON，格式如下：
{"talents":[{"name":"天赋名","description":"描述","rarity":"common"}]}

只返回JSON，不要其他内容。`;
}
