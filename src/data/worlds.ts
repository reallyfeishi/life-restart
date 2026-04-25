import { World } from '@/types/world';

export const WORLDS: World[] = [
  { id: 'modern', name: '现代都市', description: '这垃圾人生，一秒也不想呆了', icon: '🏙️', color: '#4a6fa5' },
  { id: 'xianxia', name: '九州仙域', description: '炼气筑基，渡劫飞升成仙', icon: '⚔️', color: '#b8862e' },
  { id: 'transmigration', name: '墨海浮生', description: '一朝穿书，改写命运', icon: '📖', color: '#7c5cbf' },
  { id: 'palace', name: '朱门深宫', description: '红墙深处，步步为营', icon: '👑', color: '#c4883a' },
  { id: 'magic', name: '奥术大陆', description: '恭喜入学，你是一个巫师', icon: '🧙', color: '#5a8c5a' },
  { id: 'medieval', name: '铁与火的纪元', description: '权力的游戏，生存的赌注', icon: '🏰', color: '#8a857b' },
  { id: 'cyberpunk', name: '夜之城 2099', description: '义体改造，霓虹下求生', icon: '🤖', color: '#ac4bff' },
  { id: 'scifi', name: '银河纪元', description: '群星是征途，也是坟场', icon: '🚀', color: '#3080ff' },
  { id: 'wasteland', name: '废土末世', description: '文明倒计时，活着就是胜利', icon: '☢️', color: '#b05050' },
  { id: 'custom', name: '自定义世界', description: '描述你想要的世界...', icon: '✨', color: '#8a857b' },
];
