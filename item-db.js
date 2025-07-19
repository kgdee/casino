class ItemDB {
  constructor(items) {
    this.items = items;

    this.tiers = [
      { name: "SSR", range: [1000, 2000], rate: 0.005 },
      { name: "SR", range: [500, 999], rate: 0.045 },
      { name: "R", range: [250, 499], rate: 0.15 },
      { name: "UC", range: [100, 249], rate: 0.3 },
      { name: "C", range: [1, 99], rate: 0.5 },
    ];
  }

  getItem(itemId) {
    let itemData = this.items.find((item) => item.id === itemId);
    if (!itemData) return null;
    itemData = { ...itemData, price: itemData.rarity * 2 };
    return itemData;
  }

  getItems(refs) {
    // Build a Set of IDs for fast lookup
    const idSet = new Set(refs.map((ref) => ref.id));

    // Filter items by checking if id is in the Set
    const result = this.items.filter((item) => idSet.has(item.id));
    return result
  }

  getTier() {
    const rand = Math.random();
    let cumulative = 0;

    for (const tier of this.tiers) {
      cumulative += tier.rate;
      if (rand < cumulative) {
        return tier;
      }
    }
  }

  getItemByRarity([min, max] = []) {
    const items = this.items.filter((item) => item.rarity <= max && item.rarity >= min);
    const item = items[Math.floor(Math.random() * items.length)];
    return item;
  }

  pullGacha() {
    const tier = this.getTier();
    const item = this.getItemByRarity(tier.range);
    return item;
  }

  selectItem(itemIds) {
    const itemId = itemIds[Math.floor(Math.random() * itemIds.length)];
    const item = this.getItem(itemId);
    return item;
  }

  getTierName(rarity) {
    for (const tier of this.tiers) {
      const [min, max] = tier.range;
      if (rarity >= min && rarity <= max) {
        return tier.name;
      }
    }
  }
}
