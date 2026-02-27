import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

/* ─────────────── ТИПЫ ─────────────── */
type Page = "profile" | "messages" | "friends" | "notifications" | "settings";
type CallState = { type: "video" | "voice"; name: string } | null;

/* ─────────────── МОКДАННЫЕ ─────────────── */
const ME = {
  name: "Алексей Смирнов",
  username: "@alexey_ok",
  city: "Москва",
  bio: "Люблю путешествия и хороший кофе ☕",
  friends: 248,
  photos: 134,
  subscribers: 1024,
};

const MESSAGES = [
  { id: 1, name: "Мария Иванова",    last: "Привет! Как дела?",          time: "12:34", unread: 3, online: true  },
  { id: 2, name: "Дмитрий Козлов",  last: "Увидимся завтра?",            time: "11:20", unread: 0, online: false },
  { id: 3, name: "Анна Петрова",    last: "Отличная фотография! 😍",     time: "вчера", unread: 1, online: true  },
  { id: 4, name: "Игорь Новиков",   last: "Спасибо за помощь 🙏",        time: "вчера", unread: 0, online: false },
  { id: 5, name: "Юля Белова",      last: "Когда встречаемся?",          time: "пн",    unread: 0, online: true  },
  { id: 6, name: "Сергей Попов",    last: "Посмотри этот мем 😂",        time: "вс",    unread: 2, online: false },
];

const CHAT_DEMO = [
  { id: 1, from: "them", text: "Привет! Как дела? 😊",               time: "12:30" },
  { id: 2, from: "me",   text: "Всё отлично! Занимаюсь проектом",    time: "12:31" },
  { id: 3, from: "them", text: "Здорово! Расскажи подробнее",        time: "12:32" },
  { id: 4, from: "me",   text: "Делаю своё приложение, как в ОК 😄", time: "12:33" },
  { id: 5, from: "them", text: "Привет! Как дела?",                  time: "12:34" },
];

const FRIENDS = [
  { id: 1, name: "Мария Иванова",   city: "СПб",           mutual: 12, online: true  },
  { id: 2, name: "Дмитрий Козлов", city: "Москва",         mutual: 8,  online: false },
  { id: 3, name: "Анна Петрова",   city: "Казань",         mutual: 5,  online: true  },
  { id: 4, name: "Игорь Новиков",  city: "Екатеринбург",   mutual: 3,  online: false },
  { id: 5, name: "Юля Белова",     city: "Новосибирск",    mutual: 15, online: true  },
  { id: 6, name: "Роман Сидоров",  city: "Москва",         mutual: 7,  online: false },
];

const NOTIFICATIONS = [
  { id: 1, type: "like",    user: "Мария Иванова",  text: "оценила вашу фотографию",       time: "5 мин",  read: false },
  { id: 2, type: "friend",  user: "Дмитрий Козлов", text: "отправил заявку в друзья",      time: "1 час",  read: false },
  { id: 3, type: "comment", user: "Анна Петрова",   text: "прокомментировала вашу запись", time: "2 часа", read: true  },
  { id: 4, type: "like",    user: "Игорь Новиков",  text: "оценил вашу запись",            time: "вчера",  read: true  },
  { id: 5, type: "birthday",user: "Юля Белова",     text: "сегодня день рождения! 🎂",     time: "сегодня",read: false },
];

const POSTS = [
  { id: 1, text: "Провёл выходные на природе — лучшее лекарство от городской суеты 🌲", likes: 42, comments: 8,  time: "2 часа назад" },
  { id: 2, text: "Новый проект идёт хорошо. Скоро покажу результат 🚀",                 likes: 87, comments: 15, time: "вчера"       },
  { id: 3, text: "Кто бывал в Карелии этим летом? Ищу компанию для поездки!",           likes: 31, comments: 24, time: "3 дня назад" },
];

const NAV: { id: Page; icon: string; label: string; badge?: number }[] = [
  { id: "profile",       icon: "User",          label: "Профиль"      },
  { id: "messages",      icon: "MessageCircle", label: "Сообщения",   badge: 6  },
  { id: "friends",       icon: "Users",         label: "Друзья",      badge: 1  },
  { id: "notifications", icon: "Bell",          label: "Уведомления", badge: 3  },
  { id: "settings",      icon: "Settings",      label: "Настройки"    },
];

