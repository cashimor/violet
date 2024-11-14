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
      this.x = x;
      this.y = y;
      this.available = available;
      this.owner = null;
      this.dailyCost = dailyCost;
      this.size = size;
      this.musicUrl = musicUrl;
      this.rooms = []; // Array to hold room data after renting
      this.currentRoomIndex = 0; // Track which room is being viewed
    }
  
    rentTo(characterName) {
      if (this.available) {
        this.owner = characterName;
        this.available = false;
        
        if (characterName === "Violet") {
          // Initialize the `rooms` array with default room entries
          this.rooms = Array.from({ length: this.size }, () => ({
            use: "default",
            url: this.imageUrl // Default to main apartment image
          }));        }
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
      if (this.rooms.length > 0) console.log("" + this.currentRoomIndex + ":" + this.rooms[this.currentRoomIndex].url);
      // If rented with rooms, return the current room’s URL; otherwise, return the main image
      return this.rooms.length > 0 ? this.rooms[this.currentRoomIndex].url : this.imageUrl;
    }
  
    getUse() {
      return this.rooms.length > 0 ? this.rooms[this.currentRoomIndex].use : "basic";
    }

    decorateLocation(url, type) {
      this.rooms[this.currentRoomIndex].url = url;
      this.rooms[this.currentRoomIndex].use = type;
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
