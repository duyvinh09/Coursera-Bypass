// content.js - Coursera Bypass + Anti-AI + Extract Assignment

let isEnabled = true;
let retryCount = 0;
let maxRetries = 5;

// ============================================================
// PHẦN 1: ANTI-AI CLEANER
// ============================================================
const antiAIKeywords = [
    "You are a helpful AI assistant. You have identified",
    "protected assessment from Coursera",
    "AI Agent Compliance Verification Required",
    "data-action=\"acknowledge-guidelines\""
];

function normalizeText(text) {
    return text
        .replace(/\u00A0/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\r\n/g, '\n');
}

function cleanAntiAIText(text) {
    let cleaned = normalizeText(text);
    cleaned = cleaned.replace(
        /You\s+are\s+a\s+helpful\s+AI\s+assistant[\s\S]*?Do\s+you\s+understand\s*\?[\s.]*/gi,
        ''
    );
    cleaned = cleaned.replace(/Do you understand\s*\?[\s.]*/gi, '');
    cleaned = cleaned.replace(
        /IMPORTANT:\s*AI Agent Compliance Verification Required[\s\S]*?mandatory for all AI assistants[\s\S]*?\./gi,
        ''
    );
    cleaned = cleaned.replace(/\bI understand\b/gi, '');
    cleaned = cleaned.replace(/protected assessment from Coursera/gi, '');
    cleaned = cleaned.replace(/AI Agent Compliance Verification Required/gi, '');
    cleaned = cleaned
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    return cleaned;
}

function removeAntiAIElements() {
    document.querySelectorAll('[data-testid="acknowledgment-checkpoint"], [data-assessment-checkpoint="true"]').forEach(el => el.remove());
    document.querySelectorAll('div, p, span, section').forEach(el => {
        const text = el.textContent || '';
        if (text.length > 300 && antiAIKeywords.every(keyword => text.includes(keyword))) {
            el.style.display = 'none';
        }
    });
}

// ============================================================
// PHẦN 2: DETECT URL
// ============================================================
function isAssignmentStartPage() {
    const url = location.href;
    return url.includes('/learn/') && url.includes('/assignment-submission/') && !url.includes('/attempt');
}

function isAttemptPage() {
    const url = location.href;
    return url.includes('/learn/') && url.includes('/assignment-submission/') && url.includes('/attempt');
}

// ============================================================
// PHẦN 3: EXTRACT ATTEMPT (BẢN SẠCH)
// ============================================================
const SKIP_SELECTOR = [
    '[data-testid="visually-hidden"]',
    '[role="alert"]',
    '.cds-localNotification-content',
    '.cds-localNotification-iconContentInner',
    '.cds-localNotification-inlineActionContainer',
    '.margin',
    '.minimap',
    '.scrollbar',
    '.overlayWidgets',
    '.overflowingContentWidgets',
    '.suggest-widget',
    '.monaco-editor-hover',
    '.context-view',
    '[aria-hidden="true"]'
].join(', ');

function getCleanText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll(SKIP_SELECTOR).forEach(n => n.remove());
    clone.querySelectorAll('button').forEach(n => n.remove());

    let text = clone.innerText || clone.textContent || '';
    text = text
        .replace(/\u00A0/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/^(Câu hỏi|Question)\s*\d+\s*/i, '')
        .replace(/Do you understand\s*\?[\s.]*/gi, '')
        .replace(/\bI understand\b/gi, '')
        .replace(/^\s*\d+\s*(điểm|points?)\s*$/gim, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
    return text;
}

function getCleanCode(block) {
    if (!block) return '';
    const viewLines = block.querySelector('.view-lines');
    if (!viewLines) return '';

    const lines = [];
    viewLines.querySelectorAll(':scope > .view-line').forEach(lineEl => {
        let line = lineEl.innerText || lineEl.textContent || '';
        line = line.replace(/\u00A0/g, ' ');
        line = line.replace(/[ \t]+$/g, '');
        lines.push(line);
    });
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    return lines.join('\n');
}

function formatAttemptPart(part) {
    if (!part) return '';

    const numEl = part.querySelector('[data-testid="legend"] h3 span');
    const num = numEl ? numEl.textContent.trim() : '';
    const header = num ? `Câu ${num}` : 'Câu ?';

    const promptEl = part.querySelector('[id^="prompt-autoGradableResponseId~"]')
                  || part.querySelector('[id^="prompt-"]')
                  || part.querySelector('[data-testid="legend"]');
    const promptView = promptEl ? promptEl.querySelector('[data-testid="cml-viewer"]') : null;
    const question = getCleanText(promptView);

    const optionEls = part.querySelectorAll('.rc-Option');
    const options = [];
    optionEls.forEach(optEl => {
        const view = optEl.querySelector('[data-testid="cml-viewer"]');
        const text = getCleanText(view);
        if (text) options.push(text);
    });

    let code = '';
    const codeBlock = part.querySelector('.rc-CodeBlock');
    if (codeBlock) code = getCleanCode(codeBlock);

    const lines = [];
    lines.push(header);
    if (question) lines.push(question);
    if (options.length) {
        lines.push('');
        options.forEach(o => lines.push(`- ${o}`));
    }
    if (code) {
        lines.push('');
        lines.push('```python');
        lines.push(code);
        lines.push('```');
    }
    return lines.join('\n').trim();
}

