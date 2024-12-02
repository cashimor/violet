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
    music,
    dialogue,
    funds = 0,
    theftHistory = []
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
    this.music = music;
    this.dialogue = dialogue;
    this.funds = funds;
    this.theftHistory = theftHistory;
  }

  // Convert to plain data
  toData() {
    return {
      name: this.name,
      job: this.job,
      dailyWage: this.dailyWage,
      icon: this.icon,
      imageUrl: this.imageUrl,
      cost: this.cost,
      upkeep: this.upkeep,
      hint: this.hint,
      baseProfit: this.baseProfit,
      music: this.music,
      dialogue: this.dialogue,
      funds: this.funds,
      theftHistory: this.theftHistory,
    };
  }

  static fromData(data) {
    return new RoomType(data);
  }

  // Calculate profit based on character skill and room-specific factors
  calculateProfit(character, raidChance) {
    if (!character) {
      console.warn(`No character assigned to the ${this.name}`);
      return 0; // No profit without a character
    }

    // Calculate base profit reduced by lack of skill
    const skillEffect = character.getSkillLevel() / 100; // Skill level as a percentage
    let profit = Math.max(this.baseProfit, this.funds) * skillEffect;

    // Apply room-specific adjustments
    if (this.name === "Gambling Den" && this.isRaided(raidChance)) {
      return "The gambling den was raided.";
    }

    // Apply room-specific adjustments
    if (this.name === "Drugs Laboratory" && this.isRaided(raidChance / 2)) {
      return "The drugs laboratory was raided.";
    }

    // Ensure profit doesn't fall below zero
    profit = Math.max(profit, 0);

    return Math.round(profit);
  }

  // Example: Check if the room is raided
  isRaided(raidChance) {
    console.log("Raid, with chance: " + raidChance);
    // Simple placeholder for whether a raid occurs (e.g., random chance or event)
    return Math.random() < raidChance / 100; // 10% chance of a raid
  }

  // Optional: Method to get total thefts or specific theft data
  getTotalThefts() {
    return this.theftHistory.reduce((sum, theft) => sum + theft.amount, 0);
  }
}

let roomTypes = {
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
    music: "music/gamblingden.mp3",
    dialogue: "gambledialogue.txt",
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
    baseProfit: 0,
    music: "music/loanshark.mp3",
    dialogue: "loandialogue.txt",
  }),
  druglab: new RoomType({
    name: "Drugs Laboratory",
    job: "Chemist",
    dailyWage: 12000,
    icon: "drugs",
    imageUrl: "images/drugslab.jpg",
    cost: 30000,
    upkeep: 0.025,
    hint: "A shadowy operation...",
    baseProfit: 36000,
    music: "music/drugslab.mp3",
    dialogue: "labdialogue.txt",
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
    music: "music/massage.mp3",
    dialogue: "massagedialogue.txt",
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
    music: "music/evillair.mp3",
    dialogue: "lairdialogue.txt",
  }),
  temple: new RoomType({
    name: "Temple",
    job: "Priest",
    dailyWage: 1000,
    icon: "priest",
    imageUrl: "images/temple2.jpg",
    cost: 20000,
    upkeep: 0.01,
    hint: "A sacred place to expand your influence and gather devoted followers.",
    baseProfit: 1000, // Generates some income from offerings
    music: "music/temple.mp3",
    dialogue: "templedialogue.txt", // Dialogue file for interactions
  }),
  drugsdistribution: new RoomType({
    name: "Drugs Distribution",
    job: "Dealer",
    dailyWage: 3000,
    icon: "courier",
    imageUrl: "images/drugsdistribution.jpg",
    cost: 15000,
    upkeep: 0.025,
    hint: "A network for distributing drugs produced in your lab, with high risk but high profit.",
    baseProfit: 18000, // High profit due to distribution network
    music: "music/drugsdistribution.mp3",
    dialogue: "distributiondialogue.txt", // Dialogue file for interactions
  }),
};
