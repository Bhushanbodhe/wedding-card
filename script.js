/* -------------------------------------------------------------
   WEDDING CARD INVITATION SCRIPT
------------------------------------------------------------- */

// ---- YouTube IFrame API: must be global ----
let ytPlayer = null;
let ytReady = false;
let ytPendingPlay = false;
let isMusicPlaying = false;

// Called automatically by YouTube IFrame API when loaded
window.onYouTubeIframeAPIReady = function () {
    ytReady = true;
    // If user already clicked play before API was ready, play now
    if (ytPendingPlay) {
        loadAndPlayYouTube(localStorage.getItem('wedding_yt_url') || '');
        ytPendingPlay = false;
    }
};

// Extract YouTube video ID from any YouTube URL
function extractYTVideoId(url) {
    url = url.trim();
    // Short link: youtu.be/VIDEO_ID
    let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Standard: youtube.com/watch?v=VIDEO_ID
    m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Embed: youtube.com/embed/VIDEO_ID
    m = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Music: music.youtube.com/watch?v=VIDEO_ID
    m = url.match(/music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Shorts source: youtube.com/source/VIDEO_ID/shorts
    m = url.match(/\/source\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Shorts: youtube.com/shorts/VIDEO_ID
    m = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    // Raw 11-char video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
}

function loadAndPlayYouTube(url) {
    const videoId = extractYTVideoId(url);
    if (!videoId) {
        alert('❌ Could not find a valid YouTube video ID.\nPlease paste a correct YouTube link like:\nhttps://youtu.be/ABC123xyz12');
        return;
    }

    if (!ytReady) {
        // API not yet ready — store URL and flag to play when ready
        localStorage.setItem('wedding_yt_url', url);
        ytPendingPlay = true;
        return;
    }

    // Save URL for reload
    localStorage.setItem('wedding_yt_url', url);

    if (ytPlayer) {
        // Player exists — just load new video
        ytPlayer.loadVideoById(videoId);
        ytPlayer.setVolume(80);
        ytPlayer.playVideo();
    } else {
        // Create new player in the hidden wrapper div
        ytPlayer = new YT.Player('yt-player', {
            height: '1',
            width: '1',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                loop: 1,
                playlist: videoId,
                controls: 0,
                disablekb: 1,
                fs: 0,
                rel: 0,
                mute: 0,
                playsinline: 1,
                modestbranding: 1
            },
            events: {
                onReady: (event) => {
                    event.target.setVolume(80);
                    event.target.playVideo();
                    isMusicPlaying = true;
                    document.getElementById('music-toggle-btn').classList.add('playing');
                },
                onStateChange: (event) => {
                    if (event.data === YT.PlayerState.PLAYING) {
                        isMusicPlaying = true;
                        document.getElementById('music-toggle-btn').classList.add('playing');
                    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                        isMusicPlaying = false;
                        document.getElementById('music-toggle-btn').classList.remove('playing');
                    }
                },
                onError: (event) => {
                    const errorCodes = {
                        2: 'Invalid video URL or ID.',
                        5: 'The requested content cannot be played in an HTML5 player.',
                        100: 'The video was not found. It may have been removed or set to private.',
                        101: 'The owner does not allow embedding this video.',
                        150: 'The owner does not allow embedding this video.'
                    };
                    const message = errorCodes[event.data] || 'An unknown YouTube playback error occurred.';
                    alert(`🎵 Music playback error: ${message}`);
                    isMusicPlaying = false;
                    document.getElementById('music-toggle-btn').classList.remove('playing');
                }
            }
        });
    }

    isMusicPlaying = true;
    document.getElementById('music-toggle-btn').classList.add('playing');
}

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. STATE & CORE CONFIGURATION
    // ---------------------------------------------------------
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide-section');
    const dots = document.querySelectorAll('.slide-dot');
    const musicBtn = document.getElementById('music-toggle-btn');
    const ytUrlInput = document.getElementById('youtube-url-input');
    const ytPlayBtn = document.getElementById('yt-play-btn');
    let countdownInterval;

    // Restore saved YouTube URL (use hardcoded default if none saved)
    const DEFAULT_YT_URL = 'https://youtube.com/source/YgWfzUr_M40/shorts?si=a1VzWr4N_rLsYjf4';
    const savedYtUrl = localStorage.getItem('wedding_yt_url') || DEFAULT_YT_URL;
    if (ytUrlInput) ytUrlInput.value = savedYtUrl;

    // Load initial settings from LocalStorage (if any) or defaults
    const config = JSON.parse(localStorage.getItem('wedding_card_config_v2')) || {
        theme: 'theme-crimson',
        shloka: 'प्रथम पुजावा श्री गणपती । धन्य ती भारतीय संस्कृति ।\nज्ञानेश्वराने चालविल्या भिंती । अर्जुनाच्या रथावर श्री कृष्ण सारथी ।\nतोच जुळवितो नाती-गोती । या मंगल प्रसंगी यावे आशीर्वाद देण्यासाठी...',
        groomName: 'Chintaman',
        groomParents: 'गं.भा. जिजाबाई व स्व. महादेवजी चिरखे',
        brideName: 'Sonal',
        brideParents: 'सौ. संगीताबाई व श्री. दिलदारजी मोंढे',
        weddingDate: '2026-06-23',
        weddingTime: '10:40',
        weddingVenue: 'संत गजानन सभागृह, दहेगाव रंगारी, नागपूर',
        mapsUrl: 'https://maps.app.goo.gl/k7CdHMh6KJ3fBtMP7?g_st=aw',
        enablePetals: true
    };

    // ---------------------------------------------------------
    // 2. INVITATION COVER OPENING ANIMATION
    // ---------------------------------------------------------
    const openCardBtn = document.getElementById('open-card-btn');
    const coverWrapper = document.getElementById('invitation-cover');
    const mainContainer = document.getElementById('invitation-main');

    openCardBtn.addEventListener('click', () => {
        coverWrapper.classList.add('open');
        mainContainer.classList.remove('hidden');

        // Auto-play saved YouTube song when card opens
        if (savedYtUrl) {
            loadAndPlayYouTube(savedYtUrl);
        }

        if (config.enablePetals) {
            initPetalsCanvas();
        }
        initCountdown();
    });

    // ---------------------------------------------------------
    // 3. YOUTUBE MUSIC PLAYER CONTROLS
    // ---------------------------------------------------------

    // Load & Play button
    if (ytPlayBtn) {
        ytPlayBtn.addEventListener('click', () => {
            const url = ytUrlInput.value.trim();
            if (!url) {
                alert('Please paste a YouTube song link first!');
                return;
            }
            loadAndPlayYouTube(url);
        });
    }

    // Music toggle button — play/pause the YouTube player
    musicBtn.addEventListener('click', () => {
        if (!ytPlayer) {
            // No song loaded yet — open the bubble hint
            alert('Please paste a YouTube link first and click "Load & Play"!');
            return;
        }
        if (isMusicPlaying) {
            ytPlayer.pauseVideo();
            isMusicPlaying = false;
            musicBtn.classList.remove('playing');
        } else {
            ytPlayer.playVideo();
            isMusicPlaying = true;
            musicBtn.classList.add('playing');
        }
    });


    // ---------------------------------------------------------
    // 4. SLIDESHOW NAVIGATION
    // ---------------------------------------------------------
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    function showSlide(index) {
        if (index < 0 || index >= slides.length) return;
        
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = index;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    prevBtn.addEventListener('click', () => {
        let index = currentSlide - 1;
        if (index < 0) index = slides.length - 1;
        showSlide(index);
    });

    nextBtn.addEventListener('click', () => {
        let index = currentSlide + 1;
        if (index >= slides.length) index = 0;
        showSlide(index);
    });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
        });
    });

    // ---------------------------------------------------------
    // 5. WEDDING MUHURAT COUNTDOWN TIMER
    // ---------------------------------------------------------
    function initCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        
        const countdownEl = document.getElementById('wedding-countdown');
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        function updateTimer() {
            const dateStr = config.weddingDate;
            const timeStr = config.weddingTime;
            const targetDate = new Date(`${dateStr}T${timeStr}:00`);
            const now = new Date();
            
            const difference = targetDate - now;

            if (difference <= 0) {
                clearInterval(countdownInterval);
                countdownEl.innerHTML = `<p class="gold-summary-text" style="font-size:16px;">The Auspicious Muhurat is Live!</p>`;
                return;
            }

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            daysEl.textContent = String(d).padStart(2, '0');
            hoursEl.textContent = String(h).padStart(2, '0');
            minutesEl.textContent = String(m).padStart(2, '0');
            secondsEl.textContent = String(s).padStart(2, '0');
        }

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    // ---------------------------------------------------------
    // 6. CARD CUSTOMIZER SIDEBAR CONTROLS
    // ---------------------------------------------------------

    // Live update preview values
    function applyConfiguration() {
        // Apply inputs to DOM elements
        document.getElementById('display-groom').textContent = config.groomName;
        document.getElementById('display-groom-name').textContent = config.groomName;
        document.getElementById('display-groom-parents-text').textContent = `Son of ${config.groomParents}`;

        document.getElementById('display-bride').textContent = config.brideName;
        document.getElementById('display-bride-name').textContent = config.brideName;
        document.getElementById('display-bride-parents-text').textContent = `Daughter of ${config.brideParents}`;

        document.getElementById('display-shloka').innerHTML = config.shloka.replace(/\n/g, '<br>');

        // Format Date
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateObj = new Date(config.weddingDate + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
        document.getElementById('display-date-summary').textContent = formattedDate;
        document.getElementById('display-wedding-date').textContent = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Format Time
        const timeParts = config.weddingTime.split(':');
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedTime = `${hours}:${minutes} ${ampm}`;
        document.getElementById('display-wedding-time').textContent = formattedTime;

        // Venue and maps
        document.getElementById('display-wedding-venue').textContent = config.weddingVenue;
        document.getElementById('display-wedding-maps').href = config.mapsUrl;

        // Apply Theme
        document.body.className = ''; // clear themes
        document.body.classList.add(config.theme);

        // Petals Canvas state
        togglePetals(config.enablePetals);
        
        // Restart countdown with new configurations
        initCountdown();
    }

    // Initialize Card Data
    applyConfiguration();

    // ---------------------------------------------------------
    // 8. BLESSINGS BOARD / GUESTBOOK SYSTEM
    // ---------------------------------------------------------
    const blessingsBoard = document.getElementById('blessings-board');
    const blessingAuthor = document.getElementById('blessing-author');
    const blessingMessage = document.getElementById('blessing-message');
    const submitBlessingBtn = document.getElementById('submit-blessing-btn');
    const designBtns = document.querySelectorAll('.design-btn');
    let activeCardStyle = 'gold-bg';

    // Highlight selected card template option
    designBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            designBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCardStyle = btn.getAttribute('data-style');
        });
    });

    // Default seed blessings
    const defaultBlessings = [
        {
            id: 1,
            author: "Aunt Vasundhara",
            message: "Wishing you both a lifetime of happiness, laughter, and endless love! May Lord Ganesha shower his choicest blessings upon your beautiful union. Happy wedding!",
            cardStyle: "gold-bg",
            date: "May 25, 2026"
        },
        {
            id: 2,
            author: "Amit & Sneha",
            message: "So thrilled to celebrate your special day with you! Looking forward to the Sangeet night dance floor! Hearty congratulations, guys!",
            cardStyle: "floral-bg",
            date: "May 26, 2026"
        },
        {
            id: 3,
            author: "Prof. Vinay Bodhe",
            message: "May the bond you form be strong, supportive, and full of mutual understanding. Sending all my blessings for this magnificent new adventure.",
            cardStyle: "minimal-bg",
            date: "May 26, 2026"
        }
    ];

    function loadBlessings() {
        blessingsBoard.innerHTML = '';
        let blessings = JSON.parse(localStorage.getItem('wedding_blessings'));
        
        if (!blessings) {
            blessings = defaultBlessings;
            localStorage.setItem('wedding_blessings', JSON.stringify(blessings));
        }

        // Render in reverse chronological order (newest first)
        blessings.slice().reverse().forEach(blessing => {
            const card = document.createElement('div');
            card.className = `blessing-card ${blessing.cardStyle}`;
            card.innerHTML = `
                <p>"${escapeHtml(blessing.message)}"</p>
                <div class="blessing-meta">
                    <span class="blessing-author">${escapeHtml(blessing.author)}</span>
                    <span class="blessing-date">${blessing.date}</span>
                </div>
            `;
            blessingsBoard.appendChild(card);
        });
    }

    submitBlessingBtn.addEventListener('click', () => {
        const author = blessingAuthor.value.trim();
        const message = blessingMessage.value.trim();

        if (!author || !message) {
            alert("Please fill in both your name and blessing message!");
            return;
        }

        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const newBlessing = {
            id: Date.now(),
            author: author,
            message: message,
            cardStyle: activeCardStyle,
            date: new Date().toLocaleDateString('en-US', dateOptions)
        };

        const blessings = JSON.parse(localStorage.getItem('wedding_blessings')) || defaultBlessings;
        blessings.push(newBlessing);
        localStorage.setItem('wedding_blessings', JSON.stringify(blessings));

        // Clear input form
        blessingAuthor.value = '';
        blessingMessage.value = '';

        // Reload board
        loadBlessings();
    });

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Load Guestbook
    loadBlessings();

    // ---------------------------------------------------------
    // 9. CANVAS-BASED FALLING PETALS PARTICLE SYSTEM
    // ---------------------------------------------------------
    let canvas, ctx;
    let petals = [];
    let animationId = null;
    const maxPetals = 45;
    let canvasInitialized = false;

    // Petal Images / Colors
    // We will render beautiful custom canvas paths for petals
    // to avoid loading heavy image assets over network
    function initPetalsCanvas() {
        if (canvasInitialized) return;
        
        canvas = document.getElementById('petals-canvas');
        ctx = canvas.getContext('2d');
        canvasInitialized = true;

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Spawn initial batch of petals
        for (let i = 0; i < maxPetals; i++) {
            petals.push(createPetal(true));
        }

        animatePetals();
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function createPetal(randomY = false) {
        // Red, pink, orange, yellow floral petal palette
        const colors = [
            'rgba(235, 93, 124, 0.75)',  // Soft Rose Pink
            'rgba(212, 10, 34, 0.75)',   // Crimson Red
            'rgba(240, 140, 30, 0.75)',  // Marigold Orange
            'rgba(245, 200, 45, 0.75)',  // Gold/Yellow
            'rgba(242, 175, 192, 0.75)'  // Pale Blush Pink
        ];

        return {
            x: Math.random() * canvas.width,
            y: randomY ? Math.random() * canvas.height : -20,
            size: Math.random() * 8 + 6, // 6 to 14 px
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 1.5 + 1.0, // vertical descent speed
            speedX: Math.random() * 0.8 - 0.4, // horizontal drift
            angle: Math.random() * 360,
            rotationSpeed: Math.random() * 2 - 1, // spin rate
            waveAngle: Math.random() * Math.PI,
            waveSpeed: Math.random() * 0.02 + 0.01 // side to side sway frequency
        };
    }

    function animatePetals() {
        if (!config.enablePetals) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < petals.length; i++) {
            let p = petals[i];
            
            // Update position
            p.y += p.speedY;
            p.waveAngle += p.waveSpeed;
            // Add a sway movement to the side drift
            p.x += p.speedX + Math.sin(p.waveAngle) * 0.5;
            p.angle += p.rotationSpeed;

            // Recycle petals falling off bottom or sides
            if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
                petals[i] = createPetal(false);
                p = petals[i];
            }

            // Draw petal
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            
            // Draw a beautiful organic petal shape (skewed ellipse / drop)
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
            ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
            ctx.fill();

            // Add simple highlight for 3D realism
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.arc(0, 0, p.size / 2, -Math.PI / 2, 0);
            ctx.stroke();

            ctx.restore();
        }

        animationId = requestAnimationFrame(animatePetals);
    }

    function togglePetals(enabled) {
        if (enabled) {
            if (canvasWrapperOpen()) {
                initPetalsCanvas();
            }
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    function canvasWrapperOpen() {
        return coverWrapper.classList.contains('open');
    }
});
