class PhoneController {
  constructor(containerId, canvasId, buttonId, gameController) {
    this.container = document.getElementById(containerId);
    this.canvas = document.getElementById(canvasId);
    this.button = document.getElementById(buttonId);
    this.gameController = gameController;

    // Initialize PixiJS app
    this.app = new PIXI.Application({
      view: this.canvas,
      width: 280,
      height: 500,
      backgroundColor: 0x000000, // Default phone background
    });

    // Track phone state
    this.isVisible = false;

    document
      .getElementById("toggle-phone-btn")
      .addEventListener("click", () => {
        this.togglePhone();
      });

    this.assets = {
      contactsIcon: "./images/assets/contacts.png", // Path to Contacts icon
      backIcon: "./images/assets/back.png", // Path to Back icon
    };

    // Contacts storage
    this.contacts = [];
    this.addContact("Police Officer", null);
    this.addBaseUI();
  }

  // Convert contacts to a serializable format
  toData() {
    return this.contacts.map((contact) => ({
      name: contact.name,
      onCallCallback: null, // Callbacks cannot be serialized
    }));
  }

  // Load contacts from serialized data
  fromData(data) {
    if (!data) return;
    this.contacts = data.map((contactData) => ({
      name: contactData.name,
      onCallCallback: () => {
        console.log(`Calling ${contactData.name}...`); // Default callback, replace if necessary
      },
    }));
  }

  // Add base UI, including the address book icon
  addBaseUI() {
    // Clear previous content
    this.clearStage();

    const addressBookIcon = PIXI.Sprite.from(this.assets.contactsIcon);
    addressBookIcon.x = 20;
    addressBookIcon.y = 20;
    addressBookIcon.width = 40;
    addressBookIcon.height = 40;
    addressBookIcon.interactive = true;
    addressBookIcon.buttonMode = true;

    addressBookIcon.on("pointerdown", () => {
      this.showContacts();
    });

    // Add hover effects
    addressBookIcon.on("pointerover", () => {
      addressBookIcon.tint = 0xaaaaaa; // Lighten icon on hover
    });
    addressBookIcon.on("pointerout", () => {
      addressBookIcon.tint = 0xffffff; // Restore original color
    });

    this.app.stage.addChild(addressBookIcon);
  }

  // Add a new contact to the address book
  addContact(name, onCallCallback) {
    this.contacts.push({ name, onCallCallback });
  }

  // Show the list of contacts
  showContacts() {
    // Clear previous content
    this.clearStage();

    const title = new PIXI.Text("Contacts", {
      fontSize: 24,
      fill: "#ffffff",
    });
    title.x = 10;
    title.y = 10;
    this.app.stage.addChild(title);

    // Add each contact as a clickable item
    this.contacts.forEach((contact, index) => {
        // Background bar
        const bar = new PIXI.Graphics();
        const barHeight = 30;
        bar.beginFill(0x333333); // Dark gray color for the bar
        bar.drawRect(10, 50 + index * (barHeight + 5), 260, barHeight); // Adjust dimensions as needed
        bar.endFill();
    
        bar.interactive = true;
        bar.buttonMode = true;
    
        // Highlight on hover
        bar.on("pointerover", () => {
          bar.tint = 0x555555; // Slightly lighter gray
        });
        bar.on("pointerout", () => {
          bar.tint = 0xffffff; // Reset tint
        });
    
        bar.on("pointerdown", () => {
          contact.onCallCallback();
        });
    
        this.app.stage.addChild(bar);
    
        // Contact text
        const contactText = new PIXI.Text(contact.name, {
          fontSize: 20,
          fill: "#ffffff",
        });
        contactText.x = 20; // Slight padding from the left of the bar
        contactText.y = 55 + index * (barHeight + 5); // Align with the bar
        this.app.stage.addChild(contactText);
      });

    // Add a back button
    const backButton = PIXI.Sprite.from(this.assets.backIcon);
    backButton.x = 10;
    backButton.y = this.app.renderer.height - 50; // 10px padding from the bottom
    backButton.width = 40;
    backButton.height = 40;
    backButton.interactive = true;
    backButton.buttonMode = true;

    backButton.on("pointerdown", () => {
      this.addBaseUI();
    });

    backButton.on("pointerover", () => {
      backButton.tint = 0xaaaaaa; // Lighten the icon on hover
    });
    backButton.on("pointerout", () => {
      backButton.tint = 0xffffff; // Restore original color
    });

    this.app.stage.addChild(backButton);
  }

  // Clear all elements from the PixiJS stage
  clearStage() {
    this.app.stage.removeChildren();
  }

  // Show the phone interface
  showPhone() {
    this.container.style.display = "block";
    this.isVisible = true;
  }

  // Hide the phone interface
  hidePhone() {
    this.container.style.display = "none";
    this.isVisible = false;
  }

  // Toggle phone visibility
  togglePhone() {
    if (this.isVisible) {
      this.hidePhone();
    } else {
      this.showPhone();
    }
  }

  // Show the phone button
  showButton() {
    if (this.button) {
      this.button.classList.remove("hidden");
    }
  }

  // Hide the phone button
  hideButton() {
    if (this.button) {
      this.button.classList.add("hidden");
    }
  }
}
