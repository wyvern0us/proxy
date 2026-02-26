import React, { useState, useEffect, useRef } from "react";
import { Search, Globe, X, ArrowLeft, Maximize2, ExternalLink, MessageSquare, Gamepad2, Shield, Send, Rocket, Folder, Settings, Music, Play, Monitor, Terminal, Code, Film, User, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  color: string;
}

type Tab = "home" | "proxy" | "games" | "chat" | "settings" | "about";

const USER_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399", "#22d3ee", "#818cf8", "#c084fc", "#f472b6"];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [url, setUrl] = useState("");
  const [proxiedUrl, setProxiedUrl] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [userColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "init") {
        setMessages(data.messages);
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        if (authMode === "login") {
          setUser({ username: data.username });
        } else {
          setAuthMode("login");
          setAuthError("Account created! Please log in.");
        }
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    }
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || !user) return;

    socketRef.current.send(JSON.stringify({
      type: "message",
      user: user.username,
      text: chatInput,
      color: userColor
    }));
    setChatInput("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url.trim();
    const isUrl = targetUrl.includes(".") && !targetUrl.includes(" ");
    
    if (!isUrl) {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    } else if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    setProxiedUrl(`/api/proxy?url=${encodeURIComponent(targetUrl)}`);
    setIsIframeLoading(true);
    setActiveTab("proxy");
  };

  const clearProxy = () => {
    setProxiedUrl(null);
    setUrl("");
    setActiveTab("home");
  };

  const apps = [
    { name: "Browser", icon: Globe, tab: "proxy" as Tab },
    { name: "Games", icon: Gamepad2, tab: "games" as Tab },
    { name: "Site Chat", icon: MessageSquare, tab: "chat" as Tab },
    { name: "Settings", icon: Settings, tab: "settings" as Tab },
    { name: "About", icon: Info, tab: "about" as Tab },
    { name: "Terminal", icon: Terminal, tab: "home" as Tab },
    { name: "Movies", icon: Film, tab: "home" as Tab },
    { name: "Music", icon: Music, tab: "home" as Tab },
    { name: "Code", icon: Code, tab: "home" as Tab },
    { name: "Files", icon: Folder, tab: "home" as Tab },
  ];

  const games = [
    { name: "2048", url: "https://play2048.co/", icon: "🔢" },
    { name: "Tetris", url: "https://tetris.com/play-tetris", icon: "🧱" },
    { name: "Snake", url: "https://www.google.com/logos/2010/pacman10-i.html", icon: "🐍" },
    { name: "Chess", url: "https://www.chess.com/play/computer", icon: "♟️" },
    { name: "Flappy Bird", url: "https://flappybird.io/", icon: "🐦" },
    { name: "Doodle Jump", url: "https://doodlejump.io/", icon: "🚀" }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-white/20">
      {/* Live Background Image */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ 
          scale: [1.1, 1.15, 1.1],
          rotate: [0, 1, 0, -1, 0]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url('https://c4.wallpaperflare.com/wallpaper/849/282/378/anime-one-piece-monkey-d-luffy-wallpaper-preview.jpg')` }}
      />
      
      {/* OS Branding */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none select-none">
        <h1 className="text-7xl font-bold tracking-tighter flex items-baseline">
          WYVERN <span className="text-indigo-500 text-4xl ml-2">os</span>
        </h1>
      </div>

      {/* Main Content Area */}
      <main className="relative z-20 h-screen w-full pt-32 pb-24 px-12">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-8 gap-y-12 max-w-7xl mx-auto"
            >
              {apps.map((app) => (
                <button
                  key={app.name}
                  onClick={() => setActiveTab(app.tab)}
                  className="group flex flex-col items-center gap-3 transition-all active:scale-90"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group-hover:bg-white/15 group-hover:border-white/20 transition-all shadow-lg">
                    <app.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-medium tracking-wide text-white/80 group-hover:text-white transition-colors">
                    {app.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === "proxy" && (
            <motion.div
              key="proxy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full flex flex-col max-w-6xl mx-auto"
            >
              {!proxiedUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <Globe className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Web Browser</h2>
                        <p className="text-white/40 text-sm">Browse freely through the Wyvern gateway.</p>
                      </div>
                    </div>
                    <form onSubmit={handleSearch} className="relative group">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl focus-within:border-white/30 transition-all">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="Enter URL or search query..."
                          className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg placeholder:text-white/20"
                          autoFocus
                        />
                        <button type="submit" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
                          GO
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <button onClick={clearProxy} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/5 text-sm text-white/40 max-w-md truncate">
                        <Globe className="w-3.5 h-3.5" />
                        {url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isIframeLoading && <div className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mr-2" />}
                      <button onClick={() => window.open(proxiedUrl, "_blank")} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button onClick={clearProxy} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-white">
                    <iframe src={proxiedUrl} className="w-full h-full border-none" onLoad={() => setIsIframeLoading(false)} title="Proxied Content" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "games" && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full max-w-6xl mx-auto overflow-y-auto pr-4 custom-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <button
                    key={game.name}
                    onClick={() => {
                      setUrl(game.url);
                      setProxiedUrl(`/api/proxy?url=${encodeURIComponent(game.url)}`);
                      setActiveTab("proxy");
                    }}
                    className="group relative flex flex-col items-start p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all text-left backdrop-blur-xl shadow-xl"
                  >
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{game.icon}</div>
                    <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
                    <p className="text-white/40 text-sm">Launch in secure browser</p>
                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white/40" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full max-w-4xl mx-auto flex flex-col"
            >
              {!user ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl">
                    <div className="text-center mb-8">
                      <div className="inline-block p-4 bg-white/5 rounded-2xl mb-4">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold tracking-tight mb-2">{authMode === "login" ? "Welcome Back" : "Join Wyvern"}</h2>
                      <p className="text-white/40">Secure access to global chat.</p>
                    </div>
                    <form onSubmit={handleAuth} className="space-y-4">
                      <input
                        type="text"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all"
                        placeholder="Username"
                        required
                      />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all"
                        placeholder="Password"
                        required
                      />
                      {authError && <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">{authError}</p>}
                      <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-white/90 transition-all">
                        {authMode === "login" ? "LOG IN" : "SIGN UP"}
                      </button>
                    </form>
                    <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} className="w-full mt-6 text-sm text-white/40 hover:text-white transition-colors">
                      {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col backdrop-blur-2xl shadow-2xl">
                  <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold tracking-widest uppercase">Global Chat</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/40">Logged in as <span className="text-white font-mono" style={{ color: userColor }}>{user.username}</span></span>
                      <button onClick={() => setUser(null)} className="text-[10px] uppercase tracking-widest font-bold text-white/20 hover:text-red-400 transition-colors">Logout</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col items-start max-w-[85%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-mono" style={{ color: msg.color }}>{msg.user}</span>
                          <span className="text-[10px] text-white/20">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={sendChatMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition-all"
                    />
                    <button type="submit" className="bg-white text-black p-3 rounded-xl hover:bg-white/90 transition-all">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full max-w-2xl mx-auto"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-8">System Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold">Snow Effect</p>
                      <p className="text-xs text-white/40">Toggle particle background</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="font-bold">Hardware Acceleration</p>
                      <p className="text-xs text-white/40">Optimize rendering performance</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full max-w-2xl mx-auto flex items-center justify-center"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-2xl shadow-2xl text-center">
                <div className="inline-block p-6 bg-white/5 rounded-3xl mb-8">
                  <Shield className="w-16 h-16 text-indigo-400" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">WYVERN OS</h2>
                <p className="text-white/60 mb-8 leading-relaxed">
                  Version 2.0.0 (Build 2026.02.26)<br />
                  A secure, atmospheric web operating system designed for unrestricted access and collaboration.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10">Stable</div>
                  <div className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10">Encrypted</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* OS Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1.5 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`p-3.5 rounded-full transition-all ${activeTab === "home" ? "bg-white text-black scale-110 shadow-lg" : "hover:bg-white/10 text-white/60"}`}
          >
            <Rocket className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => setActiveTab("proxy")}
            className={`p-3.5 rounded-full transition-all ${activeTab === "proxy" ? "bg-white text-black scale-110 shadow-lg" : "hover:bg-white/10 text-white/60"}`}
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`p-3.5 rounded-full transition-all ${activeTab === "games" ? "bg-white text-black scale-110 shadow-lg" : "hover:bg-white/10 text-white/60"}`}
          >
            <Gamepad2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`p-3.5 rounded-full transition-all ${activeTab === "chat" ? "bg-white text-black scale-110 shadow-lg" : "hover:bg-white/10 text-white/60"}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`p-3.5 rounded-full transition-all ${activeTab === "settings" ? "bg-white text-black scale-110 shadow-lg" : "hover:bg-white/10 text-white/60"}`}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />
          
          <button 
            onClick={() => {
              setUrl("about:blank");
              setProxiedUrl("/api/proxy?url=about%3Ablank");
              setActiveTab("proxy");
            }}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full text-xs font-bold tracking-tight transition-all active:scale-95 shadow-lg"
          >
            Open in about:blank
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <div className="flex items-center gap-3 px-4 py-2 text-white/60">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-mono font-medium tracking-tighter">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
