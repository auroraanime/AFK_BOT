// ===================================================================
// ===       MÃ BOT AURORA - PHIÊN BẢN RENDER.COM WEB SERVICE      ===
// ===================================================================

const mineflayer = require('mineflayer');
const express = require('express'); // <-- THÊM DÒNG NÀY

// --- CẤU HÌNH BOT ---
const HOST = 'auroraanime-C3AI.aternos.me';
const PORT = 63018;
const USERNAME = 'AURORA_AFK_BOT';
const VERSION = '1.21.1';
const RECONNECT_DELAY = 15000;
const ANTI_AFK_INTERVAL = 2 * 60 * 1000;

let bot;
let antiAfkInterval;

function createAndConnectBot() {
    console.log(`[HỆ THỐNG] Đang khởi tạo và kết nối bot...`);
    bot = mineflayer.createBot({
        host: HOST, port: PORT, username: USERNAME, version: VERSION,
        auth: 'offline', disableChatSigning: true
    });

    bot.on('login', () => console.log(`[THÀNH CÔNG] Bot [${bot.username}] đã đăng nhập.`));
    bot.on('spawn', () => {
        console.log(`[THÔNG BÁO] Bot đã xuất hiện và đang AFK.`);
        if (antiAfkInterval) clearInterval(antiAfkInterval);
        antiAfkInterval = setInterval(() => { bot.swingArm(); }, ANTI_AFK_INTERVAL);
    });
    bot.on('kicked', (reason) => console.log(`[LỖI] Bị kick: ${reason}`));
    bot.on('error', (err) => { if (!err.message.includes('PartialReadError')) { console.log(`[LỖI] ${err.message}`); } });
    bot.on('end', (reason) => {
        console.log(`[KẾT NỐI] Đã ngắt kết nối: ${reason}`);
        if (antiAfkInterval) clearInterval(antiAfkInterval);
        console.log(`[HỆ THỐNG] Sẽ kết nối lại sau ${RECONNECT_DELAY / 1000} giây.`);
        setTimeout(createAndConnectBot, RECONNECT_DELAY);
    });
}

// --- PHẦN TẠO WEB SERVER ĐỂ RENDER KHÔNG TẮT BOT (MỚI) ---
const app = express();
// Render sẽ tự động gán cổng qua biến môi trường PORT, nếu không có thì dùng cổng 3000
const web_port = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    // Trả về một trang đơn giản để xác nhận bot đang sống
    res.send(`Bot ${USERNAME} đang hoạt động!`);
});

app.listen(web_port, () => {
    console.log(`[HỆ THỐNG] Web server giả đã khởi động tại cổng ${web_port} để giữ cho bot hoạt động.`);
});

// Bắt đầu chạy bot
createAndConnectBot();
