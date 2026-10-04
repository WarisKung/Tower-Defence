/**
 * ASTRA: Aether Guardians — Unit Data
 */
export const UNIT_DATA = {
  archer: {
    unit_id: 'archer',
    name: 'เอลิเรีย, นักธนูวายุ',
    class: 'นักธนู',
    rarity: 'R',
    element: 'ลม',
    description: 'โจมตีระยะไกลด้วยความเร็วสูง สามารถโจมตีศัตรูที่บินได้',
    base_stats: {
      hp: 120,
      atk: 25,
      def: 5,
      attack_speed: 1.0,
      range: 7,
      cost: 50
    }
  },
  knight: {
    unit_id: 'knight',
    name: 'กาเรธ, กำแพงเหล็ก',
    class: 'อัศวิน',
    rarity: 'SR',
    element: 'ดิน',
    description: 'บล็อกการเคลื่อนไหวศัตรูทั้งหมด โดยจำนวนบล็อกจะลดลงเมื่อศัตรูเข้ามาในระยะ',
    base_stats: {
      hp: 100,
      atk: 0,
      def: 0,
      attack_speed: 1.0,
      range: 3,
      cost: 80
    }
  },
  mage: {
    unit_id: 'mage',
    name: 'อิกนิส, ผู้ทอประกายไฟ',
    class: 'นักเวทย์',
    rarity: 'SR',
    element: 'ไฟ',
    description: 'โจมตีศัตรูเป็นกลุ่มด้วยพลังเวทย์มหาศาล',
    base_stats: {
      hp: 100,
      atk: 40,
      def: 5,
      attack_speed: 0.7,
      range: 5,
      cost: 100
    }
  },
  priest: {
    unit_id: 'priest',
    name: 'ลูมิน่า, ผู้นำแสงสว่าง',
    class: 'นักบวช',
    rarity: 'R',
    element: 'แสง',
    description: 'ฟื้นฟูพลังชีวิตให้เพื่อนร่วมทีม และเพิ่มจำนวนครั้งการบล็อกให้อัศวิน พร้อมบัพพลังโจมตี',
    base_stats: {
      hp: 150,
      atk: 15, // Acts as heal/buff amount
      def: 10,
      attack_speed: 0.5,
      range: 12,
      cost: 60
    }
  },
  assassin: {
    unit_id: 'assassin',
    name: 'เซน, ดาบเงา',
    class: 'นักฆ่า',
    rarity: 'SSR',
    element: 'มืด',
    description: 'โจมตีเป้าหมายเดี่ยวอย่างรุนแรง ไม่สามารถฆ่าบอสในครั้งเดียวได้',
    base_stats: {
      hp: 180,
      atk: 50,
      def: 10,
      attack_speed: 1.5,
      range: 3,
      cost: 120
    }
  },
  summoner: {
    unit_id: 'summoner',
    name: 'ออร่า, ผู้นำทางวิญญาณ',
    class: 'ผู้อัญเชิญ',
    rarity: 'SSR',
    element: 'อีเธอร์',
    description: 'โจมตีและบล็อกศัตรูทั้งหมด จำนวนการบล็อกจะเพิ่มขึ้นเองเมื่อเวลาผ่านไป',
    base_stats: {
      hp: 140,
      atk: 25,
      def: 8,
      attack_speed: 1.0,
      range: 3,
      cost: 150
    }
  }
};
