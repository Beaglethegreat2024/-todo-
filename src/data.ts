import { GachaItem, BeadPet } from './types';

export const GACHA_ITEMS: GachaItem[] = [
  // Outfits / Accessories
  {
    id: 'hat_detective',
    type: 'outfit',
    name: '侦探小礼帽',
    description: '戴上它，你就是拼豆界最聪明的名侦探！',
    icon: '🕵️',
    rarity: 'rare',
    color: 'from-amber-500 to-amber-700',
    assetType: 'hat'
  },
  {
    id: 'hat_wizard',
    type: 'outfit',
    name: '魔法巫师帽',
    description: '神秘的紫色巫师帽，据说能悄悄帮你完成待办。',
    icon: '🧙',
    rarity: 'epic',
    color: 'from-purple-500 to-indigo-700',
    assetType: 'hat'
  },
  {
    id: 'glass_cool',
    type: 'outfit',
    name: '酷酷墨镜',
    description: '遮住双眼，待办的压力就追不上我。',
    icon: '🕶️',
    rarity: 'common',
    color: 'from-slate-400 to-slate-600',
    assetType: 'glasses'
  },
  {
    id: 'wing_angel',
    type: 'outfit',
    name: '天使小翅膀',
    description: '悬挂桌宠的绝配，让自推在桌面上轻盈起舞！',
    icon: '👼',
    rarity: 'epic',
    color: 'from-yellow-200 to-amber-400',
    assetType: 'accessory'
  },
  {
    id: 'crown_gold',
    type: 'outfit',
    name: '璀璨小皇冠',
    description: '授予今天全勤完成待办的事项之王！',
    icon: '👑',
    rarity: 'epic',
    color: 'from-yellow-400 to-orange-500',
    assetType: 'hat'
  },
  {
    id: 'ear_cat',
    type: 'outfit',
    name: '粉嫩猫耳发箍',
    description: '没有人能拒绝可爱的猫耳，自推也一样！',
    icon: '🐱',
    rarity: 'rare',
    color: 'from-pink-400 to-rose-500',
    assetType: 'accessory'
  },
  {
    id: 'scarf_red',
    type: 'outfit',
    name: '温暖红围巾',
    description: '在空调房或寒冷冬日里，给自推最贴心的温度。',
    icon: '🧣',
    rarity: 'common',
    color: 'from-red-400 to-red-600',
    assetType: 'clothing'
  },
  {
    id: 'ribbon_pink',
    type: 'outfit',
    name: '元气少女蝴蝶结',
    description: '粉粉嫩嫩的蝴蝶结，自推可爱度瞬间翻倍。',
    icon: '🎀',
    rarity: 'common',
    color: 'from-pink-300 to-pink-500',
    assetType: 'accessory'
  },
  {
    id: 'item_boba',
    type: 'outfit',
    name: '大杯黑糖珍珠奶茶',
    description: '今日甜度已超标，自推表示可以一口气写十个待办！',
    icon: '🧋',
    rarity: 'common',
    color: 'from-orange-300 to-amber-600',
    assetType: 'accessory'
  },
  {
    id: 'item_gamepad',
    type: 'outfit',
    name: '迷你手持红白机',
    description: '劳逸结合！给自推一台可以随时摸鱼的游戏机。',
    icon: '🎮',
    rarity: 'rare',
    color: 'from-cyan-400 to-blue-600',
    assetType: 'accessory'
  },

  // Room Decorations
  {
    id: 'dec_gaming_chair',
    type: 'decoration',
    name: '极客电竞太空舱椅',
    description: '人体工学，自推坐上去就不想起来。',
    icon: '💺',
    rarity: 'rare',
    color: 'from-indigo-400 to-purple-600',
    assetType: 'furniture'
  },
  {
    id: 'dec_plant',
    type: 'decoration',
    name: '护眼龟背竹盆栽',
    description: '绿意盎然，为自推的小家带来大自然的味道。',
    icon: '🌿',
    rarity: 'common',
    color: 'from-emerald-400 to-green-600',
    assetType: 'plant'
  },
  {
    id: 'dec_lava_lamp',
    type: 'decoration',
    name: '赛博朋克熔岩灯',
    description: '缓缓流动的泡泡，最适合深夜写代码或做企划。',
    icon: '💡',
    rarity: 'common',
    color: 'from-orange-400 to-rose-600',
    assetType: 'furniture'
  },
  {
    id: 'dec_plush_bear',
    type: 'decoration',
    name: '治愈系巨型熊熊玩偶',
    description: '软绵绵、超好捏，是自推最信赖的倾听者。',
    icon: '🧸',
    rarity: 'common',
    color: 'from-amber-400 to-amber-600',
    assetType: 'toy'
  },
  {
    id: 'dec_mini_mac',
    type: 'decoration',
    name: '复古麦金塔128K',
    description: '向经典致敬！屏幕上好像正闪烁着待办完成的快乐波形。',
    icon: '🖥️',
    rarity: 'epic',
    color: 'from-slate-300 to-slate-500',
    assetType: 'furniture'
  },
  {
    id: 'dec_rug_star',
    type: 'decoration',
    name: '幸运流星蓬松地毯',
    description: '铺在地上，自推踩在上面就像踩在云端。',
    icon: '⭐',
    rarity: 'common',
    color: 'from-yellow-300 to-yellow-500',
    assetType: 'furniture'
  },
  {
    id: 'dec_window_rain',
    type: 'decoration',
    name: '落雨白噪音景观窗',
    description: '窗外正下着淅淅沥沥的雨，特别有专注学习的气氛。',
    icon: '🌧️',
    rarity: 'rare',
    color: 'from-blue-400 to-indigo-500',
    assetType: 'wallpaper'
  },
  {
    id: 'dec_poster_anime',
    type: 'decoration',
    name: '二次元限定痛海报',
    description: '墙上一定要贴自推最爱的动漫海报！',
    icon: '🖼️',
    rarity: 'common',
    color: 'from-pink-400 to-purple-500',
    assetType: 'wallpaper'
  },
  {
    id: 'dec_neon_heart',
    type: 'decoration',
    name: '心动粉红霓虹挂件',
    description: '散发着暧昧又温暖的微光，代表对自推永恒的爱。',
    icon: '💖',
    rarity: 'rare',
    color: 'from-pink-400 to-rose-600',
    assetType: 'wallpaper'
  },
  {
    id: 'dec_bookshelf',
    type: 'decoration',
    name: '原木多功能小书架',
    description: '整齐地码着自推爱看的小说和手办。',
    icon: '📚',
    rarity: 'common',
    color: 'from-yellow-600 to-amber-800',
    assetType: 'furniture'
  },
  {
    id: 'dec_snack_box',
    type: 'decoration',
    name: '无限续命快乐零食车',
    description: '可乐、薯片、辣条应有尽有，随时给自推投喂！',
    icon: '🍿',
    rarity: 'common',
    color: 'from-red-400 to-orange-500',
    assetType: 'toy'
  }
];

