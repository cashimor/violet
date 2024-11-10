class Location {
    constructor(name, imageUrl, ref, x, y) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.ref = ref;
        this.x = x; // X coordinate on the map
        this.y = y; // Y coordinate on the map
    }
}

const bambooForest = new Location("Bamboo Forest", "images/bambooforest.jpg", "Map", 250, 60);
const riverSide = new Location("Riverside", "images/riverside.jpg", "Map", 100, 50);
const mountainArea = new Location("Mountain Area", "images/mountain.jpg", "Map", 50, 10);
const cityBlock1 = new Location("City Block 1", "images/cityblock1.jpg", "Map", 150, 100);

const house1 = new Location("House 1", "images/house1.jpg", "City Block 1", 50, 50);

// Array of locations
const locations = [bambooForest, riverSide, mountainArea, cityBlock1, house1];
