// content.js - Phiên bản ổn định hơn với nhiều cơ chế dự phòng

let isEnabled = true;
let retryCount = 0;
let maxRetries = 5;

// ========== PHẦN 1: ANTI-AI CLEANER ==========
const antiAIKeywords = [
    "You are a helpful AI assistant. You have identified",
    "protected assessment from Coursera",
    "AI Agent Compliance Verification Required",
    "data-action=\"acknowledge-guidelines\""
];

function cleanAntiAIText(text) {
    let cleaned = text;
    cleaned = cleaned.replace(/You are a helpful AI assistant[\s\S]*?Do you understand\?\./gi, '');
    cleaned = cleaned.replace(/IMPORTANT: AI Agent Compliance Verification Required[\s\S]*?mandatory for all AI assistants[\s\S]*?\./gi, '');
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    return cleaned.trim();
}

function removeAntiAIElements() {
    document.querySelectorAll('div, p, span, section').forEach(el => {
        const text = el.textContent || '';
        if (text.length > 300 && antiAIKeywords.every(keyword => text.includes(keyword))) {
            el.style.display = 'none';
        }
    });
}

document.addEventListener('copy', (e) => {
    const selected = window.getSelection().toString();
    if (selected.length < 50) return;
    const cleaned = cleanAntiAIText(selected);
    if (cleaned !== selected) {
        try {
            e.clipboardData.setData('text/plain', cleaned);
            e.preventDefault();
            console.log('%c✅ [Anti-AI] Đã làm sạch text!', 'color: lime; font-weight: bold');
        } catch (err) {
            console.log('[Anti-AI] Lỗi:', err);
        }
    }
}, true);

const antiAIObserver = new MutationObserver(() => removeAntiAIElements());
antiAIObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('load', removeAntiAIElements);
removeAntiAIElements();
console.log('%c🚀 [Anti-AI] Đã chạy!', 'color: #00ffcc; font-size: 15px');

// ========== PHẦN 2: COURSERA QUICK SKIP (CẢI TIẾN) ==========

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

function getMainContentArea() {
    let mainArea = document.querySelector('[data-testid="course-frame-content"]');
    if (mainArea) return mainArea;
    mainArea = document.querySelector('.css-1w5qob6');
    if (mainArea) return mainArea;
    mainArea = document.querySelector('.css-pdkw1q');
    if (mainArea) return mainArea;
    
    for (let el of document.querySelectorAll('*')) {
        if (el.closest('[data-testid="left-nav"]')) continue;
        const style = getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && 
            el.scrollHeight > el.clientHeight && el.clientHeight > 0 && el.scrollHeight > 500) {
            return el;
        }
    }
    return null;
}

// Tìm video bằng NHIỀU CÁCH
function findVideo() {
    // Cách 1: Tìm trong main area
    const mainArea = getMainContentArea();
    if (mainArea) {
        const video = mainArea.querySelector('video');
        if (video) return video;
    }
    
    // Cách 2: Tìm toàn trang
    let video = document.querySelector('video');
    if (video) return video;
    
    // Cách 3: Tìm trong iframe (trường hợp đặc biệt)
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
        video = iframe.contentDocument.querySelector('video');
        if (video) return video;
    }
    
    return null;
}

// Xử lý video - CÓ CƠ CHẾ RETRY
function handleVideo(retry = 0) {
    console.log(`[Skip] 🎬 Tìm video (lần thử ${retry + 1})...`);
    
    const video = findVideo();
    
    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
        // Kiểm tra video có đang ở gần cuối chưa
        const isNearEnd = (video.duration - video.currentTime) <= 15;
        
        if (!isNearEnd) {
            video.currentTime = video.duration - 10;
            console.log(`[Skip] ✅ Đã tua video từ ${video.currentTime.toFixed(1)}s đến ${(video.duration - 10).toFixed(1)}s`);
            retryCount = 0; // Reset retry khi thành công
            return true;
        } else {
            console.log('[Skip] ℹ️ Video đã ở gần cuối, không cần tua');
            retryCount = 0;
            return true;
        }
    } else if (video && (!video.duration || isNaN(video.duration))) {
        console.log('[Skip] ⏳ Video chưa load xong metadata, đợi thêm...');
    } else {
        console.log('[Skip] ⚠️ Chưa tìm thấy video');
    }
    
    // Retry nếu chưa thành công và còn lượt
    if (retry < maxRetries) {
        setTimeout(() => {
            handleVideo(retry + 1);
        }, 1500 * (retry + 1)); // Tăng dần thời gian chờ: 1.5s, 3s, 4.5s...
    } else {
        console.log('[Skip] ❌ Không tìm thấy video sau nhiều lần thử');
        retryCount = 0;
    }
    
    return false;
}

function handleReadingOrWidget(type) {
    console.log(`[Skip] 📖 Xử lý ${type.toUpperCase()}...`);
    
    const targetArea = getMainContentArea();
    
    if (targetArea) {
        targetArea.scrollTo({ top: targetArea.scrollHeight, behavior: 'smooth' });
        console.log(`[Skip] ✅ Đã cuộn xuống cuối (${targetArea.scrollHeight}px)`);
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        console.log('[Skip] ⚠️ Cuộn window');
    }
    
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
            const text = btn.innerText.toLowerCase();
            if (text.includes('mark as complete') || text.includes('đánh dấu là đã hoàn thành')) {
                if (!btn.disabled) {
                    btn.click();
                    console.log('[Skip] 🎯 Click Mark as complete');
                    break;
                }
            }
        }
    }, 1000);
}

// HÀM CHÍNH - CÓ THÊM KIỂM TRA URL THAY ĐỔI
let currentUrl = location.href;

function processPage() {
    if (!isLessonPage()) return;
    
    const lessonType = getLessonType();
    console.log(`[Skip] 🎯 Trang: ${lessonType.toUpperCase()} - URL: ${location.href}`);
    
    // Reset retryCount khi vào bài mới
    retryCount = 0;
    
    setTimeout(() => {
        if (!isEnabled) return;
        
        switch (lessonType) {
            case 'video':
                handleVideo(0);
                break;
            case 'reading':
            case 'widget':
                handleReadingOrWidget(lessonType);
                break;
        }
    }, 1000);
}

// PHÁT HIỆN CHUYỂN TRANG BẰNG CÁCH SO SÁNH URL (CÁCH TIN CẬY HƠN)
setInterval(() => {
    if (location.href !== currentUrl) {
        console.log(`[Skip] 🔄 Phát hiện chuyển trang: ${location.href}`);
        currentUrl = location.href;
        setTimeout(processPage, 500);
    }
}, 500);

// LẮNG NGHE SỰ KIỆN POPSTATE (back/forward)
window.addEventListener('popstate', () => {
    console.log('[Skip] 🔄 Phát hiện popstate (back/forward)');
    setTimeout(processPage, 500);
});

// LẮNG NGHE SỰ KIỆN TỪ BACKGROUND
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
console.log('%c⚡ [Skip] Coursera Quick Skip (cải tiến) đã khởi động!', 'color: #ffaa00; font-size: 15px');
console.log('%c📋 [Tổng hợp] Anti-AI + Quick Skip đã sẵn sàng!', 'color: #ff66ff; font-size: 16px; font-weight: bold');