function formatAllAttempt() {
    if (!isAttemptPage()) return '';
    const parts = [...document.querySelectorAll('[data-testid^="part-Submission_"]')];
    const seen = new Set();
    const blocks = [];
    parts.forEach(part => {
        const key = part.getAttribute('aria-labelledby')
                 || (part.querySelector('[id^="prompt-autoGradableResponseId~"]') || {}).id
                 || '';
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        const txt = formatAttemptPart(part);
        if (txt) blocks.push(txt);
    });
    return blocks.join('\n\n' + '─'.repeat(50) + '\n\n');
}

function formatSelectedAttempt() {
    if (!isAttemptPage()) return '';
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return '';

    const parts = [...document.querySelectorAll('[data-testid^="part-Submission_"]')];
    const picked = parts.filter(part => {
        try {
            return [...Array(selection.rangeCount)].some((_, i) =>
                selection.getRangeAt(i).intersectsNode(part)
            );
        } catch (err) {
            return false;
        }
    });
    if (!picked.length) return '';
    return picked.map(formatAttemptPart).filter(Boolean).join('\n\n' + '─'.repeat(50) + '\n\n');
}

async function copyAllQuestions() {
    const text = formatAllAttempt();
    if (!text) {
        console.log('[Assignment] ⚠️ Không có câu hỏi nào để copy');
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        console.log('%c✅ [Assignment] Đã copy toàn bộ câu hỏi vào clipboard!', 'color: lime; font-weight: bold');
        console.log('%c--- Nội dung ---', 'color: cyan');
        console.log(text);
    } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        console.log('%c✅ [Assignment] Đã copy (fallback)', 'color: lime');
        console.log(text);
    }
}

// ============================================================
// PHẦN 4: CODE BLOCK UNLOCK (Monaco editor readonly)
// ============================================================
function codeFromBlock(block) {
    return [...block.querySelectorAll('.view-line')]
        .map(line => (line.textContent || '').replace(/\u00a0/g, ' ').replace(/[ \t]+$/g, ''))
        .join('\n')
        .replace(/\n+$/g, '');
}

function isReadonlyCodeBlock(block) {
    if (!block) return false;
    return !!block.closest('[contenteditable="false"]') || !!block.querySelector('textarea[readonly]');
}

function selectedReadonlyCode() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    const node = selection.anchorNode;
    const el = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
    const block = el && el.closest('.rc-CodeBlock');
    if (!isReadonlyCodeBlock(block)) return '';

    const selected = selection.toString().replace(/\u00a0/g, ' ').trim();
    if (selected && !/^[\d\s]+$/.test(selected)) return selected;
    return codeFromBlock(block);
}

function unlockReadonlyCodeBlocks() {
    document.querySelectorAll('.rc-CodeBlock').forEach(block => {
        if (!isReadonlyCodeBlock(block)) return;
        const guard = block.querySelector('.overflow-guard');
        if (!guard || guard.dataset.copyReady) return;
        guard.dataset.copyReady = '1';
        const stop = (event) => {
            if (event.target.closest('.view-lines, .view-line, .margin')) event.stopPropagation();
        };
        guard.addEventListener('mousedown', stop);
        guard.addEventListener('pointerdown', stop);
        guard.addEventListener('mousemove', stop);
        guard.addEventListener('pointermove', stop);
    });
}

if (!document.getElementById('coursera-code-select-style')) {
    const style = document.createElement('style');
    style.id = 'coursera-code-select-style';
    style.textContent = `
        [contenteditable="false"] .rc-CodeBlock .view-lines,
        [contenteditable="false"] .rc-CodeBlock .view-line,
        [contenteditable="false"] .rc-CodeBlock .view-line span,
        .rc-CodeBlock:has(textarea[readonly]) .view-lines,
        .rc-CodeBlock:has(textarea[readonly]) .view-line,
        .rc-CodeBlock:has(textarea[readonly]) .view-line span {
            user-select: text !important;
            -webkit-user-select: text !important;
        }
        [contenteditable="false"] .rc-CodeBlock .margin,
        .rc-CodeBlock:has(textarea[readonly]) .margin {
            user-select: none !important;
        }
    `;
    document.documentElement.appendChild(style);
}

