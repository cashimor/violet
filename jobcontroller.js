class JobController {
  constructor() {
    this.jobs = {}; // Keyed by room ID, with data about room use and assigned NPC
  }

  toData() {
    const jobData = {};
    for (const [key, job] of Object.entries(this.jobs)) {
      jobData[key] = {
        purpose: job.purpose,
        npcAssigned: job.npcAssigned ? job.npcAssigned.name : null, // Use character's name
      };
    }
    return jobData;
  }

  fromData(data, locationController) {
    this.jobs = {};
    for (const [key, job] of Object.entries(data)) {
      this.jobs[key] = {
        purpose: job.purpose,
        npcAssigned: job.npcAssigned
          ? locationController.getCharacterByName(job.npcAssigned)
          : null, // Find character by name or leave as null
      };
    }
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
        return roomTypes[key];
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

  assignNpcToJob(roomId, character) {
    if (this.jobs[roomId] && !this.jobs[roomId].npcAssigned) {
      this.jobs[roomId].npcAssigned = character;
      const roomType = this.getRoomTypeByName(this.jobs[roomId].purpose);

      character.location = roomId;
      character.setIcon(roomType.icon);

      // Check for special dialogue overrides
      if (
        character.specialDialogues &&
        character.specialDialogues[roomType.name]
      ) {
        character.dialogue = character.specialDialogues[roomType.name];
      } else {
        character.dialogue = roomType.dialogue; // Default dialogue
      }

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

  checkLoanOfficesWithoutFunds() {
    const jobs = this.jobs; // Assuming 'this.jobs' is accessible in the relevant context.
    let loanOfficesWithoutFunds = [];

    for (const roomId in jobs) {
      const jobInfo = jobs[roomId]; // Entry from this.jobs
      if (jobInfo.npcAssigned && jobInfo.purpose === "Loan Office") {
        // Fetch the room type object
        const roomType = this.getRoomTypeByName(jobInfo.purpose);

        // Check if funds are defined and positive in the room type
        if (!roomType || roomType.funds === undefined || roomType.funds <= 0) {
          loanOfficesWithoutFunds.push(roomId);
        }
      }
    }

    return loanOfficesWithoutFunds;
  }
}
