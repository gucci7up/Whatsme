import React, { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Image, Mic } from 'lucide-react';

export default function Messages() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');

    // Mock Data for UI Visualization
    const chats = [
        { id: 1, name: 'Soporte Técnico', lastMessage: '¿En qué podemos ayudarte?', time: '10:30 AM', unread: 2, avatar: 'https://ui-avatars.com/api/?name=Soporte+Tecnico&background=random' },
        { id: 2, name: 'Ventas', lastMessage: 'Gracias por tu compra', time: 'Ayer', unread: 0, avatar: 'https://ui-avatars.com/api/?name=Ventas&background=random' },
        { id: 3, name: 'Equipo de Desarrollo', lastMessage: 'Reunión a las 3 PM', time: 'Ayer', unread: 5, avatar: 'https://ui-avatars.com/api/?name=Dev+Team&background=random' },
    ];

    const messages = [
        { id: 1, text: 'Hola, tengo una consulta sobre mi cuenta.', sender: 'me', time: '10:00 AM' },
        { id: 2, text: '¡Hola! Claro, dime en qué puedo ayudarte.', sender: 'other', time: '10:05 AM' },
        { id: 3, text: 'No puedo acceder a la configuración de facturación.', sender: 'me', time: '10:15 AM' },
    ];

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar: Chat List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedChat?.id === chat.id ? 'bg-green-50' : ''}`}
                        >
                            <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate">{chat.name}</h4>
                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <span className="w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {chat.unread}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-[#efeae2] relative">
                {/* Chat Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10 sticky top-0">
                            <div className="flex items-center gap-3">
                                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> En línea
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <Search size={20} className="hidden sm:block cursor-pointer hover:text-gray-700" />
                                <Phone size={20} className="hidden sm:block cursor-pointer hover:text-gray-700" />
                                <Video size={20} className="hidden sm:block cursor-pointer hover:text-gray-700" />
                                <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" />
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 shadow-sm ${msg.sender === 'me'
                                            ? 'bg-green-100 text-gray-800 rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <span className="text-[10px] text-gray-500 block text-right mt-1">{msg.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-3 border-t border-gray-200 z-10 sticky bottom-0">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                    <Image size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Escribe un mensaje"
                                    className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
                                />
                                {message.trim() ? (
                                    <button className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors">
                                        <Send size={20} />
                                    </button>
                                ) : (
                                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                        <Mic size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 z-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Image size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-2">Whatsme Web</h3>
                        <p className="text-sm text-gray-500">Selecciona un chat para comenzar a enviar mensajes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
