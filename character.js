class Character {
  constructor(
    name,
    imageUrls,
    location = null,
    dialogue = "testdialog.txt",
    strength,
    weakness,
    skillLevel = 10,
    specialDialogues = {}, // New parameter for special dialogues
    icon = "",
    dayTalk = 0,
    like = 0
  ) {
    this.name = name;
    this.imageUrlBases = imageUrls;
    this.location = location;
    this.dialogue = dialogue;
    this.strength = strength;
    this.weakness = weakness;
    this.skillLevel = skillLevel; // Basic skill level is 10%
    this.specialDialogues = specialDialogues; // Assign the special dialogues
    this.icon = icon;
    this.dayTalk = dayTalk;
    this.like = like;
    this.currentEmotion = "";
    this.tidbits = {}; // Store yes/no information
    this.setEmotion("");
  }

  static fromData(data) {
    const character = new Character(
      data.name,
      data.imageUrlBases,
      data.location,
      data.dialogue,
      data.strength,
      data.weakness,
      data.skillLevel,
      data.specialDialogues || {}, // Restore special dialogues or default to an empty object
      data.icon,
      data.dayTalk,
      data.like
    );

    // Ensure tidbits are restored
    character.tidbits = data.tidbits || {};
    return character;
  }

  toData() {
    return {
      name: this.name,
      imageUrlBases: this.imageUrlBases,
      location: this.location,
      dialogue: this.dialogue,
      strength: this.strength,
      weakness: this.weakness,
      skillLevel: this.skillLevel,
      specialDialogues: this.specialDialogues, // Include special dialogues in save data
      icon: this.icon,
      dayTalk: this.dayTalk,
      like: this.like,
      tidbits: this.tidbits, // Include tidbits in save data
    };
  }

  // Set a tidbit
  setTidbit(key) {
    this.tidbits[key] = true;
    return key;
  }

  // Get a tidbit (returns false if not set)
  hasTidbit(key) {
    return !!this.tidbits[key];
  }

  getSkillLevel() {
    let skill = this.skillLevel;
    if (this.icon == this.strength) {
      skill = skill + 10;
    }
    if (this.icon == this.weakness) {
      skill = skill / 2;
    }
    // Ensure skill level is between 0 and 100
    skill = Math.max(0, Math.min(100, skill));
    return skill;
  }

  setLocation(newLocation) {
    this.location = newLocation;
  }

  // Helper to construct and verify the image URL
  setEmotion(emotion) {
    this.currentEmotion = emotion;
    this.bubbleEmotion = emotion;
    if (emotion === "neutral") this.currentEmotion = "";
    const baseName = this.name.toLowerCase();

    // Attempt 1: name_icon_emotion
    const fullFilename = `${baseName}${this.icon}${this.currentEmotion}`;
    if (this.imageUrlBases.includes(fullFilename)) {
      this.currentImageUrl = this.buildImageUrl(fullFilename);
      return;
    } else {
      console.log("No " + this.icon + this.currentEmotion + " URL");
    }

    // Attempt 2: name_icon (if the specific emotion is missing)
    const iconOnlyFilename = `${baseName}${this.icon}`;
    if (this.imageUrlBases.includes(iconOnlyFilename)) {
      this.currentEmotion = "";
      this.currentImageUrl = this.buildImageUrl(iconOnlyFilename);
      return;
    }

    // Attempt 3: name (just the base name)
    if (this.imageUrlBases.includes(baseName)) {
      this.currentEmotion = ""; // Fall back to neutral
      this.currentImageUrl = this.buildImageUrl(baseName);
      return;
    }

    // Log a warning if no matching image is found
    console.warn(
      `No image found for "${baseName}" with icon "${this.icon}" and emotion "${this.currentEmotion}".`
    );
    this.currentImageUrl = this.buildImageUrl("default_placeholder"); // Default fallback image
  }

  // Utility to add path and extension
  buildImageUrl(filename) {
    return `images/${filename}.png`;
  }

  getCurrentImageUrl() {
    return this.currentImageUrl;
  }

  setIcon(icon) {
    this.icon = icon;
    this.setEmotion("");
  }
}

