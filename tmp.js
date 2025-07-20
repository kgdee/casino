const effects = [
  { name: "2", type: "multiplier", value: 2 },
  { name: "5", type: "multiplier", value: 5 },
  { name: "10", type: "multiplier", value: 10 },
  { name: "7", type: "multiplier", value: 100 },
  { name: "J", type: "multiplier", value: 11 },
  { name: "Q", type: "multiplier", value: 12 },
  { name: "K", type: "multiplier", value: 15 },
  { name: "A", type: "multiplier", value: 20 },
  { type: "bonus", value: 32 },
  { type: "bonus", value: 35 },
];

for (let i = 0; i < 3; i++) {
  effects.push({ type: "bonus", value: itemDB.getItemByRarity([50, 500]).id });
}
