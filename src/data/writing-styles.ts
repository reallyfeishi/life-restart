export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  prompt: string;
}

export const WRITING_STYLES: WritingStyle[] = [
  {
    id: 'warm_novel',
    name: '轻小说·温暖',
    description: '温暖柔软的叙事，如春风拂面',
    icon: '🌸',
    color: '#e8a0b0',
    prompt: `【文风要求】
采用"宏大的温暖"叙事风格——参考轻小说作家"青空乐章"的文风：
- 中长句为主，短句点睛：用40-80字的细腻句子铺景入情，关键处用极短句形成对比（如"起风了——"）
- 词汇偏好：温暖、柔软、轻盈、安宁、轻轻、慢慢、淡淡、安心、温馨、柔和、浅浅等温暖词汇
- 自然意象：风、阳光、月光、星光、溪水、草地、树叶、云朵等作为情感外化
- 身体感受：指尖、眼瞳、发丝、脸颊、手心等细节描写
- 语气轻柔但不软弱，常用"或许""大概""总觉得"但底色坚定
- 幽默适度：轻度自嘲+生活化吐槽，不可搞笑或无厘头，整体温暖可爱
- 避免：血腥、残酷、冷酷、搞笑、夸张搞笑的比喻`,
  },
  {
    id: 'cold_realistic',
    name: '冷峻·写实',
    description: '冷峻克制的叙事，直面人生真相',
    icon: '❄️',
    color: '#5a7a9a',
    prompt: `【文风要求】
采用"冷峻写实"叙事风格：
- 短句为主，白描手法：用简洁克制的句子陈述事实，避免华丽修饰
- 词汇偏好：冷静、客观、沉默、阴影、灰暗、冰冷、坚硬、锋利、沉重等冷色调词汇
- 自然意象：寒风、冬雪、暗夜、枯枝、铁锈、尘埃、雨幕、阴影等冷色意象
- 身体感受：冰冷的手指、僵硬的面容、沉重的呼吸、刺痛等具象感受
- 语气客观但不冷漠，常用陈述句和判断句，不带过多抒情
- 挫折与无奈：直面人生的残酷与无奈，但不渲染绝望
- 幽默：克制的讽刺+冷幽默，不搞笑不无厘头
- 避免：过度抒情、温暖治愈、鸡汤式感悟、夸张乐观的结局`,
  },
];

export function getWritingStylePrompt(id: string): string {
  const style = WRITING_STYLES.find(s => s.id === id);
  return style?.prompt || WRITING_STYLES[0].prompt;
}
