const { Telegraf, Scenes, session } = require('telegraf');
const { WizardScene, Stage } = Scenes;

const bot = new Telegraf(process.env.BOT_TOKEN);

// Тексты на двух языках
const texts = {
  ru: {
    welcome: "Добро пожаловать в MyFirm Global! 🚀 Мы помогаем регистрировать компании, открывать счета и получать лицензии по всему миру.",
    start_btn: "🚀 Да, начнём",
    privacy: "Прежде чем продолжить, нам нужно ваше согласие на обработку персональных данных. 📄 myfirm.global/privacy",
    agree: "✅ Согласен",
    disagree: "❌ Не согласен",
    choose_service: "Что вас интересует?",
    services: [
      ["🏢 Регистрация", "reg"],
      ["🏦 Банковский счёт", "bank"],
      ["📋 Лицензия", "license"],
      ["📝 Договоры", "contract"],
      ["🔄 Несколько услуг", "multi"],
      ["❓ Другое", "other"]
    ],
    choose_country: "Какая страна / юрисдикция интересует?",
    countries: [
      ["🇦🇪 ОАЭ", "UAE"],
      ["🇬🇧 UK", "UK"],
      ["🇺🇸 США", "USA"],
      ["🇸🇬 Сингапур", "SG"],
      ["🇭🇰 Гонконг", "HK"],
      ["🌍 Другая", "other_country"]
    ],
    details: "Расскажите кратко о вашем кейсе. Можно пропустить.",
    skip: "⏩ Пропустить",
    write: "✍️ Напишу сейчас",
    contact: "Как удобнее общаться со специалистом?",
    contacts: [
      ["📱 WhatsApp", "whatsapp"],
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ Всё зафиксировал. ⚡ Подключаю персонального специалиста MyFirm Global. Ожидайте — он свяжется с вами в течение нескольких минут 🚀"
  },
  en: {
    welcome: "Welcome to MyFirm Global! 🚀 We help register companies, open accounts and obtain licenses worldwide.",
    start_btn: "🚀 Yes, let's start",
    privacy: "Before we continue, we need your consent to process personal data. 📄 myfirm.global/privacy",
    agree: "✅ I agree",
    disagree: "❌ I disagree",
    choose_service: "What are you interested in?",
    services: [
      ["🏢 Company Registration", "reg"],
      ["🏦 Bank Account", "bank"],
      ["📋 License", "license"],
      ["📝 Contracts", "contract"],
      ["🔄 Multiple Services", "multi"],
      ["❓ Other", "other"]
    ],
    choose_country: "Which country / jurisdiction are you interested in?",
    countries: [
      ["🇦🇪 UAE", "UAE"],
      ["🇬🇧 UK", "UK"],
      ["🇺🇸 USA", "USA"],
      ["🇸🇬 Singapore", "SG"],
      ["🇭🇰 Hong Kong", "HK"],
      ["🌍 Other", "other_country"]
    ],
    details: "Tell us briefly about your case. You can skip this.",
    skip: "⏩ Skip",
    write: "✍️ I'll write now",
    contact: "How would you prefer to communicate with a specialist?",
    contacts: [
      ["📱 WhatsApp", "whatsapp"],
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ All noted. ⚡ Connecting your personal MyFirm Global specialist. Please wait — they will contact you within a few minutes 🚀"
  }
};

// Хранилище языка пользователя
const userLang = {};

const wizard = new WizardScene(
  'myfirm-wizard',

  // 0. Выбор языка
  (ctx) => {
    ctx.reply("🌍 Please choose your language / Выберите язык:", {
      reply_markup: { inline_keyboard: [[
        { text: "🇷🇺 Русский", callback_data: "lang_ru" },
        { text: "🇬🇧 English", callback_data: "lang_en" }
      ]] }
    });
    return ctx.wizard.next();
  },

  // 1. Приветствие
  (ctx) => {
    const lang = ctx.callbackQuery?.data === 'lang_en' ? 'en' : 'ru';
    userLang[ctx.from.id] = lang;
    const t = texts[lang];
    ctx.reply(t.welcome);
    ctx.reply("➡️", {
      reply_markup: { inline_keyboard: [[{ text: t.start_btn, callback_data: "start" }]] }
    });
    return ctx.wizard.next();
  },

  // 2. Согласие
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.privacy, {
      reply_markup: { inline_keyboard: [[
        { text: t.agree, callback_data: "agree" },
        { text: t.disagree, callback_data: "disagree" }
      ]] }
    });
    return ctx.wizard.next();
  },

  // 3. Услуга
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.choose_service, {
      reply_markup: { inline_keyboard: t.services.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 4. Юрисдикция
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.choose_country, {
      reply_markup: { inline_keyboard: t.countries.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 5. Детали
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.details, {
      reply_markup: { inline_keyboard: [[
        { text: t.skip, callback_data: "skip" },
        { text: t.write, callback_data: "write" }
      ]] }
    });
    return ctx.wizard.next();
  },

  // 6. Контакт
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.contact, {
      reply_markup: { inline_keyboard: t.contacts.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 7. Финал
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    ctx.reply(t.final);
    return ctx.scene.leave();
  }
);

const stage = new Stage([wizard]);
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => ctx.scene.enter('myfirm-wizard'));

bot.launch();
console.log("MyFirm Global Bot запущен!");