// Helper to construct a default cute pixel art cat (16x16)
// T = Transparent (null)
// W = White (#FFFFFF)
// K = Black (#1E1E2E)
// P = Pink (#FFB5D0)
// G = Gray (#8E9AA8)
// Y = Yellow (#FFD043)
// O = Orange (#FF8E43)
const T = null;
const K = '#1E1E2E';
const W = '#FFFFFF';
const P = '#FFB5D0';
const G = '#A0AAB5';
const Y = '#FFD043';
const O = '#FF843D';

const DEFAULT_CAT_GRID: (string | null)[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T],
  [T, K, K, T, T, T, T, T, T, T, T, K, K, T, T, T],
  [K, P, P, K, T, T, T, T, T, T, K, P, P, K, T, T],
  [K, G, G, G, K, K, K, K, K, K, G, G, G, K, T, T],
  [K, G, G, G, G, G, G, G, G, G, G, G, G, K, T, T],
  [K, G, K, W, G, G, G, G, G, G, W, K, G, K, T, T],
  [K, G, W, K, G, G, G, G, G, G, K, W, G, K, T, T],
  [K, G, G, G, G, G, K, K, G, G, G, G, G, K, T, T],
  [T, K, G, G, G, P, K, K, P, G, G, G, K, T, T, T],
  [T, T, K, G, G, G, G, G, G, G, G, K, T, T, T, T],
  [T, T, T, K, G, G, G, G, G, G, K, T, T, T, T, T],
  [T, T, T, K, G, G, G, G, G, G, K, T, T, K, K, T],
  [T, T, K, G, G, G, G, G, G, G, G, K, T, K, O, K],
  [T, T, K, G, K, G, G, G, G, K, G, K, T, K, O, K],
  [T, T, T, K, T, K, K, K, K, T, K, T, T, T, K, T],
  [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]
];

export const DEFAULT_PET: BeadPet = {
  name: '小芝麻',
  description: '一只爱睡懒觉、喜欢陪你一起完成任务的经典拼豆灰猫。最喜欢黑糖珍珠奶茶！',
  gridSize: 16,
  beadGrid: DEFAULT_CAT_GRID,
  activeOutfitId: null,
  hunger: 100,
  lastInteracted: Date.now()
};
