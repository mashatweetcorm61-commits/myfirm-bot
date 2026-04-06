const axios = require('axios');
const { Telegraf, Scenes, session } = require('telegraf');
const { WizardScene, Stage } = Scenes;

const bot = new Telegraf(process.env.BOT_TOKEN);
const MANAGER_ID = 762476604;
const SHEET_URL = process.env.SHEET_URL;

const sessions = {};
const userLang = {};
const userChoices = {};

const texts = {
  ru: {
    welcome: "Добро пожаловать в MyFirm Global 👋\n\nМы помогаем предпринимателям открывать компании, счета и лицензии в 50+ странах — быстро, без лишней бюрократии и с гарантией результата.\n\n🔹 Более 500 успешных кейсов\n🔹 Средний срок регистрации — 5 дней\n🔹 Персональный специалист на каждом этапе",
    start_btn: "🚀 Получить консультацию",
    privacy: "Прежде чем начать — нам важно ваше согласие на обработку персональных данных.\n\n📄 Политика конфиденциальности: https://myfirmglobal.com/privacypolicy\n\nМы никогда не передаём данные третьим лицам.",
    agree: "✅ Согласен, продолжить",
    disagree: "❌ Не согласен",
    choose_service: "Отлично! Что сейчас актуально для вашего бизнеса? 👇\n\n Выберите основное направление — мы подберем профильного специалиста",
    services: [
      ["🏢 Регистрация компании", "reg"],
      ["🏦 Открытие банковского счёта", "bank"],
      ["📋 Получение лицензии", "license"],
      ["📝 Договоры и документы", "contract"],
      ["🔄 Комплексное сопровождение", "multi"],
      ["❓ Другой вопрос", "other"]
    ],
    choose_country: "В какой юрисдикции планируете работать?\n\n Если рассматриваете несколько — выберите приоритетную👇",
    countries: [
      ["🇦🇪 ОАЭ — от 3 дней", "UAE"],
      ["🇬🇧 Великобритания — от 1 дня", "UK"],
      ["🇺🇸 США — от 5 дней", "USA"],
      ["🇸🇬 Сингапур — от 7 дней", "SG"],
      ["🇭🇰 Гонконг — от 5 дней", "HK"],
      ["🌍 Другая страна", "other_country"]
    ],
    details: "Чтобы специалист смог подготовиться — расскажите подробнее о вашей ситуации.\n\n Например: «Открываю IT-компанию,сайт компании, нужен счёт для приёма международных платежей. География клиентов и структура будет следующая:»",
    skip: "⏩ Пропустить",
    write: "✍️ Напишу",
    contact: "Почти готово! 🎯\n\n Как вам удобнее получить консультацию специалиста?",
    contacts: [
      ["📱 По телефону", "По телефону"],
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ Заявка принята!\n\n Ваш персональный специалист MyFirm Global уже получил все детали и свяжется с вами в течение 15 минут.\n\n⚡ Мы ценим ваше время — никаких долгих ожиданий.",
    manager_reply: "💬 Сообщение от вашего специалиста MyFirm Global:",
    reminder1: "👋 Добрый день!\n\n Напоминаем — вы оставляли заявку в MyFirm Global. Если остались вопросы или хотите уточнить детали — наш специалист готов помочь прямо сейчас. 🚀",
    reminder2: "🌍 MyFirm Global напоминает:\n\n Регистрация компании за рубежом — это не сложно, если рядом есть команда экспертов. Мы готовы ответить на любые Ваши вопросы. Напишите нам! 💼",
    reminder3: "⚡ Последнее напоминание от MyFirm Global:\n\n Если вы ещё думаете над открытием компании или счёта — самое время начать. Специалист свяжется с вами в течение 10 минут и ответит на все ваши вопросы. 🎯"
  },
  en: {
    welcome: "Welcome to MyFirm Global 👋\n\n We help entrepreneurs register companies, open accounts and obtain licenses in 50+ countries — fast, hassle-free and with guaranteed results.\n\n🔹 500+ successful cases\n🔹 Average registration time — 5 days\n🔹 Personal expert at every step",
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
    details: "To give you the most accurate answer right away — briefly describe your situation.\n\n For example: 'Setting up an IT company, need an account for international payments, geography and company structure will be:...'",
    skip: "⏩ Skip",
    write: "✍️ I'll describe",
    contact: "Almost there! 🎯\n\n How would you prefer to receive your consultation?",
    contacts: [
      ["📱 WhatsApp", "whatsapp"],
      ["✈️ Telegram", "telegram"],
      ["📧 Email", "email"]
    ],
    final: "✅ Request received!\n\n Your personal MyFirm Global specialist has all the details and will contact you within 15 minutes.\n\n⚡ We value your time — no long waits.",
    manager_reply: "💬 Message from your MyFirm Global specialist:",
    reminder1: "👋 Hello!\n\n Just a reminder — you submitted a request to MyFirm Global. If you have any questions or need more details — our specialist is ready to help right now. 🚀",
    reminder2: "🌍 MyFirm Global reminder:\n\n Registering a company abroad is easy when you have the right expert. We're ready to answer any questions. Just reach out! 💼",
    reminder3: "⚡ Final reminder from MyFirm Global:\n\n If you're still considering opening a company or account — now is the perfect time. A specialist will contact you within 15 minutes. 🎯"
  }
};

async function saveToSheets(data) {
  try {
    const res = await axios.post(SHEET_URL, JSON.stringify(data), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      maxRedirects: 5
    });
    console.log('Sheets response:', res.status);
  } catch (e) {
    console.error('Sheets error:', e.message);
  }

  async function getAllUsers() {
  try {
    const res = await axios.post(SHEET_URL, JSON.stringify({ type: 'get_ids' }), {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      maxRedirects: 5
    });
    return res.data;
  } catch (e) {
    console.error('Get users error:', e.message);
    return [];
  }
}

// Напоминания после заявки
function scheduleReminders(clientId, lang) {
  const t = texts[lang || 'ru'];
  
  // Через 1 день
  setTimeout(async () => {
    try {
      await bot.telegram.sendMessage(clientId, t.reminder1, {
        reply_markup: { inline_keyboard: [[
          { text: "💬 Написать специалисту", callback_data: `reply_to_manager` }
        ]]}
      });
    } catch (e) {}
  }, 24 * 60 * 60 * 1000);

  // Через 3 дня
  setTimeout(async () => {
    try {
      await bot.telegram.sendMessage(clientId, t.reminder2, {
        reply_markup: { inline_keyboard: [[
          { text: "💬 Написать специалисту", callback_data: `reply_to_manager` }
        ]]}
      });
    } catch (e) {}
  }, 3 * 24 * 60 * 60 * 1000);

  // Через 7 дней
  setTimeout(async () => {
    try {
      await bot.telegram.sendMessage(clientId, t.reminder3, {
        reply_markup: { inline_keyboard: [[
          { text: "💬 Написать специалисту", callback_data: `reply_to_manager` }
        ]]}
      });
    } catch (e) {}
  }, 7 * 24 * 60 * 60 * 1000);
}

const wizard = new WizardScene(
  'myfirm-wizard',

  (ctx) => {
    ctx.reply("🌍 Please choose your language / Выберите язык:", {
      reply_markup: { inline_keyboard: [[
        { text: "🇷🇺 Русский", callback_data: "lang_ru" },
        { text: "🇬🇧 English", callback_data: "lang_en" }
      ]] }
    });
    return ctx.wizard.next();
  },

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

  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    if (ctx.callbackQuery?.data) userChoices[ctx.from.id].consent = ctx.callbackQuery.data;
    ctx.reply(t.choose_service, {
      reply_markup: { inline_keyboard: t.services.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

  (ctx) => {
    const t = texts[userLang[ctx.from.id] || 'ru'];
    if (ctx.callbackQuery?.data) userChoices[ctx.from.id].service = ctx.callbackQuery.data;
    ctx.reply(t.choose_country, {
      reply_markup: { inline_keyboard: t.countries.map(([text, data]) => [{ text, callback_data: data }]) }
    });
    return ctx.wizard.next();
  },

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

    await saveToSheets({
      type: 'lead',
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

    // Запускаем напоминания
    scheduleReminders(clientId, lang);

    return ctx.scene.leave();
  }
);

const stage = new Stage([wizard]);
bot.use(session());
bot.use(stage.middleware());
bot.start((ctx) => ctx.scene.enter('myfirm-wizard'));

// Клиент нажимает "Написать специалисту" из напоминания
bot.action('reply_to_manager', async (ctx) => {
  await ctx.answerCbQuery();
  sessions[ctx.from.id] = MANAGER_ID;
  await ctx.reply("✍️ Напишите ваш вопрос — специалист ответит в течение 15 минут:");
});

// Менеджер нажимает "Ответить клиенту"
bot.action(/reply_to_(.+)/, async (ctx) => {
  const clientId = ctx.match[1];
  sessions[`waiting_reply_${MANAGER_ID}`] = clientId;
  await ctx.answerCbQuery();
  await ctx.reply(`✏️ Напишите сообщение для клиента:`);
});

// Команда рассылки — только для менеджера
// Использование: /broadcast Текст сообщения
bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== MANAGER_ID) return;
  
  const text = ctx.message.text.replace('/broadcast ', '').trim();
  if (!text) {
    await ctx.reply('❌ Укажите текст: /broadcast Ваше сообщение');
    return;
  }

  await ctx.reply('📤 Начинаю рассылку...');
  const users = await getAllUsers();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await bot.telegram.sendMessage(user.id, text, {
        reply_markup: { inline_keyboard: [[
          { text: "💬 Написать специалисту", callback_data: "reply_to_manager" }
        ]]}
      });
      sent++;
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      failed++;
    }
  }

  await ctx.reply(`✅ Рассылка завершена!\n📨 Отправлено: ${sent}\n❌ Ошибок: ${failed}`);
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
