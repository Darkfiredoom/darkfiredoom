// Section transition observer
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-50px 0px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Update active nav link
            const sectionId = entry.target.id;
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Parallax effect for hero orbs
const orbs = document.querySelectorAll('.gradient-orb');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Navbar background on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
});

// Add stagger animation to project cards
const projectCards = document.querySelectorAll('.project-card');

function isMobile() {
    return window.innerWidth <= 768;
}

const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

projectCards.forEach(card => {
    if (!isMobile()) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    } else {
        // On mobile, ensure cards are always visible
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }
    projectObserver.observe(card);
});

// Add stagger animation to social cards
const socialCards = document.querySelectorAll('.social-card');
const socialObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

socialCards.forEach(card => {
    if (!isMobile()) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    } else {
        // On mobile, ensure cards are always visible
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }
    socialObserver.observe(card);
});

// Initialize sections
document.addEventListener('DOMContentLoaded', () => {
    sections[0].classList.add('active');

    // On mobile, immediately activate ALL sections so none are stuck invisible.
    // The observer approach is unreliable on mobile with tall sections.
    if (isMobile()) {
        sections.forEach(section => {
            section.classList.add('active');
            section.style.opacity = '1';
            section.style.transform = 'none';
        });
    }

    fetchDiscordStatus();
});

// Discord Status Fetcher
async function fetchDiscordStatus() {
    const userId = '1086182699313668186';
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const data = await response.json();
        
        console.log('Discord API response:', data);
        
        if (data.success && data.data) {
            const discordData = data.data;
            const status = discordData.discord_status || 'offline';
            const activities = discordData.activities;
            
            // Update status indicator
            statusIndicator.className = 'status-indicator ' + status;
            
            // Build status text with full details
            let statusMessage = 'Discord Status: ';
            
            if (status === 'online') {
                statusMessage += 'Online';
            } else if (status === 'idle') {
                statusMessage += 'Idle';
            } else if (status === 'dnd') {
                statusMessage += 'Do Not Disturb';
            } else {
                statusMessage += 'Offline';
            }
            
            // Add activities with full details
            if (activities && activities.length > 0) {
                statusMessage += ' - ';
                activities.forEach((activity, index) => {
                    if (index > 0) statusMessage += ' | ';
                    
                    if (activity.type === 0) {
                        // Playing a game
                        statusMessage += `Playing ${parseEmojis(activity.name)}`;
                        if (activity.details) statusMessage += ` - ${parseEmojis(activity.details)}`;
                        if (activity.state) statusMessage += ` (${parseEmojis(activity.state)})`;
                    } else if (activity.type === 1) {
                        // Streaming
                        statusMessage += `Streaming ${parseEmojis(activity.name)}`;
                        if (activity.details) statusMessage += ` - ${parseEmojis(activity.details)}`;
                    } else if (activity.type === 2) {
                        // Listening to music
                        statusMessage += `Listening to ${parseEmojis(activity.name)}`;
                        if (activity.details && activity.state) {
                            statusMessage += ` - ${parseEmojis(activity.details)} by ${parseEmojis(activity.state)}`;
                        }
                    } else if (activity.type === 3) {
                        // Watching
                        statusMessage += `Watching ${parseEmojis(activity.name)}`;
                        if (activity.details) statusMessage += ` - ${parseEmojis(activity.details)}`;
                    } else if (activity.type === 4) {
                        // Custom status
                        statusMessage += parseEmojis(activity.state || activity.name);
                    } else if (activity.type === 5) {
                        // Competing
                        statusMessage += `Competing in ${parseEmojis(activity.name)}`;
                    }
                });
            }
            
            statusText.innerHTML = statusMessage;
        } else {
            console.log('No data returned from Lanyard API');
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Not connected to Lanyard';
        }
    } catch (error) {
        console.error('Failed to fetch Discord status:', error);
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Status unavailable';
    }
}

// Parse Discord custom emojis and convert to images
function parseEmojis(text) {
    if (!text) return '';
    // Match custom emoji format: <:name:id> or <a:name:id>
    const emojiRegex = /<(a?):(\w+):(\d+)>/g;
    return text.replace(emojiRegex, (match, animated, name, id) => {
        const ext = animated === 'a' ? 'gif' : 'png';
        return `<img src="https://cdn.discordapp.com/emojis/${id}.${ext}" alt="${name}" class="discord-emoji" />`;
    });
}

// Refresh status every 60 seconds
setInterval(fetchDiscordStatus, 60000);
