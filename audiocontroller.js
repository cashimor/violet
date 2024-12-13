class AudioController {
  constructor() {
    this.locationAudio = new Audio();
    this.themeAudio = new Audio();
    this.musicOn = true;
    this.currentLocationMusic = null;
    this.currentThemeMusic = null;
  }

  setMusicOn(state) {
    this.musicOn = state;

    if (!state) {
      this.locationAudio.pause();
      this.themeAudio.pause();
    } else {
      if (this.currentThemeMusic) {
        // Resume theme music if it exists
        this.themeAudio.play();
      } else if (this.currentLocationMusic) {
        // Resume location music if it exists
        this.locationAudio.play();
      }
    }
  }

  playLocationMusic(url) {
    if (!url || this.currentLocationMusic === url) return;
  
    this.currentLocationMusic = url; // Always store the URL
    this.locationAudio.src = url;   // Always set the source, even if music is off
    this.locationAudio.loop = false;
  
    if (this.musicOn) {
      this.locationAudio.play();
    }
  }  

  playThemeMusic(url) {
    if (!this.musicOn) return;
    if (this.currentThemeMusic === url) {
        this.themeAudio.play();
        this.locationAudio.pause();
        return;
    }
    this.currentThemeMusic = url;
    this.themeAudio.src = url;
    this.themeAudio.loop = true;
    this.themeAudio.play();

    // Pause location music while theme is active
    this.locationAudio.pause();
  }

  stopThemeMusic() {
    this.themeAudio.pause();

    // Resume location music
    if (this.currentLocationMusic) {
      this.locationAudio.play();
    }
  }
}
