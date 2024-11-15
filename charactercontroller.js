class CharacterController {
  constructor(character, canvasContext, dialogController) {
    this.character = character; // Character details (name, image, etc.)
    this.context = canvasContext; // Canvas context for drawing
    this.dialogController = dialogController; // Reference to dialog controller for dialog events
    this.imageLoaded = false;

    this.characterX = 50; // Default position, can be adjusted
    this.characterY = 315; // Default position, can be adjusted
    this.width = 255; // Character image width
    this.height = 285; // Character image height

    this.drawCharacter();
  }

  // Method to clear only the character's area
  clearCharacter() {
    this.context.clearRect(
      this.characterX,
      this.characterY,
      this.width,
      this.height
    );
  }

  drawCharacter() {
    const characterImage = new Image();
    characterImage.src = this.character.getCurrentImageUrl();

    characterImage.onload = () => {
      this.clearCharacter();

      // Get the original dimensions of the image
      const originalWidth = characterImage.width;
      const originalHeight = characterImage.height;

      // Calculate the aspect ratio and the scaled width
      let scaledWidth = (this.height / originalHeight) * originalWidth;

      // If scaled width exceeds the maximum allowed, cap it to this.width
      if (scaledWidth > this.width) {
        scaledWidth = this.width;
      }

      // Draw the character image with the scaled width and fixed height
      this.context.drawImage(
        characterImage,
        this.characterX,
        this.characterY,
        scaledWidth,
        this.height
      );
      // Draw character name below the image
      this.context.font = "16px Arial";
      this.context.fillStyle = "white";
      this.context.textAlign = "center";
      this.context.fillText(
        this.character.name,
        this.characterX + this.width / 2,
        this.characterY + this.height - 20
      );
    };
  }

  // Update character's emotion and redraw
  updateEmotion(newEmotion) {
    this.character.setEmotion(newEmotion);
    this.drawCharacter();
  }
}
