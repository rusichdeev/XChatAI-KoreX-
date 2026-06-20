// Главное приложение
class App {
    constructor() {
        this.initialize();
    }

    async initialize() {
        console.log('🚀 Запуск KoreX...');
        
        // Ожидаем авторизацию
        await this.waitForAuth();
        
        // Загружаем чаты
        await this.loadChats();
        
        // Инициализируем общий чат
        chatManager.initGeneralChat();
        
        // Настраиваем колбэки
        chatManager.setCallbacks(
            (chatId, message) => this.onNewMessage(chatId, message),
            (chatId, chatData) => this.onNewChat(chatId, chatData)
        );
        
        console.log('✅ KoreX готов к работе!');
    }

    waitForAuth() {
        return new Promise((resolve) => {
            if (auth.currentUser) {
                resolve();
            } else {
                auth.onAuthStateChanged(user => {
                    if (user) resolve();
                });
            }
        });
    }

    async loadChats() {
        try {
            const chats = await chatManager.getChats();
            if (chats) {
                for (let [chatId, chatData] of Object.entries(chats)) {
                    if (chatId !== 'general') {
                        uiManager.addChatToList(chatId, chatData);
                    }
                }
            }
            console.log('📋 Чаты загружены');
        } catch (error) {
            console.error('❌ Ошибка загрузки чатов:', error);
        }
    }

    onNewMessage(chatId, message) {
        uiManager.addMessage(chatId, message);
        
        // Если это общий чат, обновляем превью
        if (chatId === 'general') {
            uiManager.updateGeneralChat(message.text);
        }
    }

    onNewChat(chatId, chatData) {
        uiManager.addChatToList(chatId, chatData);
    }
}

// Запускаем приложение
const app = new App();
