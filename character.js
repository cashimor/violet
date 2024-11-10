class Character {
    constructor(name, imageUrl, location = null) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.location = location;  // Current location of the character
    }

    setLocation(newLocation) {
        this.location = newLocation;  // Method to update character's location
    }
}

const characters = [
    new Character("Aiko", "images/aiko.png", "Bamboo Forest"),
    new Character("Taro", "images/taro.png", "City Block 1"),
    // Add more characters as needed
];
