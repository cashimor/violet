class ShopManager {
  constructor(simulationController) {
    this.simulationController = simulationController;
    this.shops = {
      generalStore: [
        {
          id: "bicycle",
          name: "Bicycle",
          cost: 15000,
          description: "Move faster and save energy.",
        },
        {
          id: "selfHelpBook",
          name: "Self-Help Book",
          cost: 1500,
          description: "Improve persuasion.",
        },
        {
          id: "socialButterflyBrooch",
          name: "Social Butterfly Brooch",
          cost: 5000, // Adjust as appropriate for game balance
          description:
            "A whimsical brooch that unleashes your inner social butterfly. Wearing it just might make you the talk of the town!",
        },
      ],
      magicShop: [
        {
          id: "manaPotion",
          name: "Mana Potion",
          cost: 20,
          description: "Restore magic power.",
        },
        {
          id: "spellTome",
          name: "Spell Tome",
          cost: 100,
          description: "Learn a powerful spell.",
        },
      ],
    };
  }

  getItemsForSale(shopId) {
    const shopItems = this.shops[shopId];

    if (!shopItems) {
      console.error(`Shop ID '${shopId}' not found.`);
      return ["Sorry, this shop doesn't seem to exist."];
    }

    // Filter out already purchased items
    const availableItems = shopItems.filter(
      (item) => !this.simulationController.hasTidbit(`SHOP_${item.id}`)
    );

    // Build dialogue options for the available items
    const options = availableItems.map(
      (item) => `[${item.id}] ${item.name} (¥${item.cost.toLocaleString()})`
    );

    // Add a cancel option at the end
    options.push("[cancel] Thank you.");

    // Return the full array of dialogue lines
    return availableItems.length > 0
      ? ["?I have the following items available:", ...options]
      : ["Sorry, there are no items left to purchase."];
  }

  applyItemEffect(itemId) {
    switch (itemId) {
      case "socialButterflyBrooch":
        this.simulationController.reduceFriendBoundary(15);
        break;
      // Add other items with special effects here
      default:
        console.warn(`No special effect defined for item ID '${itemId}'.`);
    }
  }

  buyItem(itemId) {
    const item = this.findItemById(itemId);
    if (!item) {
      console.error(`Item ID '${itemId}' not found.`);
      return ["I'm sorry, that item doesn't exist."];
    }

    if (!this.simulationController.deductMoney(item.cost)) {
      return ["You don't seem to have enough money to buy that."];
    }

    // Mark the item as purchased
    this.simulationController.setTidbit(`SHOP_${item.id}`, true);

    // Apply special effects
    this.applyItemEffect(itemId);

    return [`Thank you for purchasing the ${item.name}!`];
  }

  findItemById(itemId) {
    for (const shop of Object.values(this.shops)) {
      const item = shop.find((i) => i.id === itemId);
      if (item) return item;
    }
    return null;
  }
}