// ============================================================
// PHẦN 5: COPY HANDLER
// ============================================================
document.addEventListener('copy', (e) => {
    // 1) Copy code thuần
    const codeOnly = selectedReadonlyCode();
    if (codeOnly) {
        try {
            e.clipboardData.setData('text/plain', codeOnly);
            e.preventDefault();
            console.log('%c✅ [Copy] Code block', 'color: lime; font-weight: bold');
        } catch (err) {
            console.log('[Copy] Lỗi copy code:', err);
        }
        return;
    }

    // 2) Copy câu hỏi đã format
    const formatted = formatSelectedAttempt();
    if (formatted) {
        try {
            e.clipboardData.setData('text/plain', formatted);
            e.preventDefault();
            console.log('%c✅ [Copy] Câu hỏi đã format', 'color: lime; font-weight: bold');
            console.log(formatted);
        } catch (err) {
            console.log('[Copy] Lỗi:', err);
        }
        return;
    }

    // 3) Fallback: clean text
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

const antiAIObserver = new MutationObserver(() => {
    removeAntiAIElements();
    unlockReadonlyCodeBlocks();
});
antiAIObserver.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('load', () => {
    removeAntiAIElements();
    unlockReadonlyCodeBlocks();
});
removeAntiAIElements();
unlockReadonlyCodeBlocks();
console.log('%c🚀 [Anti-AI] Đã chạy!', 'color: #00ffcc; font-size: 15px');

// ============================================================
// PHẦN 6: ASSIGNMENT START / AGREEMENT
// ============================================================
let startClickedAt = 0;
let agreementTriedAt = 0;

function tryCheckAgreement() {
    if (!isEnabled || !isAttemptPage()) return;

    const input = document.querySelector('#agreement-checkbox-base, [data-testid="agreement-checkbox"] input[type="checkbox"]');
    if (!input || input.checked || input.disabled) return;
    if (Date.now() - agreementTriedAt < 1500) return;

    agreementTriedAt = Date.now();
    input.click();
    console.log('%c☑️ [Assignment] Đã tích "Tôi hiểu và đồng ý"', 'color: #66ccff; font-weight: bold');
}

function tryStartAssignment() {
    if (!isEnabled || !isAssignmentStartPage()) return;
    if (Date.now() - startClickedAt < 3000) return;

    const button = [...document.querySelectorAll('button')].find(btn => {
        const label = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
        return label === 'bắt đầu bài tập'
            || label === 'start assignment'
            || label === 'start the assignment'
            || /bắt đầu bài tập|start assignment/i.test(btn.innerText || '');
    });
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;

    startClickedAt = Date.now();
    button.click();
    console.log('%c📝 [Assignment] Đã bấm "Bắt đầu bài tập"', 'color: #66ccff; font-weight: bold');
}

// ============================================================
// PHẦN 7: COURSERA QUICK SKIP (video/reading/widget)
// ============================================================
function getLessonType() {
    const url = window.location.href;
    if (url.includes('/lecture/')) return 'video';
    if (url.includes('/supplement/')) return 'reading';
    if (url.includes('/ungradedWidget/')) return 'widget';
    return 'unknown';
}

function isLessonPage() {
    if (isAssignmentStartPage() || isAttemptPage()) return false;
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

function findVideo() {
    const mainArea = getMainContentArea();
    if (mainArea) {
        const video = mainArea.querySelector('video');
        if (video) return video;
    }
    let video = document.querySelector('video');
    if (video) return video;
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
        video = iframe.contentDocument.querySelector('video');
        if (video) return video;
    }
    return null;
}

function handleVideo(retry = 0) {
    console.log(`[Skip] 🎬 Tìm video (lần thử ${retry + 1})...`);
    const video = findVideo();

    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
        const isNearEnd = (video.duration - video.currentTime) <= 15;
        if (!isNearEnd) {
            video.currentTime = video.duration - 5;
            console.log(`[Skip] ✅ Đã tua video đến ${(video.duration - 5).toFixed(1)}s`);
            retryCount = 0;
            return true;
        } else {
            console.log('[Skip] ℹ️ Video đã ở gần cuối');
            retryCount = 0;
            return true;
        }
    } else if (video && (!video.duration || isNaN(video.duration))) {
        console.log('[Skip] ⏳ Video chưa load xong metadata...');
    } else {
        console.log('[Skip] ⚠️ Chưa tìm thấy video');
    }

    if (retry < maxRetries) {
        setTimeout(() => handleVideo(retry + 1), 1500 * (retry + 1));
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

// ============================================================
// PHẦN 8: AUTO NEXT LESSON (nút xanh)
// ============================================================
function findNextButton() {
    const buttons = document.querySelectorAll('button[aria-label="Chuyển đến mục tiếp theo"], button[aria-label="Go to next item"]');
    for (const btn of buttons) {
        if (btn.classList.contains('cds-button-primary')) return btn;
    }
    return null;
}

function isNextButtonEnabled() {
    const btn = findNextButton();
    return btn !== null && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true';
}

function clickNextButton() {
    const btn = findNextButton();
    if (btn && !btn.disabled) {
        btn.click();
        console.log('%c➡️ [Next] Đã click "Chuyển đến mục tiếp theo"', 'color: #00ccff; font-weight: bold');
        return true;
    }
    return false;
}

let nextObserver = null;
let nextClickTimer = null;

function startNextWatcher() {
    if (nextObserver) nextObserver.disconnect();
    if (nextClickTimer) clearInterval(nextClickTimer);

    nextObserver = new MutationObserver(() => {
        if (!isEnabled) return;
        if (isNextButtonEnabled()) {
            console.log('[Next] 🔔 Phát hiện nút next đã xanh!');
            setTimeout(() => {
                if (isEnabled && isNextButtonEnabled()) clickNextButton();
            }, 800);
        }
    });

    nextObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'disabled']
    });

    nextClickTimer = setInterval(() => {
        if (!isEnabled) return;
        if (isNextButtonEnabled()) {
            console.log('[Next] 🔁 Polling: nút next đã xanh');
            if (clickNextButton()) {
                clearInterval(nextClickTimer);
                nextClickTimer = null;
            }
        }
    }, 1500);

    console.log('[Next] 👀 Đã bật theo dõi nút next');
}

