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
        community: false, // Indicates whether the job is part of the community
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

  getCommunityPurpose(currentPurpose) {
    const purposeMap = {
      "Gambling Den": "Arcade",
      "Drugs Distribution": "Pharmacy",
      "Drugs Laboratory": "Research Laboratory",
      "Massage Parlor": "Wellness Spa",
      "Loan Office": "Credit Union",
    };
    return purposeMap[currentPurpose] || "Community Hub"; // Default if no mapping exists
  }

  markAsCommunity(location) {
    const roomId = location.name + "/" + location.currentRoomIndex;
    const job = this.jobs[roomId]; // Fetch the job for the given location

    if (!job) {
      console.error("Location not found in job controller.");
      return;
    }

    // Mark as community in the job
    job.community = true;
    job.purpose = this.getCommunityPurpose(job.purpose);

    // Revert NPC to original form
    job.npcAssigned.icon = ""; // Reset NPC icon

    // Fetch the community room type by purpose
    const newRoomType = this.getRoomTypeByName(job.purpose);
    if (!newRoomType) {
      console.error("Room type not found for purpose:", job.purpose);
      return;
    }
    this.updateNpcDialogue(job.npcAssigned, newRoomType);
    // Update the location to reflect community status
    location.decorateLocation(
      newRoomType.imageUrl,
      newRoomType.name,
      newRoomType.music,
      true
    );

    // Optional: Notify the player of the change
    console.log(
      `The ${location.name} has been converted into a community space: ${newRoomType.name}.`
    );
    return newRoomType.cost;
  }

  // Register a room with a specific purpose once decorated
  addRoom(location) {
    let roomId = location.name + "/" + location.currentRoomIndex;
    if (!this.jobs[roomId]) {
      this.jobs[roomId] = {
        purpose: location.getUse(),
        community: location.community,
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

  removeCharacter(location) {
    const roomId = `${location.name}/${location.currentRoomIndex}`;
    const room = this.jobs[roomId];
    if (room && room.npcAssigned) {
      const removedCharacter = room.npcAssigned;
      room.npcAssigned = null;
      removedCharacter.icon = "";
      return removedCharacter;
    }
    return null;
  }

  updateNpcDialogue(character, roomType) {
    if (!character || !roomType) return;

    // Check for special dialogue overrides based on room type
    if (
      character.specialDialogues &&
      character.specialDialogues[roomType.name]
    ) {
      character.dialogue = character.specialDialogues[roomType.name];
    } // Default to the room type's dialogue
    else {
      character.dialogue = roomType.dialogue;
    }
  }

  assignNpcToJob(roomId, character) {
    if (this.jobs[roomId] && !this.jobs[roomId].npcAssigned) {
      this.jobs[roomId].npcAssigned = character;
      const roomType = this.getRoomTypeByName(this.jobs[roomId].purpose);

      character.location = roomId;
      character.setIcon(roomType.icon);

      this.updateNpcDialogue(character, roomType);
      return true;
    }
    return false;
  }

  // Check available jobs by filtering rooms by purpose and vacancy
  getAvailableJobsForPurpose(purpose) {
    return Object.keys(this.jobs).filter((roomId) => {
      const job = this.jobs[roomId];
      return job.purpose === purpose && !job.npcAssigned && !job.community;
    });
  }

  // Get a list of unique purposes that have vacant rooms (no NPC assigned)
  // Excludes jobs in community locations
  getAvailableJobTypes() {
    const availablePurposes = new Set();

    Object.values(this.jobs).forEach((job) => {
      if (!job.npcAssigned && !job.community) {
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
