// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const auth = firebase.auth();

// Анонимная авторизация для демо
auth.signInAnonymously()
    .then(() => {
        console.log('✅ Авторизован анонимно');
        updateConnectionStatus(true);
    })
    .catch(error => {
        console.error('❌ Ошибка авторизации:', error);
        updateConnectionStatus(false);
    });

// Отслеживание состояния авторизации
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('👤 Пользователь:', user.uid);
        updateConnectionStatus(true);
    } else {
        console.log('👤 Пользователь не авторизован');
        updateConnectionStatus(false);
    }
});

// Функция обновления статуса подключения
function updateConnectionStatus(isOnline) {
    const statusText = document.getElementById('statusText');
    const statusIcon = document.querySelector('#connectionStatus i');
    if (isOnline) {
        statusText.textContent = 'онлайн';
        statusIcon.style.color = '#4cd964';
    } else {
        statusText.textContent = 'офлайн';
        statusIcon.style.color = '#e47a4a';
    }
}
