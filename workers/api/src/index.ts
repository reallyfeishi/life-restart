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

const TINGYUAN_CHARACTERS = '花小猪, Asterainana(小男娘), 安叶, 小奶爱好者苏顺蓝, 河百大板面, 柏林以西, 洱月, 怜(可怜npc), 泪目(欺负对象), 抹茶干层蛋糕(小男娘), 耀斑, 香蕉你个巴拉, kk, InkLeaF, 狐雨, kitasan, 莉莉丝(老师), 冽影, 蟠桃, 怜「片翼の白鷺」, 自定义僵尸, [被窝里进蛇了, 我说蛇在里面], 两脚猫(老师), 子涵, 阔乐, Fomalhaut, 蚯蚓, 佳非猫, Alsetsune, Plus, 飞矢(是一条鱼), 汐洛';

function buildTingyuanEventRules(playingAs?: string): string {
  const base = `**【庭院世界观·角色名单——极其重要】以下是庭院中所有成员（括号内为特殊身份）：\n${TINGYUAN_CHARACTERS}\n\n**【庭院互动规则——极其重要】**\n1. 所有事件必须发生在庭院世界观内，涉及上述成员之间的互动\n2. 事件必须有至少2个角色参与（玩家角色+至少1个其他成员），绝不能写单人独角戏\n3. 带有括号身份的角色（如莉莉丝是老师、飞矢是一条鱼、泪目是欺负对象、怜是可怜npc），事件中要自然体现其身份特点\n4. 背景锁定为中世纪魔法世界观，事件风格应符合奇幻魔法氛围\n5. 成员之间要有丰富的互动关系：师徒、朋友、对手、欺负与被欺负、暧昧、恶作剧等\n6. 事件中的角色互动要符合各自的性格和身份，不要OOC（out of character）`;
  if (playingAs) {
    return base + `\n7. 玩家扮演的角色是"${playingAs}"，事件必须以"${playingAs}"为第一视角展开`;
  }
  return base;
}
function buildBackgroundPrompt(
  world: { id: string; name: string; description: string },
  identity: { gender: string; race: string; extraInfo: string; playingAs?: string },
  talents: { name: string }[],
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number }
) {
  const isTingyuan = world.id === 'special_tingyuan';
  const tingyuanBlock = isTingyuan ? `\n\n${buildTingyuanBackgroundBlock(identity.playingAs)}` : '';
  const playingAsText = identity.playingAs
    ? `**你扮演的角色：${identity.playingAs}**。你就是这个角色，所有事件以你的视角展开，用"你"来叙述。`
    : '';
  const raceAwareBg = `

**【种族感知——极其重要】当前种族为"${identity.race}"。请根据种族特性描写其生活环境与成长节奏：
- 长寿种族（吸血鬼、精灵、龙裔等）的居所和生活方式应与人类截然不同
- 环境描写要体现种族特色（精灵的古树花海、吸血鬼的古堡夜色、龙裔的山脉遗迹等）
- 成长节奏要符合种族的生命历程，不要用人类的"上学-工作-结婚"模式套用所有种族
`;
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成一段背景故事。

世界设定：${world.name} - ${world.description}${tingyuanBlock}
性别：${identity.gender}
种族：${identity.race}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}
初始属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
补充信息：${identity.extraInfo || '无'}
${playingAsText}${raceAwareBg}

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

function buildTingyuanBackgroundBlock(playingAs?: string): string {
  const base = `\n\n**【庭院世界观·角色名单——极其重要】以下是庭院中所有成员（括号内为特殊身份）：\n${TINGYUAN_CHARACTERS}\n\n**【庭院背景规则——极其重要】**\n1. 背景故事必须发生在庭院世界观内，体现上述成员之间的关系\n2. 带有括号身份的角色（如莉莉丝是老师、飞矢是一条鱼），要自然体现其身份特点\n3. 背景锁定为中世纪魔法世界观，文风应符合奇幻魔法氛围`;
  if (playingAs) {
    return base + `\n4. 玩家扮演的角色是"${playingAs}"，背景故事必须以"${playingAs}"的视角展开`;
  }
  return base;
}

