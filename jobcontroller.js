class JobController {
  constructor() {
    this.jobs = {}; // Keyed by room ID, with data about room use and assigned NPC
  }

  // Register a room with a specific purpose once decorated
  addRoom(location) {
    let roomId = location.name + "/" + location.currentRoomIndex;
    if (!this.jobs[roomId]) {
      this.jobs[roomId] = {
        purpose: location.getUse(),
        npcAssigned: null,
      };
    }
  }

  getRoomTypeByName(name) {
    for (const key in roomTypes) {
      if (roomTypes[key].name === name) {
        return roomTypes[key]
      }
    }
    return null; // Or handle error if name not found
  }

  // Retrieve the character assigned to a specific location
  getCharacter(location) {
    const roomId = `${location.name}/${location.currentRoomIndex}`;
    const room = this.jobs[roomId];
    return room ? room.npcAssigned : null; // Return assigned NPC if exists, else null
  }

  // Assign an NPC to a room if it has a specific purpose and is vacant
  assignNpcToJob(roomId, character) {
    if (this.jobs[roomId] && !this.jobs[roomId].npcAssigned) {
      this.jobs[roomId].npcAssigned = character;
      const roomType = this.getRoomTypeByName(this.jobs[roomId].purpose)
      character.location = "Job";
      character.setIcon(roomType.icon);
      return true;  
    }
    return false;
  }

  // Remove an NPC from a room (e.g., if job completed). Untested.
  removeNpcFromJob(roomId) {
    if (this.jobs[roomId]) {
      this.jobs[roomId].npcAssigned = null;
    }
  }

  // Check available jobs by filtering rooms by purpose and vacancy
  getAvailableJobsForPurpose(purpose) {
    return Object.keys(this.jobs).filter((roomId) => {
      const job = this.jobs[roomId];
      return job.purpose === purpose && !job.npcAssigned;
    });
  }

  // Get a list of unique purposes that have vacant rooms (no NPC assigned)
  getAvailableJobTypes() {
    const availablePurposes = new Set();

    Object.values(this.jobs).forEach((job) => {
      if (!job.npcAssigned) {
        availablePurposes.add(job.purpose);
      }
    });

    return Array.from(availablePurposes);
  }
}
