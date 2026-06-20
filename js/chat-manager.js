// Менеджер чатов
class ChatManager {
    constructor() {
        this.currentChatId = 'general';
        this.chats = {};
        this.messages = {};
        this.listeners = {};
        this.generalChatId = 'general';
    }

    // Инициализация общего чата
    initGeneralChat() {
        const generalRef = database.ref(`chats/${this.generalChatId}`);
        generalRef.once('value', snapshot => {
            if (!snapshot.exists()) {
                // Создаём общий чат
                generalRef.set({
                    name: 'Общий чат',
                    type: 'group',
                    createdAt: Date.now(),
                    createdBy: 'system'
                });
                console.log('✅ Общий чат создан');
            }
        });

        // Подписываемся на сообщения общего чата
        this.subscribeToChat(this.generalChatId);
    }

    // Подписка на чат
    subscribeToChat(chatId) {
        if (this.listeners[chatId]) return;

        const messagesRef = database.ref(`chats/${chatId}/messages`);
        this.listeners[chatId] = messagesRef;

        messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', snapshot => {
            const message = snapshot.val();
            message.id = snapshot.key;
            this.onNewMessage(chatId, message);
        });

        console.log(`📡 Подписан на чат: ${chatId}`);
    }

    // Отписка от чата
    unsubscribeFromChat(chatId) {
        if (this.listeners[chatId]) {
            this.listeners[chatId].off();
            delete this.listeners[chatId];
            console.log(`📡 Отписан от чата: ${chatId}`);
        }
    }

    // Отправка сообщения
    sendMessage(chatId, text) {
        if (!text || !text.trim()) return;

        const user = auth.currentUser;
        if (!user) {
            console.error('❌ Пользователь не авторизован');
            return;
        }

        const message = {
            text: text.trim(),
            sender: user.uid,
            senderName: 'Аноним',
            timestamp: Date.now()
        };

        const messagesRef = database.ref(`chats/${chatId}/messages`);
        messagesRef.push(message)
            .then(() => console.log(`✅ Сообщение отправлено в ${chatId}`))
            .catch(error => console.error('❌ Ошибка отправки:', error));
    }

    // Создание нового чата
    createChat(name, type = 'chat') {
        const user = auth.currentUser;
        if (!user) {
            console.error('❌ Пользователь не авторизован');
            return null;
        }

        const chatRef = database.ref('chats').push();
        const chatId = chatRef.key;
        const chatData = {
            name: name,
            type: type,
            createdAt: Date.now(),
            createdBy: user.uid
        };

        chatRef.set(chatData)
            .then(() => {
                console.log(`✅ Чат создан: ${name} (${chatId})`);
                this.subscribeToChat(chatId);
                this.onChatCreated(chatId, chatData);
            })
            .catch(error => console.error('❌ Ошибка создания чата:', error));

        return chatId;
    }

    // Получение списка чатов
    getChats() {
        return new Promise((resolve, reject) => {
            database.ref('chats').once('value', snapshot => {
                const chats = snapshot.val();
                this.chats = chats || {};
                resolve(this.chats);
            }).catch(reject);
        });
    }

    // Обработчик нового сообщения
    onNewMessage(chatId, message) {
        // Будет переопределён в UI
        if (this._onMessageCallback) {
            this._onMessageCallback(chatId, message);
        }
    }

    // Обработчик создания чата
    onChatCreated(chatId, chatData) {
        if (this._onChatCreatedCallback) {
            this._onChatCreatedCallback(chatId, chatData);
        }
    }

    // Установка колбэков
    setCallbacks(onMessage, onChatCreated) {
        this._onMessageCallback = onMessage;
        this._onChatCreatedCallback = onChatCreated;
    }

    // Очистка чатов (только локальных)
    clearLocalChats() {
        this.chats = {};
        if (this._onClearCallback) {
            this._onClearCallback();
        }
    }
}

// Создаём экземпляр менеджера
const chatManager = new ChatManager();
