document.addEventListener('DOMContentLoaded', () => {
    // Initialize Howler audio objects
    const backgroundMusic = new Howl({
        src: ['beachsong.mp3'],
        loop: true,
        volume: 0.5,
        html5: true, // This helps with mobile compatibility
        onloaderror: function() {
            console.error('Error loading background music');
        }
    });

    const laughSound = new Howl({
        src: ['laughh.mp3'],
        volume: 0.7,
        html5: true
    });

    // Try to autoplay background music - will work if browser allows
    try {
        backgroundMusic.play();
    } catch (error) {
        console.log('Autoplay prevented. User interaction required.');
    }

    // Add listener for first user interaction to start music if autoplay fails
    document.body.addEventListener('click', () => {
        if (!backgroundMusic.playing()) {
            backgroundMusic.play();
        }
    }, { once: true });

    // DOM elements
    const blob = document.getElementById('blob');
    const container = document.querySelector('.ocean-container');

    // Set initial blob position
    const initialPositioning = () => {
        const blobRect = blob.getBoundingClientRect();
        
        // Position the blob in the middle initially
        gsap.set(blob, {
            x: (window.innerWidth - blobRect.width) / 2,
            y: (window.innerHeight - blobRect.height) / 2
        });
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
        const pos = getRandomPosition();
        const duration = gsap.utils.random(5, 8);
        const ease = "sine.inOut";
        
        gsap.to(blob, {
            x: pos.x,
            y: pos.y,
            rotation: pos.rotation,
            duration: duration,
            ease: ease,
            onComplete: animateBlob
        });
    };

    // Start the random swimming animation
    animateBlob();

    // Function to make blob swim away when tapped
    const swimAway = () => {
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
    };

    // Add click/tap event listener to blob
    blob.addEventListener('click', swimAway);
    blob.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        swimAway();
    });

    // Handle window resize to keep blob in bounds
    window.addEventListener('resize', () => {
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
    });
}); 