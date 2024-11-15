class Character {
  constructor(
    name,
    imageUrls,
    location = null,
    dialogue = "testdialog.txt",
    strength,
    weakness
  ) {
    this.name = name;
    this.location = location;
    this.icon = "";
    this.imageUrlBases = imageUrls;
    this.currentEmotion = "";
    this.setEmotion("");
    this.dialogue = dialogue;
    this.strength = strength;
    this.weakness = weakness;
    this.skillLevel = 10; // Basic skill level is 10%
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

const characters = [
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
    ],
    "Bamboo Forest",
    "aikobackstory.txt",
    "loan",
    "massage"
  ),
  new Character(
    "Taro",
    ["taro", "taroshock", "taroloan", "taromassage", "tarogamble", "tarodrugs", "taropartner"],
    "City Block 1",
    "tarobackstory.txt",
    "drugs",
    "gamble"
  ),
  // Add more characters as needed
];
