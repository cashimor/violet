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
    size = 0,
    owner = null,
    rooms = [],
    currentRoomIndex = 0
  ) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.ref = ref;
    this.x = x;
    this.y = y;
    this.available = available;
    (this.owner = owner), (this.dailyCost = dailyCost);
    this.size = size;
    this.musicUrl = musicUrl;
    this.rooms = rooms;
    this.currentRoomIndex = currentRoomIndex;
  }

  static fromData(data) {
    let location = new Location(
      data.name,
      data.imageUrl,
      data.ref,
      data.x,
      data.y,
      data.musicUrl,
      data.available,
      data.dailyCost,
      data.size,
      data.owner,
      data.rooms,
      data.currentRoomIndex
    );
    return location;
  }

  evict() {
    // Clear ownership and reset availability
    this.owner = null;
    this.available = true;

    // Clear rooms if previously owned by Violet
    if (this.rooms && this.rooms.length > 0) {
      this.rooms = []; // Reset the rooms array
    }
  }

  rentTo(characterName) {
    if (this.available) {
      this.owner = characterName;
      this.available = false;

      if (characterName === "Violet") {
        // Initialize the `rooms` array with default room entries
        this.rooms = Array.from({ length: this.size }, () => ({
          use: "default",
          url: this.imageUrl, // Default to main apartment image
          music: this.musicUrl,
          community: false, // Default
        }));
      }
    }
  }

  // Untested.
  vacate() {
    this.owner = null;
    this.available = true;
    this.rooms = []; // Clear rooms when vacated
    this.currentRoomIndex = 0;
  }

  getImageUrl() {
    if (this.rooms.length > 0)
      console.log(
        "" + this.currentRoomIndex + ":" + this.rooms[this.currentRoomIndex].url
      );
    // If rented with rooms, return the current room’s URL; otherwise, return the main image
    return this.rooms.length > 0
      ? this.rooms[this.currentRoomIndex].url
      : this.imageUrl;
  }

  getMusicUrl() {
    if (this.rooms.length > 0)
      console.log(
        "" +
          this.currentRoomIndex +
          ":" +
          this.rooms[this.currentRoomIndex].music
      );
    // If rented with rooms, return the current room’s URL; otherwise, return the main image
    return this.rooms.length > 0
      ? this.rooms[this.currentRoomIndex].music
      : this.musicUrl;
  }

  getUse() {
    return this.rooms.length > 0
      ? this.rooms[this.currentRoomIndex].use
      : "basic";
  }

  decorateLocation(url, type, music, isCommunity = false) {
    const allowedTempleLocations = ["Room Tower", "Room Mountain"];

    // Check if the type is "Temple"
    if (type === "Temple") {
      // Verify that the current location is one of the allowed locations
      if (!allowedTempleLocations.includes(this.name)) {
        updateSummaryText(
          this.name + " is not a suitable location for a temple."
        );
        return false;
      }

      // Check if any other room already has a specific use
      for (const room of this.rooms) {
        if (room.use && room.use !== "default") {
          updateSummaryText("Can't build a temple near a " + room.use + ".");
          return false;
        }
      }

      // Remove other rooms from the array, leaving only the current room
      this.rooms = [
        {
          url: url,
          use: type,
          music: music,
        },
      ];
      this.currentRoomIndex = 0;
      updateSummaryText("The temple has been successfully built.");
      return true;
    }

    // For other types, just assign the type and details to the current room
    this.rooms[this.currentRoomIndex].url = url;
    this.rooms[this.currentRoomIndex].use = type;
    this.rooms[this.currentRoomIndex].music = music;
    this.rooms[this.currentRoomIndex].community = isCommunity; // Set community flag

    // Check if all rooms in this location are now community
    if (this.rooms.every((room) => room.community)) {
      this.owner = "Community"; // Change the location's owner
    }
    return true;
  }

  // Method to navigate rooms: accepts 'next' or 'prev' as direction
  navigateRooms(direction) {
    if (direction === "next") {
      this.currentRoomIndex = (this.currentRoomIndex + 1) % this.rooms.length;
    } else if (direction === "prev") {
      this.currentRoomIndex =
        (this.currentRoomIndex - 1 + this.rooms.length) % this.rooms.length;
    }
    console.log("" + this.currentRoomIndex);
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
  300,
  "music/city.mp3"
);

