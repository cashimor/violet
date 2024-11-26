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
      default: `
        <h2>General Help</h2>
        <p>Explore and interact with the game world to uncover its secrets!</p>
      `,
      // Other stages...
    };
    this.update("intro");
  }

  hide() {
    this.shown = false;
    this.helpScreen.classList.toggle("active");
  }

  update(stage) {
    this.helpContent.innerHTML = this.stages[stage];
  }
}
