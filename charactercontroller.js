class CharacterController {
    constructor(character, canvasContext, dialogController) {
        this.character = character; // Character details (name, image, etc.)
        this.context = canvasContext; // Canvas context for drawing
        this.dialogController = dialogController; // Reference to dialog controller for dialog events
        this.imageLoaded = false;

        this.characterX = 50;  // Default position, can be adjusted
        this.characterY = 315; // Default position, can be adjusted
        this.width = 255;      // Character image width
        this.height = 285;     // Character image height

        this.drawCharacter();
    }

    drawCharacter() {
        const characterImage = new Image();
        characterImage.src = this.character.getCurrentImageUrl();
        
        characterImage.onload = () => {
            // Clear the area where the character will be redrawn
            this.context.clearRect(this.characterX, this.characterY, this.width, this.height);
            
            // Draw the updated character image
            this.context.drawImage(characterImage, this.characterX, this.characterY, this.width, this.height);
            
            // Draw character name below the image
            this.context.font = "16px Arial";
            this.context.fillStyle = "white";
            this.context.textAlign = "center";
            this.context.fillText(this.character.name, this.characterX + this.width / 2, this.characterY + this.height - 20);
        };
    }

    // Update character's emotion and redraw
    updateEmotion(newEmotion) {
        this.character.setEmotion(newEmotion);
        this.drawCharacter();
    }
}
