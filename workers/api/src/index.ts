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
    const backstory = await chatCompletion(config, prompt, 300, disableThinking);
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
  identity: { gender: string; race: string; extraInfo: string },
  talents: { name: string }[],
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number }
) {
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成一段背景故事。

世界设定：${world.name} - ${world.description}
性别：${identity.gender}
种族：${identity.race}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}
初始属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
补充信息：${identity.extraInfo || '无'}

【文风要求】采用"宏大的温暖"叙事风格——参考轻小说作家"青空乐章"的文风：
- 中长句为主，短句点睛：用40-80字的细腻句子铺景入情，关键处用极短句形成对比（如"起风了——"）
- 词汇偏好：温暖、柔软、轻盈、安宁、轻轻、慢慢、淡淡、安心、温馨、柔和、浅浅等温暖词汇
- 自然意象：风、阳光、月光、星光、溪水、草地、树叶、云朵等作为情感外化
- 身体感受：指尖、眼瞳、发丝、脸颊、手心等细节描写
- 语气轻柔但不软弱，常用"或许""大概""总觉得"但底色坚定
- 幽默适度：轻度自嘲+生活化吐槽，不可搞笑或无厘头，整体温暖可爱
- 避免：血腥、残酷、冷酷、搞笑、夸张搞笑的比喻

身世描写要求：
- 严格基于种族、性别、天赋、属性：如果种族是动物（如猪、狼、龙等），必须用描写该动物的方式叙述
- 高颜值/低颜值、高智力/低智力、高体质/低体质、高家境/低家境都要在身世中有所体现
- 天赋要融入故事背景中，不要简单罗列
- 不要包含具体事件，只描述出生背景
- 用"你"作为第二人称叙述
- 世界观"渐进式"展开，从小场景自然引出更大的世界，不要堆砌设定
- 100-200字`;
}

function buildEventPrompt(
  age: number,
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number },
  talents: { name: string }[],
  events: { age: number; content: string }[],
  world: { name: string },
  identity: { gender: string; race: string },
  resources: { money: number; career: string; social: number },
  previousDecision?: { optionId: string; optionText: string; customInput: string }
) {
  const recentEvents = events.slice(-5).map((e: { age: number; content: string }) => `${e.age}岁：${e.content}`).join('\n');
  const decisionContext = previousDecision
    ? `上一次选择：玩家明确选择了 "${previousDecision.optionText}"。新事件必须明确反映这个选择的具体后果——绝对不能写成像是选了其他选项的结果。`
    : '';
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成这一年发生的事件。

当前年龄：${age}岁
世界设定：${world.name}
性别：${identity.gender}
种族：${identity.race}
当前属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}
**天赋说明：天赋是玩家自带的特性，不要在事件正文中反复提及天赋名称。天赋只需在后台默默影响事件的走向和结果——例如"过目不忘"让学习事件更容易成功，"天煞孤星"让社交事件更容易失败。天赋的存在感要低，只在相关事件的结果中自然体现。**
**属性变化规则：颜值、智力、体质、家境都可在日常事件中发生小幅变化（±1到±2）。体质代表健康——吃饭、锻炼、研究可提升体质；绝食、厌学、劳累会降低体质。在attrChanges中如实反映所有属性的变化。**
**日常事件的属性变化要丰富：一个事件可以同时影响多个属性（如颜值+1、智力+2），变化量可以是±1到±2。让事件对角色的塑造有明显的痕迹——比如"交了好运"可以同时提升家境和社交，"专注学习"可以大幅提升智力但微降颜值。在attrChanges中如实反映多个属性的变化。**
当前状态：金钱${resources.money} 职业${resources.career} 社交${resources.social}
之前的事件：${recentEvents || '无'}
${decisionContext}

【文风要求】采用"宏大的温暖"叙事风格——参考轻小说作家"青空乐章"的文风：
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

写作要求：
1. 生成1个事件的描述（中文，20-80字）
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
{"content":"事件内容...","attrChanges":{},"resources":{},"isDecision":true,"decision":{"prompt":"你决定：","options":[{"id":"a","text":"选项A","hint":"风险高但回报大"},{"id":"b","text":"选项B","hint":"稳妥路线"},{"id":"c","text":"选项C","hint":"荒诞但有趣"}],"allowFreeInput":true}}

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
1. 生成8个天赋，每个天赋包含 name（中文名，2-5字）、description（一句话描述效果，10-20字）、rarity（稀有度：common/rare/epic/legendary 之一）
2. 天赋必须与世界设定、种族强相关——修仙世界写灵根修炼，赛博世界写义体骇客，绝不混杂
3. 稀有度分布：至少2个common，2个rare，1-2个epic，0-1个legendary
4. 天赋名称要有创意、有意境，不要千篇一律
5. 天赋描述要具体，说明它如何影响人生走向
6. 如果种族是非人类（如龙、兽人、精灵等），天赋要体现种族特色

只返回JSON，格式如下：
{"talents":[{"name":"天赋名","description":"描述","rarity":"common"}]}

只返回JSON，不要其他内容。`;
}
