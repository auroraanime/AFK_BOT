// ===================================================================
// ===       MÃ BOT AURORA - PHIÊN BẢN RENDER.COM WEB SERVICE      ===
// ===================================================================

const mineflayer = require('mineflayer');
const express = require('express');
const moment = require('moment-timezone'); // Thêm dòng này để sử dụng thư viện thời gian

// --- CẤU HÌNH BOT ---
const HOST = 'auroraanime-C3AI.aternos.me';
const PORT = 63018;
const USERNAME = 'AURORA_AFK_BOT';
const VERSION = '1.21.1';
const RECONNECT_DELAY = 15000;

// Cấu hình các khoảng thời gian cho hành động
const CHAT_TIME_INTERVAL = 60 * 60 * 1000; // 1 giờ
const JUMP_INTERVAL = 2 * 60 * 1000;      // 2 phút
const LOOK_AROUND_INTERVAL = 2 * 60 * 1000; // 2 phút

let bot;
let chatTimeInterval;
let jumpInterval;
let lookAroundInterval;

function createAndConnectBot() {
    console.log(`[HỆ THỐNG] Đang khởi tạo và kết nối bot...`);
    bot = mineflayer.createBot({
        host: HOST, port: PORT, username: USERNAME, version: VERSION,
        auth: 'offline', disableChatSigning: true
    });

    bot.on('login', () => console.log(`[THÀNH CÔNG] Bot [${bot.username}] đã đăng nhập.`));
    bot.on('spawn', () => {
        console.log(`[THÔNG BÁO] Bot đã xuất hiện và đang AFK.`);

        // Clear tất cả các interval cũ nếu có
        if (chatTimeInterval) clearInterval(chatTimeInterval);
        if (jumpInterval) clearInterval(jumpInterval);
        if (lookAroundInterval) clearInterval(lookAroundInterval);

        // Khởi tạo các hành động định kỳ
        chatTimeInterval = setInterval(chatCurrentTime, CHAT_TIME_INTERVAL);
        jumpInterval = setInterval(performJump, JUMP_INTERVAL);
        lookAroundInterval = setInterval(performLookAround, LOOK_AROUND_INTERVAL);

        // Thực hiện hành động lần đầu ngay sau khi spawn
        chatCurrentTime();
    });
    bot.on('kicked', (reason) => console.log(`[LỖI] Bị kick: ${reason}`));
    bot.on('error', (err) => { if (!err.message.includes('PartialReadError')) { console.log(`[LỖI] ${err.message}`); } });
    bot.on('end', (reason) => {
        console.log(`[KẾT NỐI] Đã ngắt kết nối: ${reason}`);
        // Clear tất cả các interval khi bot bị ngắt kết nối
        if (chatTimeInterval) clearInterval(chatTimeInterval);
        if (jumpInterval) clearInterval(jumpInterval);
        if (lookAroundInterval) clearInterval(lookAroundInterval);

        console.log(`[HỆ THỐNG] Sẽ kết nối lại sau ${RECONNECT_DELAY / 1000} giây.`);
        setTimeout(createAndConnectBot, RECONNECT_DELAY);
    });
}

// --- HÀM HÀNH ĐỘNG CỦA BOT ---

function chatCurrentTime() {
    if (!bot || !bot.entity) return;
    const vietnamTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD/MM/YYYY');
    bot.chat(`[AURORA BOT] Thời gian thực tại Việt Nam là: ${vietnamTime}`);
    console.log(`[CHAT] Bot đã gửi thời gian: ${vietnamTime}`);
}

async function performJump() {
    if (!bot || !bot.entity) return;
    console.log('[ANTI-AFK] Nhảy.');
    bot.setControlState('jump', true);
    await bot.waitForTicks(5); // Giữ nút nhảy một chút
    bot.setControlState('jump', false);
}

async function performLookAround() {
    if (!bot || !bot.entity) return;
    console.log('[ANTI-AFK] Xoay đầu ngẫu nhiên.');
    const yaw = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * Math.PI / 2;
    await bot.look(yaw, pitch, true);
}


// --- PHẦN TẠO WEB SERVER ĐỂ RENDER KHÔNG TẮT BOT ---
const app = express();
const web_port = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send(`Bot ${USERNAME} đang hoạt động!`);
});

app.listen(web_port, () => {
    console.log(`[HỆ THỐNG] Web server giả đã khởi động tại cổng ${web_port} để giữ cho bot hoạt động.`);
});

// Bắt đầu chạy bot
createAndConnectBot();
