export function displayAnimation(animationFile) {
    return new Promise((resolve) => {
        const animContainer = document.createElement('div');
        animContainer.className = 'animation-container';
        animContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        
        const animation = document.createElement('img');
        animation.src = `/css/assets/images/Animations/${animationFile}`;
        animation.style.maxWidth = '400px';
        // Prevent GIF from looping
        animation.style.WebkitAnimationPlayState = 'running';
        animation.style.animationPlayState = 'running';
        
        // Add class for no-repeat
        animation.className = 'play-once';
        
        animation.onerror = () => {
            console.error(`Failed to load animation: ${animationFile}`);
            resolve();
        };
        
        animation.onload = () => {
            // Get GIF duration using a proxy image
            const proxyImg = new Image();
            proxyImg.src = animation.src;
            proxyImg.onload = function() {
                // Typical GIF frame delay is 100ms, estimate total duration
                const frameCount = 30; // Assume 30 frames for typical animation
                const duration = frameCount * 100; // Approximate duration in ms
                
                setTimeout(() => {
                    animContainer.remove();
                    resolve();
                }, duration);
            };
        };
        
        animContainer.appendChild(animation);
        document.body.appendChild(animContainer);
    });
}