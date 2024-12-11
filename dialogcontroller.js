/**
 * Dialogue File Syntax Documentation
 *
 * A dialogue file consists of labeled sections that define the NPC's interactions.
 * Below are the key elements and features you can use in a dialogue file:
 *
 * 1. **Labels**:
 *    Labels act as entry points or sections in the dialogue. Define a label by ending a line with a colon (`:`).
 *    Example:
 *      start:
 *        Hello there.
 *
 *    - Labels cannot be created dynamically via function return values.
 *    - Each label must be unique within the file.
 *
 * 2. **Random Lines**:
 *    Include random lines using a block of lines starting with `#`.
 *    A single line from the block will be chosen at random during parsing.
 *    Example:
 *      #The moon will rise tonight.
 *      #Winter is coming.
 *      #I will miss you. Stay.
 *
 *    - Random blocks cannot be created dynamically via function return values.
 *    - Random blocks can contain > for redirection.
 *
 * 3. **Directing to Another Label**:
 *    Use `>` to jump directly to another label within the same dialogue file.
 *    Example:
 *      >anotherLabel
 *
 * 4. **Emotion Tags**:
 *    Use `!` to set the NPC's emotion. This can update the NPC's expression or mood.
 *    Example:
 *      !neutral
 *      !happy
 *      !angry
 *
 * 5. **Questions and Player Choices**:
 *    Use `?` to pose a question or prompt the player to make a choice.
 *    Choices are defined using square brackets (`[]`).
 *    Example:
 *      ?What would you like to do?
 *      [label1] Learn more about your skills.
 *      [label2] Let’s do some training.
 *
 *    - Choices must reference valid labels.
 *
 * 6. **Calling Functions**:
 *    Use `@functionName(parameter)` to call functions defined in the `commandTable`.
 *    Functions can return arrays of dialogue lines as if they were part of the label.
 *    Example:
 *      @showSkill()
 *      @train(10)
 *
 *    - Functions must exist in the `commandTable`.
 *    - Functions can dynamically generate responses but cannot define labels or random blocks.
 *
 * 7. **Combining Elements**:
 *    Most elements can be combined in sequence within a label.
 *    Example:
 *      start:
 *        !happy
 *        Hello there!
 *        ?What do you need?
 *        [label1] Learn more.
 *        [label2] Just passing by.
 *
 *
 * Notes and Limitations:
 * ----------------------
 * - Labels and random lines must be defined in the static dialogue file and cannot be generated dynamically.
 * - Functions are limited to modifying or returning dialogue within the confines of an existing label.
 * - Ensure proper formatting for clarity and consistency.
 * - Lines can't be too long, as they must fit in the text bubble.
 */
class DialogController {
  constructor(
    dialogFile,
    canvas,
    characterController,
    jobController,
    simulationController,
    gameController
  ) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.characterController = characterController;
    this.character = characterController.character;
    this.gameController = gameController;
    this.simulationController = simulationController;
    this.loadDialogFile(dialogFile);
    this.jobController = jobController;
    this.currentLabel = "start"; // Begin at the default label or starting point
    this.characterX = characterController.characterX;
    this.characterY = characterController.characterY;
    this.currentIndex = 0; // Tracks the current line in the dialog
    this.state = "ACTIVE";

