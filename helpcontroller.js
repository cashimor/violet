class HelpController {
  constructor(gameController) {
    this.gameController = gameController;
    this.violetOutline = document.getElementById("violet-outline");
    this.helpScreen = document.getElementById("help-screen");
    this.helpContent = document.getElementById("help-content");
    this.closeHelpButton = document.getElementById("close-help");
    this.shown = false;

    this.violetOutline.addEventListener("click", () => {
      if (this.shown) {
        this.hide();
        return;
      }
      this.update();
      this.helpScreen.classList.toggle("active");
      this.shown = true;
    });

    this.closeHelpButton.addEventListener("click", () => {
      this.hide();
    });

    this.stages = {
      intro: `
          <p>Welcome to the game! Here's how to navigate through the dialogue:</p>
          <ul>
            <li><strong>Click on the character/text bubble</strong> to proceed to the next part of the conversation.</li>
            <li><strong>Click on the buttons</strong> below the dialogue to choose a possible response or action.</li>
          </ul>
          <p>You’ll also notice the following elements:</p>
          <ul>
            <li><strong>Red Circle with an "X"</strong>: This dismisses the character, skipping the rest of the dialogue. Note that skipping dialogue does not skip its effects!</li>
            <li><strong>Disappearing Characters</strong>: Characters you interact with will disappear until the next day, so choose your interactions wisely!</li>
          </ul>
          <p>Feel free to experiment and explore different responses. Good luck!</p>
        `,
      itsuki: `
        <p>The <strong>Map button</strong> allows you to open the map of the area.</p>
        <ul>
          <li><strong>Red dots</strong> represent interesting locations you can explore.</li>
          <li>The <strong>blue dot</strong> marks the Police Station, which can be critical for your progress.</li>
        </ul>
        <p>Click on a dot to travel to that location. The map is essential for navigating the city and finding new opportunities!</p>
      `,
      lowMoney: `
      <p>It seems you don't have much money left!</p>
      <ul>
        <li>You can ask NPCs for money by choosing the "Beg" option during dialogue.</li>
        <li>Friendly NPCs (those who smile at you) are more likely to give you money.</li>
        <li>Interact with NPCs to see if they are friendly and request their help.</li>
      </ul>
    `,
      noLocations: `
      <p>You currently don't have a rented location. Here's what to do:</p>
      <ul>
        <li>Use the map to explore various places. The map button shows your options.</li>
        <li>Hover over buildings in a location to see if blue squares appear.</li>
        <li>Click on a blue square to enter that building.</li>
        <li>Inside, you can check if you can rent the location or if it's already occupied.</li>
        <li>To leave a location, click the yellow arrow in the corner of the screen.</li>
      </ul>
    `,
      noDecoratedRoom: `
    <h3>Setting Up a Job</h3>
    <p>To start making money, you’ll need a decorated room that’s suitable for a job. 
    Some great options to begin with include:</p>
    <ul>
      <li><b>Massage Parlor</b> – A simple and profitable choice.</li>
      <li><b>Gambling Den</b> – Attracts wealthy patrons for big earnings.</li>
      <li><b>Drugs Laboratory</b> – High risk, but high reward.</li>
    </ul>
    <p>Look for a rentable location on the map, decorate it appropriately, and you’ll be ready to start your business!</p>
  `,
      recruitHelp: `
    <p>You have decorated rooms available for jobs, but they need workers!</p>
    <p>To recruit someone, go to an NPC and see if they are willing to work for you:</p>
    <ul>
      <li>If the NPC likes you enough, you can ask them to take a job in your establishment.</li>
      <li>Not all NPCs are suited for every job. Pay attention to their traits and dialogue.</li>
      <li>If successful, the NPC will start working in the job you assign them, and you'll begin earning income!</li>
    </ul>
    <p>Keep building relationships and improving your rooms to attract better workers.</p>
  `,
      multipleRoomsHelp: `
    <p>Congratulations on filling your first decorated room!</p>
    <p>Did you know that apartments can have multiple rooms?</p>
    <ul>
      <li>Inside the apartment, look for the <strong>left</strong> and <strong>right arrows</strong> near the edges of the screen.</li>
      <li>Use these arrows to cycle through different rooms in the apartment.</li>
      <li>You can decorate and fill additional rooms to expand your operations and increase your income!</li>
    </ul>
    <p>Keep an eye out for other ways to maximize the use of your space.</p>
  `,
      lowEnergy: `
    <p>Your energy is running low! Here's how to improve it:</p>
    <ul>
      <li>Build an <b>Evil Lair</b>: This adds 25 energy every day.</li>
      <li>Assign someone to the Evil Lair: This adds another 25 energy every day.</li>
      <li>You can rest a day, which gives energy back.</li>
    </ul>
    <p>Energy is essential for running your operations, so make sure to manage it wisely!</p>
  `,
      trainNPCs: `
    <p>Some of your rooms are operating, but the NPCs aren't fully trained.</p>
    <ul>
      <li>NPC that need training: <span id="fillin"></span>.</li>
      <li>You can train your NPCs to improve their efficiency and unlock advanced abilities.</li>
      <li>Select an NPC and look for the <b>Train</b> option to get started.</li>
      <li>Training will take time but is essential for running a successful operation!</li>
    </ul>
    <p>Don't forget to regularly train your NPCs to keep up with increasing demands!</p>
  `,
      xivato: `
  <p><strong>The Xivato:</strong> A new faction has emerged—an evil organization called the Xivato.</p>
  <ul>
    <li>Xivato-controlled locations are marked on the map with a <strong>red influence circle</strong>.</li>
    <li>These locations are no longer available for purchase.</li>
    <li>However, you can visit these areas and attempt to negotiate or interact with the Xivato.</li>
  </ul>
  <p>Be cautious—the Xivato have their own motives and can be dangerous!</p>
`,
      evil_win: `
      <p><strong>Evil Win Condition:</strong></p>
      <p>You can achieve ultimate victory in the evil path by meeting these conditions:</p>
      <ul>
        <li><strong>Accumulate 1,000,000 Yen.</strong> Use your resources wisely to amass this fortune.</li>
        <li><strong>Occupy all locations:</strong> Make sure all available locations are under your influence.</li>
        <li><strong>Remove Xivato influence:</strong> Ensure no locations are under the control of the Xivato faction.</li>
        <li><strong>Bribe the police:</strong> Successfully secure their cooperation to shield your operations.</li>
      </ul>
      <p>Once all these conditions are met, you will achieve the evil victory!</p>
      <p>Remember: the path to power is filled with challenges, but careful planning and determination will lead you to success.</p>
    `,
      default: `
        <h2>General Help</h2>
        <p>Explore and interact with the game world to uncover its secrets!</p>
      `,
      // Other stages...
    };
  }

  getUndertrainedJobNPCs() {
    const undertrained = [];

    for (const roomId in this.gameController.jobController.jobs) {
      const job = this.gameController.jobController.jobs[roomId];
      if (job.npcAssigned) {
        const npc = job.npcAssigned;

        // Check if the NPC is undertrained
        if (npc && npc.skillLevel < 20) {
          undertrained.push(npc.name);
        }
      }
    }
    return undertrained;
  }

  hide() {
    this.shown = false;
    this.helpScreen.classList.toggle("active");
  }

  update() {
    if (this.gameController.simulationController.gameIntro) {
      this.updateStage("intro");
      return;
    }
    if (
      this.gameController.locationController.currentLocation.name ==
      "Itsuki's Apartment"
    ) {
      this.updateStage("itsuki");
      return;
    }
    if (this.gameController.simulationController.money < 10000) {
      this.updateStage("lowMoney");
      return;
    }
    if (
      this.gameController.simulationController.energy < 15 &&
      this.gameController.simulationController.evilLairBonus < 15
    ) {
      this.updateStage("lowEnergy");
      return;
    }
    if (this.gameController.xivatoController.owned("Violet") < 1) {
      this.updateStage("noLocations");
      return;
    }
    if (this.gameController.xivatoController.owned("Xivato") > 0) {
      this.updateStage("xivato");
      return;
    }
    if (this.gameController.xivatoController.owned("Violet") > 2) {
      this.updateStage("evil_win");
      return;
    }
    if (
      this.gameController.xivatoController.owned("Violet") == 1 &&
      this.gameController.jobController.getAvailableJobTypes().length === 0
    ) {
      if (Object.keys(this.gameController.jobController.jobs).length == 1) {
        this.updateStage("multipleRoomsHelp");
        return;
      }
      this.updateStage("noDecoratedRoom");
      return;
    }
    const underTrained = this.getUndertrainedJobNPCs();
    if (underTrained.length > 0) {
      const npcList = underTrained.join(", "); // Join the NPC names with commas
      this.updateStage("trainNPCs");
      document.getElementById("fillin").innerHTML = "<B>" + npcList + "</B>";
      return;
    }
    if (this.gameController.jobController.getAvailableJobTypes().length > 0) {
      this.updateStage("recruitHelp");
      return;
    }
    console.log("Falling back to default help file!");
    this.updateStage("default");
  }

  updateStage(stage) {
    this.helpContent.innerHTML = this.stages[stage];
  }
}
