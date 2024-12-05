class OptionsController {
  constructor(
    simulationController,
    jobController,
    locationController,
    enemyController,
    mapController,
    gameController
  ) {
    this.simulationController = simulationController;
    this.jobController = jobController;
    this.locationController = locationController;
    this.enemyController = enemyController;
    this.mapController = mapController;
    this.gameController = gameController;
    this.showing = false;
    this.unlockedEndings = new Set(); // Use a Set for efficient lookups
    this.loadUnlockedEndings();
    this.errorContainer = document.getElementById("save-load-error");
    this.saveSlots = {
      slot1: { summary: "(Empty)" },
      slot2: { summary: "(Empty)" },
      slot3: { summary: "(Empty)" },
    };
    this.loadFromStorage();
    this.cleanupOldSave();

    document.getElementById("save-button").addEventListener(
      "click",
      debounceClick(() => {
        const selectedSlot = document.querySelector(
          'input[name="save-slot"]:checked'
        ).value;
        this.saveGameState(selectedSlot);
      })
    );

    document.getElementById("load-button").addEventListener(
      "click",
      debounceClick(() => {
        const selectedSlot = document.querySelector(
          'input[name="save-slot"]:checked'
        ).value;
        this.loadGameState(selectedSlot);
      })
    );

    document
      .getElementById("music-toggle")
      .addEventListener("change", (event) => {
        this.toggleMusic();
      });

    document.getElementById("close-config").addEventListener(
      "click",
      debounceClick(() => {
        this.close();
      })
    );

    document.getElementById("unlocked-endings-button").addEventListener(
      "click",
      debounceClick(() => {
        this.endings();
      })
    );

    document.getElementById("config-button").addEventListener(
      "click",
      debounceClick(() => {
        const configScreen = document.getElementById("config-screen");
        if (this.showing) {
          this.close();
          return;
        }
        this.showing = true;
        configScreen.style.display = "flex"; // Change from "none" to "flex" for the overlay
        document.getElementById("config-screen").style.display = "block";
        document.getElementById("music-toggle").checked =
          this.locationController.musicOn;
      })
    );

    document.getElementById("restart-button").addEventListener(
      "click",
      debounceClick(() => {
        if (
          confirm(
            "Are you sure you want to restart the game? All progress will be lost."
          )
        ) {
          // Clear game state
          location.reload(); // Reload the page to restart the game
        }
      })
    );

    document.getElementById("back-button").addEventListener(
      "click",
      debounceClick(() => {
        this.closeEndingsView();
      })
    );
  }

  loadUnlockedEndings() {
    const data = localStorage.getItem("unlockedEndings");
    if (data) {
      JSON.parse(data).forEach((name) => this.unlockedEndings.add(name));
    }
  }

  saveUnlockedEndings() {
    localStorage.setItem(
      "unlockedEndings",
      JSON.stringify([...this.unlockedEndings])
    );
  }

  unlockEnding(key) {
    if (!this.unlockedEndings.has(key)) {
      this.unlockedEndings.add(key);
      this.saveUnlockedEndings();
    }
  }

  isEndingUnlocked(key) {
    return this.unlockedEndings.has(key);
  }

  close() {
    this.errorContainer.style.display = "none";
    this.showing = false;
    const configScreen = document.getElementById("config-screen");
    configScreen.style.display = "none";
    document.body.style.overflow = ""; // Restore scrolling
    document.getElementById("config-screen").style.display = "none";
  }
  saveGameState(slot) {
    if (this.simulationController.scenarioManager.gameOver) {
      updateSummaryText(
        "The game is over. Please restart or reload to continue."
      );
      return;
    }
    if (this.simulationController.scenarioManager.gameIntro) {
      updateSummaryText("The game hasn't started yet.");
      return;
    }
    if (this.simulationController.scenarioManager.oldLife) {
      updateSummaryText("The game can't be saved.");
      return;
    }

    const gameState = {
      day: this.simulationController.day,
      energy: this.simulationController.energy,
      money: this.simulationController.money,
      dailyCost: this.simulationController.dailyCost,
      locationCost: this.simulationController.locationCost,
      jobCost: this.simulationController.jobCost,
      friendBoundary: this.simulationController.friendBoundary,
      bribes: this.simulationController.bribes,
      locations: this.locationController.locations,
      currentLocation: this.locationController.currentLocation,
      jobs: this.jobController.toData(),
      characters: this.locationController.characters,
      daysSinceLastOccupation: this.enemyController.daysSinceLastOccupation,
      mana: this.gameController.goddessController.mana,
    };

    const roomTypesData = {};
    for (const [key, roomType] of Object.entries(
      this.locationController.roomTypes
    )) {
      roomTypesData[key] = roomType.toData(); // Assume `RoomType` has a `toData` method.
    }
    gameState.roomTypes = roomTypesData;

    this.saveSlots[slot].summary = `Saved at ${new Date().toLocaleString()}`; // Example summary
    this.saveToStorage();
    this.updateSlotSummaries();
    localStorage.setItem("gameState" + slot, JSON.stringify(gameState));
    updateSummaryText("Game saved successfully!");
    this.close();
  }

  loadGameState(slot) {
    console.log("gameState" + slot);
    const gameState = JSON.parse(localStorage.getItem("gameState" + slot));
    if (!gameState) {
      this.errorContainer.textContent = `Error: No saved game found.`;
      this.errorContainer.style.display = "block";
      return;
    }
    this.simulationController.showButtons();
    this.gameController.closeDialogCallback = null;
    this.simulationController.scenarioManager.gameOver = false;
    this.simulationController.scenarioManager.gameIntro = false;
    this.simulationController.day = gameState.day;
    this.simulationController.energy = gameState.energy;
    this.simulationController.money = gameState.money;
    this.simulationController.dailyCost = gameState.dailyCost;
    this.simulationController.locationCost = gameState.locationCost;
    this.simulationController.jobCost = gameState.jobCost;
    this.simulationController.friendBoundary = gameState.friendBoundary;
    this.simulationController.bribes = gameState.bribes;
    this.enemyController.daysSinceLastOccupation =
      gameState.daysSinceLastOccupation;
    this.gameController.goddessController.mana = gameState.mana || 0;
    this.locationController.locations = gameState.locations.map(
      Location.fromData
    );
    this.locationController.characters = gameState.characters.map(
      Character.fromData
    );
    Object.keys(gameState.roomTypes).forEach((key) => {
      if (this.locationController.roomTypes[key]) {
        this.locationController.roomTypes[key] = RoomType.fromData(
          gameState.roomTypes[key]
        );
      } else {
        console.warn(`Room type '${key}' not found in current roomTypes.`);
      }
    });
    if (gameState.currentLocation) {
      this.locationController.currentLocation =
        this.locationController.locations.find(
          (loc) => loc.name === gameState.currentLocation.name
        );
    } else {
      this.locationController.currentLocation = null;
    }
    this.jobController.fromData(gameState.jobs, this.locationController);
    this.simulationController.updateDisplay();

    // Fix other places where arrays are used
    locations = this.locationController.locations;
    this.enemyController.locations = locations;
    this.mapController.setLocations(locations);
    characters = this.locationController.characters;
    this.simulationController.characters = characters;
    this.gameController.goddessController.characters = characters;
    if (this.locationController.currentLocation) {
      this.locationController.loadLocation(
        this.locationController.currentLocation
      );
    }
    this.locationController.updateDecorateOptions();
    updateSummaryText("Game loaded successfully!");
    this.close();
  }

  toggleMusic() {
    this.locationController.musicOn = !this.locationController.musicOn;
    if (!this.locationController.musicOn) this.locationController.audio.pause();
    localStorage.setItem(
      "musicSetting",
      JSON.stringify(this.locationController.musicOn)
    );
    // Logic to enable/disable music playback can go here.
  }

  applyMusicSetting() {
    const musicSetting = localStorage.getItem("musicSetting");
    if (musicSetting !== null) {
      const isMusicOn = JSON.parse(musicSetting);
      this.locationController.musicOn = isMusicOn;
    }
  }

  showEndingDetails(location) {
    // Set the background image for the left-ending-panel
    const leftEndingPanel = document.getElementById("left-ending-panel");
    leftEndingPanel.style.backgroundImage = `url(${location.getImageUrl()})`;
    leftEndingPanel.style.backgroundSize = "cover";
    leftEndingPanel.style.backgroundPosition = "center";

    // Play music if enabled and not already playing the same track
    if (this.locationController.musicOn) {
      const newMusicUrl = location.getMusicUrl();

      if (this.locationController.currentMusic !== newMusicUrl) {
        this.locationController.audio.src = newMusicUrl;
        this.locationController.audio.loop = false;
        this.locationController.audio.play();
        this.locationController.currentMusic = newMusicUrl;
      }
    }
  }

  populateEndingOptions() {
    const endingOptions = document.getElementById("ending-options");
    endingOptions.innerHTML = ""; // Clear existing options

    Object.entries(gameOverLocations).forEach(([key, location]) => {
      if (!location.name.startsWith("Game Over:")) return; // Skip non-ending locations

      const button = document.createElement("button");
      button.className = "button-parchment";
      button.classList.add("button-space");
      button.textContent = location.name.replace("Game Over: ", ""); // Display name without prefix

      if (!this.isEndingUnlocked(key)) {
        button.disabled = true; // Disable if locked
        button.classList.add("locked-ending");
      } else {
        button.addEventListener(
          "click",
          debounceClick(() => this.showEndingDetails(location))
        );
      }

      endingOptions.appendChild(button);
    });
  }

  endings() {
    this.close();
    // Hide regular panels
    document.getElementById("left-panel").style.display = "none";
    document.getElementById("right-panel").style.display = "none";

    // Show ending panels
    document.getElementById("left-ending-panel").style.display = "flex";
    document.getElementById("right-ending-panel").style.display = "flex";

    this.populateEndingOptions();
  }

  // Restore the original game panels
  closeEndingsView() {
    document.getElementById("left-ending-panel").style.display = "none";
    document.getElementById("right-ending-panel").style.display = "none";

    document.getElementById("left-panel").style.display = "flex";
    document.getElementById("right-panel").style.display = "block";
  }

  saveToStorage() {
    // Persist save slots to localStorage
    localStorage.setItem("gameSaveSlots", JSON.stringify(this.saveSlots));
  }

  loadFromStorage() {
    // Load save slots from localStorage
    const savedData = JSON.parse(localStorage.getItem("gameSaveSlots"));
    if (savedData) {
      this.saveSlots = savedData;
    }
  }

  updateSlotSummaries() {
    // Update the UI to reflect save slot summaries
    for (const slot in this.saveSlots) {
      document.getElementById(`${slot}-summary`).innerText =
        this.saveSlots[slot].summary || "(Empty)";
    }
  }

  cleanupOldSave() {
    // Check if the old gameState exists
    const oldGameState = localStorage.getItem("gameState");
    if (oldGameState) {
      // Migrate the old gameState to slot1
      localStorage.setItem("gameStateslot1", oldGameState);
      this.saveSlots.slot1.summary = `Migrated save at ${new Date().toLocaleString()}`;
      console.log("Old save data migrated to Slot 1.");

      // Clean up the old key
      localStorage.removeItem("gameState");
    }
    this.saveToStorage(); // Ensure the updated metadata is saved
  }
}
