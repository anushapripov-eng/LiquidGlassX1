import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

export async function GET() {
  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram config missing" }, { status: 500 });
  }

  try {
    const bot = new TelegramBot(token);
    await bot.sendMessage(chatId, "✅ Telegram works. Assistant online.");
    return NextResponse.json({ success: true, message: "Telegram works. Assistant online." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