const room1 = new Location(
  "City Room 1",
  "images/room1.jpg",
  "City Block 1",
  80,
  50,
  "music/room.mp3",
  true,
  1500,
  2
);

const room2 = new Location(
  "City Room 2",
  "images/room2.jpg",
  "City Block 1",
  550,
  70,
  "music/room.mp3",
  true,
  2200,
  3
);

const roomtea = new Location(
  "Room Tea",
  "images/tea.jpg",
  "Bamboo Forest",
  530,
  280,
  "music/room.mp3",
  true,
  1000,
  1
);

const roomtower = new Location(
  "Room Tower",
  "images/room1.jpg",
  "Bamboo Forest",
  160,
  390,
  "music/room.mp3",
  true,
  4000,
  3
);

const roomriver = new Location(
  "Room River",
  "images/room2.jpg",
  "Riverside",
  520,
  180,
  "music/room.mp3",
  true,
  2900,
  3
);

const roommountain = new Location(
  "Room Mountain",
  "images/temple.jpg",
  "Mountain Area",
  460,
  200,
  "music/room.mp3",
  true,
  5000,
  2
);

const cityBlock2 = new Location(
  "City Block 2",
  "images/cityblock2.jpg",
  "Map",
  350, // X-coordinate northeast of City Block 1
  150, // Y-coordinate northeast of City Block 1
  "music/city.mp3"
);

const room3 = new Location(
  "City Room 3",
  "images/room1.jpg",
  "City Block 2",
  480, // Adjusted for relative position within City Block 2
  160,
  "music/room.mp3",
  true,
  1800, // Price to purchase the room
  2 // Maintenance level or room difficulty
);

const room4 = new Location(
  "City Room 4",
  "images/room2.jpg",
  "City Block 2",
  340, // Adjusted for relative position within City Block 2
  130,
  "music/room.mp3",
  true,
  2500, // Price to purchase the room
  3 // Maintenance level or room difficulty
);

const police = new Location(
  "Police Station",
  "images/policestation.jpg",
  "Map",
  220, // Adjusted for relative position within City Block 2
  280,
  "music/policestation.mp3"
);

const itsukiapt = new Location(
  "Itsuki's Apartment",
  "images/itsukiapartment.jpg",
  "Game Start",
  0,
  0,
  "music/itsukisapt.mp3"
);

// Array of locations
let locations = [
  itsukiapt,
  bambooForest,
  riverSide,
  mountainArea,
  cityBlock1,
  room1,
  room2,
  roomtea,
  roomtower,
  roomriver,
  roommountain,
  cityBlock2,
  room3,
  room4,
  police,
];

const gameOverXivato = new Location(
  "Game Over: Xivato Wins",
  "images/goxivato.jpg",
  "Game Over",
  0,
  0,
  "music/gameover.mp3" // MP3
);

const gameOverPoverty = new Location(
  "Game Over: Poverty",
  "images/gopoor.jpg",
  "Game Over",
  0,
  0,
  "music/gameover.mp3" // MP3
);

const gameOverMalvani = new Location(
  "Game Over: Malvani Darkness",
  "images/goevil.jpg",
  "Game Over",
  0,
  0,
  "music/goevil.mp3" // MP3
);

const gameOverEvilItsuki = new Location(
  "Game Over: Evil Itsuki",
  "images/goevilitsuki.jpg",
  "Game Over",
  0,
  0,
  "music/goevil.mp3" // MP3
);

const gameOverDead = new Location(
  "Game Over: Dead",
  "images/godead.jpg",
  "Game Over",
  0,
  0,
  "music/godead.mp3" // MP3
);

const gameStartBedroom = new Location(
  "Game Start: Violet's Bedroom",
  "images/violetbed.jpg",
  "Game Start",
  0,
  0,
  "music/violetbedroom.mp3"
);

const gameStartPurgatory = new Location(
  "Game Start: Purgatory",
  "images/purgatory.jpg",
  "Game Start",
  0,
  0,
  "music/purgatory.mp3"
);

// Add them to a separate gameOverLocations array
const gameOverLocations = {
  xivato: gameOverXivato,
  poverty: gameOverPoverty,
  evil: gameOverMalvani,
  evilItsuki: gameOverEvilItsuki,
  dead: gameOverDead,
  bedroom: gameStartBedroom,
  purgatory: gameStartPurgatory,
};
