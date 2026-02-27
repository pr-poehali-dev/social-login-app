import { useState, useRef, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

/* ─────────────── ТИПЫ ─────────────── */
type Page = "profile" | "messages" | "friends" | "notifications" | "settings";
type CallState = { type: "video" | "voice"; name: string } | null;

interface UserProfile {
  name: string;
  username: string;
  city: string;
  bio: string;
  avatar: string | null;
  cover: string | null;
  friends: number;
  photos: number;
  subscribers: number;
}

interface Post {
  id: number;
  text: string;
  image: string | null;
  likes: number;
  comments: { id: number; author: string; text: string; time: string }[];
  time: string;
}

interface ChatMessage {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
  image?: string | null;
}

/* ─────────────── НАЧАЛЬНЫЕ ДАННЫЕ ─────────────── */
const INIT_PROFILE: UserProfile = {
  name: "Алексей Смирнов",
  username: "@alexey_ok",
  city: "Москва",
  bio: "Люблю путешествия и хороший кофе ☕",
  avatar: null,
  cover: null,
  friends: 248,
  photos: 134,
  subscribers: 1024,
};

const INIT_POSTS: Post[] = [
  { id: 1, text: "Провёл выходные на природе — лучшее лекарство от городской суеты 🌲", image: null, likes: 42, comments: [{ id: 1, author: "Мария Иванова", text: "Класс! Где это?", time: "2 ч назад" }, { id: 2, author: "Дмитрий Козлов", text: "Отлично выглядит!", time: "1 ч назад" }], time: "2 часа назад" },
  { id: 2, text: "Новый проект идёт хорошо. Скоро покажу результат 🚀", image: null, likes: 87, comments: [{ id: 1, author: "Анна Петрова", text: "Ждём с нетерпением!", time: "вчера" }], time: "вчера" },
  { id: 3, text: "Кто бывал в Карелии этим летом? Ищу компанию для поездки!", image: null, likes: 31, comments: [], time: "3 дня назад" },
];

const MESSAGES_LIST = [
  { id: 1, name: "Мария Иванова",   last: "Привет! Как дела?",       time: "12:34", unread: 3, online: true  },
  { id: 2, name: "Дмитрий Козлов", last: "Увидимся завтра?",         time: "11:20", unread: 0, online: false },
  { id: 3, name: "Анна Петрова",   last: "Отличная фотография! 😍",  time: "вчера", unread: 1, online: true  },
  { id: 4, name: "Игорь Новиков",  last: "Спасибо за помощь 🙏",     time: "вчера", unread: 0, online: false },
  { id: 5, name: "Юля Белова",     last: "Когда встречаемся?",       time: "пн",    unread: 0, online: true  },
  { id: 6, name: "Сергей Попов",   last: "Посмотри этот мем 😂",     time: "вс",    unread: 2, online: false },
];

const INIT_CHATS: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, from: "them", text: "Привет! Как дела? 😊", time: "12:30" },
    { id: 2, from: "me",   text: "Всё отлично! Занимаюсь проектом", time: "12:31" },
    { id: 3, from: "them", text: "Здорово! Расскажи подробнее", time: "12:32" },
    { id: 4, from: "me",   text: "Делаю своё приложение 😄", time: "12:33" },
    { id: 5, from: "them", text: "Привет! Как дела?", time: "12:34" },
  ],
  2: [
    { id: 1, from: "them", text: "Привет, увидимся завтра?", time: "11:15" },
    { id: 2, from: "me",   text: "Да, конечно! Во сколько?", time: "11:18" },
    { id: 3, from: "them", text: "Увидимся завтра?", time: "11:20" },
  ],
  3: [
    { id: 1, from: "me",   text: "Привет!", time: "вчера" },
    { id: 2, from: "them", text: "Отличная фотография! 😍", time: "вчера" },
  ],
  4: [{ id: 1, from: "them", text: "Спасибо за помощь 🙏", time: "вчера" }],
  5: [{ id: 1, from: "them", text: "Когда встречаемся?", time: "пн" }],
  6: [{ id: 1, from: "them", text: "Посмотри этот мем 😂", time: "вс" }],
};

