// Helper function to format time from seconds to MM:SS
function formatTime(time) {
    // Ensure time is a number and not negative
    if (isNaN(time) || time < 0) {
        return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    // Add leading zero to seconds if less than 10
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    return `${minutes}:${formattedSeconds}`;
}


window.addEventListener('load', () => {
    console.log("Window loaded, initializing report blocks.");

    // Select all report blocks
    document.querySelectorAll('.report-block').forEach(reportBlock => {
        // Find buttons within this block
        const readBtn = reportBlock.querySelector('.js-read-btn');
        const listenBtn = reportBlock.querySelector('.js-listen-btn');
        const watchBtn = reportBlock.querySelector('.js-watch-btn');

        // Get media source URLs from data attributes
        const audioSrc = reportBlock.dataset.audioSrc; // Get audio source URL
        const videoSrc = reportBlock.dataset.videoSrc; // Get video source URL
        const reportUrl = reportBlock.dataset.reportUrl; // Get report URL


        // Find audio elements and players within this block
        const audioWrapper = reportBlock.querySelector('.js-audio-wrapper');
        const audioElement = reportBlock.querySelector('.js-audio-element');
        const audioPlayPauseBtn = reportBlock.querySelector('.js-audio-play-pause-btn');
        const audioProgressBarContainer = reportBlock.querySelector('.js-audio-progress');
        const audioProgressBar = reportBlock.querySelector('.js-audio-progress-bar');
        const audioTimeDisplay = reportBlock.querySelector('.js-audio-time-display');
        const audioCloseBtn = reportBlock.querySelector('.js-audio-close-btn');


        const videoWrapper = reportBlock.querySelector('.js-video-wrapper');
        const videoElement = reportBlock.querySelector('.js-video-element');
        // Assuming video might have similar controls, add selectors if needed
        // const videoPlayPauseBtn = reportBlock.querySelector('.js-video-play-pause-btn');
        // const videoProgressBarContainer = reportBlock.querySelector('.js-video-progress');
        // const videoProgressBar = reportBlock.querySelector('.js-video-progress-bar');
        // const videoTimeDisplay = reportBlock.querySelector('.js-video-time-display');
        const videoCloseBtn = reportBlock.querySelector('.js-video-close-btn');


        // --- Existing Button Click Listeners (Keep these) ---
        if (readBtn) {
            readBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                // reportUrl is already read above
                if (reportUrl) {
                    // Logic to open report (e.g., in a new tab or modal)
                    window.open(reportUrl, '_blank'); // Open in a new tab
                    console.log('Reading report:', reportUrl);
                    // Removed alert as it's disruptive
                } else {
                    console.warn("No report URL found for this block.");
                }
            });
        }

        if (listenBtn && audioWrapper && audioElement) { // Ensure audioElement exists
            listenBtn.addEventListener('click', () => {
                // Hide other media wrappers in this block
                if (videoWrapper) videoWrapper.classList.remove('visible');
                 // Pause other media players on the page
                document.querySelectorAll('.js-audio-element, .js-video-element').forEach(media => {
                    if (media !== audioElement && !media.paused) {
                        media.pause();
                        // Optionally update their play/pause buttons and classes
                        const parentPlayer = media.closest('.custom-player');
                        if (parentPlayer) {
                             const btn = parentPlayer.querySelector('.play-pause-btn'); // Selector might need adjustment for video
                             if(btn) btn.textContent = '▶'; // Reset button text
                             if(btn) btn.classList.remove('playing'); // Remove playing class
                        }
                    }
                });

                // Toggle visibility of the audio player wrapper
                audioWrapper.classList.toggle('visible');
                if (!audioWrapper.classList.contains('visible')) {
                    // If hiding, pause the audio
                    if (!audioElement.paused) { // Check if it was playing
                        audioElement.pause();
                         if(audioPlayPauseBtn) audioPlayPauseBtn.textContent = '▶';
                         if(audioPlayPauseBtn) audioPlayPauseBtn.classList.remove('playing');
                    }
                     // Reset time and progress when hidden
                     audioElement.currentTime = 0;
                     if (audioProgressBar) audioProgressBar.style.width = '0%';
                      // Reset time display
                     if (audioTimeDisplay) audioTimeDisplay.textContent = '0:00 / 0:00';

                } else {
                    // If showing, set the audio source and load/play
                    if (audioSrc && audioElement.src !== audioSrc) { // Only set src if different
                         audioElement.src = audioSrc;
                         audioElement.load(); // Load the audio
                         console.log("Loading audio from:", audioSrc);
                    } else if (!audioSrc) {
                         console.warn("No audio source URL found for this block.");
                         // Hide the player again if no source
                         audioWrapper.classList.remove('visible');
                         return; // Stop here if no source
                    }

                     // Set initial button state (play icon) - playback starts on play button click
                      if(audioPlayPauseBtn) audioPlayPauseBtn.textContent = '▶';
                      if(audioPlayPauseBtn) audioPlayPlayPauseBtn.classList.remove('playing');
                      // Set initial time display if duration is known (will be updated by loadedmetadata)
                       if (audioTimeDisplay && !isNaN(audioElement.duration)) {
                           audioTimeDisplay.textContent = `0:00 / ${formatTime(audioElement.duration)}`;
                       } else if (audioTimeDisplay) {
                           audioTimeDisplay.textContent = '0:00 / 0:00'; // Default until metadata loads
                       }
                }
            });
        }

        if (watchBtn && videoWrapper && videoElement) { // Ensure videoElement exists
             watchBtn.addEventListener('click', () => {
                // Hide other media wrappers in this block
                if (audioWrapper) audioWrapper.classList.remove('visible');
                 // Pause other media players on the page
                document.querySelectorAll('.js-audio-element, .js-video-element').forEach(media => {
                    if (media !== videoElement && !media.paused) {
                        media.pause();
                         // Optionally update their play/pause buttons and classes
                         const parentPlayer = media.closest('.custom-player');
                         if (parentPlayer) {
                             const btn = parentPlayer.querySelector('.play-pause-btn'); // Selector might need adjustment for audio
                              if(btn) btn.textContent = '▶'; // Reset button text
                              if(btn) btn.classList.remove('playing'); // Remove playing class
                         }
                    }
                });

                // Toggle visibility of the video player wrapper
                 videoWrapper.classList.toggle('visible');
                 if (!videoWrapper.classList.contains('visible')) {
                     // If hiding, pause the video
                     if (!videoElement.paused) { // Check if it was playing
                         videoElement.pause();
                         // If you have a custom play/pause button for video, update it here
                         // if(videoPlayPauseBtn) videoPlayPauseBtn.textContent = '▶';
                     }
                      // Reset time if video has controls and you want to reset
                     videoElement.currentTime = 0;
                 } else {
                     // If showing, set the video source and load
                     if (videoSrc && videoElement.src !== videoSrc) { // Only set src if different
                         videoElement.src = videoSrc;
                         videoElement.load(); // Load the video
                         console.log("Loading video from:", videoSrc);
                     } else if (!videoSrc) {
                         console.warn("No video source URL found for this block.");
                         // Hide the player again if no source
                         videoWrapper.classList.remove('visible');
                         return; // Stop here if no source
                     }
                     // If showing, video will be ready to play (can be handled by video controls)
                     // if(videoPlayPauseBtn) videoPlayPauseBtn.textContent = '▶'; // Set initial button state if exists
                 }
            });
        }


        // --- Audio Player Functionality (Includes Progress and Seeking) ---
        // Ensure these event listeners are added only if the elements exist
        if (audioElement && audioPlayPauseBtn && audioProgressBarContainer && audioProgressBar && audioTimeDisplay) {

            // Update time display and progress bar as audio plays
            audioElement.addEventListener('timeupdate', () => {
                const percentage = (audioElement.currentTime / audioElement.duration) * 100;
                if (!isNaN(percentage)) { // Only update if duration is valid (audio has loaded enough)
                     audioProgressBar.style.width = percentage + '%';
                     audioTimeDisplay.textContent = `${formatTime(audioElement.currentTime)} / ${formatTime(audioElement.duration)}`;
                } else {
                     // Handle case where duration is not yet known
                     audioTimeDisplay.textContent = `${formatTime(audioElement.currentTime)} / 0:00`;
                }
            });

            // Update total duration when metadata is loaded
             audioElement.addEventListener('loadedmetadata', () => {
                audioTimeDisplay.textContent = `0:00 / ${formatTime(audioElement.duration)}`;
             });

             // Handle audio ending
             audioElement.addEventListener('ended', () => {
                 audioPlayPauseBtn.textContent = '▶'; // Change button to play symbol
                 audioPlayPauseBtn.classList.remove('playing'); // Remove playing class
                 audioElement.currentTime = 0; // Reset to start
                 audioProgressBar.style.width = '0%'; // Reset progress bar
                  if (audioTimeDisplay && !isNaN(audioElement.duration)) {
                      audioTimeDisplay.textContent = `0:00 / ${formatTime(audioElement.duration)}`;
                  } else if (audioTimeDisplay) {
                       audioTimeDisplay.textContent = '0:00 / 0:00';
                   }
             });


            // Handle seeking when progress bar container is clicked
            audioProgressBarContainer.addEventListener('click', (e) => {
                // Ensure duration is valid before seeking
                 if (isNaN(audioElement.duration)) {
                     console.warn("Audio duration not available yet. Cannot seek.");
                     return;
                 }
                const clickPosition = e.offsetX; // Position relative to the container
                const containerWidth = audioProgressBarContainer.offsetWidth; // Total width of the container
                // Calculate the time to seek to (click position / container width) * total duration
                const seekTime = (clickPosition / containerWidth) * audioElement.duration;

                if (!isNaN(seekTime)) { // Ensure seekTime is a valid number
                     audioElement.currentTime = seekTime;
                }
            });

             // Optional: Handle seeking when progress bar is dragged (more complex but better UX)
            let isDragging = false; // Variable to track if dragging is active

            // Mouse events for desktop dragging
            audioProgressBarContainer.addEventListener('mousedown', (e) => {
                 // Ensure duration is valid before starting drag/seek
                 if (isNaN(audioElement.duration)) {
                     console.warn("Audio duration not available yet. Cannot seek.");
                     return;
                 }
                isDragging = true;
                 // Prevent text selection while dragging
                e.preventDefault();
                // Calculate position relative to the start of the container
                const containerRect = audioProgressBarContainer.getBoundingClientRect();
                const mouseX = e.clientX - containerRect.left;
                const containerWidth = audioProgressBarContainer.offsetWidth;
                const seekTime = (mouseX / containerWidth) * audioElement.duration;

                 // Update time immediately on mousedown
                 if (seekTime >= 0 && seekTime <= audioElement.duration && !isNaN(seekTime)) {
                    audioElement.currentTime = seekTime;
                 }
            });

            // Use document to ensure drag continues even if mouse leaves the progress bar
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                     // Ensure duration is valid
                     if (isNaN(audioElement.duration)) return;

                     // Calculate position relative to the start of the container
                    const containerRect = audioProgressBarContainer.getBoundingClientRect();
                    const mouseX = e.clientX - containerRect.left;
                    const containerWidth = audioProgressBarContainer.offsetWidth;
                    const seekTime = (mouseX / containerWidth) * audioElement.duration;

                    // Update time only if within bounds and valid
                    if (seekTime >= 0 && seekTime <= audioElement.duration && !isNaN(seekTime)) {
                         audioElement.currentTime = seekTime;
                         // Manually update progress bar width during drag for smoother visual feedback
                         audioProgressBar.style.width = (seekTime / audioElement.duration) * 100 + '%';
                         // Optionally update time display during drag
                         // audioTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(audioElement.duration)}`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });


             // --- Mobile Touch Event Listeners for dragging ---
            audioProgressBarContainer.addEventListener('touchstart', (e) => {
                 // Ensure duration is valid
                 if (isNaN(audioElement.duration)) return;
                isDragging = true;
                 // Prevent default scrolling/zooming
                 e.preventDefault();
                 // Handle touch position immediately on touchstart
                const touchPosition = e.touches[0].clientX - e.target.getBoundingClientRect().left;
                const containerWidth = audioProgressBarContainer.offsetWidth;
                const seekTime = (touchPosition / containerWidth) * audioElement.duration;
                 if (seekTime >= 0 && seekTime <= audioElement.duration && !isNaN(seekTime)) {
                    audioElement.currentTime = seekTime;
                 }
            });

            document.addEventListener('touchmove', (e) => {
                if (isDragging) {
                     // Ensure duration is valid
                     if (isNaN(audioElement.duration)) return;

                     // Prevent default scrolling/zooming
                    e.preventDefault();
                    const containerRect = audioProgressBarContainer.getBoundingClientRect();
                    const touchX = e.touches[0].clientX - containerRect.left;
                    const containerWidth = audioProgressBarContainer.offsetWidth;
                    const seekTime = (touchX / containerWidth) * audioElement.duration;

                     if (seekTime >= 0 && seekTime <= audioElement.duration && !isNaN(seekTime)) {
                         audioElement.currentTime = seekTime;
                         // Manually update progress bar width during drag for smoother visual feedback
                         audioProgressBar.style.width = (seekTime / audioElement.duration) * 100 + '%';
                          // Optionally update time display during drag
                         // audioTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(audioElement.duration)}`;
                    }
                }
            });

            document.addEventListener('touchend', () => {
                isDragging = false;
            });


        }
        // --- End Audio Player Functionality ---


         // --- Existing Close Button Listeners (Keep these) ---
        if(audioCloseBtn && audioWrapper && audioElement) {
            audioCloseBtn.addEventListener('click', () => {
                audioWrapper.classList.remove('visible');
                if (!audioElement.paused) { // Check if it was playing
                     audioElement.pause();
                     if(audioPlayPauseBtn) audioPlayPauseBtn.textContent = '▶'; // Reset button text
                     if(audioPlayPauseBtn) audioPlayPauseBtn.classList.remove('playing'); // Remove playing class
                }
                 // Reset time and progress when closed
                 audioElement.currentTime = 0;
                 if (audioProgressBar) audioProgressBar.style.width = '0%';
                 // Reset time display
                  if (audioTimeDisplay && !isNaN(audioElement.duration)) {
                      audioTimeDisplay.textContent = `0:00 / ${formatTime(audioElement.duration)}`;
                  } else if (audioTimeDisplay) {
                       audioTimeDisplay.textContent = '0:00 / 0:00';
                   }

            });
        }

         if(videoCloseBtn && videoWrapper && videoElement) { // Ensure videoElement exists
             videoCloseBtn.addEventListener('click', () => {
                 videoWrapper.classList.remove('visible');
                 if (!videoElement.paused) { // Check if it was playing
                     videoElement.pause();
                     // if(videoPlayPauseBtn) videoPlayPauseBtn.textContent = '▶'; // Reset video play/pause button if exists
                 }
                  // Reset time if video has controls and you want to reset
                 if (videoElement) videoElement.currentTime = 0;
             });
         }

    }); // End reportBlock loop

    // --- Optional: Check for initial players that should be hidden on load ---
    // Although display:none in CSS handles initial hidden state,
    // JS can be used to explicitly hide if CSS isn't reliable.
    // This logic might already be handled by your button click listeners initially hiding others.

}); // End window.addEventListener('load')