let characters = [
  new Character(
    "Aiko",
    [
      "aiko",
      "aikoshock",
      "aikoloan",
      "aikomassage",
      "aikomassageloss",
      "aikogamble",
      "aikodrugs",
      "aikopartner",
      "aikohappy",
      "aikocourier",
      "aikopriest",
    ],
    "Bamboo Forest",
    "aikobackstory.txt",
    "loan",
    "massage"
  ),
  new Character(
    "Taro",
    [
      "taro",
      "taroshock",
      "taroloan",
      "taromassage",
      "taromassageloss",
      "tarogamble",
      "tarodrugs",
      "taropartner",
      "tarohappy",
      "tarocourier",
      "taropriest",
    ],
    "City Block 1",
    "tarobackstory.txt",
    "drugs",
    "gamble"
  ),
  new Character(
    "Riku",
    [
      "riku",
      "rikushock",
      "rikuloan",
      "rikumassage",
      "rikumassageloss",
      "rikugamble",
      "rikudrugs",
      "rikupartner",
      "rikuhappy",
      "rikucourier",
      "rikupriest",
    ],
    "Riverside",
    "rikubackstory.txt",
    "gamble",
    "loan"
  ),
  new Character(
    "Sakura",
    [
      "sakura",
      "sakurashock",
      "sakuraloan",
      "sakuramassage",
      "sakuramassageloss",
      "sakuragamble",
      "sakuradrugs",
      "sakurapartner",
      "sakurahappy",
      "sakuracourier",
      "sakurapriest",
    ],
    "Mountain Area",
    "sakurabackstory.txt",
    "massage",
    "drugs"
  ),
  new Character(
    "Ryo",
    [
      "ryo",
      "ryoshock",
      "ryoloan",
      "ryomassage",
      "ryomassageloss",
      "ryogamble",
      "ryodrugs",
      "ryopartner",
      "ryohappy",
      "ryocourier",
      "ryopriest",
    ],
    "City Block 2",
    "ryobackstory.txt",
    "loan",
    "drugs"
  ),
  new Character(
    "Police Officer",
    ["police officer"],
    "Police Station",
    "police.txt",
    null,
    null,
    100,
    {},
    "police",
  ),
  new Character(
    "Xivato",
    ["xivato"],
    "Job",
    "xivato.txt",
    null,
    null,
    100,
    {},
    "xivato",
  ),
  new Character(
    "Alaric",
    ["alaric"],
    "Game Start: Violet's Bedroom",
    "alaric.txt",
    null,
    null,
    100,
    {},
    "alaric",
    0,
    -100
  ),
  new Character(
    "Vaeren",
    ["vaeren"],
    "Job",
    "vaeren.txt",
    null,
    null,
    100,
    {},
    "vaeren",
    0,
    -100
  ),
  new Character(
    "Nirvani",
    ["nirvani"],
    "Game Start: Purgatory",
    "nirvani.txt",
    null,
    null,
    100,
    {},
    "nirvani",
    0,
    100
  ),
  new Character(
    "Itsuki",
    ["itsuki", "itsukishock", "itsukipartner"],
    "Itsuki's Apartment",
    "itsuki.txt",
    null,
    null,
    100,
    { "Evil Lair": "itsukilairdialogue.txt" }, // Special dialogue for Evil Lair
    "itsuki",
    0,
    1000
  ),
  new Character(
    "Takeshi",
    ["takeshi", "takeshihappy", "takeshipartner", "takeshipartnerfather"],
    "Shrine",
    "takeshibackstory.txt",
    "lair",
    "drugs",
    -10,
    { "Evil Lair": "takeshilairdialogue.txt" } // Special dialogue for Evil Lair
  ),
  // Add more characters as needed
  new Character(
    "Ume",
    [
      "ume",
      "umeshock",
      "umeloan",
      "umemassage",
      "umemassageloss",
      "umegamble",
      "umedrugs",
      "umepartner",
      "umehappy",
      "umecourier",
      "umepriest",
    ],
    "City Block 2",
    "umebackstory.txt",
    "drugs",
    "loan",
    20
  ),
];
