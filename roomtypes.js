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
    community = false,
    funds = 0,
    theftHistory = [],
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
    this.community = community;
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
      community: this.community,
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

    // Gambling Den specific adjustments
    if (this.name === "Gambling Den") {
      if (this.isRaided(raidChance)) {
        return "The gambling den was raided.";
      }
      // Introduce variability in profit (random factor between 1 and 2)
      profit *= 1 + Math.random();
    }

    // Drugs Laboratory specific adjustments
    if (this.name === "Drugs Laboratory" && this.isRaided(raidChance / 2)) {
      return "The drugs laboratory was raided.";
    }

    // Drugs Distribution specific adjustments
    if (this.name === "Drugs Distribution" && this.isRaided(raidChance / 4)) {
      return "The drugs distribution network was disrupted.";
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
  arcade: new RoomType({
    name: "Arcade",
    job: null, // No job required
    dailyWage: 0, // No wages
    icon: "arcade", // Unique icon for an arcade
    imageUrl: "images/arcade.jpg", // Unique image for the arcade
    cost: 15000, // Refund when selling (matches original gambling den cost)
    upkeep: 0, // No upkeep cost
    hint: "A family-friendly entertainment venue with games and fun.",
    baseProfit: 0, // No profit (community space)
    music: "music/community.mp3", // Shared music for all community spaces
    dialogue: "communitydialogue.txt", // Unified dialogue file
    community: true,
  }),

  pharmacy: new RoomType({
    name: "Pharmacy",
    job: null,
    dailyWage: 0,
    icon: "pharmacy",
    imageUrl: "images/pharmacy.jpg",
    cost: 15000, // Matches drugs distribution cost
    upkeep: 0,
    hint: "A legal establishment for selling medicine and health supplies.",
    baseProfit: 0,
    music: "music/community.mp3",
    dialogue: "communitydialogue.txt",
    community: true,
  }),

  researchlaboratory: new RoomType({
    name: "Research Laboratory",
    job: null,
    dailyWage: 0,
    icon: "laboratory",
    imageUrl: "images/researchlaboratory.jpg",
    cost: 15000, // Matches drugs laboratory cost
    upkeep: 0,
    hint: "A place for scientific research and innovation.",
    baseProfit: 0,
    music: "music/community.mp3",
    dialogue: "communitydialogue.txt",
    community: true,
  }),

  wellnessspa: new RoomType({
    name: "Wellness Spa",
    job: null,
    dailyWage: 0,
    icon: "spa",
    imageUrl: "images/wellnessspa.jpg",
    cost: 15000, // Matches massage parlor cost
    upkeep: 0,
    hint: "A relaxing retreat offering health and wellness services.",
    baseProfit: 0,
    music: "music/community.mp3",
    dialogue: "communitydialogue.txt",
    community: true,
  }),

  creditunion: new RoomType({
    name: "Credit Union",
    job: null,
    dailyWage: 0,
    icon: "creditunion",
    imageUrl: "images/creditunion.jpg",
    cost: 15000, // Matches loan office cost
    upkeep: 0,
    hint: "A financial cooperative offering fair loans and savings.",
    baseProfit: 0,
    music: "music/community.mp3",
    dialogue: "communitydialogue.txt",
    community: true,
  }),

  community: new RoomType({
    name: "Community Hub",
    job: null,
    dailyWage: 0,
    icon: "communityhub",
    imageUrl: "images/communityhub.jpg",
    cost: -15000, // Matches loan office cost
    upkeep: 0,
    hint: "A hub that can be used for community efforts.",
    baseProfit: 0,
    music: "music/community.mp3",
    dialogue: "communitydialogue.txt",
    community: true,
  }),
};
