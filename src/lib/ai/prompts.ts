export function buildBackgroundPrompt(world: { name: string; description: string }, identity: { gender: string; race: string; extraInfo: string }, talents: { name: string }[], attributes: { appearance: number; intelligence: number; constitution: number; wealth: number }) {
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成一段背景故事。

世界设定：${world.name} - ${world.description}
性别：${identity.gender}
种族：${identity.race}
天赋：${talents.map(t => t.name).join('、')}
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

export function buildEventPrompt(
  age: number,
  attributes: { appearance: number; intelligence: number; constitution: number; wealth: number },
  talents: { name: string }[],
  events: { age: number; content: string }[],
  world: { name: string },
  identity: { gender: string; race: string },
  resources: { money: number; career: string; social: number },
  previousDecision?: { optionId: string; optionText: string; customInput: string }
) {
  const recentEvents = events.slice(-5).map(e => `${e.age}岁：${e.content}`).join('\n');
  const decisionContext = previousDecision
    ? `上一次选择：玩家明确选择了 "${previousDecision.optionText}"。新事件必须明确反映这个选择的具体后果——绝对不能写成像是选了其他选项的结果。`
    : '';
  return `你是一个创意写作助手。请为一个"人生重开"游戏生成这一年发生的事件。

当前年龄：${age}岁
世界设定：${world.name}
性别：${identity.gender}
种族：${identity.race}
当前属性：颜值${attributes.appearance} 智力${attributes.intelligence} 体质${attributes.constitution} 家境${attributes.wealth}
天赋：${talents.map(t => t.name).join('、')}
**天赋说明：天赋是玩家自带的特性，不要在事件正文中反复提及天赋名称。天赋只需在后台默默影响事件的走向和结果——例如"过目不忘"让学习事件更容易成功，"天煞孤星"让社交事件更容易失败。天赋的存在感要低，只在相关事件的结果中自然体现。**
**属性变化规则：颜值、智力可以在日常事件中发生小幅变化（±1），但体质只能在重大抉择事件中发生变化——不要在普通事件的attrChanges中写体质变化！体质代表健康/寿命，只有通过重大选择的结果（如冒险受伤、极限挑战等）才能增减。**
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
4. 事件要真实、生动、有戏剧性，不要平淡过滤，但也不可搞笑或荒诞
5. **死亡判定规则：除非玩家60岁以上（自然老死），否则死亡必须由重大抉择的后果驱动——玩家做出了高风险选择并失败才可能死亡，不能随机出现意外死亡。让玩家死得明明白白。**
6. 如果年龄较大（60岁以上），要考虑健康衰退和自然死亡
7. 在重要人生节点（如升学、就业、恋爱、结婚、创业、重大抉择等）生成选择事件（约30%概率），在JSON中添加decision字段
8. **选择事件的选项必须从当前事件中自然衍生**——选项是玩家对该事件不同应对方式，必须与事件情节直接相关，不能脱离上下文
9. 在末尾用JSON格式标注变化，格式如下：
{"content":"事件内容...","attrChanges":{},"resources":{"money":0,"career":"","social":0},"isDecision":false}

选择事件格式（仅在重要节点使用）：
{"content":"事件内容...","attrChanges":{},"resources":{},"isDecision":true,"decision":{"prompt":"你决定：","options":[{"id":"a","text":"选项A","hint":"风险高但回报大"},{"id":"b","text":"选项B","hint":"稳妥路线"},{"id":"c","text":"选项C","hint":"荒诞但有趣"}],"allowFreeInput":true}}

attrChanges只写变化的值（正负均可），不变的不写。
resources中career为空字符串表示不变，money和social写变化量。

只返回JSON，不要其他内容。`;
}
