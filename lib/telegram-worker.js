import TelegramBot from "node-telegram-bot-api";
import schedule from "node-schedule";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log("Worker initializing...");
console.log("Token present:", !!token);
console.log("Chat ID present:", !!chatId);

const DB_FILE = ".telegram_db.json";
let db = {};
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    db = {};
  }
}
const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db));

if (token && chatId) {
  const bot = new TelegramBot(token);
  console.log("Telegram bot worker started!");
  
  bot.sendMessage(chatId, "🚀 TradeJournal Assistant is now online and monitoring your trades!").catch(console.error);

  schedule.scheduleJob({ hour: 10, minute: 45, dayOfWeek: [1,2,3,4,5], tz: "Asia/Yerevan" }, () => {
    const today = new Date().toISOString().split("T")[0];
    if (db[`sent_morning_${today}`]) return;
    const msgs = ["Good morning, Anush! ☀️", "Rise and shine! ☕️", "Hello! ✨", "Morning! 🌟", "Hey! 👋"];
    bot.sendMessage(chatId, msgs[Math.floor(Math.random() * msgs.length)]);
    db[`sent_morning_${today}`] = true;
    saveDb();
  });

  schedule.scheduleJob({ hour: 22, minute: 15, tz: "Asia/Yerevan" }, () => {
    const today = new Date().toISOString().split("T")[0];
    if (db[`sent_evening_${today}`]) return;
    const msgs = ["Hey! Don't forget to fill your journal! 📝", "Time to review your trades! 🧐", "Journal check! ✅"];
    bot.sendMessage(chatId, msgs[Math.floor(Math.random() * msgs.length)]);
    db[`sent_evening_${today}`] = true;
    saveDb();
  });

  schedule.scheduleJob({ hour: 2, minute: 0, dayOfWeek: 6, tz: "Asia/Yerevan" }, () => {
    const weekId = new Date().toISOString().split("T")[0];
    if (db[`sent_weekly_${weekId}`]) return;
    bot.sendMessage(chatId, "📊 Weekly summary time! Great work this week! 🗓️");
    db[`sent_weekly_${weekId}`] = true;
    saveDb();
  });
} else {
  console.error("Telegram token or chatId missing. Token length:", token ? token.length : 0, "ChatID:", chatId);
}
