/**
 * ASTRA: Aether Guardians — Stage Data
 */
export const STAGE_DATA = {
  stage_1: {
    id: 'stage_1',
    name: 'บทที่ 1: การตื่นรู้',
    description: 'ปกป้องคริสตัลอีเธอร์จากฝูงอสูรโกลาหลที่เข้ามารุกราน',
    backgroundImage: '/assets/01_stage.png',
    // Stage 1 follows the composition of its background image. All positions
    // are normalized (0 = left/top edge, 1 = right/bottom edge), so they
    // remain aligned when the map is scaled.
    coordinateSystem: 'normalized',
    mapSize: { width: 1280, height: 720 },
    spawn: { x: 0.055, y: 0.635 },
    core: { x: 0.862, y: 0.120 },
    coreHP: 20,
    startingAether: 300,
    paths: [
      // Upper road: from the breach, through the northern courtyard, to the Base.
      [
        { x: 0.055, y: 0.635 },
        { x: 0.135, y: 0.615 },
        { x: 0.230, y: 0.575 },
        { x: 0.305, y: 0.510 },
        { x: 0.320, y: 0.435 },
        { x: 0.390, y: 0.370 },
        { x: 0.490, y: 0.305 },
        { x: 0.565, y: 0.235 },
        { x: 0.650, y: 0.215 },
        { x: 0.725, y: 0.265 },
        { x: 0.810, y: 0.270 },
        { x: 0.875, y: 0.215 },
        { x: 0.862, y: 0.120 }
      ],
      // Lower road: loops around the southern walls before returning to the Base.
      [
        { x: 0.055, y: 0.635 },
        { x: 0.135, y: 0.615 },
        { x: 0.230, y: 0.575 },
        { x: 0.305, y: 0.590 },
        { x: 0.375, y: 0.640 },
        { x: 0.460, y: 0.690 },
        { x: 0.540, y: 0.705 },
        { x: 0.610, y: 0.680 },
        { x: 0.680, y: 0.635 },
        { x: 0.750, y: 0.600 },
        { x: 0.815, y: 0.550 },
        { x: 0.855, y: 0.485 },
        { x: 0.865, y: 0.415 },
        { x: 0.850, y: 0.345 },
        { x: 0.835, y: 0.280 },
        { x: 0.862, y: 0.120 }
      ]
    ],
    towerSpots: [
      { id: 'tower_01', x: 0.379, y: 0.297, radius: 0.035 },
      { id: 'tower_02', x: 0.649, y: 0.356, radius: 0.035 },
      { id: 'tower_03', x: 0.785, y: 0.398, radius: 0.035 },
      { id: 'tower_04', x: 0.719, y: 0.553, radius: 0.035 },
      { id: 'tower_05', x: 0.479, y: 0.708, radius: 0.035 },
      { id: 'tower_06', x: 0.345, y: 0.603, radius: 0.035 },
      { id: 'tower_07', x: 0.279, y: 0.460, radius: 0.035 }
    ],
    waves: [
      {
        groups: [
          { type: 'imp', count: 5, pathIndex: 'random', delay: 1.5 }
        ]
      },
      {
        groups: [
          { type: 'imp', count: 8, pathIndex: 'random', delay: 1.0 },
          { type: 'rat', count: 3, pathIndex: 'random', delay: 0.5 }
        ]
      },
      {
        groups: [
          { type: 'rat', count: 10, pathIndex: 'random', delay: 0.3 }
        ]
      },
      {
        groups: [
          { type: 'golem', count: 2, pathIndex: 'random', delay: 3.0 },
          { type: 'imp', count: 5, pathIndex: 'random', delay: 1.0 }
        ]
      },
      {
        groups: [
          { type: 'boss', count: 1, pathIndex: 'random', delay: 0 }
        ]
      }
    ]
  },
  stage_2: {
    id: 'stage_2',
    name: 'บทที่ 2: ทางแยกแห่งชะตากรรม',
    description: 'ศัตรูบุกเข้ามาจากสองเส้นทางพร้อมกัน เตรียมการป้องกันให้ดี!',
    corePosition: { col: 5, row: 8 },
    coreHP: 20,
    startingAether: 350,
    tileSize: 64,
    grid: {
      cols: 10,
      rows: 10,
      tiles: [
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 2, 2, 2, 2, 2, 0, 1],
        [0, 1, 0, 2, 0, 0, 0, 2, 0, 1],
        [0, 1, 0, 2, 0, 0, 0, 2, 0, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 2, 2, 2, 2, 1, 2, 2, 2, 0],
        [0, 0, 0, 0, 2, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 2, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    },
    paths: [
      [{ col: 1, row: 0 }, { col: 1, row: 4 }, { col: 5, row: 4 }, { col: 5, row: 8 }],
      [{ col: 9, row: 0 }, { col: 9, row: 4 }, { col: 5, row: 4 }, { col: 5, row: 8 }]
    ],
    waves: [
      { groups: [{ type: 'imp', count: 5, pathIndex: 0, delay: 1.5 }] },
      { groups: [{ type: 'imp', count: 5, pathIndex: 1, delay: 1.5 }] },
      { groups: [{ type: 'imp', count: 4, pathIndex: 0, delay: 1.5 }, { type: 'imp', count: 4, pathIndex: 1, delay: 1.5 }] },
      { groups: [{ type: 'rat', count: 6, pathIndex: 0, delay: 0.8 }, { type: 'rat', count: 6, pathIndex: 1, delay: 0.8 }] },
      { groups: [{ type: 'golem', count: 1, pathIndex: 0, delay: 0 }, { type: 'golem', count: 1, pathIndex: 1, delay: 0 }] },
      { groups: [{ type: 'imp', count: 8, pathIndex: 0, delay: 1.0 }, { type: 'rat', count: 5, pathIndex: 1, delay: 0.5 }] },
      { groups: [{ type: 'rat', count: 5, pathIndex: 0, delay: 0.5 }, { type: 'imp', count: 8, pathIndex: 1, delay: 1.0 }] },
      { groups: [{ type: 'golem', count: 2, pathIndex: 0, delay: 2.0 }, { type: 'golem', count: 2, pathIndex: 1, delay: 2.0 }] },
      { groups: [{ type: 'rat', count: 10, pathIndex: 0, delay: 0.5 }, { type: 'rat', count: 10, pathIndex: 1, delay: 0.5 }] },
      { groups: [{ type: 'boss', count: 1, pathIndex: 0, delay: 0 }, { type: 'boss', count: 1, pathIndex: 1, delay: 0 }] }
    ]
  }
};
