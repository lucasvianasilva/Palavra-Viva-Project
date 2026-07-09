import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- Componente Criado para o Efeito de "Digitação" Fluida ---
const TypewriterMessage = ({ text, isNew }) => {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : text);

  useEffect(() => {
    if (!isNew) return;
    let i = 0;
    const interval = setInterval(() => {
      // Usado slice para não quebrar acentuação e emojis
      setDisplayedText(text.slice(0, i + 1)); 
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 13); // <-- 13ms é a velocidade da digitação
    
    return () => clearInterval(interval);
  }, [text, isNew]);

  return <span className="whitespace-pre-line leading-loose tracking-wide block">{displayedText}</span>;
};


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Faz a tela rolar suavemente para baixo sempre que houver nova mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // isNew: false para a mensagem do usuário (aparece de uma vez)
    const userMessage = { sender: 'user', text: input, isNew: false };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('https://palavra-viva-api-0s2i.onrender.com', {
        text: currentInput
      });
      
      // isNew: true para a IA (ativa o efeito de digitação)
      setMessages((prev) => [...prev, { sender: 'ia', text: response.data.response, isNew: true }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ia', text: 'Desculpe, tive um problema de conexão.', isNew: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo bege pastel calmante
    <div className="min-h-screen bg-[#F7F4EF] text-[#5C5042] font-sans flex flex-col items-center p-4">
      
      {/* Container Principal Centralizado */}
      <div className="w-full max-w-3xl flex flex-col h-full flex-1" style={{ minHeight: '90vh' }}>
        
        {/* Cabeçalho que sobe quando a conversa começa */}
        <div className={`transition-all duration-700 ease-in-out text-center w-full ${messages.length > 0 ? 'mt-8 mb-6' : 'mt-[30vh] mb-8'}`}>
          <h1 className="text-3xl font-serif font-bold text-[#4A3F35] flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-[#C3B5A3]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2h2v6h6v2h-6v12h-2V10H5V8h6V2z"/>
            </svg>
            Palavra Viva
          </h1>
          {messages.length === 0 && (
            <p className="mt-3 text-[#8C7E6D]">Olá! Como posso ajudar o seu coração hoje?</p>
          )}
        </div>

        {/* Área do Chat (Oculta a barra de rolagem mas permite rolar) */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto mb-6 px-2 space-y-6 scrollbar-none">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#E3D8C8]/60 text-[#4A3F35] rounded-br-md' 
                      : 'bg-white/50 backdrop-blur-sm border border-[#EBE4DA] text-[#5C5042] rounded-bl-md'
                  }`}
                >
                  {msg.sender === 'ia' ? (
                    <TypewriterMessage text={msg.text} isNew={msg.isNew} />
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* O Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-sm rounded-3xl rounded-bl-md border border-[#EBE4DA] text-[#8C7E6D] shadow-sm italic">
                  {/* Ícone de loading girando */}
                  <svg className="animate-spin h-5 w-5 text-[#C3B5A3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm tracking-wide">Buscando em Deus sua resposta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Barra de Input Centralizada / Inferior com 50% de Opacidade */}
        <div className={`w-full transition-all duration-700 ease-in-out ${messages.length === 0 ? 'mb-auto' : 'mt-auto pb-6'}`}>
          <form onSubmit={handleSend} className="relative w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Faça uma pergunta ou desabafo..."
              // bg-white/50 aplica os 50% de transparência. backdrop-blur cria o efeito de vidro
              className="w-full p-4 pl-6 pr-14 bg-white/50 backdrop-blur-md border border-[#D5CABB] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C3B5A3]/50 focus:border-transparent text-[#5C5042] shadow-sm transition-all placeholder-[#A39887]"
              disabled={loading}
            />
            
            {/* Botão de Seta */}
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-[#D5CABB]/80 hover:bg-[#C3B5A3] text-white rounded-full transition-colors disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;