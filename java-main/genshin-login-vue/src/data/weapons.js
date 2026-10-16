/**
 * 武器演示数据（纯前端，供武器库页使用）
 * 真实数据接入时替换为后端接口即可。
 */

// 武器类型（装备类型）
export const WEAPON_TYPES = ['单手剑', '双手剑', '弓', '法器', '长柄武器']

export const WEAPON_TYPE_COLOR = {
  单手剑: '#9be8a8',
  双手剑: '#e8c87a',
  弓: '#7ec8ff',
  法器: '#c4a0ff',
  长柄武器: '#ff9a5a',
}

export const WEAPONS = [
  { name: '天空之刃', type: '单手剑', rarity: 5, desc: '高泛用单手剑，充能加成与移速提升兼具。' },
  { name: '风鹰剑', type: '单手剑', rarity: 5, desc: '物理输出向，触发额外范围伤害。' },
  { name: '铁蜂刺', type: '单手剑', rarity: 4, desc: '元素精通加成，适合反应队副C。' },
  { name: '狼的末路', type: '双手剑', rarity: 5, desc: '攻击力与全队增益兼备的双手剑。' },
  { name: '天空之傲', type: '双手剑', rarity: 5, desc: '兼具体力与增伤的通用双手剑。' },
  { name: '阿莫斯之弓', type: '弓', rarity: 5, desc: '蓄力箭特化，甘雨毕业弓。' },
  { name: '终末嗟叹之诗', type: '弓', rarity: 5, desc: '辅助向弓，提供元素精通与增益。' },
  { name: '祭礼弓', type: '弓', rarity: 4, desc: '技能刷新机制，功能性强。' },
  { name: '四风原典', type: '法器', rarity: 5, desc: '移速叠层增伤，法系站场优选。' },
  { name: '天空之卷', type: '法器', rarity: 5, desc: '元素伤害与续航兼顾的法器。' },
  { name: '护摩之杖', type: '长柄武器', rarity: 5, desc: '生命转攻击，胡桃/魈核心武器。' },
  { name: '和璞鸢', type: '长柄武器', rarity: 5, desc: '精通与增伤兼具的长柄武器。' },
]
