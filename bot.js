const { Telegraf, Scenes, session } = require('telegraf');
const { WizardScene, Stage } = Scenes;

const bot = new Telegraf(process.env.BOT_TOKEN);
const MANAGER_ID = 762476604;
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwKD31qjHxBz_JNXT45QX26iIbyMMXbcsn9FQoDPN4TatNXbYygalSN-jpsBI7BcURF/exec';

const sessions = {};
const userLang = {};
const userChoices = {};

const texts = {
  ru: {
    welcome: "Добро пожаловать в MyFirm Global 👋\n\nМы помогаем предпринимателям открывать компании, счета и лицензии в 50+ странах — быстро, без лишней бюрократии и с гарантией результата.\n\n🔹 Более 500 успешных кейсов\n🔹 Средний срок регистрации — 5 дней\n🔹 Персональный специалист на каждом этапе",
    start_btn: "🚀 Получить консультацию",
    privacy: "Прежде чем начать — нам важно ваше согласие на обработку персональных данных.\n\n📄 Политика конфиденциальности: https://myfirmglobal.com/privacypolicy\n\n Мы никогда не передаём данные третьим лицам.",
    agree: "✅ Согласен, продолжить",
    disagree: "❌ Не согласен",
    choose_service: "Отлично! Что сейчас актуально для вашего бизнеса? 👇\n\n Выберите основное направление — специалист подготовится заранее к звонку",
    services: [
      ["🏢 Регистрация компании", "reg"],
      ["🏦 Открытие банковского счёта", "bank"],
      ["📋 Получение лицензии", "license"],
      ["📝 Договоры и документы", "contract"],
      ["🔄 Комплексное сопровождение", "multi"],
      ["❓ Другой вопрос", "other"]
    ],
    choose_country: "В какой юрисдикции планируете работать?\n\n Если рассматриваете несколько — выберите приоритетную 👇",
    countries: [
      ["🇦🇪 ОАЭ — от 3 дней", "UAE"],
      ["🇬🇧 Великобритания — от 1 дня", "UK"],
      ["🇺🇸 США — от 5 дней", "USA"],
      ["🇸🇬 Сингапур — от 7 дней", "SG"],
      ["🇭🇰 Гонконг — от 5 дней", "HK"],
      ["🌍 Другая страна", "other_country"]
    ],
    details: "Чтобы специалист сразу дал точный ответ — расскажите в двух словах о вашей ситуации.\n\n Например: «Открываю IT-компанию, нужен счёт для приёма международных платежей, структура »",
    skip: "⏩ Пропустить",
    write: "✍️ Напишу",
    contact: "Почти готово! 🎯\n\nКак вам удобнее получить консультацию специалиста?",
    contacts: [
      ["📱 WhatsApp", "whatsapp"],
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ Заявка принята!\n\nВаш персональный специалист MyFirm Global уже получил все детали и свяжется с вами в течение 10 минут.\n\n⚡ Мы ценим ваше время — никаких долгих ожиданий.",
    manager_reply: "💬 Сообщение от вашего специалиста MyFirm Global:"
  },
  en: {
    welcome: "Welcome to MyFirm Global 👋\n\nWe help entrepreneurs register companies, open accounts and obtain licenses in 50+ countries — fast, hassle-free and with guaranteed results.\n\n🔹 500+ successful cases\n🔹 Average registration time — 5 days\n🔹 Personal expert at every step",
    start_btn: "🚀 Get a free consultation",
    privacy: "Before we start — we need your consent to process personal data.\n\n📄 Privacy policy: https://myfirmglobal.com/privacypolicy\n\n We never share your data with third parties.",
    agree: "✅ I agree, let's continue",
    disagree: "❌ I disagree",
    choose_service: "Great! What's most relevant for your business right now? 👇\n\n Choose the main area — your specialist will prepare in advance",
    services: [
      ["🏢 Company Registration", "reg"],
      ["🏦 Bank Account Opening", "bank"],
      ["📋 License Obtainment", "license"],
      ["📝 Contracts & Documents", "contract"],
      ["🔄 Full Business Support", "multi"],
      ["❓ Other Question", "other"]
    ],
    choose_country: "Which jurisdiction are you planning to operate in?\n\n If you're considering several — pick the priority one👇",
    countries: [
      ["🇦🇪 UAE — from 3 days", "UAE"],
      ["🇬🇧 UK — from 1 day", "UK"],
      ["🇺🇸 USA — from 5 days", "USA"],
      ["🇸🇬 Singapore — from 7 days", "SG"],
      ["🇭🇰 Hong Kong — from 5 days", "HK"],
      ["🌍 Other country", "other_country"]
    ],
    details: "To give you the most accurate answer right away — briefly describe your situation.\n\n For example: 'Setting up an IT company, need an account for international payments'",
    skip: "⏩ Skip",
    write: "✍️ I'll describe",
    contact: "Almost there! 🎯\n\nHow would you prefer to receive your consultation?",
    contacts: [,
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ Request received!\n\nYour personal MyFirm Global specialist has all the details and will contact you within 15 minutes.\n\n⚡ We value your time — no long waits.",
    manager_reply: "💬 Message from your MyFirm Global specialist:"
  }
};

async function saveToSheets(data) {
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Sheets error:', e);
  }
}

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
    userChoices[ctx.from.id] = { lang };
    const t = texts[lang];
    ctx.reply(t.welcome);
    ctx.reply("👇", {
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
    if (ctx.callbackQuery?.data) userChoices[ctx.from.id].consent = ctx.callbackQuery.data;
    ctx.reply(t.choose_service, {
      reply_markup: { inline_keyboard: t.services.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 4. Юрисдикция
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    if (ctx.callbackQuery?.data) userChoices[ctx.from.id].service = ctx.callbackQuery.data;
    ctx.reply(t.choose_country, {
      reply_markup: { inline_keyboard: t.countries.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 5. Детали
  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    if (ctx.callbackQuery?.data) userChoices[ctx.from.id].country = ctx.callbackQuery.data;
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
    if (ctx.callbackQuery?.data === 'skip') {
      userChoices[ctx.from.id].details = '—';
    } else if (ctx.message?.text) {
      userChoices[ctx.from.id].details = ctx.message.text;
    }
    ctx.reply(t.contact, {
      reply_markup: { inline_keyboard: t.contacts.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  // 7. Финал
  async (ctx) => {
    const lang = userLang[ctx.from.id] || 'ru';
    const t = texts[lang];
    const c = userChoices[ctx.from.id] || {};
    const clientId = ctx.from.id;
    const clientName = ctx.from.first_name || 'Клиент';
    const username = ctx.from.username ? `@${ctx.from.username}` : '—';

    if (ctx.callbackQuery?.data) c.contact = ctx.callbackQuery.data;

    sessions[clientId] = MANAGER_ID;

    await ctx.reply(t.final);

    // Сохраняем в Google Sheets
    await saveToSheets({
      date: new Date().toLocaleString('ru-RU'),
      name: clientName,
      username: username,
      telegram_id: clientId,
      lang: lang === 'ru' ? 'Русский' : 'English',
      service: c.service || '—',
      country: c.country || '—',
      contact: c.contact || '—',
      details: c.details || '—'
    });

    // Уведомление менеджеру
    await bot.telegram.sendMessage(MANAGER_ID,
      `🆕 Новая заявка!\n\n` +
      `👤 Клиент: ${clientName} (${username})\n` +
      `🆔 ID: ${clientId}\n` +
      `🌍 Язык: ${lang === 'ru' ? 'Русский' : 'English'}\n` +
      `📋 Услуга: ${c.service || '—'}\n` +
      `🌏 Страна: ${c.country || '—'}\n` +
      `📝 Детали: ${c.details || '—'}\n` +
      `📱 Контакт: ${c.contact || '—'}\n\n` +
      `💬 Нажмите кнопку чтобы ответить клиенту`,
      { reply_markup: { inline_keyboard: [[
        { text: "💬 Ответить клиенту", callback_data: `reply_to_${clientId}` }
      ]] }}
    );

    return ctx.scene.leave();
  }
);

const stage = new Stage([wizard]);
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => ctx.scene.enter('myfirm-wizard'));

// Менеджер нажимает "Ответить клиенту"
bot.action(/reply_to_(.+)/, async (ctx) => {
  const clientId = ctx.match[1];
  sessions[`waiting_reply_${MANAGER_ID}`] = clientId;
  await ctx.answerCbQuery();
  await ctx.reply(`✏️ Напишите сообщение для клиента:`);
});

// Обработка сообщений
bot.on('message', async (ctx) => {
  const fromId = ctx.from.id;

  if (fromId === MANAGER_ID) {
    const clientId = sessions[`waiting_reply_${MANAGER_ID}`];
    if (clientId && ctx.message.text) {
      const lang = userLang[clientId] || 'ru';
      const t = texts[lang];
      await bot.telegram.sendMessage(clientId, `${t.manager_reply}\n\n${ctx.message.text}`);
      await ctx.reply(`✅ Сообщение доставлено клиенту`);
      delete sessions[`waiting_reply_${MANAGER_ID}`];
      return;
    }
  }

  if (sessions[fromId] === MANAGER_ID) {
    await bot.telegram.sendMessage(MANAGER_ID,
      `💬 Сообщение от клиента ${ctx.from.first_name} (ID: ${fromId}):\n\n${ctx.message.text}`,
      { reply_markup: { inline_keyboard: [[
        { text: "💬 Ответить", callback_data: `reply_to_${fromId}` }
      ]] }}
    );
  }
});

bot.launch();
console.log("MyFirm Global Bot запущен!");
