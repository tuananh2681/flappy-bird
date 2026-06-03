document.addEventListener('DOMContentLoaded', () => {
    // Scene Elements
    const sceneBoot = document.getElementById('scene-boot');
    const sceneArchive = document.getElementById('scene-archive');
    const sceneError = document.getElementById('scene-error');
    const sceneEnding = document.getElementById('scene-ending');
    const sceneLost = document.getElementById('scene-lost');

    // UI Elements
    const bootText = document.getElementById('boot-text');
    const unlockContainer = document.getElementById('unlock-container');
    const btnUnlock = document.getElementById('btn-unlock');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const archiveText = document.getElementById('archive-text');
    const globalGlitch = document.getElementById('global-glitch');
    const btnShutdown = document.getElementById('btn-shutdown');

    // Constants
    const CIRCLE_CIRCUMFERENCE = 326.726; // 2 * pi * 52
    
    // Texts
    const bootLines = [
        "Đang truy cập hệ thống...",
        "Đang kiểm tra dữ liệu nhân sự...",
        "Phát hiện một nhân viên sắp rời khỏi hệ thống..."
    ];

    const pages = [
        [
            "Có những người chỉ xuất hiện trong một giai đoạn ngắn...",
            "Nhưng lại trở thành một phần ký ức rất lâu.",
            "Không phải mọi kết thúc đều buồn.",
            "Đôi khi nó chỉ là lúc một hành trình mới bắt đầu.",
            "Từ những deadline tưởng không qua nổi...",
            "Đến những cuộc trò chuyện rất bình thường..."
        ],
        [
            "Mọi thứ đều đáng nhớ.",
            "Có thể sau này...",
            "Mọi người sẽ quên vài project.",
            "Nhưng hy vọng sẽ không quên những lần cùng nhau cố gắng.",
            "Dữ liệu có thể bị xóa khỏi hệ thống...",
            "Nhưng ký ức thì không."
        ],
        [
            "Cảm ơn vì đã xuất hiện trong hành trình này.",
            "Mình không giỏi nói lời tạm biệt.",
            "Nên mình viết nó thành một hệ thống.",
            "Nếu một ngày nào đó...",
            "Mọi người vô tình nhớ đến mình...",
            "Thì như vậy là đủ rồi."
        ]
    ];

    // Helpers
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function typeWriter(element, text, speed = 50, useSound = true, useHtml = false) {
        element.innerHTML = '';
        let currentText = '';
        for (let i = 0; i < text.length; i++) {
            currentText += text.charAt(i);
            element.innerHTML = useHtml ? currentText + '<span class="blinking-cursor">_</span>' : currentText + '<span class="blinking-cursor">_</span>';
            if (useSound && text.charAt(i) !== ' ') AudioEngine.type();
            await sleep(speed + Math.random() * 30);
        }
        element.innerHTML = currentText; // Remove cursor after done or keep it?
    }

    function setScene(activeScene) {
        [sceneBoot, sceneArchive, sceneError, sceneEnding, sceneLost].forEach(s => {
            s.classList.remove('active');
        });
        activeScene.classList.add('active');
    }

    // Timeline - Step 1: Boot
    async function startBootSequence() {
        await sleep(2000); // initial silence
        
        for (const line of bootLines) {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'terminal-line';
            bootText.appendChild(lineDiv);
            await typeWriter(lineDiv, line, 40, true);
            await sleep(1000);
        }

        await sleep(1000);
        unlockContainer.style.display = 'flex';
        // Allow layout to calculate
        setTimeout(() => {
            unlockContainer.style.opacity = '1';
        }, 100);
    }

    // Timeline - Step 2: Hold to Unlock
    let holdTimer;
    let scanAudio;
    let progress = 0;
    const HOLD_DURATION = 2500;
    const UPDATE_INTERVAL = 50;
    let isHolding = false;

    function setProgress(percent) {
        const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
        progressCircle.style.strokeDashoffset = offset;
    }

    function onHoldStart(e) {
        if(e) e.preventDefault(); // prevent text selection
        if (isHolding) return;
        isHolding = true;
        AudioEngine.init(); // Initialize audio context on first interaction
        scanAudio = AudioEngine.startScan();
        progress = 0;
        
        holdTimer = setInterval(() => {
            progress += (UPDATE_INTERVAL / HOLD_DURATION) * 100;
            setProgress(Math.min(progress, 100));
            
            if (progress >= 100) {
                clearInterval(holdTimer);
                onUnlock();
            }
        }, UPDATE_INTERVAL);
    }

    function onHoldEnd() {
        if (!isHolding) return;
        isHolding = false;
        clearInterval(holdTimer);
        if (scanAudio) scanAudio.stop();
        if (progress < 100) {
            // Revert progress
            progress = 0;
            setProgress(0);
        }
    }

    btnUnlock.addEventListener('mousedown', onHoldStart);
    btnUnlock.addEventListener('touchstart', onHoldStart, {passive: false});
    document.addEventListener('mouseup', onHoldEnd);
    document.addEventListener('touchend', onHoldEnd);

    async function onUnlock() {
        // Unlock sequence
        btnUnlock.removeEventListener('mousedown', onHoldStart);
        btnUnlock.removeEventListener('touchstart', onHoldStart);
        
        AudioEngine.unlock();
        AudioEngine.startDrone();
        window.showParticles();

        try {
            await document.documentElement.requestFullscreen();
        } catch(e) {
            console.log("Fullscreen API error:", e);
        }

        setScene(sceneArchive);
        await sleep(2000);
        startArchiveSequence();
    }

    // Timeline - Step 3: Archive Messages
    async function startArchiveSequence() {
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            archiveText.innerHTML = '';
            archiveText.style.opacity = 1;
            
            for (let j = 0; j < page.length; j++) {
                const line = page[j];
                const lineDiv = document.createElement('div');
                
                // Add heartbeat class to some emotional messages
                if (
                    (i === 0 && j === 1) || 
                    (i === 1 && j === 0) || 
                    (i === 1 && j === 5) || 
                    (i === 2 && j === 0)
                ) {
                    lineDiv.classList.add('heartbeat');
                }

                archiveText.appendChild(lineDiv);
                await typeWriter(lineDiv, line, 50, true);
                
                await sleep(500); // pause between lines on the same page
            }
            
            await sleep(4000); // pause to read the full page
            
            // Fade out page
            archiveText.style.opacity = 0;
            await sleep(1500);
        }

        await sleep(1000);
        triggerErrorSequence();
    }

    // Timeline - Step 4: Error Sequence
    async function triggerErrorSequence() {
        setScene(sceneError);
        globalGlitch.classList.add('global-glitch-active');
        AudioEngine.glitch();
        window.hideParticles();
        
        await sleep(3000); // Glitch duration
        
        globalGlitch.classList.remove('global-glitch-active');
        setScene(sceneEnding);
    }

    // Timeline - Step 5: Shutdown
    btnShutdown.addEventListener('click', async () => {
        AudioEngine.stopDrone();
        setScene(sceneLost);
        await sleep(5000); // Wait in connection lost screen
        // Fade completely to black
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#000';
    });

    // Initialize
    startBootSequence();
});
