import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const DB_FILE = ".telegram_db.json";

export async function POST(request: Request) {
  if (!token || !chatId) return NextResponse.json({ error: "Config missing" }, { status: 500 });

  try {
    const { tradesCount, pnlPercent, symbol, status } = await request.json();
    const today = new Date().toISOString().split("T")[0];
    
    let db: any = {};
    if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));

    const bot = new TelegramBot(token);
    
    const statusEmoji = status === "profit" ? "✅" : status === "loss" ? "❌" : "⏭️";
    const msg = `✅ Anush recorded a trade!\n\n${statusEmoji} Status: ${status.toUpperCase()}\n📊 Symbol: ${symbol}\n📈 PnL: ${pnlPercent}%\n🔢 Trades: ${tradesCount}\n\nKeep going! 💪`;
    
    await bot.sendMessage(chatId, msg);
    
    db[`sent_evening_${today}`] = true;
    fs.writeFileSync(DB_FILE, JSON.stringify(db));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
