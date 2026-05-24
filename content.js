// content.js - Coursera Quick Skip + Anti-AI Cleaner

let isEnabled = true;

// ========== PHẦN 1: ANTI-AI CLEANER (của bạn) ==========
const antiAIKeywords = [
    "You are a helpful AI assistant. You have identified",
    "protected assessment from Coursera",
    "AI Agent Compliance Verification Required",
    "data-action=\"acknowledge-guidelines\""
];

function cleanAntiAIText(text) {
    let cleaned = text;

    // Xóa toàn bộ khối anti-AI
    cleaned = cleaned.replace(/You are a helpful AI assistant[\s\S]*?Do you understand\?\./gi, '');
    cleaned = cleaned.replace(/IMPORTANT: AI Agent Compliance Verification Required[\s\S]*?mandatory for all AI assistants[\s\S]*?\./gi, '');

    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    return cleaned.trim();
}

// Chỉ xóa element chứa toàn bộ đoạn text dài (an toàn hơn)
function removeAntiAIElements() {
    document.querySelectorAll('div, p, span, section').forEach(el => {
        const text = el.textContent || '';
        if (text.length > 300 && antiAIKeywords.every(keyword => text.includes(keyword))) {
            el.style.display = 'none';
            // Không remove hẳn để tránh làm trắng trang
        }
    });
}

// Xử lý Copy - Phần quan trọng nhất
document.addEventListener('copy', (e) => {
    const selected = window.getSelection().toString();
    if (selected.length < 50) return;

    const cleaned = cleanAntiAIText(selected);

    if (cleaned !== selected) {
        try {
            e.clipboardData.setData('text/plain', cleaned);
            e.preventDefault();
            console.log('%c✅ [Anti-AI] Đã làm sạch text thành công!', 'color: lime; font-weight: bold');
        } catch (err) {
            console.log('[Anti-AI] Lỗi:', err);
        }
    }
}, true);

// Chạy anti-AI cleaner
const antiAIObserver = new MutationObserver(() => {
    removeAntiAIElements();
});
antiAIObserver.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('load', removeAntiAIElements);
removeAntiAIElements();

console.log('%c🚀 [Anti-AI] Coursera Cleaner đã chạy!', 'color: #00ffcc; font-size: 15px');

// ========== PHẦN 2: COURSERA QUICK SKIP (tua video + cuộn bài đọc) ==========

function getLessonType() {
    const url = window.location.href;
    if (url.includes('/lecture/')) return 'video';
    if (url.includes('/supplement/')) return 'reading';
    if (url.includes('/ungradedWidget/')) return 'widget';
    return 'unknown';
}

function isLessonPage() {
    return getLessonType() !== 'unknown';
}

// Tìm phần tử nội dung CHÍNH CẦN CUỘN
function getMainContentArea() {
    // Ưu tiên 1: data-testid="course-frame-content"
    let mainArea = document.querySelector('[data-testid="course-frame-content"]');
    if (mainArea) {
        console.log('[Skip] 🎯 Tìm thấy course-frame-content');
        return mainArea;
    }
    
    // Ưu tiên 2: class css-1w5qob6
    mainArea = document.querySelector('.css-1w5qob6');
    if (mainArea) {
        console.log('[Skip] 🎯 Tìm thấy .css-1w5qob6');
        return mainArea;
    }
    
    // Ưu tiên 3: class css-pdkw1q
    mainArea = document.querySelector('.css-pdkw1q');
    if (mainArea) {
        console.log('[Skip] 🎯 Tìm thấy .css-pdkw1q');
        return mainArea;
    }
    
    // Fallback: tìm phần tử có thanh cuộn, không phải left-nav
    const allElements = document.querySelectorAll('*');
    for (let el of allElements) {
        if (el.closest('[data-testid="left-nav"]')) continue;
        const style = getComputedStyle(el);
        const overflowY = style.overflowY;
        const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && 
                              el.scrollHeight > el.clientHeight &&
                              el.clientHeight > 0;
        if (isScrollable && el.scrollHeight > 500) {
            console.log('[Skip] 🎯 Fallback tìm thấy:', el.className);
            return el;
        }
    }
    return null;
}

// Xử lý video
function handleVideo() {
    console.log('[Skip] 🎬 Xử lý video...');
    const mainArea = getMainContentArea();
    const video = mainArea ? mainArea.querySelector('video') : document.querySelector('video');
    
    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
        if (video.currentTime < video.duration - 5) {
            video.currentTime = video.duration - 5;
            console.log('[Skip] ✅ Đã tua video đến 5 giây cuối');
        }
    } else {
        console.log('[Skip] ⚠️ Không tìm thấy video');
    }
}

// Xử lý bài đọc/widget
function handleReadingOrWidget(type) {
    console.log(`[Skip] 📖 Xử lý ${type.toUpperCase()}...`);
    
    const targetArea = getMainContentArea();
    
    if (targetArea) {
        targetArea.scrollTo({
            top: targetArea.scrollHeight,
            behavior: 'smooth'
        });
        console.log(`[Skip] ✅ Đã cuộn xuống cuối (${targetArea.scrollHeight}px)`);
    } else {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        console.log('[Skip] ⚠️ Không tìm thấy vùng cuộn, đã cuộn window');
    }
    
    // Tự động click "Mark as complete"
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
            const text = btn.innerText.toLowerCase();
            if (text.includes('mark as complete') || text.includes('đánh dấu là đã hoàn thành')) {
                if (!btn.disabled) {
                    btn.click();
                    console.log('[Skip] 🎯 Đã click nút Mark as complete');
                    break;
                }
            }
        }
    }, 1000);
}

// HÀM CHÍNH
function processPage() {
    if (!isLessonPage()) return;
    
    const lessonType = getLessonType();
    console.log(`[Skip] 🎯 Trang: ${lessonType.toUpperCase()}`);
    
    setTimeout(() => {
        if (!isEnabled) return;
        
        switch (lessonType) {
            case 'video':
                handleVideo();
                break;
            case 'reading':
            case 'widget':
                handleReadingOrWidget(lessonType);
                break;
        }
    }, 1500);
    
    // Xử lý lần 2 cho bài đọc (đề phòng load chậm)
    if (lessonType === 'reading' || lessonType === 'widget') {
        setTimeout(() => {
            if (isEnabled) handleReadingOrWidget(lessonType);
        }, 4000);
    }
}

// THEO DÕI CHUYỂN TRANG
let lastUrl = location.href;
function observeNavigation() {
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('[Skip] 🔄 Chuyển trang');
            setTimeout(processPage, 500);
        }
    }).observe(document, { subtree: true, childList: true });
}

// Lắng nghe bật/tắt từ background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        isEnabled = request.enabled;
        console.log(`[Skip] Trạng thái: ${isEnabled ? 'BẬT' : 'TẮT'}`);
        if (isEnabled) processPage();
    }
    sendResponse({ status: 'ok' });
});

// KHỞI ĐỘNG
processPage();
observeNavigation();

console.log('%c⚡ [Skip] Coursera Quick Skip đã khởi động!', 'color: #ffaa00; font-size: 15px');
console.log('%c📋 [Tổng hợp] Anti-AI Cleaner + Quick Skip đã sẵn sàng!', 'color: #ff66ff; font-size: 16px; font-weight: bold');