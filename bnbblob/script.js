document.addEventListener('DOMContentLoaded', () => {
    // Initialize Howler audio objects with proper error handling
    const backgroundMusic = new Howl({
        src: ['./beachsong.mp3'],
        loop: true,
        volume: 0.5,
        html5: true,
        onloaderror: function(id, err) {
            console.error('Error loading background music:', err);
        }
    });

    const laughSound = new Howl({
        src: ['./laughh.mp3'],
        volume: 0.7,
        html5: true,
        onloaderror: function(id, err) {
            console.error('Error loading laugh sound:', err);
        }
    });

    // Play background music with improved error handling
    const playBackgroundMusic = () => {
        if (!backgroundMusic.playing()) {
            backgroundMusic.play();
        }
    };

    // Try to autoplay background music (will likely be blocked by browser)
    playBackgroundMusic();

    // Add listener for user interaction to start music if autoplay fails
    document.body.addEventListener('click', playBackgroundMusic, { once: true });

    // DOM elements
    const blob = document.getElementById('blob');
    if (!blob) {
        console.error('Blob element not found');
        return;
    }

    // Set initial blob position
    const initialPositioning = () => {
        try {
            const blobRect = blob.getBoundingClientRect();
            
            // Position the blob in the middle initially
            gsap.set(blob, {
                x: (window.innerWidth - blobRect.width) / 2,
                y: (window.innerHeight - blobRect.height) / 2
            });
        } catch (error) {
            console.error('Error in initial positioning:', error);
        }
    };

    initialPositioning();

    // Function to get random position within viewable bounds
    const getRandomPosition = () => {
        const blobRect = blob.getBoundingClientRect();
        
        // Add padding to keep blob fully in view
        const padding = 20;
        
        return {
            x: gsap.utils.random(padding, window.innerWidth - blobRect.width - padding),
            y: gsap.utils.random(padding, window.innerHeight - blobRect.height - padding),
            rotation: gsap.utils.random(-15, 15)
        };
    };

    // Function to animate blob with random swimming movement
    const animateBlob = () => {
        try {
            const pos = getRandomPosition();
            const duration = gsap.utils.random(5, 8);
            
            gsap.to(blob, {
                x: pos.x,
                y: pos.y,
                rotation: pos.rotation,
                duration: duration,
                ease: "sine.inOut",
                onComplete: animateBlob
            });
        } catch (error) {
            console.error('Error in animation:', error);
            // Try to recover
            setTimeout(animateBlob, 1000);
        }
    };

    // Start the random swimming animation
    animateBlob();

    // Function to make blob swim away when tapped
    const swimAway = () => {
        try {
            // Kill any ongoing animation
            gsap.killTweensOf(blob);
            
            // Play laugh sound
            laughSound.play();
            
            // Get current position
            const currentX = gsap.getProperty(blob, "x");
            const currentY = gsap.getProperty(blob, "y");
            
            // Calculate direction to swim away (opposite of center)
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Direction vector (from center to current position)
            let dirX = currentX - centerX;
            let dirY = currentY - centerY;
            
            // Normalize and scale
            const length = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
            dirX = (dirX / length) * 300;
            dirY = (dirY / length) * 300;
            
            // Ensure we stay in bounds
            const blobRect = blob.getBoundingClientRect();
            const padding = 20;
            const maxX = window.innerWidth - blobRect.width - padding;
            const maxY = window.innerHeight - blobRect.height - padding;
            
            const targetX = Math.min(Math.max(padding, currentX + dirX), maxX);
            const targetY = Math.min(Math.max(padding, currentY + dirY), maxY);
            
            // Quickly swim away
            gsap.to(blob, {
                x: targetX,
                y: targetY,
                rotation: gsap.utils.random(-30, 30),
                duration: 2,
                ease: "power2.out",
                onComplete: () => {
                    // Gradually slow down and resume normal swimming
                    gsap.to(blob, {
                        rotation: 0,
                        duration: 1,
                        ease: "power1.inOut",
                        onComplete: animateBlob
                    });
                }
            });
        } catch (error) {
            console.error('Error in swim away:', error);
            // Recover animation
            animateBlob();
        }
    };

    // Add click/tap event listener to blob
    blob.addEventListener('click', swimAway);
    blob.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        swimAway();
    });

    // Handle window resize to keep blob in bounds
    window.addEventListener('resize', () => {
        try {
            const blobRect = blob.getBoundingClientRect();
            const padding = 20;
            const maxX = window.innerWidth - blobRect.width - padding;
            const maxY = window.innerHeight - blobRect.height - padding;
            
            // If blob is outside bounds after resize, reposition it
            if (gsap.getProperty(blob, "x") > maxX || gsap.getProperty(blob, "y") > maxY) {
                gsap.to(blob, {
                    x: Math.min(gsap.getProperty(blob, "x"), maxX),
                    y: Math.min(gsap.getProperty(blob, "y"), maxY),
                    duration: 0.5
                });
            }
        } catch (error) {
            console.error('Error handling resize:', error);
        }
    });
});