    // "X" button position and size
    this.closeButtonX = this.characterX + 500; // Adjust based on bubble position
    this.closeButtonY = this.characterY - 90;
    this.closeButtonSize = 20;
    this.shopManager = new ShopManager(this.simulationController);
    this.commandTable = {
      getItemsForSale: (param) => this.shopManager.getItemsForSale(param),
      buyItem: (param) => this.shopManager.buyItem(param),
      showJobChoices: (param) => this.showJobChoices(param),
      selectJob: (param) => this.selectJob(param),
      train: (param) => this.train(param),
      showSkill: (param) => this.showSkill(param),
      invest: (param) => this.invest(param), // New function
      getInvestmentAmount: (param) => this.getInvestmentAmount(param),
      giveBonus: (amount) => this.giveBonus(amount),
      adjustLike: (param) => this.adjustLike(param),
      friendCheck: (param) => this.friendCheck(param),
      giveLike: (param) => this.giveLike(param),
      buyoutLocation: (param) => this.buyoutLocation(param),
      scenarioStep: (param) => this.scenarioStep(param),
      hasMoney: (param) => this.hasMoney(param),
      adjustEvilness: (param) => this.adjustEvilness(param), // Added function to adjust evilness
      setTidbit: (param) => this.setTidbit(param), // Add setTidBit command
      getFollowerCount: (param) => this.getFollowerCount(param),
      pray: (param) => this.pray(param),
      checkTheft: (param) => this.checkTheft(param),
      communify: (param) => this.communify(param),
      checkEvil: (param) => this.checkEvil(param),
      // Add more functions as needed
    };
  }

  checkEvil(value) {
    const evilness = this.simulationController.evilness;
    console.log(`Evilness check: ${evilness} against ${value}`);
    return evilness >= parseInt(value)
      ? [">checkEvilTrue"]
      : [">checkEvilFalse"];
  }

  communify(param) {
    const location = this.gameController.locationController.currentLocation;
    if (param == "nirvani") {
      location.rooms[0].music = "music/temple2.mp3";
      return [">nirvaniLocation"];
    }
    const price = this.gameController.jobController.markAsCommunity(location);
    this.simulationController.recalculateDailyCostLocations(
      this.gameController.locationController.locations
    );
    this.simulationController.recalculateDailyCostJobs();
    this.simulationController.money += price;
    this.simulationController.updateDisplay();
    this.gameController.locationController.loadLocation(location);
    return [">communify"];
  }

  checkTheft() {
    const loanSharkRoom = roomTypes["loansharking"];

    // Check if theft logs exist
    if (
      !loanSharkRoom.theftHistory ||
      loanSharkRoom.theftHistory.length === 0
    ) {
      return [">notheft"]; // No theft to report
    }

    // Add an introductory message
    const theftDescriptions = [
      "We've detected some irregularities in the funds. Here are the details:",
    ];

    // Describe the theft(s)
    theftDescriptions.push(
      ...loanSharkRoom.theftHistory.map((theft, index) => {
        return `Incident ${index + 1}: ${theft.amount} currency was stolen on ${
          theft.date
        }.`;
      })
    );

    // Clear the theft record after processing
    loanSharkRoom.theftHistory = [];

    // Add a marker to indicate theft occurred
    theftDescriptions.push(">theft");

    return theftDescriptions;
  }

  pray(target) {
    if (target === "xivato") {
      const result = this.gameController.goddessController.prayForEviction();

      if (result === true) {
        return [
          "The Goddess has answered your prayer!",
          "The Xivato have been driven from one of their strongholds.",
        ];
      } else {
        return [result]; // Return the failure message
      }
    }
    return ["The Goddess cannot fulfill that request."];
  }

  getFollowerCount() {
    // Count followers by checking tidbits
    const followers = this.gameController.goddessController.calculateFollowers(
      this.gameController.goddessController.getFollowerCount()
    );

    // Check if prayers can be answered
    const canAnswerPrayer =
      this.gameController.goddessController.canHearPrayer();

    // Construct the response based on follower count and prayer status
    let response = [];
    if (followers > 0) {
      response.push(
        `We currently have ${followers} devoted followers in Malvani's name.`
      );
      if (canAnswerPrayer) {
        response.push("The Goddess is listening; your prayers may be heard.");
        response.push(">prayerPossible");
        return response;
      } else {
        response.push(
          "The faith is strong, but the Goddess requires more mana to act."
        );
      }
    } else {
      response.push(
        "There's only the two truly dedicated members.",
        "The faith is yet to grow."
      );
    }

    // Add dialogue metadata
    response.push(">getFollowerCount");
    return response;
  }

  setTidbit(param) {
    // Extract tidbit name and optional prefix from the parameter
    const tidbitName = param.trim();
    let tidbitKey = tidbitName;
    let target = this.character; // Default to the current character

    // Check for GLOBAL prefix
    if (tidbitName.startsWith("GLOBAL/")) {
      tidbitKey = tidbitName.replace("GLOBAL/", ""); // Strip the GLOBAL prefix
      target = this.simulationController; // Switch target to global tidbits
    }

    // Set the tidbit for the target
    const result = target.setTidbit(tidbitKey);

    if (target == this.simulationController) {
      this.gameController.locationController.updateDecorateOptions();
    }

    // Return the reference for branching in the dialogue
    return [">" + result]; // Return an array with the result to match other commands' return formats
  }

  adjustEvilness(param) {
    const change = parseInt(param, 10); // Get the evilness change (positive or negative)
    this.simulationController.updateEvilness(change); // Update the evilness in the simulation
    const nextLabel = change < 0 ? ">goodviolet" : ">evilviolet"; // Determine the next label based on change
    return [nextLabel]; // Return a dialogue response and a label jump
  }

  hasMoney(param) {
    const money = parseInt(param, 10);
    if (this.simulationController.money >= money) {
      return ["You seem rich enough."];
    }
    return ["Oh, you poor thing...", ">poor"];
  }

  scenarioStep(param) {
    // Handle specific steps in your scenario logic
    if (param === "start") {
      console.log("Moving to game start due to skip.");
      // Move the game state to the next scenario step
      this.gameController.closeDialogCallback = null;
      this.simulationController.scenarioManager.triggerGameStart(); // Example: Loads a new location or triggers events
      return [""];
    }
    if (param === "oldlife") {
      console.log("Moving to old life...");
      this.gameController.closeDialogCallback = null;
      this.simulationController.scenarioManager.triggerOldLife();
      return [""];
    }
    if (param === "childend") {
      console.log("Game over child");
      this.gameController.closeDialogCallback = null;
      this.simulationController.scenarioManager.triggerGameOver(
        "United with her child, Violet resumes her old life.",
        "child"
      );
      return [""];
    }
    if (param === "goddess") {
      console.log("Nirvani/Malvani encounter");
      this.gameController.goddessController.reduceMana();
      this.gameController.closeDialogCallback = null;
      if (!this.simulationController.hasTidbit("goddessNirvani")) {
        const location = this.gameController.findLocationByName("Purgatory Malvani");
        location.ref = this.gameController.locationController.currentLocation.ref;
        this.gameController.locationController.loadLocation(location);
        return [""];
      }
      const nirvani = this.gameController.getCharacterByName("Nirvani");
      nirvani.location = "Purgatory Nirvani";
      nirvani.dialogue = "nirvani2.txt";
      const location = this.gameController.findLocationByName("Purgatory Nirvani");
      location.ref = this.gameController.locationController.currentLocation.ref;
      this.gameController.locationController.loadLocation(location);
      return [""];
    }
    // Add other steps as needed
    return [""];
  }

  buyoutLocation(param) {
    const amount = parseInt(param, 10);
    if (!this.simulationController.deductMoney(amount)) {
      return ["You don't even have that, silly Violet!"];
    }
    if (amount < 1000000 && this.simulationController.day * 15000 > amount) {
      return ["Thank you for the money, but that is hardly enough."];
    }
    this.character.currentLocation.vacate();
    return [
      "Oh, it is a pleasure doing business with you.",
      "Have fun with this new property. We will be back!",
    ];
  }

  isFriend() {
    const friendBoundary = this.simulationController.friendBoundary || 0;
    return this.character.like >= friendBoundary;
  }

  friendCheck() {
    if (this.isFriend()) {
      return ["Of course, you're my friend.", ">friendCheck"]; // Success case
    } else {
      return ["I'm sorry, but I need more time to trust you."]; // Failure case
    }
  }

  adjustLike(amount) {
    const like = parseInt(amount, 10);
    this.character.like += like; // Adjust the like value
    if (like > 0) {
      return ["You're so nice."];
    }
    return ["Hm... Pity."];
  }

  giveLike(amount) {
    const bonus = parseInt(amount, 10);
    if (!this.simulationController.deductMoney(bonus)) {
      return ["You don't have enough money to give this gift."];
    }

    if (this.character.name === "Police Officer") {
      // For the Police Officer, call addBribe instead of adjusting like
      this.simulationController.addBribe(bonus);
      return [
        `Thank you for your generous contribution of ¥${amount.toLocaleString()}!`,
        "We'll make sure things stay quieter for you.",
      ];
    }

    if (bonus < 0) {
      return [">money"];
    }
    // Default behavior for other characters
    const likeBoost = Math.min(5, Math.floor(amount / 3000)); // Diminishing returns
    this.character.like = Math.min(100, this.character.like + likeBoost);

    return [
      `Thank you for your generous gift of ¥${amount.toLocaleString()}!`,
      likeBoost > 0 ? `I feel closer to you.` : `Oh, that's thoughtful...`,
      ">giveLike",
    ];
  }

  giveBonus(amount) {
    const bonus = parseInt(amount, 10);
    if (!this.simulationController.deductMoney(bonus)) {
      return ["You don't have enough money to give this bonus."];
    }
    // Boost skill with diminishing returns
    const skillBoost = Math.min(5, Math.floor(amount / 5000));
    this.character.skillLevel = Math.min(
      100,
      this.character.skillLevel + skillBoost
    );
    this.giveLike(amount / 2);
    return [
      `Thank you for your ¥${amount.toLocaleString()}.`,
      skillBoost > 0 ? `I will work better!` : `Aw...`,
    ];
  }

  getInvestmentAmount() {
    // Fetch the room type object for the current job
    const job = this.jobController.getRoomTypeByName(
      this.jobController.jobs[this.character.location].purpose
    );

    // If the job exists and has funds, format and return the amount
    if (job && job.funds !== undefined) {
      return [
        `We currently have ¥${job.funds.toLocaleString()} in funds.`,
        ">getInvestmentAmount",
      ];
    } else {
      return ["It seems we don’t have any funds yet.", ">getInvestmentAmount"];
    }
  }

  invest(amount) {
    const investmentAmount = parseInt(amount, 10);
    if (isNaN(investmentAmount) || investmentAmount === 0) {
      return ["Please enter a valid amount to invest or withdraw."];
    }

    const job = this.jobController.getRoomTypeByName(
      this.jobController.jobs[this.character.location].purpose
    );

    // If withdrawing (negative investment)
    if (investmentAmount < 0) {
      const withdrawAmount = Math.abs(investmentAmount);
      if ((job.funds || 0) < withdrawAmount) {
        return [
          "This loan office doesn't have enough funds to withdraw that amount.",
        ];
      }
      job.funds -= withdrawAmount;
      this.simulationController.money += withdrawAmount;

      // Update display
      this.simulationController.updateDisplay();

      return [
        `You withdrew ¥${withdrawAmount.toLocaleString()} from the ${
          job.name
        }.`,
        `The ${job.name} now has ¥${job.funds.toLocaleString()} available.`,
      ];
    }
    // If depositing (positive investment)
    if (!this.simulationController.deductMoney(investmentAmount)) {
      return ["You don't have enough money to invest that much."];
    }
    job.funds = (job.funds || 0) + investmentAmount;
    // Update display
    this.simulationController.updateDisplay();
    return [
      `You invested ¥${investmentAmount.toLocaleString()} in the ${job.name}.`,
      `The ${job.name} now has ¥${job.funds.toLocaleString()} available.`,
    ];
  }

  showSkill(param) {
    const skillLevel = this.character.skillLevel;
    const description = this.getSkillDescription(skillLevel);
    return [`Let me think...`, `I feel like ${description}`, ">showSkill"];
  }

  getSkillDescription(skillLevel) {
    // Map skill level ranges to descriptions
    if (skillLevel < 10) return "I know nothing about this.";
    if (skillLevel < 20) return "I'm just starting to learn.";
    if (skillLevel < 30) return "I have a basic understanding.";
    if (skillLevel < 40) return "I'm getting the hang of it.";
    if (skillLevel < 50) return "I'm fairly competent.";
    if (skillLevel < 60) return "I'm doing well.";
    if (skillLevel < 70) return "I'm quite skilled.";
    if (skillLevel < 80) return "I'm very skilled.";
    if (skillLevel < 90) return "I'm an expert.";
    return "I've mastered this.";
  }

  train(param) {
    const energyCost = 40; // Energy cost for training
    const amount = parseInt(param, 10); // Extract the training amount

    if (isNaN(amount)) {
      console.error("Invalid @train parameter. Expected a number.");
      return;
    }

    // Deduct energy from Violet
    if (this.simulationController.deductEnergy(energyCost)) {
      // Update the skill level of the current character
      if (this.character) {
        this.character.skillLevel = Math.min(
          100,
          this.character.skillLevel + amount
        );
        return ["Thank you for training me."];
      }
    } else {
      return ["You seem too tired to help me."];
    }
  }

  // In DialogController.js
  selectJob(roomTypeName) {
    // Step 1: Retrieve available rooms for the specified job type
    const availableRooms =
      this.jobController.getAvailableJobsForPurpose(roomTypeName);

    // Step 2: Check if there are no available rooms
    if (availableRooms.length === 0) {
      console.log(`No available rooms for job type: ${roomTypeName}`);
      return [">selectJobFail"];
    }

    // Step 3: Try assigning the NPC to the first available empty room
    let assigned = false;
    for (const room of availableRooms) {
      assigned = this.jobController.assignNpcToJob(room, this.character);
      if (assigned) {
        this.simulationController.recalculateDailyCostJobs(this.jobController);
        if (this.simulationController.friendBoundary < 90) {
          this.simulationController.friendBoundary =
            this.simulationController.friendBoundary + 10;
        }
        return [`Thank you for giving me a place in your ${roomTypeName}!`];
      }
    }

    // Step 4: If no room assignment was successful, return a fallback message
    console.log(`All rooms are occupied for job type: ${roomTypeName}`);
    return [">selectJobFail"];
  }

  showJobChoices(param) {
    const availableJobs = this.jobController.getAvailableJobTypes();
    let jobOptions = availableJobs.map((jobType) => {
      const jobInfo = this.jobController.getRoomTypeByName(jobType);
      return `[${jobType}] ${jobInfo.job}.`;
    });

    // Add a cancel option
    jobOptions.push("[Cancel] Let me get back to you.");
    return ["?Which job would you like me to do?", ...jobOptions];
  }

  // Method to load and parse a dialog file
  loadDialogFile(dialogFile) {
    this.dialogMap = this.parseDialogFile(dialogFile);
  }

  // Parse the dialog file into a structured format
  parseDialogFile(dialogFile) {
    const dialogMap = new Map();
    let label = null;
    let dialogLines = [];
    let randomBlock = [];

    for (let line of dialogFile) {
      line = line.trim();

      if (line.endsWith(":")) {
        // Save the previous label and its lines
        if (label) {
          dialogMap.set(label, dialogLines);
        }
        // Start a new label
        label = line.slice(0, -1); // Remove the ':' from the label
        dialogLines = [];
      } else if (line.startsWith("#")) {
        // Handle random line blocks
        randomBlock.push(line.slice(1)); // Remove the '#' and add to the random block
      } else if (randomBlock.length > 0) {
        // If exiting a random block, pick one randomly and add it
        const randomLine =
          randomBlock[Math.floor(Math.random() * randomBlock.length)];
        dialogLines.push(this.processTidbitSyntax(randomLine));
        randomBlock = [];

        // Process the current line normally if it's not empty
        if (line !== "") dialogLines.push(this.processTidbitSyntax(line));
      } else if (label) {
        // Normal line processing
        if (line !== "") dialogLines.push(this.processTidbitSyntax(line));
      }
    }

    // Save the final label and its lines
    if (label) {
      dialogMap.set(label, dialogLines);
    }

    return dialogMap;
  }

  processTidbitSyntax(line) {
    // Match the syntax ${CharacterName/tidbitKey:if_true:if_false}
    const tidbitRegex = /\$\{([^:]+):([^:]*):([^}]+)\}/g;

    return line.replace(tidbitRegex, (match, key, ifTrue, ifFalse) => {
      let characterName = null;
      let tidbitKey = key;

      // Check if there's a character prefix
      if (key.includes("/")) {
        [characterName, tidbitKey] = key.split("/");
      }

      // Resolve the character or check the simulation controller for GLOBAL
      let hasTidbit = false;
      if (characterName === "GLOBAL") {
        hasTidbit = this.simulationController.hasTidbit(tidbitKey);
      } else {
        const character = characterName
          ? this.gameController.getCharacterByName(characterName)
          : this.character; // Default to current character
        hasTidbit = character?.hasTidbit(tidbitKey);
      }

      // Return the appropriate value
      return hasTidbit ? (ifTrue !== "" ? ifTrue : "") : ifFalse;
    });
  }

  // Fetches the next line and checks for special commands like ~<file>
  getNextLine() {
    if (this.currentLabel && this.dialogMap.has(this.currentLabel)) {
      const dialogLines = this.dialogMap.get(this.currentLabel);
      if (this.currentIndex < dialogLines.length) {
        let line = dialogLines[this.currentIndex++];

        if (line.startsWith("~")) {
          // Handle the command to load a new dialogue file
          const newFile = line.slice(1).trim();
          const url = `dialogue/${newFile}?v=${Date.now()}`; // Append directory path
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              this.loadDialogFile(data.split("\n")); // Replace dialog file content
              this.currentLabel = "start";
              this.currentIndex = 0;
              this.start(); // Restart dialog with the new file
            });
          return "..."; // Temporarily return ... while loading the new file
        }

        return line;
      }
    } else {
      console.log("Label " + this.currentLabel + " not found in dialogue.");
    }
    return null;
  }

  hasMoreLines() {
    if (this.currentLabel && this.dialogMap.has(this.currentLabel)) {
      return this.currentIndex < this.dialogMap.get(this.currentLabel).length;
    }
    return false;
  }

  // Advance dialog based on selected choice
  chooseOption(label) {
    this.currentLabel = label;
    this.currentIndex = 0; // Tracks the current line in the dialog
  }

  // Method to clear the manga-style panel area
  clearPanel() {
    const panelX = this.characterX + 255; // Match panel position
    const panelY = this.characterY + 20; // Match panel position
    const panelWidth = 410; // Match panel width
    const panelHeight = 210; // Match panel height

    this.context.clearRect(panelX, panelY, panelWidth, panelHeight);
  }

  // Method to draw a manga-style panel above the speech bubble
  drawPanel(url) {
    const panelX = this.characterX + 260; // Adjust based on panel position
    const panelY = this.characterY + 25; // Place it higher than the bubble
    const panelWidth = 200; // Adjust the width of the panel
    const panelHeight = 200; // Adjust the height of the panel
    const borderWidth = 5;

    const img = new Image();
    img.onload = () => {
      this.context.drawImage(img, panelX, panelY, panelWidth, panelHeight);

      this.context.shadowColor = "rgba(0, 0, 0, 0.5)";
      this.context.shadowBlur = 10;
      this.context.shadowOffsetX = 5;
      this.context.shadowOffsetY = 5;

      // Outer border
      this.context.strokeStyle = "black";
      this.context.lineWidth = borderWidth;
      this.context.strokeRect(
        panelX - borderWidth / 2,
        panelY - borderWidth / 2,
        panelWidth + borderWidth,
        panelHeight + borderWidth
      );

      // Inner border
      this.context.strokeStyle = "white";
      this.context.lineWidth = 2;
      this.context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    };
    img.src = `images/manga/${url}`; // Prepend the images/ directory to the URL
  }

  // Method to clear only the dialog bubble area
  clearBubble() {
    const bubbleX = this.characterX + 50; // Adjust based on bubble position
    const bubbleY = this.characterY - 100; // Adjust to appear above the character
    this.context.clearRect(bubbleX, bubbleY, 400, 100);
    this.context.clearRect(
      this.closeButtonX - 20,
      this.closeButtonY - 20,
      40,
      40
    );
  }

  drawSpeechBubble(characterX, characterY, dialogue, emotion) {
    const bubbleImage = new Image();
    let bubbleSrc = "images/bubble.png"; // Default speech bubble

    const emotionStyles = {
      happy: { src: "images/bubble.png", textColor: "#A8760B" }, // Darker goldenrod
      angry: { src: "images/bubble_angry.png", textColor: "#B22222" }, // Firebrick
      sad: { src: "images/bubble_sad.png", textColor: "#000080" }, // Navy
      shock: { src: "images/bubble.png", textColor: "#8B4513" }, // SaddleBrown
      confused: { src: "images/bubble_confused.png", textColor: "#4B0082" }, // Indigo
      neutral: { src: "images/bubble.png", textColor: "black" },
      curious: { src: "images/bubble_confused.png", textColor: "#006400" }, // DarkGreen
      cheerful: { src: "images/bubble.png", textColor: "#FF8C00" }, // Darker orange
      frustrated: { src: "images/bubble_angry.png", textColor: "#A52A2A" }, // Brown
      empathetic: { src: "images/bubble.png", textColor: "#C71585" }, // MediumVioletRed
      conflicted: { src: "images/bubble_confused.png", textColor: "#4B0082" }, // Indigo
      analytical: { src: "images/bubble.png", textColor: "#1E4E79" }, // Darker SteelBlue
      scientific: { src: "images/bubble.png", textColor: "#1E4E79" }, // Match analytical
    };

    // Check for emotion and update bubbleSrc and text color
    if (emotion && emotionStyles[emotion]) {
      bubbleSrc = emotionStyles[emotion].src;
    }

    bubbleImage.src = bubbleSrc;

    bubbleImage.onload = () => {
      // Position the speech bubble above the character’s image
      const bubbleX = characterX + 50; // Adjust based on bubble position
      const bubbleY = characterY - 100; // Adjust to appear above the character

      // Draw the bubble background image
      this.context.drawImage(bubbleImage, bubbleX, bubbleY, 400, 100);

      // Set font and text color based on emotion
      const textColor = emotionStyles[emotion]?.textColor || "black";
      this.context.font =
        emotion === "happy" || emotion === "curious" || emotion === "cheerful"
          ? "italic 16px Arial"
          : "16px Arial";
      this.context.textAlign = "center";

      this.context.shadowColor = "rgba(0, 0, 0, 0.2)"; // Lighter shadow
      this.context.shadowBlur = 2; // Less blur
      this.context.shadowOffsetX = 0; // Optional: remove offsets
      this.context.shadowOffsetY = 1; // Subtle shadow effect

      // Split dialogue into lines with a max of 55 characters, keeping words intact
      const maxLineLength = 45;
      const wrappedText = this.wrapText(dialogue, maxLineLength);

      // Calculate initial text Y position within the bubble
      let textY = bubbleY + 40; // Start text a bit lower inside the bubble
      const lineHeight = 22; // Adjust line spacing

      // Draw each line of wrapped text
      this.context.fillStyle = textColor; // Apply text color
      wrappedText.forEach((line) => {
        this.context.fillText(line, bubbleX + 200, textY); // Center text in the bubble
        textY += lineHeight;
      });

      // Reset shadow to avoid affecting other drawings
      this.context.shadowColor = "transparent";
      this.context.shadowBlur = 0;

      // Draw the "X" button (if applicable)
      this.drawCloseButton();
    };
  }

  // Helper function to wrap text into lines
  wrapText(text, maxLineLength) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const newLine = currentLine + (currentLine ? " " : "") + word;
      if (newLine.length > maxLineLength) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = newLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  drawCloseButton() {
    this.context.fillStyle = "red";
    this.context.beginPath();
    this.context.arc(
      this.closeButtonX,
      this.closeButtonY,
      this.closeButtonSize,
      0,
      2 * Math.PI
    );
    this.context.fill();

    // Draw the "X" inside the button
    this.context.strokeStyle = "white";
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(this.closeButtonX - 5, this.closeButtonY - 5);
    this.context.lineTo(this.closeButtonX + 5, this.closeButtonY + 5);
    this.context.moveTo(this.closeButtonX - 5, this.closeButtonY + 5);
    this.context.lineTo(this.closeButtonX + 5, this.closeButtonY - 5);
    this.context.stroke();
  }

  handleCanvasClick(event, x, y) {
    // Check if click is within the "X" button area
    const dx = x - this.closeButtonX;
    const dy = y - this.closeButtonY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.closeButtonSize) {
      this.closeDialog(); // Close the dialog if "X" is clicked
      return true;
    }

    // Then check character click
    if (y > 200 && x > 50 && x < this.canvas.width - 50) {
      this.character.dayTalk = this.simulationController.day;
      this.start();
      return true;
    }
    return false;
  }

  closePopup() {
    if (this.choiceContainer) {
      document
        .getElementById("choice-popup-holder")
        .removeChild(this.choiceContainer); // Remove the popup
      this.choiceContainer = null;
    }
  }

  closeDialog() {
    if (this.state == "INACTIVE") {
      return;
    }
    this.state = "INACTIVE";
    this.closePopup();
    // Clear the canvas to remove any previously drawn characters
    this.characterController.clearCharacter();
    this.clearBubble();
    this.clearPanel();
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Check if there's a scenario step tied to this dialogue
    const callback = this.gameController.closeDialogCallback;
    this.gameController.closeDialogCallback = null;
    if (typeof callback === "function") {
      console.log(
        "Executing closeDialogCallback:",
        callback.name || "anonymous function"
      );
      callback();
    }
  }

  startDialog(label) {
    this.currentLabel = label;
    this.currentIndex = 0;
  }

  showChoices(choices) {
    // Create a container for choices
    this.choiceContainer = document.createElement("div");
    this.choiceContainer.id = "choice-popup";
    this.choiceContainer.style.position = "absolute";
    this.choiceContainer.style.left = "50px"; // Adjust as needed
    this.choiceContainer.style.bottom = "50px"; // Adjust as needed
    this.choiceContainer.style.padding = "10px";
    this.choiceContainer.style.backgroundColor = "rgba(0,0,0,0.7)";
    this.choiceContainer.style.borderRadius = "5px";

    // Add each choice as a button
    choices.forEach(([label, text]) => {
      const isConfused = label.startsWith("^"); // Check for the ^ marker
      const cleanLabel = isConfused ? label.slice(1) : label; // Remove the ^ marker

      const choiceButton = document.createElement("button");
      choiceButton.innerText = text;
      choiceButton.className = "button-parchment";
      choiceButton.style.margin = "5px";

      // Apply special styling for confused choices
      if (isConfused) {
        choiceButton.style.color = "#003366"; // Special color for learning options
        choiceButton.style.fontStyle = "italic"; // Optional: make it italic for emphasis
        choiceButton.style.border = "2px dotted #003366";
        choiceButton.style.backgroundColor = "rgba(173, 216, 230, 0.5)";
      }

      choiceButton.onclick = debounceClick(() => {
        this.closePopup();
        this.state = "ACTIVE";
        this.chooseOption(cleanLabel); // Use the cleaned label
        this.start(); // Restart dialog with chosen label
      });
      this.choiceContainer.appendChild(choiceButton);
      this.state = "POPUP";
    });

    // Add the choice container to the body or a parent element
    document
      .getElementById("choice-popup-holder")
      .appendChild(this.choiceContainer);
  }

  // Modified start method to handle dialog choices and emotions
  start(first = false) {
    if (first) {
      if (this.isFriend()) {
        this.handleEmotion("!happy");
      } else {
        this.handleEmotion("!neutral");
      }
    }
    let dialogContent = this.getNextLine();
    if (!dialogContent) {
      this.closeDialog();
      return;
    }
    // Handle emotion change if line starts with "!"
    if (dialogContent.startsWith("!")) {
      this.handleEmotion(dialogContent);
      dialogContent = this.getNextLine();
    }
    // Handle manga panel change if line starts with "%"
    if (dialogContent.startsWith("%")) {
      const panelCommand = dialogContent.substring(1).trim(); // Get text after "%"
      if (panelCommand) {
        this.drawPanel(panelCommand); // Draw specified panel
      } else {
        this.clearPanel(); // Clear the panel if no text
      }
      dialogContent = this.getNextLine(); // Move to the next line
    }
    if (dialogContent.startsWith(">")) {
      this.chooseOption(dialogContent.slice(1));
      this.start();
      return;
    }
    // Handle commands if line starts with "@"
    if (dialogContent.startsWith("@")) {
      const commandMatch = dialogContent.match(/^@(\w+)\((.*)\)$/);
      if (commandMatch) {
        const commandName = commandMatch[1];
        const param = commandMatch[2];

        // Look up and execute the command
        const commandFunction = this.commandTable[commandName];
        if (commandFunction) {
          const result = commandFunction(param);
          this.dialogMap.set("commandResult", result);
          this.chooseOption("commandResult");
          dialogContent = this.getNextLine();
          if (dialogContent.startsWith(">")) {
            // Handle branching logic directly
            this.chooseOption(dialogContent.slice(1));
            this.start(); // Continue processing
            return;
          }
        } else {
          console.log("Couldn't find command " + commandName);
        }
      }
    }

    // Handle dialog choices if line starts with "?"
    if (dialogContent && dialogContent.startsWith("?")) {
      this.drawSpeechBubble(
        this.characterX,
        this.characterY,
        dialogContent.slice(1),
        this.character.bubbleEmotion
      );
      const choices = this.parseChoices();
      this.showChoices(choices);
    } else if (dialogContent) {
      // Regular dialog line
      this.drawSpeechBubble(
        this.characterX,
        this.characterY,
        dialogContent,
        this.character.bubbleEmotion
      );
    }
  }

  // New helper method to handle emotion changes
  handleEmotion(line) {
    const emotion = line.slice(1); // Extract the emotion keyword
    this.characterController.updateEmotion(emotion);
  }

  // New helper method to parse dialog choices
  parseChoices() {
    const choices = [];
    let line;

    while ((line = this.getNextLine()) !== null) {
      if (line.startsWith("[")) {
        // Check for choice format "[label] message"
        const [label, text] = line.slice(1).split("] ");
        choices.push([label.trim(), text.trim()]);
      } else {
        break; // Stop parsing if a non-choice line is encountered
      }
    }
    return choices;
  }
}
