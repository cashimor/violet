class Location {
    constructor(name, imageUrl, ref, x, y) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.ref = ref;
        this.x = x; // X coordinate on the map
        this.y = y; // Y coordinate on the map
    }
}

const bambooForest = new Location("Bamboo Forest", "images/bambooforest.jpg", "Map", 460, 230);
const riverSide = new Location("Riverside", "images/riverside.jpg", "Map", 180, 200);
const mountainArea = new Location("Mountain Area", "images/mountain.jpg", "Map", 150, 30);
const cityBlock1 = new Location("City Block 1", "images/cityblock1.jpg", "Map", 300, 300);

const room1 = new Location("Room 1", "images/room1.jpg", "City Block 1", 50, 50);

// Array of locations
const locations = [bambooForest, riverSide, mountainArea, cityBlock1, room1];
