class Character {
  constructor(
    name,
    imageUrls,
    location = null,
    dialogue = "testdialog.txt",
    strength,
    weakness,
    skillLevel = 10,
    icon = "",
    dayTalk = 0,
    like = 0
  ) {
    this.name = name;
    this.location = location;
    this.icon = icon;
    this.imageUrlBases = imageUrls;
    this.currentEmotion = "";
    this.setEmotion("");
    this.dialogue = dialogue;
    this.strength = strength;
    this.weakness = weakness;
    this.skillLevel = skillLevel; // Basic skill level is 10%
    this.dayTalk = dayTalk;
    this.like = 0;
  }

  static fromData(data) {
    return new Character(
      data.name,
      data.imageUrlBases,
      data.location,
      data.dialogue,
      data.strength,
      data.weakness,
      data.skilLevel,
      data.icon,
      data.dayTalk,
      data.like
    );
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
    "police"
  ),
  new Character(
    "Xivato",
    ["xivato"],
    "Job",
    "xivato.txt",
    null,
    null,
    100,
    "xivato"
  ),

  // Add more characters as needed
];
