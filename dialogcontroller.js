class DialogController {
  constructor(dialogFile, canvas, characterController, jobController, simulationController) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.loadDialogFile(dialogFile);
    this.characterController = characterController;
    this.simulationController = simulationController;
    this.jobController = jobController;
    this.currentLabel = "start"; // Begin at the default label or starting point
    this.character = characterController.character;
    this.characterX = characterController.characterX;
    this.characterY = characterController.characterY;
    this.currentIndex = 0; // Tracks the current line in the dialog
    this.state = "ACTIVE";

    // "X" button position and size
    this.closeButtonX = this.characterX + 500; // Adjust based on bubble position
    this.closeButtonY = this.characterY - 90;
    this.closeButtonSize = 20;

    this.commandTable = {
      test: (param) => this.test(param),
      showJobChoices: (param) => this.showJobChoices(param),
      selectJob: (param) => this.selectJob(param),
      // Add more functions as needed
    };
  }

  // In DialogController.js
  selectJob(roomTypeName) {
    // Step 1: Retrieve available rooms for the specified job type
    const availableRooms =
      this.jobController.getAvailableJobsForPurpose(roomTypeName);

    // Step 2: Check if there are no available rooms
    if (availableRooms.length === 0) {
      console.log(`No available rooms for job type: ${roomTypeName}`);
      return ["There are no available rooms for this job type at the moment."];
    }

    // Step 3: Try assigning the NPC to the first available empty room
    let assigned = false;
    for (const room of availableRooms) {
      assigned = this.jobController.assignNpcToJob(room, this.character);
      if (assigned) {
        this.simulationController.recalculateDailyCostJobs(jobController);
        return [`Thank you for giving me a job in your ${roomTypeName}!`];
      }
    }

    // Step 4: If no room assignment was successful, return a fallback message
    console.log(`All rooms are occupied for job type: ${roomTypeName}`);
    return ["All rooms for this job type are currently occupied."];
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

    // Create dialogue options based on available jobs
    const choices =
      availableJobs.length > 0
        ? availableJobs.map((job) => ({
            label: job,
            action: () => this.assignJob(dialogueContext.npcId, job),
          }))
        : [];

    // Add a fallback option in case the player wants to decline or no jobs are available
    choices.push({
      label: "I'll get back to you",
      action: () => console.log("Player chose to delay job assignment."),
    });

    // Returns formatted choices for use in the dialogue UI
    return choices;
  }

  test(param) {
    console.log("" + param);
    return ["This is the end", "As we know it."];
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

    for (let line of dialogFile) {
      line = line.trim();
      if (line.endsWith(":")) {
        if (label) {
          dialogMap.set(label, dialogLines);
        }
        label = line.slice(0, -1); // Remove the ':' from the label
        dialogLines = [];
      } else if (label) {
        if (line != "") dialogLines.push(line);
      }
    }

    if (label) {
      dialogMap.set(label, dialogLines);
    }
    return dialogMap;
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
          fetch(newFile)
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

  // Method to clear only the dialog bubble area
  clearBubble() {
    const bubbleX = this.characterX + 50; // Adjust based on bubble position
    const bubbleY = this.characterY - 100; // Adjust to appear above the character
    this.context.clearRect(bubbleX, bubbleY, 400, 100);
    this.context.clearRect(this.closeButtonX - 20, this.closeButtonY - 20, 40, 40);
  }

  drawSpeechBubble(characterX, characterY, dialogue) {
    const bubbleImage = new Image();
    bubbleImage.src = "images/bubble.png"; // Path to your speech bubble image

    bubbleImage.onload = () => {
      // Position the speech bubble above the character’s image
      const bubbleX = characterX + 50; // Adjust based on bubble position
      const bubbleY = characterY - 100; // Adjust to appear above the character

      // Draw the bubble background image
      this.context.drawImage(bubbleImage, bubbleX, bubbleY, 400, 100);

      // Draw the text within the bubble
      this.context.font = "14px Arial";
      this.context.fillStyle = "black";
      this.context.textAlign = "center";
      // Split dialogue into lines with a max of 60 characters, keeping words intact
      const maxLineLength = 60;
      const wrappedText = this.wrapText(dialogue, maxLineLength);

      // Calculate initial text Y position within the bubble
      let textY = bubbleY + 40; // Start text a bit lower inside the bubble
      const lineHeight = 20; // Line spacing for readability

      // Draw each line of wrapped text
      wrappedText.forEach((line) => {
        this.context.fillText(line, bubbleX + 200, textY); // Center text in the bubble
        textY += lineHeight;
      });
      // Draw the "X" button
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
    if (y > 200) {
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
    // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
      const choiceButton = document.createElement("button");
      choiceButton.innerText = text;
      choiceButton.className = "button-parchment";
      choiceButton.style.margin = "5px";
      choiceButton.onclick = () => {
        this.chooseOption(label); // Update dialog based on choice
        this.start(); // Restart dialog with chosen label
        this.closePopup();
        this.state = "ACTIVE";
      };
      this.choiceContainer.appendChild(choiceButton);
      this.state = "POPUP";
    });

    // Add the choice container to the body or a parent element
    document
      .getElementById("choice-popup-holder")
      .appendChild(this.choiceContainer);
  }

  // Modified start method to handle dialog choices and emotions
  start() {
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
    if (dialogContent.startsWith("@")) {
      const commandMatch = dialogContent.match(/^@(\w+)\((.*)\)$/);
      if (commandMatch) {
        const commandName = commandMatch[1];
        const param = commandMatch[2];

        // Look up and execute the command
        const commandFunction = this.commandTable[commandName];
        if (commandFunction) {
          const result = commandFunction(param);

          // Handle the result if it returns dialogue text
          if (result) {
            this.dialogMap.set("commandResult", result);
            this.chooseOption("commandResult");
          }
          dialogContent = this.getNextLine();
        }
      }
    }

    // Handle dialog choices if line starts with "?"
    if (dialogContent && dialogContent.startsWith("?")) {
      this.drawSpeechBubble(
        this.characterX,
        this.characterY,
        dialogContent.slice(1)
      );
      const choices = this.parseChoices();
      this.showChoices(choices);
    } else if (dialogContent) {
      // Regular dialog line
      this.drawSpeechBubble(this.characterX, this.characterY, dialogContent);
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
