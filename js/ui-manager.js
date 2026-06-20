// Менеджер UI
class UIManager {
    constructor() {
        this.chatList = document.getElementById('chatList');
        this.chatWindow = document.getElementById('chatWindow');
        this.messagesArea = document.getElementById('messagesArea');
        this.chatUserName = document.getElementById('chatUserName');
        this.msgInput = document.getElementById('msgInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.backBtn = document.getElementById('backBtn');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        
        this.currentChatId = 'general';
        this.isDarkTheme = true;
        this.notifications = true;
        
        this.bindEvents();
    }

    // Привязка событий
    bindEvents() {
        // Отправка сообщения
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.msgInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Назад
        this.backBtn.addEventListener('click', () => this.closeChat());

        // Модалка
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modalConfirm').addEventListener('click', () => this.createChatFromModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });

        // Плавающая кнопка
        document.getElementById('addChatBtn').addEventListener('click', () => this.openModal());

        // Настройки
        document.getElementById('navSettings').addEventListener('click', () => this.toggleSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.toggleSettings());
        this.settingsOverlay.addEventListener('click', () => this.toggleSettings());

        // Тема
        document.getElementById('themeSwitch').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTheme();
        });

        // Уведомления
        document.getElementById('notifSwitch').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotifications();
        });

        // Очистка чатов
        document.getElementById('clearChats').addEventListener('click', () => {
            if (confirm('Очистить все чаты?')) {
                chatManager.clearLocalChats();
                this.clearChatList();
                this.toggleSettings();
            }
        });

        // О KoreX
        document.getElementById('aboutKorex').addEventListener('click', () => {
            alert('KoreX v2.0\nЗащищённый мессенджер\nС Firebase интеграцией\n\nСделано с ❤️');
            this.toggleSettings();
        });

        // Выход
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Выйти из аккаунта?')) {
                auth.signOut().then(() => {
                    alert('Вы вышли из KoreX');
                    this.toggleSettings();
                });
            }
        });

        // Навигация
        document.querySelectorAll('.bottom-nav i').forEach(el => {
            el.addEventListener('click', function() {
                const nav = this.closest('.bottom-nav');
                if (nav) {
                    nav.querySelectorAll('i').forEach(icon => icon.classList.remove('active'));
                }
                this.classList.add('active');
                if (document.getElementById('chatWindow').classList.contains('active')) {
                    document.getElementById('chatWindow').classList.remove('active');
                }
            });
        });

        // Поиск и меню
        document.getElementById('searchBtn').addEventListener('click', () => this.closeChat());
        document.getElementById('menuBtn').addEventListener('click', () => this.closeChat());
        document.getElementById('avatarBtn').addEventListener('click', () => this.closeChat());
    }

    // Открыть чат
    openChat(chatId, chatName, isGroup = false) {
        this.currentChatId = chatId;
        const icon = isGroup ? '<i class="fas fa-users" style="font-size: 14px; color: #3f8cff; margin-left: 6px;"></i>' : 
                               '<i class="fas fa-circle" style="font-size: 12px; color: #4cd964; margin-left: 6px;"></i>';
        this.chatUserName.innerHTML = chatName + ' ' + icon;
        
        // Очищаем сообщения
        this.messagesArea.innerHTML = `<div class="message system">📢 Начало чата "${chatName}"</div>`;
        
        // Подписываемся на чат
        chatManager.subscribeToChat(chatId);
        
        this.chatWindow.classList.add('active');
    }

    // Закрыть чат
    closeChat() {
        this.chatWindow.classList.remove('active');
        if (this.currentChatId) {
            chatManager.unsubscribeFromChat(this.currentChatId);
        }
    }

    // Отправить сообщение
    sendMessage() {
        const text = this.msgInput.value.trim();
        if (!text || !this.currentChatId) return;
        
        chatManager.sendMessage(this.currentChatId, text);
        this.msgInput.value = '';
    }

    // Добавить сообщение в UI
    addMessage(chatId, message) {
        if (chatId !== this.currentChatId) {
            // Обновляем превью в списке
            this.updateChatPreview(chatId, message.text);
            return;
        }

        const isOut = message.sender === auth.currentUser?.uid;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isOut ? 'out' : ''}`;
        
        const time = new Date(message.timestamp);
        const timeStr = time.getHours().toString().padStart(2,'0') + ':' + 
                       time.getMinutes().toString().padStart(2,'0');
        
        msgDiv.innerHTML = message.text + `<div class="time">${timeStr}</div>`;
        this.messagesArea.appendChild(msgDiv);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    // Обновить превью чата в списке
    updateChatPreview(chatId, text) {
        const chatItem = this.chatList.querySelector(`[data-chat="${chatId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector('.msg-text');
            if (preview) {
                preview.textContent = text.length > 30 ? text.substring(0, 30) + '...' : text;
            }
        }
    }

    // Добавить чат в список
    addChatToList(chatId, chatData) {
        const isGroup = chatData.type === 'group';
        const icon = isGroup ? '<i class="fas fa-users"></i>' : '<i class="fas fa-user"></i>';
        const avatarClass = isGroup ? 'channel' : 'c1';
        
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.dataset.chat = chatId;
        item.innerHTML = `
            <div class="chat-avatar ${avatarClass}">${icon}</div>
            <div class="chat-info">
                <div class="chat-name"><span>${chatData.name}</span><span>${new Date(chatData.createdAt).toLocaleDateString()}</span></div>
                <div class="chat-preview"><span class="msg-text">Напишите первое сообщение</span></div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.openChat(chatId, chatData.name, isGroup);
        });
        
        this.chatList.appendChild(item);
    }

    // Очистить список чатов (кроме общего)
    clearChatList() {
        const items = this.chatList.querySelectorAll('.chat-item');
        items.forEach(item => {
            if (item.dataset.chat !== 'general') {
                item.remove();
            }
        });
    }

    // Модальное окно
    openModal() {
        this.modalOverlay.classList.add('active');
        document.getElementById('newChatName').value = '';
        document.getElementById('newChatName').focus();
    }

    closeModal() {
        this.modalOverlay.classList.remove('active');
    }

    createChatFromModal() {
        const name = document.getElementById('newChatName').value.trim();
        const type = document.getElementById('chatTypeSelect').value;
        
        if (!name) {
            const input = document.getElementById('newChatName');
            input.style.border = '1px solid #e47a4a';
            setTimeout(() => input.style.border = 'none', 1000);
            return;
        }
        
        chatManager.createChat(name, type);
        this.closeModal();
    }

    // Настройки
    toggleSettings() {
        this.settingsPanel.classList.toggle('active');
        this.settingsOverlay.classList.toggle('active');
    }

    // Тема
    toggleTheme() {
        const toggle = document.getElementById('themeSwitch');
        toggle.classList.toggle('active');
        this.isDarkTheme = toggle.classList.contains('active');
        
        const bg = this.isDarkTheme ? '#17212b' : '#e8edf2';
        const fg = this.isDarkTheme ? '#f0f5fa' : '#1e2b36';
        
        document.querySelector('.phone').style.background = bg;
        document.querySelectorAll('.header, .chat-window-header, .chat-input-area, .bottom-nav, .chat-list, .messages-area, .chat-window')
            .forEach(el => { el.style.background = bg; });
        document.querySelectorAll('.chat-item, .chat-info, .chat-name, .chat-preview, .message, .chat-user, .header-status, .header-actions')
            .forEach(el => { el.style.color = fg; });
    }

    // Уведомления
    toggleNotifications() {
        const toggle = document.getElementById('notifSwitch');
        toggle.classList.toggle('active');
        this.notifications = toggle.classList.contains('active');
    }

    // Обновить общий чат
    updateGeneralChat(message) {
        const preview = document.getElementById('generalPreview');
        if (preview) {
            preview.textContent = message.length > 30 ? message.substring(0, 30) + '...' : message;
        }
        const time = document.getElementById('generalTime');
        if (time) {
            time.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        // Увеличиваем счётчик непрочитанных
        const badge = document.getElementById('generalBadge');
        if (badge) {
            const count = parseInt(badge.textContent) || 0;
            badge.textContent = count + 1;
        }
    }
}

// Создаём экземпляр UI
const uiManager = new UIManager();
