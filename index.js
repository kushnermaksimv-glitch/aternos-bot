const mineflayer = require('mineflayer');
const express = require('express');
const fetch = require('node-fetch');

// --- НАСТРОЙКИ СЕРВЕРА ATERNOS ---
const HOST = 'IdiakantWorld.aternos.me'; // Укажите IP вашего сервера (без порта)
const PORT = 25565;                  // Укажите динамический порт, если он есть
const BOT_NAME = 'Aternos_Guard';     // Никнейм бота
const VERSION = '26.1.2';             // Версия майнкрафта вашего сервера
// ---------------------------------

let bot;

// 1. Создание веб-сервера (чтобы Render не выдавал ошибку и не отключал скрипт)
const app = express();
const WEB_PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Бот активен и работает!');
});

app.listen(WEB_PORT, () => {
    console.log(`Веб-сервер запущен на порту ${WEB_PORT}`);
});

// 2. Основная функция запуска Minecraft бота
function createMinecraftBot() {
    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: BOT_NAME,
        version: VERSION,
        skipValidation: true
    });

    bot.on('spawn', () => {
        console.log(`[${BOT_NAME}] Успешно зашел на сервер!`);
        
        // Анти-АФК: бот прыгает каждые 20 секунд, чтобы его не кикнуло
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 20000);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        // Команда в чате для проверки бота
        if (message === '!ping') {
            bot.chat('Поздравляю, я в сети!');
        }
    });

    // Автоматический перезаход при кике или падении сервера
    bot.on('end', (reason) => {
        console.log(`Бот отключился: ${reason}. Повторное подключение через 30 секунд...`);
        setTimeout(createMinecraftBot, 30000);
    });

    bot.on('error', (err) => {
        console.log('Произошла ошибка:', err.message);
    });
}

createMinecraftBot();

// 3. Функция "Self-Ping" (Самопинг), предотвращающая отключение хостинга Render
const RENDER_URL = process.env.RENDER_EXTERNAL_URL; // Render автоматически подставит ссылку

if (RENDER_URL) {
    setInterval(() => {
        fetch(RENDER_URL)
            .then(() => console.log('Сработал самопинг. Веб-сервер активен.'))
            .catch((err) => console.log('Ошибка самопинга:', err.message));
    }, 5 * 60 * 1000); // Пинг каждые 5 минут
}