const FRIENDS_INIT = [
  { id: 1, name: "Мария Иванова",   city: "СПб",          mutual: 12, online: true  },
  { id: 2, name: "Дмитрий Козлов", city: "Москва",        mutual: 8,  online: false },
  { id: 3, name: "Анна Петрова",   city: "Казань",        mutual: 5,  online: true  },
  { id: 4, name: "Игорь Новиков",  city: "Екатеринбург",  mutual: 3,  online: false },
  { id: 5, name: "Юля Белова",     city: "Новосибирск",   mutual: 15, online: true  },
  { id: 6, name: "Роман Сидоров",  city: "Москва",        mutual: 7,  online: false },
];

const REQUESTS_INIT = [
  { id: 101, name: "Артём Волков",    city: "Краснодар",     mutual: 4,  online: true  },
  { id: 102, name: "Наташа Кузьмина", city: "Санкт-Петербург", mutual: 9, online: false },
  { id: 103, name: "Павел Орлов",     city: "Екатеринбург",  mutual: 2,  online: true  },
];

const NOTIFICATIONS_LIST = [
  { id: 1, type: "like",     user: "Мария Иванова",  text: "оценила вашу фотографию",       time: "5 мин",   read: false },
  { id: 2, type: "friend",   user: "Дмитрий Козлов", text: "отправил заявку в друзья",      time: "1 час",   read: false },
  { id: 3, type: "comment",  user: "Анна Петрова",   text: "прокомментировала вашу запись", time: "2 часа",  read: true  },
  { id: 4, type: "like",     user: "Игорь Новиков",  text: "оценил вашу запись",            time: "вчера",   read: true  },
  { id: 5, type: "birthday", user: "Юля Белова",     text: "сегодня день рождения! 🎂",     time: "сегодня", read: false },
];

const NAV_BASE: { id: Page; icon: string; label: string }[] = [
  { id: "profile",       icon: "User",          label: "Профиль"      },
  { id: "messages",      icon: "MessageCircle", label: "Сообщения"    },
  { id: "friends",       icon: "Users",         label: "Друзья"       },
  { id: "notifications", icon: "Bell",          label: "Уведомления"  },
  { id: "settings",      icon: "Settings",      label: "Настройки"    },
];

/* ─────────────── УТИЛИТЫ ─────────────── */
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}
const GRAD = [
  "from-blue-500 to-indigo-600", "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-600","from-orange-400 to-red-500",
  "from-pink-500 to-rose-600",   "from-cyan-500 to-sky-600",
];
function grad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRAD[Math.abs(h) % GRAD.length];
}
function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
function readFile(file: File): Promise<string> {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as string);
    r.readAsDataURL(file);
  });
}

