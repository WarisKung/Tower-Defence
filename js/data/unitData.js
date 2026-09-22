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
      attack_speed: 1.2,
      range: 4,
      cost: 50
    }
  },
  knight: {
    unit_id: 'knight',
    name: 'กาเรธ, กำแพงเหล็ก',
    class: 'อัศวิน',
    rarity: 'SR',
    element: 'ดิน',
    description: 'บล็อกการเคลื่อนที่ของศัตรูได้สูงสุด 3 ตัว เหมาะสำหรับเป็นตัวชน',
    base_stats: {
      hp: 350,
      atk: 15,
      def: 25,
      attack_speed: 0.8,
      range: 1.5,
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
      range: 3.5,
      cost: 100
    }
  },
  priest: {
    unit_id: 'priest',
    name: 'ลูมิน่า, ผู้นำแสงสว่าง',
    class: 'นักบวช',
    rarity: 'R',
    element: 'แสง',
    description: 'ฟื้นฟูพลังชีวิตให้กับเพื่อนร่วมทีมที่บาดเจ็บในระยะ',
    base_stats: {
      hp: 150,
      atk: 30, // Acts as heal amount
      def: 10,
      attack_speed: 0.5,
      range: 3,
      cost: 60
    }
  },
  assassin: {
    unit_id: 'assassin',
    name: 'เซน, ดาบเงา',
    class: 'นักฆ่า',
    rarity: 'SSR',
    element: 'มืด',
    description: 'โจมตีเป้าหมายเดี่ยวอย่างรุนแรง มีโอกาสติดคริติคอลสูงมาก',
    base_stats: {
      hp: 180,
      atk: 45,
      def: 10,
      attack_speed: 1.5,
      range: 2.5,
      cost: 120
    }
  },
  summoner: {
    unit_id: 'summoner',
    name: 'ออร่า, ผู้นำทางวิญญาณ',
    class: 'ผู้อัญเชิญ',
    rarity: 'SSR',
    element: 'อีเธอร์',
    description: 'อัญเชิญโกเลมออกมาช่วยบล็อกศัตรูและโจมตี',
    base_stats: {
      hp: 140,
      atk: 20,
      def: 8,
      attack_speed: 1.0,
      range: 3,
      cost: 150
    }
  }
};