/* ─────────────── УТИЛИТЫ ─────────────── */
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

const GRAD = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600",
  "from-orange-400 to-red-500",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-sky-600",
];

function grad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRAD[Math.abs(h) % GRAD.length];
}

/* ─────────────── КОМПОНЕНТЫ ─────────────── */
function Ava({ name, size = "md", border = false }: { name: string; size?: "xs"|"sm"|"md"|"lg"|"xl"; border?: boolean }) {
  const sz: Record<string, string> = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  return (
    <div className={`${sz[size]} rounded-full bg-gradient-to-br ${grad(name)} flex items-center justify-center font-bold text-white flex-shrink-0 ${border ? "ring-2 ring-background" : ""}`}>
      {initials(name)}
    </div>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  if (!online) return null;
  return <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--card))]" />;
}

/* ─────────────── ЭКРАН ВХОДА ─────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Лого */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-500/30">
            <Icon name="Users" size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">МоёОбщество</h1>
          <p className="text-muted-foreground text-sm mt-2">Общайтесь, звоните, дружите</p>
        </div>

        {/* Кнопка ОК */}
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 hover:opacity-90 shadow-lg"
          style={{ background: "linear-gradient(135deg, #ff8c00, #e65c00)" }}
        >
          <span className="text-xl font-black">ОК</span>
          <span>Войти через Одноклассники</span>
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">или</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Форма */}
        <div className="space-y-3 mb-4">
          <Input placeholder="Email или телефон" className="bg-[hsl(var(--card))] border-border h-12 rounded-xl" />
          <Input placeholder="Пароль" type="password" className="bg-[hsl(var(--card))] border-border h-12 rounded-xl" />
        </div>
        <button
          onClick={onLogin}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all active:scale-95"
        >
          Войти
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Нет аккаунта?{" "}
          <button className="text-primary font-semibold hover:underline">Зарегистрироваться</button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────── ПРОФИЛЬ ─────────────── */
