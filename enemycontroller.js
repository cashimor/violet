class EnemyController {
  constructor(locations) {
    this.occupationInterval = 10; // Days between occupying new locations
    this.daysSinceLastOccupation = 0; // Tracks the days since last occupation
    this.locations = locations;
  }

  owned(who) {
    return this.locations.filter(
        (location) => location.owner === who
      ).length;
  }

  getAvailableLocations() {
    return this.locations.filter((location) => location.available);
  }

  checkLoseCondition() {
    const violetOwned = this.owned("Violet");
    const xivatoOwned = this.owned("Xivato");
    const availableRooms = this.getAvailableLocations().length;

    // Lose condition: Violet owns no locations, and all others are occupied by Xivato
    if (violetOwned === 0 && xivatoOwned > 0 && availableRooms === 0) return true;
    return false;
  }

  // Method invoked each new day
  onNewDay() {
    this.daysSinceLastOccupation++;

    if (this.daysSinceLastOccupation >= this.occupationInterval) {
      this.occupyNewLocation();
      this.daysSinceLastOccupation = 0; // Reset counter
    }

    return this.checkLoseCondition();
  }

  occupyNewLocation() {
    const availableLocations = this.getAvailableLocations();

    if (availableLocations.length > 0) {
      const locationToOccupy =
        availableLocations[
          Math.floor(Math.random() * availableLocations.length)
        ];
      locationToOccupy.rentTo("Xivato"); // Assuming `rentTo` sets the location's owner
      console.log(`Xivato have occupied ${locationToOccupy.name}`);
    }
  }
}
