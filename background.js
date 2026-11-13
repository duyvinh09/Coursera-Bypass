// background.js
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes('/learn/')) {
        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
        console.log('Đã gửi lệnh bật/tắt cho tab bài học');
    } else {
        console.log('Tab hiện tại không phải bài học Coursera, bỏ qua');
    }
});