import { useState, useMemo, useEffect } from "react";
import { Sparkles, Swords, Loader2, Send, ChevronDown, X, Heart, Zap, TrendingUp, Settings, MessageCircle, Star, Shield, Target, Brain, Image, AlertTriangle } from "lucide-react";

// ---- Clash Royale API & Resim Ayarları ----
const CARDS = [
  { id: "knight", name: "Şövalye", elixir: 3, role: "Tank-Mini", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/knight.png" },
  { id: "archers", name: "Okçular", elixir: 3, role: "Destek", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/archers.png" },
  { id: "hog-rider", name: "Domuz Binicisi", elixir: 4, role: "Atak", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/hog-rider.png" },
  { id: "fireball", name: "Alev Topu", elixir: 4, role: "Büyü", type: "Büyü", imageUrl: "https://cdn.clashroyale.com/cards/2k/fireball.png" },
  { id: "the-log", name: "Tomruk", elixir: 2, role: "Büyü", type: "Büyü", imageUrl: "https://cdn.clashroyale.com/cards/2k/the-log.png" },
  { id: "musketeer", name: "Silahşör", elixir: 4, role: "Destek", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/musketeer.png" },
  { id: "ice-golem", name: "Buz Golemi", elixir: 2, role: "Tank-Mini", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/ice-golem.png" },
  { id: "skeletons", name: "İskeletler", elixir: 1, role: "Savunma", type: "Birlis", imageUrl: "https://cdn.clashroyale.com/cards/2k/skeletons.png" },
];

const META_DECKS = [
  { name: "Hog 2.6 Cycle (Popüler Meta)", cardIds: ["hog-rider", "musketeer", "ice-golem", "skeletons", "the-log", "fireball", "knight", "archers"] },
  { name: "Klasik Savunma Metası", cardIds: ["knight", "archers", "fireball", "the-log", "musketeer"] }
];

export default function ClashRoyaleDeckBuilder() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [favoriteCard, setFavoriteCard] = useState(null);
  const [compareDeck, setCompareDeck] = useState([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  
  // Ayarlar ve Domuz Binicisi Yapay Zekası State'leri
  const [showSettings, setShowSettings] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "hog", text: "Heey! Ben Domuz Binicisi! 🐗 Çekiç bende, domuz bende! Deste kurarken yardıma ihtiyacın var mı dostum? Sor bana!" }
  ]);

  // Kart Seçme / Çıkarma
  const toggleCard = (card) => {
    if (isCompareMode) {
      setCompareDeck(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : prev.length < 8 ? [...prev, card] : prev);
    } else {
      setSelectedCards(prev => prev.some(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : prev.length < 8 ? [...prev, card] : prev);
    }
  };

  // Ortalama İksir ve Sinerji Puanı Hesaplama
  const deckStats = useMemo(() => {
    const currentDeck = isCompareMode ? compareDeck : selectedCards;
    if (currentDeck.length === 0) return { elixir: "0.0", synergy: 0 };
    const totalElixir = currentDeck.reduce((sum, c) => sum + c.elixir, 0);
    
    // Basit Sinerji Mantığı: Destede Atak, Tank, Büyü ve Savunma dengesi
    const roles = currentDeck.map(c => c.role);
    let uniqueRoles = new Set(roles).size;
    let synergyScore = Math.min(100, uniqueRoles * 20 + currentDeck.length * 2);

    return {
      elixir: (totalElixir / currentDeck.length).toFixed(1),
      synergy: synergyScore
    };
  }, [selectedCards, compareDeck, isCompareMode]);

  // Kart Yükseltme Önceliği (Atak ve Büyüler önce yükseltilir)
  const upgradePriority = useMemo(() => {
    const currentDeck = isCompareMode ? compareDeck : selectedCards;
    return [...currentDeck].sort((a, b) => {
      const score = { "Atak": 1, "Büyü": 2, "Tank-Mini": 3, "Destek": 4, "Savunma": 5 };
      return (score[a.role] || 9) - (score[b.role] || 9);
    });
  }, [selectedCards, compareDeck, isCompareMode]);

  // Domuz Binicisi Yapay Zeka Botu Cevap Mantığı
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.toLowerCase();
    let reply = "Hımm, bunu tam anlayamadım ama bence daha çok Domuz Binicisi oyna! 🐗";

    if (userMsg.includes("selam" || userMsg.includes("merhaba"))) {
      reply = "Sana da selam dostum! Arenaya çıkmaya hazır mıyız? 🔨";
    } else if (userMsg.includes("deste") || userMsg.includes("meta")) {
      reply = "Şu an en çılgın meta Hog 2.6 Cycle! İksiri hızlı döndür, rakibe durmadan kule vurdur! Benim olduğum desteler her zaman en iyisidir!";
    } else if (userMsg.includes("yükselt") || userMsg.includes("seviye")) {
      reply = "Her zaman önce ana kuleye vuran atak kartını (yani beni!) yükselt, sonra arkamdan gelen büyüleri (Alev Topu gibi) halledersin.";
    } else if (userMsg.includes("en iyi kart")) {
      reply = "Bu da soru mu? Tabii ki BEN! Domuz Binicisi! 🐗 Çekicimin gücünü hafife alma!";
    }

    setChatMessages(prev => [
      ...prev,
      { sender: "user", text: chatInput },
      { sender: "hog", text: reply }
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white">
      
      {/* Üst Bar ve Ayarlar Sekmesi */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/10 p-4 rounded-xl mb-4 backdrop-blur-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Swords className="text-yellow-400" /> Clash Pro Kurucu
        </h1>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="p-2 hover:bg-white/20 rounded-full transition relative"
        >
          <Settings className="w-6 h-6 text-yellow-400 animate-spin-slow" />
        </button>
      </div>

      {/* Yapay Zeka Ayarlar Penceresi (Domuz Binicisi) */}
      {showSettings && (
        <div className="max-w-6xl mx-auto bg-slate-900/95 p-4 rounded-xl border border-yellow-400 mb-4 space-y-3 shadow-2xl animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="font-bold text-yellow-400 flex items-center gap-2">
              <Brain /> Yapay Zeka Asistanı: Domuz Binicisi
            </h3>
            <button onClick={() => setShowSettings(false)}><X className="text-red-400" /></button>
          </div>
          
          {/* Sohbet Alanı */}
          <div className="h-48 overflow-y-auto bg-black/30 p-2 rounded space-y-2 text-sm">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`p-2 rounded max-w-[80%] ${msg.sender === 'hog' ? 'bg-orange-600/30 mr-auto border-l-4 border-orange-500' : 'bg-blue-600/30 ml-auto'}`}>
                <span className="block text-[10px] opacity-50">{msg.sender === 'hog' ? '🐗 Domuz Binicisi' : 'Sen'}</span>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Mesaj Gönderme */}
          <div className="flex gap-2">
            <input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              placeholder="Deste sor, meta sor, taktik iste..." 
              className="flex-1 bg-white/10 p-2 rounded text-white text-sm outline-none border border-white/10 focus:border-yellow-400"
            />
            <button onClick={handleSendMessage} className="bg-yellow-500 hover:bg-yellow-600 text-purple-900 font-bold px-4 rounded text-sm flex items-center gap-1">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ana Ekran Düzeni */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-4">
        
        {/* Sol Kolon: Kart Seçimi ve Meta Önerileri */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Meta Deste Önerileri Sekmesi */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-yellow-400 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Güncel Meta Deste Önerileri
            </h2>
            <div className="flex flex-wrap gap-2">
              {META_DECKS.map((meta, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    const cards = meta.cardIds.map(id => CARDS.find(c => c.id === id)).filter(Boolean);
                    if (isCompareMode) setCompareDeck(cards); else setSelectedCards(cards);
                  }}
                  className="bg-white/5 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs border border-white/10 transition"
                >
                  {meta.name} ⚡
                </button>
              ))}
            </div>
          </div>

          {/* Kart Seçim Havuzu */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold flex items-center gap-2"><Image /> Arenadaki Tüm Kartlar</h2>
              <button 
                onClick={() => { setIsCompareMode(!isCompareMode); setCompareDeck([]); }} 
                className={`text-xs font-bold px-3 py-1 rounded transition ${isCompareMode ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
              >
                {isCompareMode ? "Karşılaştırmadan Çık" : "Deste Karşılaştırma Modu"}
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CARDS.map(card => {
                const selected = selectedCards.some(c => c.id === card.id);
                const compared = compareDeck.some(c => c.id === card.id);
                return (
                  <button 
                    key={card.id}
                    onClick={() => toggleCard(card)}
                    className={`p-2 rounded-lg bg-black/20 border transition relative text-center flex flex-col items-center ${compared ? 'border-red-500 bg-red-500/10' : selected ? 'border-yellow-400 bg-yellow-400/10' : 'border-transparent hover:bg-white/5'}`}
                  >
                    {/* Gerçek Kart Görseli */}
                    <img src={card.imageUrl} alt={card.name} className="w-12 h-14 object-contain mb-1 rounded" />
                    <span className="text-[11px] block truncate w-full">{card.name}</span>
                    <span className="absolute top-1 right-1 bg-purple-600 text-[10px] px-1 rounded-full font-bold">{card.elixir}</span>
                    
                    {/* En Sevilen Kart Kalp İkonu */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFavoriteCard(card.id === favoriteCard ? null : card.id); }}
                      className="absolute bottom-1 right-1"
                    >
                      <Heart className={`w-3 h-3 ${favoriteCard === card.id ? 'text-red-500 fill-red-500' : 'text-white/40'}`} />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Analiz, Sıralama, Karşılaştırma */}
        <div className="space-y-4">
          
          {/* Aktif Deste İncelemesi */}
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md space-y-3">
            <h3 className="font-bold text-yellow-400 border-b border-white/10 pb-1">
              {isCompareMode ? "⚖️ Karşılaştırılan Deste (2)" : "🃏 Senin Desten (1)"}
            </h3>

            {/* Sinerji ve Eşleşme Puanı */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/30 p-2 rounded text-center">
                <span className="text-[10px] block opacity-60">Ort. İksir</span>
                <span className="text-lg font-bold text-purple-400">{deckStats.elixir} 💧</span>
              </div>
              <div className="bg-black/30 p-2 rounded text-center">
                <span className="text-[10px] block opacity-60">Sinerji Puanı</span>
                <span className="text-lg font-bold text-emerald-400">%{deckStats.synergy}</span>
              </div>
            </div>

            {/* Favori Kart Bildirimi */}
            {favoriteCard && (
              <div className="bg-pink-500/20 p-2 rounded text-xs flex items-center gap-1 text-pink-300">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> 
                <span>En sevdiğin kart: <b>{CARDS.find(c => c.id === favoriteCard)?.name}</b></span>
              </div>
            )}

            {/* Kart Yükseltme Önceliği */}
            <div>
              <span className="text-[11px] font-bold text-yellow-400 block mb-1">📈 Kart Yükseltme Önceliği Sırası:</span>
              <div className="flex flex-wrap gap-1">
                {upgradePriority.map((c, i) => (
                  <span key={i} className="bg-white/5 text-[10px] px-2 py-0.5 rounded border border-white/10">
                    {i+1}. {c.name}
                  </span>
                ))}
                {upgradePriority.length === 0 && <span className="text-xs text-white/40">Önce kart seçmelisin.</span>}
              </div>
            </div>
          </div>

          {/* Deste Karşılaştırma Karşı Paneli */}
          {!isCompareMode && (
            <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-xs text-yellow-200/80">
              💡 Yukarıdaki mavi butona basarak iki farklı destenin iksirini ve yükseltme önceliklerini birbiriyle anlık olarak karşılaştırabilirsin!
            </div>
          )}

        </div>
      </div>
    </div>
  );
}