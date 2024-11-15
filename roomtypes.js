class RoomType {
  constructor({
    name,
    job,
    dailyWage,
    icon,
    imageUrl,
    cost,
    upkeep,
    hint,
    baseProfit,
  }) {
    this.name = name;
    this.job = job;
    this.dailyWage = dailyWage;
    this.icon = icon;
    this.imageUrl = imageUrl;
    this.cost = cost;
    this.upkeep = upkeep;
    this.hint = hint;
    this.baseProfit = baseProfit;
  }

  // Calculate profit based on character skill and room-specific factors
  calculateProfit(character) {
    if (!character) {
      console.warn(`No character assigned to the ${this.name}`);
      return 0; // No profit without a character
    }

    // Calculate base profit reduced by lack of skill
    const skillEffect = character.getSkillLevel() / 100; // Skill level as a percentage
    let profit = this.baseProfit * skillEffect;

    console.log("" + skillEffect + ":" + this.baseProfit + ":" + profit);
    
    // Apply room-specific adjustments
    if (this.name === "Gambling Den" && this.isRaided()) {
        return "The gambling den was raided."
    }

    // Ensure profit doesn't fall below zero
    profit = Math.max(profit, 0);

    return Math.round(profit);
  }

  // Example: Check if the room is raided
  isRaided() {
    // Simple placeholder for whether a raid occurs (e.g., random chance or event)
    return Math.random() < 0.1; // 10% chance of a raid
  }
}

const roomTypes = {
  gambling: new RoomType({
    name: "Gambling Den",
    job: "Pit Boss",
    dailyWage: 8000,
    icon: "gamble",
    imageUrl: "images/gamblingden.jpg",
    cost: 50000, // Decoration cost in currency
    upkeep: 0.015,
    hint: "A place where fortunes are made... or lost.",
    baseProfit: 24000,
  }),
  loansharking: new RoomType({
    name: "Loan Office",
    job: "Debt Collector",
    dailyWage: 10000,
    icon: "loan",
    imageUrl: "images/loanshark.jpg",
    cost: 20000,
    upkeep: 0.005,
    hint: "Only the most desperate come to borrow...",
    baseProfit: 30000,
  }),
  druglab: new RoomType({
    name: "Drug Laboratory",
    job: "Chemist",
    dailyWage: 12000,
    icon: "drugs",
    imageUrl: "images/drugslab.jpg",
    cost: 30000,
    upkeep: 0.025,
    hint: "A shadowy operation...",
    baseProfit: 36000,
  }),
  massageparlor: new RoomType({
    name: "Massage Parlor",
    job: "Practitioner",
    dailyWage: 6000,
    icon: "massage",
    imageUrl: "images/massageparlor.jpg",
    cost: 30000,
    upkeep: 0.01,
    hint: "Unholy dealings of various kinds...",
    baseProfit: 18000,
  }),
  evillair: new RoomType({
    name: "Evil Lair",
    job: "Partner",
    dailyWage: 0,
    icon: "partner",
    imageUrl: "images/evillair.jpg",
    cost: 10000,
    upkeep: 0,
    hint: "The heart of all your dark plans...",
    baseProfit: 0,
  }),
};
