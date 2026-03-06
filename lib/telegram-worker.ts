import TelegramBot from "node-telegram-bot-api";
import schedule from "node-schedule";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Simple in-memory DB for flags (lost on restart, but per requirement we should store in DB)
// For now, since no DB is set up, we'll use a local file
import fs from "fs";
const DB_FILE = ".telegram_db.json";
let db: any = {};
if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db));

if (token && chatId) {
  const bot = new TelegramBot(token);
  
  // Morning reminders Mon-Fri 10:45
  schedule.scheduleJob({ hour: 10, minute: 45, dayOfWeek: [1,2,3,4,5], tz: "Asia/Yerevan" }, () => {
    const today = new Date().toISOString().split("T")[0];
    if (db[`sent_morning_${today}`]) return;

    const msgs = [
      "Good morning, Anush! ☀️ A new day for great trades! 📈",
      "Rise and shine! ☕️ The markets are waiting for you! 📊",
      "Hello! ✨ Ready to catch some pips today? 🎯",
      "Morning! 🌟 Wishing you a profitable session! 🚀",
      "Hey! 👋 Time to focus and execute the plan! 💎"
    ];
    bot.sendMessage(chatId, msgs[Math.floor(Math.random() * msgs.length)]);
    db[`sent_morning_${today}`] = true;
    saveDb();
  });

  // Evening reminders 22:15
  schedule.scheduleJob({ hour: 22, minute: 15, tz: "Asia/Yerevan" }, () => {
    const today = new Date().toISOString().split("T")[0];
    if (db[`sent_evening_${today}`]) return;

    // Logic for checking journal would go here if we had server-side access to store
    // For now, sending a general reminder
    const msgs = [
      "Hey! Don't forget to fill your journal for today! 📝",
      "Time to review your trades! 🧐 Did you log everything?",
      "Journal check! ✅ Make sure your data is up to date.",
      "Reviewing the day is key to growth! 📈 Fill your journal now.",
      "Don't let the day pass without recording your progress! ✨"
    ];
    bot.sendMessage(chatId, msgs[Math.floor(Math.random() * msgs.length)]);
    db[`sent_evening_${today}`] = true;
    saveDb();
  });

  // Weekly Saturday 02:00
  schedule.scheduleJob({ hour: 2, minute: 0, dayOfWeek: 6, tz: "Asia/Yerevan" }, () => {
    const weekId = new Date().toISOString().split("T")[0]; // simplified
    if (db[`sent_weekly_${weekId}`]) return;

    bot.sendMessage(chatId, "📊 Weekly summary time! Great work this week! 🗓️");
    db[`sent_weekly_${weekId}`] = true;
    saveDb();
  });
}