function buildEventPrompt(
  age: number,
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number },
  talents: { name: string }[],
  events: { age: number; content: string }[],
  world: { id: string; name: string },
  identity: { gender: string; race: string; playingAs?: string },
  resources: { money: number; career: string; social: number },
  previousDecision?: { optionId: string; optionText: string; customInput: string }
) {
  const recentEvents = events.slice(-10).map((e: { age: number; content: string }) => `${e.age}岁：${e.content}`).join('\n');
  const decisionContext = previousDecision
    ? `上一次选择：玩家明确选择了 "${previousDecision.optionText}"。新事件必须明确反映这个选择的具体后果——绝对不能写成像是选了其他选项的结果。`
    : '';
  const playingAsText = identity.playingAs
    ? `**你扮演的角色：${identity.playingAs}**。事件必须围绕这个角色展开，以"你"的视角叙述，你就是${identity.playingAs}。**`
    : '';
  const tingyuanBlock = world.id === 'special_tingyuan' ? `\n\n${buildTingyuanEventRules(identity.playingAs)}` : '';

  const raceAwarenessBlock = `

**【种族感知——极其重要】当前种族为"${identity.race}"。你必须根据这个种族的本质特征来生成事件，每个种族都是独特的：
1. **寿命与成长节奏**：根据种族判断寿命范围（吸血鬼数百年、精灵上千年、人类约80年、仿生人理论上不朽等），并据此描写成长节奏。长寿种族的"十年"可能只是短暂瞬间，人类的一个月对精灵来说只是眨眼。
2. **成长阶段**：不同种族的成长阶段不同。精灵可能100岁才成年，吸血鬼可能转变后就不再衰老。用种族特有的成长描述，不要套用人类的"上学-工作-结婚"模式。
3. **生活环境**：根据种族描写适宜的环境。精灵的居所应有古树、花海、月光、溪流等生命气息；吸血鬼可能生活在古堡、夜色、城堡深处；龙裔可能居住在火山、山脉、遗迹；仿生人可能在都市、实验室、科技设施。**环境描写要体现种族特色，绝不能千篇一律**。
4. **种族能力与弱点**：吸血鬼怕阳光银器但拥有超自然力量，精灵擅长自然魔法但可能不擅铁器，龙裔有龙族血脉但可能傲慢，仿生人不怕疾病但可能依赖能源。事件中可以自然体现这些特性。
5. **社交与文化**：长寿种族可能对时间有不同的感知——百年不见、岁月淡漠、对短暂事物的珍视等。他们的社交节奏、情感表达方式应与人类不同。
6. **【种族≠属性偏向——极其重要】种族特性不意味着属性增长的偏向！龙裔不一定要一直加体质——龙也可以有高智力（博学古老）、高颜值（龙族威严之美）、高家境（龙族宝藏/地位）。精灵不一定只加颜值——精灵也可以有高智力（古老智慧）、高体质（自然力量）、高家境（精灵王国财富）。种族只是背景设定，不影响四属性平衡（25%智力、25%体质、25%颜值、25%家境）的分布要求。绝对不要因为种族是龙族就一直写体质相关事件！**
7. **如果种族是人类**，则按正常的现代社会节奏生成事件即可。
`;
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成这一年发生的事件。

当前年龄：${age}岁（${getAgeStage(age)}）
世界设定：${world.name}
性别：${identity.gender}
种族：${identity.race}
${playingAsText}${raceAwarenessBlock}
当前属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
天赋：${talents.map((t: { name: string }) => t.name).join('、')}${tingyuanBlock}
**【属性变化规则——极其重要】每个事件必须在attrChanges中标注属性变化，变化必须与事件内容直接相关。**

**事件类型分布——极其重要：不要连续生成相同类型的事件！每 5 个事件中，四个属性都应该有正增长的机会。禁止连续 3 个事件都让同一个属性增加。**

**正负变化比例：大约 60% 的事件带来正增长，40% 带来负增长或无变化。不要每个事件都同时有正有负——有时只写正面，有时只写负面，有时中性过渡。**

变化幅度由当前属性值决定（S型成长曲线）：
- 属性 0-3（低）：容易变化，±1 到 ±2
- 属性 4-8（中）：变化适中，±0 到 ±2
- 属性 9-12（高）：变化放缓，±0 到 +1（正向），-1 到 -2（负向仍可能）
- 属性 13-15（极高）：正向几乎停滞（+0），但负向仍可能（-1 到 -2）

**四属性平衡——事件类型参考（每个类型大约占 25% 的事件）：**

1. **智力相关（约25%）**：学习读书、拜师学艺、解谜探索、研究发明、辩论思考、顿悟冥想、阅读古籍、破解谜题 | 负面：厌学荒废、被误导欺骗、知识遗忘
2. **体质相关（约25%）**：锻炼劳作、习武修行、饮食调养、游历跋涉、竞技比试、登山涉水 | 负面：生病受伤、劳累过度、饥寒交迫、中毒感染
3. **颜值相关（约25%）**：精心装扮、贵人赏识、气质蜕变、青春焕发、才艺展示、仪态修养 | 负面：风吹日晒、不修边幅、容颜受损、遭遇嫉妒
4. **家境相关（约25%）**：经商投资、贵人资助、意外之财、遗产继承、升职加薪、贵人提携 | 负面：投资失败、家道中落、遭遇诈骗、灾祸破财、挥霍浪费

**注意：每个事件只侧重一个属性的变化，不要每个事件都写"智力+1体质-1"这种固定搭配！事件应该围绕一个核心展开。**

**【恋爱/婚恋内容频率控制——极其重要】**
人生中的恋爱/婚恋/暧昧/相亲类事件要克制，占比不超过总事件的 10%。具体要求：
1. 不要连续生成恋爱相关事件——至少间隔 10 个事件以上
2. 人生中还有其他重要主题：事业、友情、亲情、学业、探索、成长、健康等——不要只围绕恋爱展开
3. 如果最近 5 个事件中已经出现过恋爱类事件，新事件绝对不要再涉及恋爱、邂逅、暧昧、相亲、告白等内容
4. 结婚类事件只在适龄且距离上一次恋爱事件足够远时才出现一次即可

注意：attrChanges 的值必须是数字（如 1, -1），不要用字符串（如 "+1"）。键名必须是"智力""体质""颜值""家境"，不要带数字或其他后缀。
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
2. 事件要与年龄、属性、天赋、种族、之前的事件逻辑连贯。天赋是潜在的背景影响，不要在故事正文中反复提及天赋名称——天赋的影响应该通过事件内容自然体现，而不是直接说"因为你有XX天赋所以..."
3. **叙述视角——极其重要：必须使用第一人称"我"来叙述**——事件以玩家自己的视角展开，用"我"来描述经历、感受和行动。绝对不要用"他""她"或第三人称来叙述玩家的行为
4. **如果上次有选择，新事件必须是该选择的直接后果**——承接上文的因果关系，不能脱节
4. 事件要真实、生动、有戏剧性，不要平淡过滤，但不可搞笑或荒诞
5. **死亡判定规则——极其重要：**
   - 首先判断种族的自然寿命。非人类种族的寿命远超人类（精灵数百年到上千年、吸血鬼数百年、龙裔更久等），${age}岁对${identity.race}来说属于什么阶段？请自行判断。
   - 只有在玩家处于该种族意义上的"极度衰老"（接近寿命极限）时，才可能出现自然死亡（衰老、疾病、力量衰退）。
   - 在任何其他情况下，死亡必须由重大抉择的失败后果驱动——玩家做出了高风险选择并失败才可能死亡，不能随机出现意外死亡。
   - **如果事件中玩家死亡，必须在 content 中明确写明具体的死因经过**——是什么事件、什么选择、什么后果导致了死亡，描写要具体、有画面感。
6. 年龄参考：当前${age}岁（${getAgeStage(age)}）。但对于非人类种族，这个年龄的实际意义由你根据种族特性判断。
7. **【反反复读禁令——极其重要】AI 生成的事件不能与之前的事件重复。检查之前的事件列表，确保新事件在以下方面与所有之前的事件不同：**
   - **场景不同**：不要在同一个地点反复描写
   - **事件不同**：不要连续几年写相似的事件
   - **描写不同**：不要使用相同或相似的词句
   - **视角不同**：从不同侧面描写人生——人际关系、事业、探索、内心感悟、外部环境变化等
   - 如果之前的某个主题已经写过 2 次以上，新事件必须切换到完全不同的主题
8. **老年/高寿事件指南**：当年纪较大时（60岁以上人类，或对应种族的高龄阶段），事件可以包括：
   - 回忆往事、传授经验给后辈、旧友重逢或故人离别
   - 身体的变化与适应、对生命意义的感悟与释然
   - 未完成心愿的追寻、与年轻时的自己的对话或对比
   - 环境变迁与时代更迭的观察
   - 不要连续多年写同一个场景或同一种描写方式
9. 在重要人生节点（如升学、就业、创业、结婚、重大抉择等，约20%概率）生成选择事件。恋爱/婚恋类事件出现频率要低——大约每15-20个事件中只出现1次，不要频繁描写恋爱、相亲、邂逅、暧昧等内容
10. **选择事件的选项必须从当前事件中自然衍生**——选项是玩家对该事件不同应对方式，必须与事件情节直接相关，不能脱离上下文
11. 在末尾用JSON格式标注变化，格式如下：
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

function getAgeStage(age: number): string {
  if (age < 10) return '幼年';
  if (age < 20) return '少年';
  if (age < 30) return '青年';
  if (age < 50) return '壮年';
  if (age < 70) return '中年';
  if (age < 100) return '老年';
  if (age < 150) return '高寿';
  if (age < 200) return '极高寿';
  return '难以想象的高龄';
}

function buildTalentPrompt(world: { id: string; name: string; description: string }, gender: string, race: string) {
  const isTingyuan = world.id === 'special_tingyuan';
  const tingyuanBlock = isTingyuan ? `\n\n**【庭院世界观·角色名单】**\n${TINGYUAN_CHARACTERS}\n\n**【庭院天赋规则——极其重要】**\n1. 背景锁定为中世纪魔法世界观，天赋必须符合魔法/奇幻/宫廷风格\n2. 天赋可以体现与上述庭院成员的关系（如"莉莉丝的得意门生"、"飞矢的鱼语者"等）\n3. 绝对不要出现赛博、科幻、现代等与世界观不符的词汇` : '';
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成天赋卡牌。

世界设定：${world.name} - ${world.description}${tingyuanBlock}
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
7. 天赋应反映种族的特性：长寿种族的"岁月感知"、精灵的"自然亲和"、吸血鬼的"暗夜之力"、龙裔的"龙血觉醒"等

只返回JSON，格式如下：
{"talents":[{"name":"天赋名","description":"描述","rarity":"common"}]}

只返回JSON，不要其他内容。`;
}