function ProfilePage() {
  const [liked, setLiked] = useState<number[]>([]);

  return (
    <div className="animate-fade-in">
      {/* Обложка */}
      <div className="relative mb-12">
        <div className="h-36 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="absolute -bottom-8 left-5 animate-pulse-ring">
          <Ava name={ME.name} size="xl" border />
        </div>
        <button className="absolute bottom-3 right-4 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 backdrop-blur rounded-lg border border-white/25 hover:bg-white/25 transition-colors">
          Редактировать
        </button>
      </div>

      <div className="px-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{ME.name}</h1>
            <p className="text-sm text-muted-foreground">{ME.username}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Icon name="MapPin" size={12} />{ME.city}
          </span>
        </div>
        <p className="text-sm text-foreground/80 mb-5">{ME.bio}</p>

        {/* Статы */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[["Друзья", ME.friends], ["Фото", ME.photos], ["Подписчики", ME.subscribers]].map(([l, v]) => (
            <div key={l} className="bg-[hsl(var(--card))] rounded-xl p-3 text-center cursor-pointer hover:bg-[hsl(var(--card))]/80 transition-colors">
              <p className="text-lg font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Icon name="Edit3" size={15} /> Редактировать
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[hsl(var(--card))] text-foreground text-sm font-semibold hover:bg-[hsl(var(--card))]/70 transition-colors">
            <Icon name="Share2" size={15} /> Поделиться
          </button>
        </div>

        {/* Посты */}
        <div className="space-y-3">
          {POSTS.map(post => (
            <div key={post.id} className="bg-[hsl(var(--card))] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Ava name={ME.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{ME.name}</p>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mb-3 leading-relaxed">{post.text}</p>
              <div className="flex gap-5 border-t border-border pt-3">
                <button
                  onClick={() => setLiked(p => p.includes(post.id) ? p.filter(x => x !== post.id) : [...p, post.id])}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${liked.includes(post.id) ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}
                >
                  <Icon name="Heart" size={16} />
                  <span>{post.likes + (liked.includes(post.id) ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="MessageCircle" size={16} /><span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                  <Icon name="Share2" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── СООБЩЕНИЯ ─────────────── */
function MessagesPage({ onCall }: { onCall: (t: "video"|"voice", name: string) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [text, setText] = useState("");
  const chat = MESSAGES.find(m => m.id === open);

  if (open && chat) {
    return (
      <div className="flex flex-col animate-fade-in" style={{ height: "calc(100dvh - 130px)" }}>
        <div className="flex items-center gap-3 pb-3 border-b border-border mb-3">
          <button onClick={() => setOpen(null)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="relative">
            <Ava name={chat.name} size="sm" />
            <OnlineDot online={chat.online} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{chat.name}</p>
            <p className={`text-xs ${chat.online ? "text-emerald-400" : "text-muted-foreground"}`}>
              {chat.online ? "онлайн" : "был(а) недавно"}
            </p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onCall("voice", chat.name)} className="w-9 h-9 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Phone" size={16} />
            </button>
            <button onClick={() => onCall("video", chat.name)} className="w-9 h-9 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Video" size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pb-2">
          {CHAT_DEMO.map(m => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              {m.from !== "me" && <Ava name={chat.name} size="xs" />}
              <div className={`max-w-[78%] ml-2 px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-[hsl(var(--card))] text-foreground rounded-bl-sm"}`}>
                {m.text}
                <p className={`text-[10px] mt-0.5 ${m.from === "me" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
            <Icon name="Smile" size={20} />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
            <Icon name="Paperclip" size={20} />
          </button>
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-[hsl(var(--card))] border-transparent h-10 rounded-xl"
          />
          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity">
            <Icon name="Send" size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="relative mb-4">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Поиск диалогов..." className="pl-9 bg-[hsl(var(--card))] border-transparent h-10 rounded-xl" />
      </div>
      <div className="space-y-0.5">
        {MESSAGES.map(msg => (
          <button key={msg.id} onClick={() => setOpen(msg.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--card))] transition-colors text-left">
            <div className="relative flex-shrink-0">
              <Ava name={msg.name} size="md" />
              <OnlineDot online={msg.online} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-semibold truncate">{msg.name}</p>
                <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{msg.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{msg.last}</p>
            </div>
            {msg.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">{msg.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── ДРУЗЬЯ ─────────────── */
function FriendsPage({ onCall }: { onCall: (t: "video"|"voice", name: string) => void }) {
  const [tab, setTab] = useState<"all"|"online"|"requests">("all");
  const list = tab === "online" ? FRIENDS.filter(f => f.online) : FRIENDS;

  return (
    <div className="animate-fade-in">
      <div className="flex gap-1 mb-5 bg-[hsl(var(--card))] rounded-xl p-1">
        {(["all","online","requests"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? "Все" : t === "online" ? "Онлайн" : <span className="flex items-center justify-center gap-1">Заявки <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">1</span></span>}
          </button>
        ))}
      </div>

      {tab === "requests" ? (
        <div className="bg-[hsl(var(--card))] rounded-2xl p-4 flex items-center gap-3">
          <Ava name="Роман Сидоров" size="md" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Роман Сидоров</p>
            <p className="text-xs text-muted-foreground">7 общих друзей · Москва</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">Принять</button>
            <button className="px-3 py-1.5 rounded-lg bg-[hsl(var(--background))] text-muted-foreground text-xs font-semibold hover:text-foreground">Отклонить</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(f => (
            <div key={f.id} className="bg-[hsl(var(--card))] rounded-2xl p-3.5 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Ava name={f.name} size="md" />
                <OnlineDot online={f.online} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.city} · {f.mutual} общих</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onCall("voice", f.name)} title="Позвонить"
                  className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-emerald-400 transition-colors">
                  <Icon name="Phone" size={15} />
                </button>
                <button onClick={() => onCall("video", f.name)} title="Видеозвонок"
                  className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-blue-400 transition-colors">
                  <Icon name="Video" size={15} />
                </button>
                <button className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="MessageCircle" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── УВЕДОМЛЕНИЯ ─────────────── */
const N_ICON: Record<string, string> = { like: "Heart", friend: "UserPlus", comment: "MessageCircle", birthday: "Gift" };
const N_COLOR: Record<string, string> = { like: "text-red-400 bg-red-400/10", friend: "text-blue-400 bg-blue-400/10", comment: "text-emerald-400 bg-emerald-400/10", birthday: "text-yellow-400 bg-yellow-400/10" };

function NotificationsPage() {
  return (
    <div className="animate-fade-in space-y-2">
      {NOTIFICATIONS.map(n => (
        <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${n.read ? "bg-[hsl(var(--card))] border-transparent" : "bg-[hsl(var(--card))] border-primary/20"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${N_COLOR[n.type]}`}>
            <Icon name={N_ICON[n.type]} size={18} fallback="Bell" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-semibold">{n.user}</span>{" "}
              <span className="text-muted-foreground">{n.text}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
          </div>
          {!n.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
        </div>
      ))}
    </div>
  );
}

/* ─────────────── НАСТРОЙКИ ─────────────── */
function SettingsPage({ onLogout }: { onLogout: () => void }) {
  const [notif, setNotif] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [priv, setPriv] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const sections = [
    { title: "Аккаунт", items: [
      { icon: "User", label: "Редактировать профиль", arrow: true },
      { icon: "Lock", label: "Безопасность", arrow: true },
      { icon: "Phone", label: "Номер телефона", val: "+7 999 *** **01", arrow: true },
      { icon: "Mail", label: "Email", val: "alex@mail.ru", arrow: true },
    ]},
    { title: "Внешний вид", items: [
      { icon: "Moon", label: "Тёмная тема", toggle: true, val: darkMode, set: setDarkMode },
    ]},
    { title: "Уведомления", items: [
      { icon: "Bell",    label: "Push-уведомления", toggle: true, val: notif,  set: setNotif  },
      { icon: "Volume2", label: "Звуки",            toggle: true, val: sounds, set: setSounds },
    ]},
    { title: "Конфиденциальность", items: [
      { icon: "Eye",   label: "Закрытый профиль",     toggle: true, val: priv, set: setPriv },
      { icon: "Users", label: "Кто может писать мне", val: "Все", arrow: true },
    ]},
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="bg-[hsl(var(--card))] rounded-2xl p-4 flex items-center gap-4">
        <Ava name={ME.name} size="lg" />
        <div className="flex-1">
          <p className="font-bold">{ME.name}</p>
          <p className="text-sm text-muted-foreground">{ME.username}</p>
          <button className="text-xs text-primary mt-0.5 hover:underline">Изменить фото</button>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 font-semibold">
          <span className="font-black">ОК</span> Привязан
        </div>
      </div>

      {sections.map(s => (
        <div key={s.title}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">{s.title}</p>
          <div className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden divide-y divide-border">
            {s.items.map(item => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(var(--background))]/40 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--background))] flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name={item.icon} size={16} fallback="Settings" />
                </div>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.toggle !== undefined ? (
                  <button onClick={() => item.set?.(!item.val)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${item.val ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.val ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    {item.val && <span className="text-xs text-muted-foreground">{item.val}</span>}
                    {item.arrow && <Icon name="ChevronRight" size={15} className="text-muted-foreground" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onLogout} className="w-full py-3 rounded-2xl text-red-400 text-sm font-semibold border border-red-400/25 hover:bg-red-400/8 transition-colors">
        Выйти из аккаунта
      </button>
    </div>
  );
}

/* ─────────────── ЭКРАН ЗВОНКА ─────────────── */
function CallOverlay({ call, onEnd }: { call: NonNullable<CallState>; onEnd: () => void }) {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [secs, setSecs] = useState(0);

  // Таймер
  useState(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  });

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(160deg, #0f0f1a 0%, #12182b 50%, #0a1020 100%)" }}>
      {/* Фон */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 80%, #6366f1 0%, transparent 50%)" }} />

      <div className="relative flex-1 flex flex-col items-center justify-between py-16 px-6">
        {/* Верх */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-5">
            {call.type === "video" ? "Видеозвонок" : "Голосовой звонок"}
          </p>
          <div className="animate-pulse-ring inline-block rounded-full mb-4">
            <Ava name={call.name} size="xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">{call.name}</h2>
          <p className="text-white/50 text-sm mt-2 font-mono tracking-widest">
            {secs > 0 ? fmt(secs) : "Соединение..."}
          </p>
        </div>

        {/* Видео-превью */}
        {call.type === "video" && (
          <div className="w-full max-w-sm h-44 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur">
            {camOff ? (
              <div className="text-white/40 flex flex-col items-center gap-2">
                <Icon name="VideoOff" size={36} />
                <p className="text-sm">Камера выключена</p>
              </div>
            ) : (
              <div className="text-white/40 flex flex-col items-center gap-2">
                <Icon name="Video" size={36} className="text-blue-400" />
                <p className="text-sm">Ваша камера</p>
              </div>
            )}
            <div className="absolute top-3 right-3 w-16 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Ava name={call.name} size="sm" />
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-5 items-center">
          <button onClick={() => setMuted(!muted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${muted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
            <Icon name={muted ? "MicOff" : "Mic"} size={22} fallback="Mic" />
          </button>

          <button onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-xl shadow-red-500/40 active:scale-95">
            <Icon name="PhoneOff" size={26} className="text-white" />
          </button>

          {call.type === "video" ? (
            <button onClick={() => setCamOff(!camOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${camOff ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
              <Icon name={camOff ? "VideoOff" : "Video"} size={22} fallback="Video" />
            </button>
          ) : (
            <button onClick={() => setSpeaker(!speaker)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${!speaker ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
              <Icon name={speaker ? "Volume2" : "VolumeX"} size={22} fallback="Volume2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── ГЛАВНОЕ ПРИЛОЖЕНИЕ ─────────────── */
export default function Index() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>("profile");
  const [call, setCall] = useState<CallState>(null);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const handleCall = (type: "video" | "voice", name: string) => setCall({ type, name });
  const totalBadge = NAV.reduce((s, n) => s + (n.badge || 0), 0);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground flex">
      {call && <CallOverlay call={call} onEnd={() => setCall(null)} />}

      {/* ───── САЙДБАР (только десктоп) ───── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[hsl(var(--card))] border-r border-border py-6 px-3 flex-shrink-0 fixed top-0 left-0 h-full">
        {/* Лого */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Icon name="Users" size={18} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">МоёОбщество</span>
        </div>

        {/* Профиль пользователя */}
        <div className="flex items-center gap-3 px-3 mb-6 pb-6 border-b border-border">
          <Ava name={ME.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{ME.name}</p>
            <p className="text-xs text-muted-foreground truncate">{ME.username}</p>
          </div>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--background))]/60"}`}>
              <Icon name={item.icon} size={18} fallback="Circle" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && page !== item.id && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={() => setLoggedIn(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/8 transition-all text-sm">
          <Icon name="LogOut" size={18} /> Выйти
        </button>
      </aside>

      {/* ───── КОНТЕНТ ───── */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-6">
        {/* Шапка */}
        <header className="sticky top-0 z-30 bg-[hsl(var(--background))]/90 backdrop-blur border-b border-border px-4 lg:px-8 py-3.5 flex items-center gap-3">
          <h1 className="text-lg font-bold flex-1">{NAV.find(n => n.id === page)?.label}</h1>
          <div className="relative">
            <button className="w-9 h-9 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="Bell" size={17} />
            </button>
            {totalBadge > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{totalBadge}</span>}
          </div>
          <div className="relative hidden sm:block">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск..." className="pl-8 h-9 w-48 bg-[hsl(var(--card))] border-transparent rounded-xl text-sm" />
          </div>
        </header>

        <div className="px-4 lg:px-8 py-5 max-w-2xl mx-auto">
          {page === "profile"       && <ProfilePage />}
          {page === "messages"      && <MessagesPage onCall={handleCall} />}
          {page === "friends"       && <FriendsPage onCall={handleCall} />}
          {page === "notifications" && <NotificationsPage />}
          {page === "settings"      && <SettingsPage onLogout={() => setLoggedIn(false)} />}
        </div>
      </main>

      {/* ───── НИЖНЯЯ НАВИГАЦИЯ (только мобайл) ───── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--card))]/95 backdrop-blur border-t border-border flex items-center justify-around px-1 py-1.5">
        {NAV.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px] ${page === item.id ? "text-primary" : "text-muted-foreground"}`}>
            {page === item.id && <span className="absolute inset-0 bg-primary/10 rounded-xl" />}
            <div className="relative">
              <Icon name={item.icon} size={21} fallback="Circle" />
              {item.badge && page !== item.id && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">{item.badge}</span>
              )}
            </div>
            <span className="text-[10px] font-medium relative">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
