class Location {
  constructor(
    name,
    imageUrl,
    ref,
    x,
    y,
    musicUrl = null,
    available = false,
    dailyCost = 0,
    size = 0
  ) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.ref = ref;
    this.x = x; // X coordinate on the map
    this.y = y; // Y coordinate on the map
    this.available = available; // Whether location is for rent
    this.owner = null; // Current renter, if any
    this.dailyCost = dailyCost; // Daily cost in Yen
    this.size = size; // Size in tatami mats
    this.musicUrl = musicUrl;
  }

  rentTo(characterName) {
    if (this.available) {
      this.owner = characterName;
      this.available = false; // Mark as rented
    }
  }

  vacate() {
    this.owner = null;
    this.available = true; // Mark as available again
  }
}

const bambooForest = new Location(
  "Bamboo Forest",
  "images/bambooforest.jpg",
  "Map",
  460,
  230,
  "music/bambooforest.mp3"
);
const riverSide = new Location(
  "Riverside",
  "images/riverside.jpg",
  "Map",
  180,
  200,
  "music/riverside.mp3"
);
const mountainArea = new Location(
  "Mountain Area",
  "images/mountain.jpg",
  "Map",
  150,
  30,
  "music/mountains.mp3"
);
const cityBlock1 = new Location(
  "City Block 1",
  "images/cityblock1.jpg",
  "Map",
  300,
  300
);

const room1 = new Location(
  "Room 1",
  "images/room1.jpg",
  "City Block 1",
  80,
  50,
  null,
  true,
  1500,
  2
);
const room2 = new Location(
  "Room 2",
  "images/room2.jpg",
  "City Block 1",
  550,
  70,
  null,
  true,
  2200,
  3
);

// Array of locations
const locations = [
  bambooForest,
  riverSide,
  mountainArea,
  cityBlock1,
  room1,
  room2,
];
