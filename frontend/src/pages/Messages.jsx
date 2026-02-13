import React, { useState, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Image, Mic } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Messages() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch Accounts on Mount
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
                const allAccounts = response.documents;
                const ADMIN_EMAIL = 'gucci7up@gmail.com';

                const myAccounts = allAccounts.filter(acc => {
                    if (user?.email === ADMIN_EMAIL) return true;
                    if (acc.user_email === user?.email) return true;
                    // Legacy handling: if no user_email, only admin sees it (handled by first check), 
                    // or if we want legacy accessible by creator (but we don't track creator in legacy), so strict filter.
                    return false;
                });

                setAccounts(myAccounts);
                if (myAccounts.length > 0) {
                    // Prefer connected account
                    const connected = myAccounts.find(a => a.status === 'connected');
                    setSelectedAccount(connected || myAccounts[0]);
                }
            } catch (error) {
                console.error('Error fetching accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAccounts();
    }, [user]);

    // Fetch Chats when Account Changes
    useEffect(() => {
        if (selectedAccount && selectedAccount.status === 'connected') {
            fetchChats(selectedAccount.$id);
        } else {
            setChats([]);
        }
    }, [selectedAccount]);

    // Poll Messages when Chat is Selected
    useEffect(() => {
        let interval;
        if (selectedAccount && selectedChat) {
            // Initial fetch
            fetchMessages(selectedAccount.$id, selectedChat.id);
            // Poll every 3 seconds
            interval = setInterval(() => {
                fetchMessages(selectedAccount.$id, selectedChat.id, true); // true = silent loading
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedChat, selectedAccount]);

    const fetchChats = async (accountId) => {
        setLoadingChats(true);
        try {
            // Using the endpoint assumed from context
            const res = await axios.post('https://api.losmuchachos.es/get-chats', { accountId });
            // API returns array of { id, name, unreadCount, lastMessage (timestamp) }
            const mappedChats = res.data.map(chat => ({
                id: chat.id, // Baileys returns JID string directly
                name: chat.name || chat.id.split('@')[0],
                lastMessage: chat.lastMessage ? 'Start thinking for yourself...' : '', // Baileys store simple chat object doesn't have msg content by default, implies fetching
                time: chat.lastMessage ? new Date(chat.lastMessage * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: chat.unreadCount,
                avatar: `https://ui-avatars.com/api/?name=${chat.name || 'User'}&background=random`
            }));
            setChats(mappedChats);
        } catch (error) {
            console.error('Error fetching chats:', error);
            // Fallback for demo if API fails
            // setChats([]); 
        } finally {
            setLoadingChats(false);
        }
    };

    const fetchMessages = async (accountId, chatId, silent = false) => {
        if (!silent) setLoadingMessages(true);
        try {
            const res = await axios.post('https://api.losmuchachos.es/get-messages', {
                accountId,
                chatId,
                limit: 50
            });
            const mappedMessages = res.data.map(msg => ({
                id: msg.id,
                text: msg.body,
                sender: msg.fromMe ? 'me' : 'other',
                time: new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            // Only update if different? For now just set.
            // Check if we have new messages to avoid cursor jump? 
            // Simple set for now.
            setMessages(mappedMessages.reverse());
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedAccount || !selectedChat) return;

        try {
            await axios.post('https://api.losmuchachos.es/send-message', {
                accountId: selectedAccount.$id,
                recipient: selectedChat.id.replace('@c.us', ''), // API likely expects number
                content: messageInput
            });

            // Optimistic update
            setMessages(prev => [...prev, {
                id: Date.now(), // Temp ID
                text: messageInput,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setMessageInput('');
        } catch (error) {
            alert('Error al enviar mensaje');
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuentas...</div>;

    if (accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <p className="text-xl mb-4">No tienes cuentas de WhatsApp configuradas.</p>
                <p>Ve al Dashboard para conectar una cuenta.</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar: Accounts & Chat List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                {/* Account Selector */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">CUENTA ACTIVA</label>
                    <div className="relative">
                        <select
                            value={selectedAccount?.$id || ''}
                            onChange={(e) => setSelectedAccount(accounts.find(a => a.$id === e.target.value))}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                        >
                            {accounts.map(acc => (
                                <option key={acc.$id} value={acc.$id}>
                                    {acc.client_name} ({acc.phone_number || 'Sin número'})
                                </option>
                            ))}
                        </select>
                        <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selectedAccount?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} title={selectedAccount?.status}></div>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingChats ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Cargando chats...</div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">
                            {selectedAccount?.status === 'connected' ? 'No hay chats recientes.' : 'Cuenta desconectada.'}
                        </div>
                    ) : (
                        chats.map(chat => (
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
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-[#efeae2] relative">
                {/* Background */}
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
                                        {selectedAccount?.status === 'connected' && <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>}
                                        {selectedAccount?.status === 'connected' ? 'Conectado' : 'Desconectado'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                                <Search size={20} className="hidden sm:block cursor-pointer hover:text-gray-700" />
                                <Phone size={20} className="hidden sm:block cursor-pointer hover:text-gray-700" />
                                <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" />
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-0 flex flex-col-reverse"> {/* Reverse column for bottom-up scroll usually, but here handling standard mapping order reverse? check implementation */}
                            {/* Wait, I reversed the array in fetch, so mapping them renders top-to-bottom as oldest-to-newest? 
                                Typically chat is bottom-up. 
                                Let's stick to standard flow: Map renders top-down. 
                                If `messages` has [oldest, ..., newest], then last element is at bottom.
                                Scrolling should default to bottom.
                             */}
                            {loadingMessages ? (
                                <div className="text-center py-10"><span className="text-gray-500">Cargando mensajes...</span></div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 shadow-sm ${msg.sender === 'me'
                                            ? 'bg-green-100 text-gray-800 rounded-tr-none'
                                            : 'bg-white text-gray-800 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <span className="text-[10px] text-gray-500 block text-right mt-1">{msg.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-3 border-t border-gray-200 z-10 sticky bottom-0">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                    <Image size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Escribe un mensaje"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
                                />
                                {messageInput.trim() ? (
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                                    >
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