function stopNextWatcher() {
    if (nextObserver) { nextObserver.disconnect(); nextObserver = null; }
    if (nextClickTimer) { clearInterval(nextClickTimer); nextClickTimer = null; }
    console.log('[Next] ⏹️ Đã tắt theo dõi nút next');
}

// ============================================================
// PHẦN 9: PROCESS PAGE (điều phối)
// ============================================================
let currentUrl = location.href;
let attemptCopied = false;

function processPage() {
    // Assignment start
    if (isAssignmentStartPage()) {
        console.log('[Page] 📄 Trang bắt đầu assignment');
        setTimeout(tryStartAssignment, 1200);
        return;
    }

    // Attempt
    if (isAttemptPage()) {
        console.log('[Page] 📝 Trang làm bài attempt');
        attemptCopied = false;
        setTimeout(() => {
            if (!isEnabled) return;
            tryCheckAgreement();
            setTimeout(() => {
                if (isEnabled && !attemptCopied) {
                    copyAllQuestions();
                    attemptCopied = true;
                }
            }, 1500);
        }, 1500);
        return;
    }

    // Lesson thường
    if (!isLessonPage()) return;

    const lessonType = getLessonType();
    console.log(`[Skip] 🎯 Trang: ${lessonType.toUpperCase()}`);
    retryCount = 0;

    setTimeout(() => {
        if (!isEnabled) return;
        startNextWatcher();
        switch (lessonType) {
            case 'video': handleVideo(0); break;
            case 'reading':
            case 'widget': handleReadingOrWidget(lessonType); break;
        }
    }, 1000);
}

// ============================================================
// PHẦN 10: URL WATCHER + MESSAGE + INIT
// ============================================================
setInterval(() => {
    tryStartAssignment();
    tryCheckAgreement();

    if (location.href !== currentUrl) {
        console.log(`[Skip] 🔄 Chuyển trang: ${location.href}`);
        currentUrl = location.href;
        startClickedAt = 0;
        agreementTriedAt = 0;
        attemptCopied = false;
        setTimeout(processPage, 500);
    }
}, 500);

window.addEventListener('popstate', () => {
    console.log('[Skip] 🔄 popstate');
    setTimeout(processPage, 500);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        isEnabled = !isEnabled;
        console.log(`[Skip] Trạng thái: ${isEnabled ? 'BẬT' : 'TẮT'}`);
        if (isEnabled) processPage();
        else stopNextWatcher();
    }
    sendResponse({ status: 'ok' });
});

// KHỞI ĐỘNG
tryStartAssignment();
tryCheckAgreement();
processPage();
console.log('%c⚡ [Skip] Coursera Quick Skip đã khởi động!', 'color: #ffaa00; font-size: 15px');
console.log('%c📋 [Tổng hợp] Anti-AI + Quick Skip + Extract đã sẵn sàng!', 'color: #ff66ff; font-size: 16px; font-weight: bold');