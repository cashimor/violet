class Character {
  constructor(name, imageUrls, location = null) {
    this.name = name;
    this.location = location;

    // Check if imageUrls is a single string (one URL), convert it to a dictionary
    if (typeof imageUrls === "string") {
      this.imageUrls = { neutral: imageUrls }; // Default emotion as "neutral"
    } else {
      this.imageUrls = imageUrls; // If it's already a dictionary, use it as is
    }

    // Set initial emotion to "neutral" or first emotion in dictionary
    this.currentEmotion = Object.keys(this.imageUrls)[0];
  }

  setLocation(newLocation) {
    this.location = newLocation;
  }

  setEmotion(emotion) {
    if (this.imageUrls[emotion]) {
      this.currentEmotion = emotion;
    } else {
      console.warn(
        `Emotion "${emotion}" not found for character "${this.name}".`
      );
    }
  }

  getCurrentImageUrl() {
    return this.imageUrls[this.currentEmotion];
  }
}

const characters = [
  new Character(
    "Aiko",
    { neutral: "images/aiko.png", shock: "images/aikoshock.png" },
    "Bamboo Forest"
  ),
  new Character("Taro", "images/taro.png", "City Block 1"),
  // Add more characters as needed
];
