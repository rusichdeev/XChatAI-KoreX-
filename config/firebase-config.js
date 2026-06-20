// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAcLADBGoNsFjZe5QMXUscE7JUt9IchMK0",
    authDomain: "korex-team.firebaseapp.com",
    databaseURL: "https://korex-team-default-rtdb.firebaseio.com",
    projectId: "korex-team",
    storageBucket: "korex-team.firebasestorage.app",
    messagingSenderId: "772446140389",
    appId: "1:772446140389:web:75e9154d2c09d9fb19210c"
};

// Правила базы данных (для справки)
/*
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "messages": {
          "$messageId": {
            ".validate": "newData.hasChildren(['text', 'sender', 'timestamp'])",
            "text": { ".validate": "newData.isString() && newData.val().length > 0" },
            "sender": { ".validate": "newData.isString()" },
            "timestamp": { ".validate": "newData.isNumber()" }
          }
        }
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
*/
