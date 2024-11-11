class CharacterController {
    constructor(character, canvasContext, dialogController) {
        this.character = character; // Character details (name, image, etc.)
        this.context = canvasContext; // Canvas context for drawing
        this.dialogController = dialogController; // Reference to dialog controller for dialog events
        this.imageLoaded = false;
        this.image = new Image();
        this.image.src = this.character.imageUrl;

        this.characterX = 50;  // Default position, can be adjusted
        this.characterY = 315; // Default position, can be adjusted
        this.width = 255;      // Character image width
        this.height = 285;     // Character image height

        // Load image and flag as loaded to avoid repeated loading
        this.image.onload = () => {
            this.imageLoaded = true;
            this.drawCharacter(); // Draw the character immediately after loading
        };
    }

    drawCharacter() {
        if (this.imageLoaded) {
            // Draw character image
            this.context.drawImage(this.image, this.characterX, this.characterY, this.width, this.height);

            // Draw character name below the image
            this.context.font = "16px Arial";
            this.context.fillStyle = "white";
            this.context.textAlign = "center";
            this.context.fillText(this.character.name, this.characterX + this.width / 2, this.characterY + this.height - 20);
        }
    }

    // Update visuals when dialog is active
    updateVisualsDuringDialog() {
        // Placeholder for actions to take when the character is actively talking
        this.drawCharacter();
        this.drawActiveState();
    }

    // Draw indicator for active dialog state (optional)
    drawActiveState() {
        this.context.strokeStyle = "yellow";
        this.context.lineWidth = 3;
        this.context.strokeRect(this.characterX, this.characterY, this.width, this.height);
    }

    // Clear any highlighting or active indicators
    clearVisualIndicators() {
        this.context.clearRect(this.characterX - 3, this.characterY - 3, this.width + 6, this.height + 6); // Clear with padding
        this.drawCharacter(); // Redraw character after clearing
    }

    // Handle any changes in dialog and update visuals
    handleDialogUpdate() {
        if (this.dialogController && this.dialogController.active) {
            this.updateVisualsDuringDialog();
        } else {
            this.clearVisualIndicators();
        }
    }

    // Start dialog when clicked or triggered
    startDialog() {
        if (this.dialogController) {
            this.dialogController.startDialog("start");
            this.handleDialogUpdate(); // Update visuals when dialog starts
        }
    }
}
