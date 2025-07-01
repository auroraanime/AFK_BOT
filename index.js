// ===================================================================
// ===           MÃ BOT AURORA - PHIÊN BẢN RENDER.COM            ===
// ===================================================================

const mineflayer = require('mineflayer');

// --- CẤU HÌNH BOT (Đã cập nhật theo yêu cầu của bạn) ---
const HOST = 'auroraanime-C3AI.aternos.me';
const PORT = 63018;
const USERNAME = 'AURORA_AFK_BOT';
const VERSION = '1.21.1';
const RECONNECT_DELAY = 15000; // Tăng lên 15 giây cho ổn định
const ANTI_AFK_INTERVAL = 2 * 60 * 1000; // 2 phút

let bot;
let antiAfkInterval;

function createAndConnectBot() {
    console.log(`[HỆ THỐNG] Đang khởi tạo và kết nối tới ${HOST}:${PORT}...`);
    
    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME,
        version: VERSION,
        auth: 'offline',
        disableChatSigning: true
    });

    bot.on('login', () => {
        console.log(`[THÀNH CÔNG] Bot [${bot.username}] đã đăng nhập.`);
    });

    bot.on('spawn', () => {
        console.log(`[THÔNG BÁO] Bot đã xuất hiện và đang AFK. Kết nối ổn định!`);
        console.log(`[HỆ THỐNG] Kích hoạt chức năng chống kick AFK.`);
        
        if (antiAfkInterval) clearInterval(antiAfkInterval); 
        
        antiAfkInterval = setInterval(() => {
            bot.swingArm();
        }, ANTI_AFK_INTERVAL);
    });

    bot.on('kicked', (reason) => {
        console.log(`[LỖI] Bot bị kick. Lý do:`, reason);
    });

    bot.on('error', (err) => {
        if (!err.message.includes('PartialReadError')) {
            console.log(`[LỖI] Đã xảy ra lỗi: ${err.message}`);
        }
    });

    bot.on('end', (reason) => {
        console.log(`[KẾT NỐI] Đã ngắt kết nối. Lý do: ${reason}`);
        
        if (antiAfkInterval) clearInterval(antiAfkInterval);
        
        console.log(`[HỆ THỐNG] Sẽ tự động kết nối lại sau ${RECONNECT_DELAY / 1000} giây.`);
        setTimeout(createAndConnectBot, RECONNECT_DELAY);
    });
}

// Bắt đầu chạy bot
createAndConnectBot();