/* ─────────────── КОМПОНЕНТ: АВАТАР ─────────────── */
function Ava({ name, src, size = "md", border = false }: { name: string; src?: string | null; size?: "xs"|"sm"|"md"|"lg"|"xl"; border?: boolean }) {
  const sz: Record<string, string> = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  if (src) return (
    <img src={src} alt={name} className={`${sz[size]} rounded-full object-cover flex-shrink-0 ${border ? "ring-2 ring-background" : ""}`} />
  );
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
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-500/30">
            <Icon name="Users" size={38} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">МоёОбщество</h1>
          <p className="text-muted-foreground text-sm mt-2">Общайтесь, звоните, дружите</p>
        </div>
        <button onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 hover:opacity-90 shadow-lg mb-5"
          style={{ background: "linear-gradient(135deg, #ff8c00, #e65c00)" }}>
          <span className="text-xl font-black">ОК</span>
          <span>Войти через Одноклассники</span>
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">или</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-3 mb-4">
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email или телефон" className="bg-[hsl(var(--card))] border-border h-12 rounded-xl" />
          <Input value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" type="password" className="bg-[hsl(var(--card))] border-border h-12 rounded-xl" />
        </div>
        <button onClick={onLogin} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all active:scale-95">
          Войти
        </button>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Нет аккаунта?{" "}
          <button onClick={onLogin} className="text-primary font-semibold hover:underline">Зарегистрироваться</button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────── МОДАЛКА РЕДАКТИРОВАНИЯ ПРОФИЛЯ ─────────────── */
function EditProfileModal({ profile, onSave, onClose }: { profile: UserProfile; onSave: (p: UserProfile) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...profile });
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    setForm(f => ({ ...f, avatar: url }));
  };
  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFile(file);
    setForm(f => ({ ...f, cover: url }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-[hsl(var(--card))] rounded-t-3xl sm:rounded-3xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Редактировать профиль</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Обложка */}
        <div className="relative mb-12">
          <div
            className="h-24 rounded-2xl overflow-hidden cursor-pointer group"
            style={form.cover ? { backgroundImage: `url(${form.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            onClick={() => coverRef.current?.click()}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <div className="flex items-center gap-2 text-white text-sm font-semibold">
                <Icon name="Camera" size={16} /> Изменить обложку
              </div>
            </div>
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />

          <div className="absolute -bottom-8 left-4 cursor-pointer group" onClick={() => avatarRef.current?.click()}>
            <Ava name={form.name} src={form.avatar} size="xl" border />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon name="Camera" size={18} className="text-white" />
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Имя и фамилия</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-[hsl(var(--background))] border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Имя пользователя</label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="bg-[hsl(var(--background))] border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Город</label>
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-[hsl(var(--background))] border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">О себе</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--background))] border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-[hsl(var(--background))] text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors">
            Отмена
          </button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── ПРОФИЛЬ ─────────────── */
function ProfilePage({ profile, onEditProfile, posts, onAddPost, onLike, onComment }: {
  profile: UserProfile;
  onEditProfile: () => void;
  posts: Post[];
  onAddPost: (text: string, image: string | null) => void;
  onLike: (id: number) => void;
  onComment: (postId: number, text: string) => void;
}) {
  const [liked, setLiked] = useState<number[]>([]);
  const [openComments, setOpenComments] = useState<number[]>([]);
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const postImgRef = useRef<HTMLInputElement>(null);

  const handlePostImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPostImage(await readFile(file));
  };
  const submitPost = () => {
    if (!newPost.trim() && !newPostImage) return;
    onAddPost(newPost.trim(), newPostImage);
    setNewPost("");
    setNewPostImage(null);
  };
  const toggleLike = (id: number) => {
    setLiked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    onLike(id);
  };
  const submitComment = (postId: number) => {
    const t = commentTexts[postId]?.trim();
    if (!t) return;
    onComment(postId, t);
    setCommentTexts(p => ({ ...p, [postId]: "" }));
  };

  return (
    <div className="animate-fade-in">
      {/* Обложка */}
      <div className="relative mb-12">
        <div
          className="h-36 rounded-2xl overflow-hidden relative"
          style={profile.cover
            ? { backgroundImage: `url(${profile.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)" }
          }
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="absolute -bottom-8 left-5">
          <Ava name={profile.name} src={profile.avatar} size="xl" border />
        </div>
        <button onClick={onEditProfile} className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 backdrop-blur rounded-lg border border-white/25 hover:bg-white/25 transition-colors">
          <Icon name="Edit3" size={12} /> Редактировать
        </button>
      </div>

      <div className="px-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.username}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Icon name="MapPin" size={12} />{profile.city}
          </span>
        </div>
        <p className="text-sm text-foreground/80 mb-5">{profile.bio}</p>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[["Друзья", profile.friends], ["Фото", profile.photos], ["Подписчики", profile.subscribers]].map(([l, v]) => (
            <div key={l} className="bg-[hsl(var(--card))] rounded-xl p-3 text-center cursor-pointer hover:bg-[hsl(var(--card))]/70 transition-colors">
              <p className="text-lg font-bold">{v}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        {/* Создать пост */}
        <div className="bg-[hsl(var(--card))] rounded-2xl p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <Ava name={profile.name} src={profile.avatar} size="sm" />
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Что у вас нового?"
              rows={2}
              className="flex-1 bg-[hsl(var(--background))] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground"
            />
          </div>
          {newPostImage && (
            <div className="relative mb-3 inline-block">
              <img src={newPostImage} alt="" className="h-32 rounded-xl object-cover" />
              <button onClick={() => setNewPostImage(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-white">
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-1">
              <button onClick={() => postImgRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-[hsl(var(--background))] transition-colors">
                <Icon name="Image" size={15} /> Фото
              </button>
              <input ref={postImgRef} type="file" accept="image/*" className="hidden" onChange={handlePostImage} />
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-[hsl(var(--background))] transition-colors">
                <Icon name="Smile" size={15} /> Настроение
              </button>
            </div>
            <button onClick={submitPost} disabled={!newPost.trim() && !newPostImage}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              Опубликовать
            </button>
          </div>
        </div>

        {/* Посты */}
        <div className="space-y-3">
          {posts.map(post => {
            const isLiked = liked.includes(post.id);
            const showComments = openComments.includes(post.id);
            return (
              <div key={post.id} className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Ava name={profile.name} src={profile.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>
                  {post.text && <p className="text-sm text-foreground/90 mb-3 leading-relaxed">{post.text}</p>}
                </div>
                {post.image && (
                  <img src={post.image} alt="" className="w-full max-h-80 object-cover" />
                )}
                <div className="px-4 py-3">
                  <div className="flex gap-5 border-t border-border pt-3">
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
                      <Icon name="Heart" size={16} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button onClick={() => setOpenComments(p => p.includes(post.id) ? p.filter(x => x !== post.id) : [...p, post.id])}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Icon name="MessageCircle" size={16} /><span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                      <Icon name="Share2" size={16} />
                    </button>
                  </div>

                  {/* Комментарии */}
                  {showComments && (
                    <div className="mt-3 space-y-2">
                      {post.comments.map(c => (
                        <div key={c.id} className="flex gap-2">
                          <Ava name={c.author} size="xs" />
                          <div className="flex-1 bg-[hsl(var(--background))] rounded-xl px-3 py-2">
                            <p className="text-xs font-semibold">{c.author}</p>
                            <p className="text-xs text-foreground/80">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <Ava name={profile.name} src={profile.avatar} size="xs" />
                        <div className="flex-1 flex gap-1">
                          <Input
                            value={commentTexts[post.id] || ""}
                            onChange={e => setCommentTexts(p => ({ ...p, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                            placeholder="Написать комментарий..."
                            className="flex-1 h-8 text-xs bg-[hsl(var(--background))] border-transparent rounded-lg"
                          />
                          <button onClick={() => submitComment(post.id)} className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:opacity-90">
                            <Icon name="Send" size={13} className="text-primary-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── СООБЩЕНИЯ ─────────────── */
function MessagesPage({ profile, chats, setChats, onCall }: {
  profile: UserProfile;
  chats: Record<number, ChatMessage[]>;
  setChats: React.Dispatch<React.SetStateAction<Record<number, ChatMessage[]>>>;
  onCall: (t: "video"|"voice", name: string) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [attachImg, setAttachImg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const chat = MESSAGES_LIST.find(m => m.id === open);
  const msgs = open ? (chats[open] || []) : [];

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachImg(await readFile(file));
  };

  const sendMsg = useCallback(() => {
    if (!text.trim() && !attachImg) return;
    if (!open) return;
    const msg: ChatMessage = { id: Date.now(), from: "me", text: text.trim(), time: now(), image: attachImg };
    setChats(p => ({ ...p, [open]: [...(p[open] || []), msg] }));
    setText("");
    setAttachImg(null);
    // авто-ответ
    setTimeout(() => {
      const replies = ["Понял! 👍", "Отлично!", "Хорошо, договорились!", "😊", "Ок, скоро напишу"];
      const reply: ChatMessage = { id: Date.now() + 1, from: "them", text: replies[Math.floor(Math.random() * replies.length)], time: now() };
      setChats(p => ({ ...p, [open!]: [...(p[open!] || []), reply] }));
    }, 1500);
  }, [text, attachImg, open, setChats]);

  const filtered = MESSAGES_LIST.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

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
            <p className={`text-xs ${chat.online ? "text-emerald-400" : "text-muted-foreground"}`}>{chat.online ? "онлайн" : "был(а) недавно"}</p>
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
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} gap-2`}>
              {m.from !== "me" && <Ava name={chat.name} size="xs" />}
              <div className={`max-w-[78%] rounded-2xl text-sm ${m.from === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-[hsl(var(--card))] text-foreground rounded-bl-sm"}`}>
                {m.image && <img src={m.image} alt="" className="w-full max-w-xs rounded-xl object-cover mb-1" />}
                {m.text && <p className="px-3.5 pt-2">{m.text}</p>}
                <p className={`text-[10px] px-3.5 pb-2 pt-0.5 ${m.from === "me" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
              {m.from === "me" && <Ava name={profile.name} src={profile.avatar} size="xs" />}
            </div>
          ))}
        </div>

        {attachImg && (
          <div className="relative mb-2 inline-block">
            <img src={attachImg} alt="" className="h-20 rounded-xl object-cover" />
            <button onClick={() => setAttachImg(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white">
              <Icon name="X" size={10} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button onClick={() => imgRef.current?.click()} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
            <Icon name="Image" size={20} />
          </button>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleAttach} />
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMsg()}
            placeholder="Написать сообщение..."
            className="flex-1 bg-[hsl(var(--card))] border-transparent h-10 rounded-xl"
          />
          <button onClick={sendMsg} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity">
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
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск диалогов..." className="pl-9 bg-[hsl(var(--card))] border-transparent h-10 rounded-xl" />
      </div>
      <div className="space-y-0.5">
        {filtered.map(msg => {
          const last = chats[msg.id]?.at(-1);
          return (
            <button key={msg.id} onClick={() => setOpen(msg.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[hsl(var(--card))] transition-colors text-left">
              <div className="relative flex-shrink-0">
                <Ava name={msg.name} size="md" />
                <OnlineDot online={msg.online} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold truncate">{msg.name}</p>
                  <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{last?.time || msg.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{last?.from === "me" ? "Вы: " : ""}{last?.text || (last?.image ? "📷 Фото" : msg.last)}</p>
              </div>
              {msg.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">{msg.unread}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── ДРУЗЬЯ ─────────────── */
function FriendsPage({ onCall, onMessage, onReqCountChange }: { onCall: (t: "video"|"voice", name: string) => void; onMessage: () => void; onReqCountChange: (n: number) => void }) {
  const [tab, setTab]           = useState<"all"|"online"|"requests">("all");
  const [search, setSearch]     = useState("");
  const [friends, setFriends]   = useState(FRIENDS_INIT);
  const [requests, setRequests] = useState(REQUESTS_INIT);
  const [toasts, setToasts]     = useState<{ id: number; text: string; type: "ok"|"no" }[]>([]);

  const showToast = (text: string, type: "ok"|"no") => {
    const id = Date.now();
    setToasts(p => [...p, { id, text, type }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3000);
  };

  const acceptRequest = (req: typeof REQUESTS_INIT[0]) => {
    const updated = requests.filter(r => r.id !== req.id);
    setFriends(p => [...p, { ...req, id: req.id }]);
    setRequests(updated);
    onReqCountChange(updated.length);
    showToast(`${req.name} теперь ваш друг!`, "ok");
  };
  const declineRequest = (req: typeof REQUESTS_INIT[0]) => {
    const updated = requests.filter(r => r.id !== req.id);
    setRequests(updated);
    onReqCountChange(updated.length);
    showToast(`Заявка от ${req.name.split(" ")[0]} отклонена`, "no");
  };
  const removeFriend = (id: number, name: string) => {
    setFriends(p => p.filter(f => f.id !== id));
    showToast(`${name.split(" ")[0]} удалён из друзей`, "no");
  };

  const list = (tab === "online" ? friends.filter(f => f.online) : friends)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      {/* Тосты */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-in ${t.type === "ok" ? "bg-emerald-500" : "bg-red-500"}`}>
            <Icon name={t.type === "ok" ? "UserCheck" : "UserX"} size={16} fallback="Check" />
            {t.text}
          </div>
        ))}
      </div>

      <div className="relative mb-3">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск друзей..." className="pl-9 bg-[hsl(var(--card))] border-transparent h-10 rounded-xl" />
      </div>

      <div className="flex gap-1 mb-5 bg-[hsl(var(--card))] rounded-xl p-1">
        {(["all","online","requests"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "all" ? `Все (${friends.length})` : t === "online" ? "Онлайн" : (
              <span className="flex items-center justify-center gap-1.5">
                Заявки
                {requests.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{requests.length}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ЗАЯВКИ */}
      {tab === "requests" && (
        requests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="UserCheck" size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Новых заявок нет</p>
            <p className="text-xs mt-1 opacity-60">Когда кто-то захочет подружиться — увидите здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">{requests.length} {requests.length === 1 ? "заявка" : requests.length < 5 ? "заявки" : "заявок"} в ожидании</p>
            {requests.map(req => (
              <div key={req.id} className="bg-[hsl(var(--card))] rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <Ava name={req.name} size="md" />
                    {req.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[hsl(var(--card))]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{req.name}</p>
                    <p className="text-xs text-muted-foreground">{req.city} · {req.mutual} общих друзей</p>
                  </div>
                  {req.online && <span className="text-[10px] text-emerald-400 font-medium">онлайн</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
                  >
                    <Icon name="UserCheck" size={15} /> Принять
                  </button>
                  <button
                    onClick={() => declineRequest(req)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[hsl(var(--background))] text-muted-foreground text-sm font-semibold hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-95"
                  >
                    <Icon name="UserX" size={15} /> Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* СПИСОК ДРУЗЕЙ */}
      {tab !== "requests" && (
        list.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "Никого не найдено" : "Нет друзей онлайн"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(f => (
              <div key={f.id} className="bg-[hsl(var(--card))] rounded-2xl p-3.5 flex items-center gap-3 group">
                <div className="relative flex-shrink-0">
                  <Ava name={f.name} size="md" />
                  <OnlineDot online={f.online} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.city} · {f.mutual} общих</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onCall("voice", f.name)} title="Голосовой звонок"
                    className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 transition-all">
                    <Icon name="Phone" size={15} />
                  </button>
                  <button onClick={() => onCall("video", f.name)} title="Видеозвонок"
                    className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                    <Icon name="Video" size={15} />
                  </button>
                  <button onClick={onMessage} title="Написать"
                    className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                    <Icon name="MessageCircle" size={15} />
                  </button>
                  <button onClick={() => removeFriend(f.id, f.name)} title="Удалить из друзей"
                    className="w-8 h-8 rounded-full bg-[hsl(var(--background))] flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                    <Icon name="UserMinus" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ─────────────── УВЕДОМЛЕНИЯ ─────────────── */
const N_ICON: Record<string, string>  = { like: "Heart", friend: "UserPlus", comment: "MessageCircle", birthday: "Gift" };
const N_COLOR: Record<string, string> = { like: "text-red-400 bg-red-400/10", friend: "text-blue-400 bg-blue-400/10", comment: "text-emerald-400 bg-emerald-400/10", birthday: "text-yellow-400 bg-yellow-400/10" };

function NotificationsPage() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS_LIST);

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  return (
    <div className="animate-fade-in">
      {notifs.some(n => !n.read) && (
        <button onClick={markAll} className="w-full text-xs text-primary font-semibold mb-3 text-right hover:underline">
          Отметить все как прочитанные
        </button>
      )}
      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors hover:border-primary/30 ${n.read ? "bg-[hsl(var(--card))] border-transparent" : "bg-[hsl(var(--card))] border-primary/20"}`}>
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
    </div>
  );
}

/* ─────────────── НАСТРОЙКИ ─────────────── */
function SettingsPage({ profile, onEditProfile, onLogout }: { profile: UserProfile; onEditProfile: () => void; onLogout: () => void }) {
  const [notif,   setNotif]   = useState(true);
  const [sounds,  setSounds]  = useState(true);
  const [priv,    setPriv]    = useState(false);
  const [dark,    setDark]    = useState(true);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="bg-[hsl(var(--card))] rounded-2xl p-4 flex items-center gap-4">
        <Ava name={profile.name} src={profile.avatar} size="lg" />
        <div className="flex-1">
          <p className="font-bold">{profile.name}</p>
          <p className="text-sm text-muted-foreground">{profile.username}</p>
          <button onClick={onEditProfile} className="text-xs text-primary mt-0.5 hover:underline">Изменить профиль</button>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 font-semibold">
          <span className="font-black">ОК</span> Привязан
        </div>
      </div>

      {[
        { title: "Аккаунт", items: [
          { icon: "User",    label: "Редактировать профиль", action: onEditProfile, arrow: true },
          { icon: "Lock",    label: "Безопасность",           arrow: true },
          { icon: "Phone",   label: "Номер телефона",  val: "+7 999 *** **01", arrow: true },
          { icon: "Mail",    label: "Email",           val: "alex@mail.ru",    arrow: true },
        ]},
        { title: "Внешний вид", items: [
          { icon: "Moon",   label: "Тёмная тема",       toggle: true, val: dark,   set: setDark   },
        ]},
        { title: "Уведомления", items: [
          { icon: "Bell",    label: "Push-уведомления", toggle: true, val: notif,  set: setNotif  },
          { icon: "Volume2", label: "Звуки",            toggle: true, val: sounds, set: setSounds },
        ]},
        { title: "Конфиденциальность", items: [
          { icon: "Eye",   label: "Закрытый профиль",     toggle: true, val: priv, set: setPriv },
          { icon: "Users", label: "Кто может писать мне", val: "Все",   arrow: true },
        ]},
      ].map(s => (
        <div key={s.title}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">{s.title}</p>
          <div className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden divide-y divide-border">
            {s.items.map((item: { icon: string; label: string; action?: () => void; arrow?: boolean; val?: string | boolean; toggle?: boolean; set?: (v: boolean) => void }) => (
              <div key={item.label} onClick={item.action} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[hsl(var(--background))]/40 cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--background))] flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name={item.icon} size={16} fallback="Settings" />
                </div>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.toggle !== undefined ? (
                  <button onClick={e => { e.stopPropagation(); item.set?.(!item.val); }}
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

/* ─────────────── ЗВОНОК ─────────────── */

function CallOverlay({ call, onEnd }: { call: NonNullable<CallState>; onEnd: () => void }) {
  const [muted,   setMuted]   = useState(false);
  const [camOff,  setCamOff]  = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [secs,    setSecs]    = useState(0);
  const [phase,   setPhase]   = useState<"connecting"|"active">("connecting");

  useEffect(() => {
    const connect = setTimeout(() => setPhase("active"), 2000);
    return () => clearTimeout(connect);
  }, []);

  useEffect(() => {
    if (phase !== "active") return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  const isVideo = call.type === "video";

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: isVideo ? "linear-gradient(160deg,#0a0a12,#0d1420,#080e1a)" : "linear-gradient(160deg,#0f0f1a,#12182b,#0a1020)" }}>
      {/* Фоновые блики */}
      <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: isVideo ? "radial-gradient(circle at 20% 30%, #1d4ed8 0%,transparent 45%),radial-gradient(circle at 80% 70%,#7c3aed 0%,transparent 45%)" : "radial-gradient(circle at 30% 25%, #059669 0%,transparent 50%),radial-gradient(circle at 75% 75%,#0284c7 0%,transparent 50%)" }} />

      {/* Шапка */}
      <div className="relative flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur">
          <span className={`w-2 h-2 rounded-full ${phase === "active" ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"}`} />
          <span className="text-white/80 text-xs font-medium">
            {isVideo ? "Видеозвонок" : "Голосовой звонок"}
          </span>
        </div>
        {phase === "active" && (
          <span className="text-white/60 text-sm font-mono tabular-nums">{fmt(secs)}</span>
        )}
      </div>

      {/* Видео / Голос */}
      {isVideo ? (
        <div className="relative flex-1 mx-4 rounded-3xl overflow-hidden bg-black/40 backdrop-blur border border-white/10">
          {camOff ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30">
              <Icon name="VideoOff" size={56} />
              <p className="text-sm">Камера выключена</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/30">
              <Icon name="Video" size={56} className="text-blue-400/50" />
              <p className="text-sm">Ваша камера</p>
            </div>
          )}
          {/* Мини-окно собеседника */}
          <div className="absolute top-4 right-4 w-24 h-18 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden" style={{ height: "72px" }}>
            <Ava name={call.name} size="md" />
          </div>
          {/* Имя собеседника */}
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold text-lg">{call.name}</p>
            <p className="text-white/50 text-xs">{phase === "connecting" ? "Соединение..." : "В разговоре"}</p>
          </div>
        </div>
      ) : (
        /* Голосовой — центральный аватар */
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className={`relative ${phase === "active" ? "animate-pulse-ring" : ""}`}>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/30">
              {call.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
            {phase === "active" && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{call.name}</h2>
            <p className="text-white/50 text-sm mt-1 font-mono">
              {phase === "connecting" ? "Звоним..." : fmt(secs)}
            </p>
          </div>
          {/* Визуализация звука */}
          {phase === "active" && !muted && (
            <div className="flex gap-1 items-end h-8">
              {[3,6,4,8,5,7,3,6,5,4,7,6].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-emerald-400/60" style={{ height: `${h * 3}px`, animation: `waveBar 0.8s ease-in-out ${i * 0.07}s infinite alternate` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Кнопки управления */}
      <div className="relative pb-14 pt-6 px-8">
        <div className="flex items-center justify-center gap-5">
          {/* Микрофон */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={() => setMuted(!muted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${muted ? "bg-red-500/20 border-red-400 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
              <Icon name={muted ? "MicOff" : "Mic"} size={22} fallback="Mic" />
            </button>
            <span className="text-white/40 text-[10px]">{muted ? "Вкл. микр." : "Микрофон"}</span>
          </div>

          {/* Завершить */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={onEnd}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-2xl shadow-red-500/50 active:scale-95">
              <Icon name="PhoneOff" size={28} className="text-white" />
            </button>
            <span className="text-white/40 text-[10px]">Завершить</span>
          </div>

          {/* Камера (видео) / Громкость (голос) */}
          <div className="flex flex-col items-center gap-1">
            {isVideo ? (
              <>
                <button onClick={() => setCamOff(!camOff)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${camOff ? "bg-red-500/20 border-red-400 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                  <Icon name={camOff ? "VideoOff" : "Video"} size={22} fallback="Video" />
                </button>
                <span className="text-white/40 text-[10px]">{camOff ? "Вкл. камеру" : "Камера"}</span>
              </>
            ) : (
              <>
                <button onClick={() => setSpeaker(!speaker)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${!speaker ? "bg-red-500/20 border-red-400 text-red-400" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                  <Icon name={speaker ? "Volume2" : "VolumeX"} size={22} fallback="Volume2" />
                </button>
                <span className="text-white/40 text-[10px]">Динамик</span>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────── ГЛАВНЫЙ КОМПОНЕНТ ─────────────── */
export default function Index() {
  const [loggedIn, setLoggedIn]   = useState(false);
  const [page, setPage]           = useState<Page>("profile");
  const [call, setCall]           = useState<CallState>(null);
  const [profile, setProfile]     = useState<UserProfile>(INIT_PROFILE);
  const [posts, setPosts]         = useState<Post[]>(INIT_POSTS);
  const [chats, setChats]         = useState<Record<number, ChatMessage[]>>(INIT_CHATS);
  const [editOpen, setEditOpen]   = useState(false);
  const [reqCount, setReqCount]   = useState(REQUESTS_INIT.length);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const handleCall    = (type: "video"|"voice", name: string) => setCall({ type, name });
  const handleAddPost = (text: string, image: string | null) => {
    setPosts(p => [{ id: Date.now(), text, image, likes: 0, comments: [], time: "только что" }, ...p]);
  };
  const handleLike    = (id: number) => setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));
  const handleComment = (postId: number, text: string) => setPosts(p => p.map(x => x.id === postId
    ? { ...x, comments: [...x.comments, { id: Date.now(), author: profile.name, text, time: "только что" }] } : x
  ));

  const NAV = NAV_BASE.map(n => ({
    ...n,
    badge: n.id === "friends" ? (reqCount > 0 ? reqCount : undefined)
         : n.id === "messages" ? 6
         : n.id === "notifications" ? 3
         : undefined,
  }));

  const totalBadge = NAV.reduce((s, n) => s + (n.badge || 0), 0);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground flex">
      {call && <CallOverlay call={call} onEnd={() => setCall(null)} />}
      {editOpen && <EditProfileModal profile={profile} onSave={setProfile} onClose={() => setEditOpen(false)} />}

      {/* САЙДБАР — только десктоп */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[hsl(var(--card))] border-r border-border py-6 px-3 fixed top-0 left-0 h-full">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Icon name="Users" size={18} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">МоёОбщество</span>
        </div>
        <div className="flex items-center gap-3 px-3 mb-6 pb-6 border-b border-border">
          <Ava name={profile.name} src={profile.avatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.username}</p>
          </div>
        </div>
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

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
        <header className="sticky top-0 z-30 bg-[hsl(var(--background))]/90 backdrop-blur border-b border-border px-4 lg:px-8 py-3.5 flex items-center gap-3">
          <h1 className="text-lg font-bold flex-1">{NAV.find(n => n.id === page)?.label}</h1>
          <div className="relative">
            <button onClick={() => setPage("notifications")} className="w-9 h-9 rounded-full bg-[hsl(var(--card))] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
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
          {page === "profile" && (
            <ProfilePage
              profile={profile}
              onEditProfile={() => setEditOpen(true)}
              posts={posts}
              onAddPost={handleAddPost}
              onLike={handleLike}
              onComment={handleComment}
            />
          )}
          {page === "messages" && (
            <MessagesPage profile={profile} chats={chats} setChats={setChats} onCall={handleCall} />
          )}
          {page === "friends" && (
            <FriendsPage onCall={handleCall} onMessage={() => setPage("messages")} onReqCountChange={setReqCount} />
          )}
          {page === "notifications" && <NotificationsPage />}
          {page === "settings" && (
            <SettingsPage profile={profile} onEditProfile={() => setEditOpen(true)} onLogout={() => setLoggedIn(false)} />
          )}
        </div>
      </main>

      {/* НИЖНЯЯ НАВИГАЦИЯ — только мобайл */}
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