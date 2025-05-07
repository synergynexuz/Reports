// reportPlayerInitializer.js

(function() { // Use an IIFE to keep variables out of the global scope

    // Array to keep track of all media elements initialized ({ element, type })
    const allMediaElements = [];

    // --- Helper function for time formatting ---
    function formatTime(seconds) {
      // Ensure time is a number and not negative
      if (isNaN(seconds) || seconds < 0) {
          return '0:00';
      }
      const minutes = Math.floor(seconds / 60);
      seconds = Math.floor(seconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // --- Helper function to pause all other media players ---
    function pauseOtherMedia(currentPlayerElement) {
        allMediaElements.forEach(mediaItem => {
            const otherMediaElement = mediaItem.element;
            if (otherMediaElement && otherMediaElement !== currentPlayerElement && !otherMediaElement.paused) {
                otherMediaElement.pause();

                // Find the container for this other media element
                const otherContainer = otherMediaElement.closest('.report-block');
                if (otherContainer) {
                   // Find and hide the visible wrapper for the paused media
                   const otherAudioWrapper = otherContainer.querySelector('.js-audio-wrapper');
                   const otherVideoWrapper = otherContainer.querySelector('.js-video-wrapper');

                   if (mediaItem.type === 'audio' && otherAudioWrapper) {
                      otherAudioWrapper.classList.remove('visible');
                      // Update audio play button and state
                      const otherAudioPlayBtn = otherContainer.querySelector('.js-audio-play-pause-btn');
                      if(otherAudioPlayBtn) {
                           otherAudioPlayBtn.textContent = '▶';
                           otherAudioPlayBtn.classList.remove('playing');
                      }
                      // Optional: Reset audio progress/time display for paused players
                      // const otherAudioProgressBar = otherContainer.querySelector('.js-audio-progress-bar');
                      // const otherAudioTimeDisplay = otherContainer.querySelector('.js-audio-time-display');
                      // if (otherAudioProgressBar) otherAudioProgressBar.style.width = '0%';
                      // if (otherAudioTimeDisplay && !isNaN(otherMediaElement.duration)) {
                      //    otherAudioTimeDisplay.textContent = `0:00 / ${formatTime(otherMediaElement.duration)}`;
                      // }

                   } else if (mediaItem.type === 'video' && otherVideoWrapper) {
                      otherVideoWrapper.classList.remove('visible');
                      // If using custom video controls, update their state here
                      // const otherVideoPlayBtn = otherContainer.querySelector('.js-video-play-pause-btn');
                      // if(otherVideoPlayBtn) otherVideoPlayBtn.textContent = '▶';
                   }
                }
            }
        });
    }
    // ----------------------------------------------------------


    // --- Reusable function to initialize one report/media block ---
    function initializeReportBlock(containerElement) {
      // Get data attributes to know what content is available
      const reportUrl = containerElement.dataset.reportUrl;
      const audioSrc = containerElement.dataset.audioSrc;
      const videoSrc = containerElement.dataset.videoSrc;
      const videoPoster = containerElement.dataset.videoPoster;
      const articleTitle = containerElement.dataset.title; // Optional short title

      // --- Initialize Report Link (if data-report-url is present) ---
      const readBtn = containerElement.querySelector('.js-read-btn');
      if (readBtn && reportUrl) {
        readBtn.onclick = function() {
          // Use articleTitle for the window name if available, otherwise a generic one
          const windowName = articleTitle ? articleTitle.replace(/[^a-zA-Z0-9_]/g, '') : 'ArticleReport'; // Sanitize window name
          window.open(reportUrl, windowName, 'width=800,height=800,resizable=yes,scrollbars=yes');
          return false; // Prevent default link behavior
        };
        readBtn.style.display = 'inline-flex'; // Ensure button is visible
      } else if (readBtn) {
        readBtn.style.display = 'none'; // Hide button if no report URL
      }

      // --- Initialize Audio Player (if data-audio-src is present) ---
      if (audioSrc) {
        const audio = containerElement.querySelector('.js-audio-element');
        const audioWrapper = containerElement.querySelector('.js-audio-wrapper');
        const listenBtn = containerElement.querySelector('.js-listen-btn');
        const audioPlayBtn = containerElement.querySelector('.js-audio-play-pause-btn');
        const audioProgressBar = containerElement.querySelector('.js-audio-progress-bar');
        const audioTimeDisplay = containerElement.querySelector('.js-audio-time-display');
        const audioCloseBtn = containerElement.querySelector('.js-audio-close-btn');
        const audioProgressContainer = containerElement.querySelector('.js-audio-progress'); // Need this for seeking

        if (audio && audioWrapper && listenBtn && audioPlayBtn && audioProgressBar && audioTimeDisplay && audioCloseBtn && audioProgressContainer) {
          // Add this audio element to the global list
          allMediaElements.push({ element: audio, type: 'audio' });

          // Set the audio source
          audio.src = audioSrc;
          audio.preload = 'auto'; // Ensure preload is set to auto or metadata

          listenBtn.style.display = 'inline-flex'; // Show the listen button

          // Event handler for toggling the audio player visibility
          listenBtn.addEventListener('click', () => {
              // Hide any visible video player in this same block first
              const videoWrapper = containerElement.querySelector('.js-video-wrapper');
              const videoElement = containerElement.querySelector('.js-video-element');
              if(videoWrapper && videoWrapper.classList.contains('visible')) {
                   if (videoElement) videoElement.pause(); // Pause video
                   videoWrapper.classList.remove('visible'); // Hide video wrapper
                   // If using custom video controls, update their state here
                   // const videoPlayBtn = containerElement.querySelector('.js-video-play-pause-btn');
                   // if(videoPlayBtn) videoPlayBtn.textContent = '▶';
              }

              if (audioWrapper.classList.contains('visible')) {
                // If player is already visible, clicking button closes it
                closeAudioPlayer(); // Use the defined close function

              } else {
                // Before showing and playing, pause ALL other media on the page
                pauseOtherMedia(audio);

                // Show the audio player wrapper
                audioWrapper.classList.add('visible');

                // Attempt to play the audio when the player is shown
                // The play promise handles cases where loading is still in progress
                 audio.play().then(() => {
                   audioPlayBtn.textContent = '⏸'; // Change button to pause symbol on successful play
                   audioPlayBtn.classList.add('playing'); // Add playing class for styling
                 }).catch(e => {
                   console.error("Audio play failed after showing player:", e);
                   // Handle play failure (e.g., show error message, keep button as play)
                   audioPlayBtn.textContent = '▶';
                   audioPlayBtn.classList.remove('playing');
                   // Optionally display an error message to the user in the time display
                   if (audioTimeDisplay) audioTimeDisplay.textContent = "Playback failed.";
                 });
              }
          });

          // Audio Play/Pause button handler
          audioPlayBtn.addEventListener('click', () => {
            if (audio.paused) {
              // Before playing, pause ALL other media
              pauseOtherMedia(audio);

              audio.play().then(() => {
                  audioPlayBtn.textContent = '⏸';
                  audioPlayBtn.classList.add('playing');
              }).catch(e => {
                 console.error("Audio play failed:", e);
                 // Handle play failure
                 audioPlayBtn.textContent = '▶';
                 audioPlayBtn.classList.remove('playing');
                 if (audioTimeDisplay) audioTimeDisplay.textContent = "Playback failed.";
              });
            } else {
              audio.pause();
              audioPlayBtn.textContent = '▶';
              audioPlayBtn.classList.remove('playing');
            }
          });

          // --- New Functionality: Audio Progress Bar and Seeking ---

          // Update time display and progress bar as audio plays
          audio.addEventListener('timeupdate', () => {
            if (!isNaN(audio.duration)) { // Check if duration is available
               const progress = (audio.currentTime / audio.duration) * 100;
               audioProgressBar.style.width = progress + '%';
               audioTimeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
            }
          });

          // Update total duration when metadata is loaded
          audio.addEventListener('loadedmetadata', () => {
            console.log("Audio metadata loaded. Duration:", audio.duration); // Log duration
            if (!isNaN(audio.duration)) {
               audioTimeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
            } else {
               audioTimeDisplay.textContent = `0:00 / --:--`; // Display placeholder if duration is not available
            }
          });

           // Audio can play (might have duration before loadedmetadata in some cases)
          audio.addEventListener('canplay', () => {
             if (!isNaN(audio.duration) && audioTimeDisplay.textContent === '0:00 / 0:00') {
                audioTimeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
             }
          });


          // Audio ended
          audio.addEventListener('ended', () => {
            audioPlayBtn.textContent = '▶';
            audioPlayBtn.classList.remove('playing');
            audioProgressBar.style.width = '0%';
            audio.currentTime = 0; // Reset to beginning
             if (!isNaN(audio.duration)) {
                audioTimeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`; // Reset time display
            } else {
                audioTimeDisplay.textContent = `0:00 / --:--`;
            }
          });

          // Audio error handling
           audio.addEventListener('error', (e) => {
               console.error("Audio error:", audio.error); // Log the error object
               let errorMessage = "An audio error occurred.";
               switch (e.target.error.code) {
                   case MediaError.MEDIA_ERR_ABORTED:
                       errorMessage = 'Audio playback aborted.';
                       break;
                   case MediaError.MEDIA_ERR_NETWORK:
                       errorMessage = 'A network error caused the audio download to fail.';
                       break;
                   case MediaError.MEDIA_ERR_DECODE:
                       errorMessage = 'The audio playback was aborted due to a corruption problem or because the audio used features your browser did not support.';
                       break;
                   case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                       errorMessage = 'The audio could not be loaded, either because the server or network failed or because the format is not supported.';
                       break;
                   default:
                       errorMessage = 'An unknown audio error occurred.';
                       break;
               }
               console.error(errorMessage); // Log a user-friendly error message
               // Optionally display an error message to the user
               if (audioTimeDisplay) audioTimeDisplay.textContent = "Error loading audio.";
               if (audioPlayBtn) audioPlayBtn.textContent = "Error"; // Change button text
               if (audioPlayBtn) audioPlayBtn.classList.remove('playing'); // Remove playing class
           });


          // Handle seeking by clicking on progress bar
          audioProgressContainer.addEventListener('click', (e) => {
              if (!isNaN(audio.duration)) { // Ensure duration is valid before seeking
                const rect = audioProgressContainer.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audio.currentTime = pos * audio.duration;
              } else {
                 console.warn("Audio duration not available yet. Cannot seek.");
              }
          });

          // Handle seeking when progress bar is dragged (more complex but better UX)
          let isDragging = false; // Variable to track if dragging is active

          // Mouse events for desktop dragging
          audioProgressContainer.addEventListener('mousedown', (e) => {
               if (!isNaN(audio.duration)) { // Ensure duration is valid before starting drag/seek
                  isDragging = true;
                   // Prevent text selection while dragging
                  e.preventDefault();
                  // Calculate position relative to the start of the container
                  const containerRect = audioProgressContainer.getBoundingClientRect();
                  const mouseX = e.clientX - containerRect.left;
                  const containerWidth = audioProgressContainer.offsetWidth;
                  const seekTime = (mouseX / containerWidth) * audio.duration;

                   // Update time immediately on mousedown
                   if (seekTime >= 0 && seekTime <= audio.duration && !isNaN(seekTime)) {
                      audio.currentTime = seekTime;
                   }
               } else {
                  console.warn("Audio duration not available yet. Cannot seek.");
               }
          });

          // Use document to ensure drag continues even if mouse leaves the progress bar
          document.addEventListener('mousemove', (e) => {
              if (isDragging) {
                   if (isNaN(audio.duration)) return; // Ensure duration is valid

                   // Calculate position relative to the start of the container
                  const containerRect = audioProgressContainer.getBoundingClientRect();
                  const mouseX = e.clientX - containerRect.left;
                  const containerWidth = audioProgressContainer.offsetWidth;
                  const seekTime = (mouseX / containerWidth) * audio.duration;

                  // Update time only if within bounds and valid
                  if (seekTime >= 0 && seekTime <= audio.duration && !isNaN(seekTime)) {
                       audio.currentTime = seekTime;
                       // Manually update progress bar width during drag for smoother visual feedback
                       audioProgressBar.style.width = (seekTime / audio.duration) * 100 + '%';
                        // Optionally update time display during drag
                       // audioTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(audio.duration)}`;
                  }
              }
          });

          document.addEventListener('mouseup', () => {
              isDragging = false;
          });


           // --- Mobile Touch Event Listeners for dragging ---
          audioProgressContainer.addEventListener('touchstart', (e) => {
               if (!isNaN(audio.duration)) { // Ensure duration is valid
                  isDragging = true;
                   // Prevent default scrolling/zooming
                   e.preventDefault();
                   // Handle touch position immediately on touchstart
                  const touchPosition = e.touches[0].clientX - e.target.getBoundingClientRect().left;
                  const containerWidth = audioProgressContainer.offsetWidth;
                  const seekTime = (touchPosition / containerWidth) * audio.duration;
                   if (seekTime >= 0 && seekTime <= audio.duration && !isNaN(seekTime)) {
                      audio.currentTime = seekTime;
                   }
               } else {
                  console.warn("Audio duration not available yet. Cannot seek.");
               }
          });

          document.addEventListener('touchmove', (e) => {
              if (isDragging) {
                   if (isNaN(audio.duration)) return; // Ensure duration is valid

                   // Prevent default scrolling/zooming
                  e.preventDefault();
                  const containerRect = audioProgressContainer.getBoundingClientRect();
                  const touchX = e.touches[0].clientX - containerRect.left;
                  const containerWidth = audioProgressContainer.offsetWidth;
                  const seekTime = (touchX / containerWidth) * audio.duration;

                   if (seekTime >= 0 && seekTime <= audio.duration && !isNaN(seekTime)) {
                       audio.currentTime = seekTime;
                       // Manually update progress bar width during drag for smoother visual feedback
                       audioProgressBar.style.width = (seekTime / audio.duration) * 100 + '%';
                        // Optionally update time display during drag
                       // audioTimeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(audio.duration)}`;
                   }
              }
          });

          document.addEventListener('touchend', () => {
              isDragging = false;
          });

          // --- End New Functionality ---


          // Close audio player handler
          const closeAudioPlayer = () => { // Define close function within scope
              audioWrapper.classList.remove('visible');
              audio.pause();
              audioPlayBtn.textContent = '▶';
              audioPlayBtn.classList.remove('playing');
              audio.currentTime = 0;
              audioProgressBar.style.width = '0%';
               if (!isNaN(audio.duration)) {
                  audioTimeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
              } else {
                 audioTimeDisplay.textContent = `0:00 / --:--`;
              }
          };
          audioCloseBtn.addEventListener('click', closeAudioPlayer);


        } else {
            console.warn('Audio elements not found despite data-audio-src presence for container:', containerElement);
            if(listenBtn) listenBtn.style.display = 'none'; // Hide button if elements are missing
        }
      } else {
         // Hide the listen button if no audio source
         const listenBtn = containerElement.querySelector('.js-listen-btn');
         if(listenBtn) listenBtn.style.display = 'none';
      }


      // --- Initialize Video Player (if data-video-src is present) ---
      if (videoSrc) {
          const video = containerElement.querySelector('.js-video-element');
          const videoWrapper = containerElement.querySelector('.js-video-wrapper');
          const watchBtn = containerElement.querySelector('.js-watch-btn');
          const videoCloseBtn = containerElement.querySelector('.js-video-close-btn');
          // Get other video control elements here if using custom controls

          if (video && videoWrapper && watchBtn && videoCloseBtn) {
              // Add this video element to the global list
              allMediaElements.push({ element: video, type: 'video' });

              video.src = videoSrc;
              if (videoPoster) {
                  video.poster = videoPoster;
              }
              video.preload = 'auto'; // Ensure preload is set

              watchBtn.style.display = 'inline-flex'; // Show the watch button

              // Event handler for toggling the video player visibility
              watchBtn.addEventListener('click', () => {
                   // Hide any visible audio player in this same block first
                   const audioWrapper = containerElement.querySelector('.js-audio-wrapper');
                   const audioElement = containerElement.querySelector('.js-audio-element');
                   if(audioWrapper && audioWrapper.classList.contains('visible')) {
                        if (audioElement) audioElement.pause(); // Pause audio
                         // Find and update audio play button state if needed
                        const audioPlayBtn = containerElement.querySelector('.js-audio-play-pause-btn');
                        if(audioPlayBtn) {
                             audioPlayBtn.textContent = '▶';
                             audioPlayBtn.classList.remove('playing');
                        }
                        audioWrapper.classList.remove('visible'); // Hide audio wrapper
                   }

                  if (videoWrapper.classList.contains('visible')) {
                    // If player is already visible, clicking button closes it
                     closeVideoPlayer(); // Use the defined close function

                  } else {
                     // Before showing and playing, pause ALL other media
                     pauseOtherMedia(video);

                     // Show the video player wrapper
                     videoWrapper.classList.add('visible');

                     // Auto-play video when shown (optional, remove if not desired)
                     video.play().catch(e => console.error("Video play failed:", e));

                     // If using custom video controls, update their state here
                  }
              });

               // Close video player handler
               const closeVideoPlayer = () => { // Define close function within scope
                   videoWrapper.classList.remove('visible');
                   video.pause(); // Pause video on close
                   // Reset video current time? Depends on desired behavior, maybe to 0
                   video.currentTime = 0; // Reset to beginning
                   // If using custom video controls, update their state here
               };
              videoCloseBtn.addEventListener('click', closeVideoPlayer);

              // Add other event listeners for video if using custom controls (timeupdate, play/pause, ended, etc.)
              // video.addEventListener('timeupdate', ...)
              // If using a custom play/pause button for video: videoPlayBtn.addEventListener('click', ...)


          } else {
               console.warn('Video elements not found despite data-video-src presence for container:', containerElement);
               if(watchBtn) watchBtn.style.display = 'none'; // Hide button if elements are missing
          }
      } else {
         // Hide the watch button if no video source
         const watchBtn = containerElement.querySelector('.js-watch-btn');
         if(watchBtn) watchBtn.style.display = 'none';
      }

      // Initial state setup (ensure media wrappers are hidden by default via CSS)
      // This is primarily handled by the CSS `display: none;` on `.media-wrapper`
      // but JS can ensure the '.visible' class is not present initially.
      const audioWrapper = containerElement.querySelector('.js-audio-wrapper');
      const videoWrapper = containerElement.querySelector('.js-video-wrapper');
      if(audioWrapper) audioWrapper.classList.remove('visible');
      if(videoWrapper) videoWrapper.classList.remove('visible');


      // Set initial time display for audio if metadata is loaded quickly
      // This part is already handled in the audio initialization block above
      // via the loadedmetadata and canplay events.

    }

    // --- Initialization Code (run when the page loads) ---
    window.addEventListener('DOMContentLoaded', () => {
      // Find all elements that represent a report/media block
      const reportBlocks = document.querySelectorAll('.report-block'); // Target the main container class

      console.log(`Found ${reportBlocks.length} report/media blocks.`); // Debugging line

      // Loop through each container and initialize it
      reportBlocks.forEach(container => {
        initializeReportBlock(container);
      });
    });

  })(); // End of IIFE

