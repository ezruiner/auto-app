# Настройка хостинга для React SPA приложения

При размещении приложения на хостинге, при перезагрузке страницы на маршрутах `/records`, `/admin` и др. может появиться ошибка "Not found". Это происходит потому, что сервер ищет реальный файл вместо перенаправления на `index.html`.

## Быстрое решение (если у вас Apache)

Убедитесь, что в папке, куда загружен сайт, находится файл `.htaccess` из папки `public/` проекта. При запуске `npm run build` этот файл автоматически копируется в папку `build/`, и вы загружаете весь контент из `build/` на сервер.

**Если все еще не работает:**
1. Логируйтесь в панель управления хостингом
2. Проверьте, что модуль `mod_rewrite` включен
3. Убедитесь, что разрешены файлы `.htaccess`

## Шаг за шагом

### 1. Пересборка приложения

```bash
npm run build
```

### 2. Загрузка на хостинг

Загрузите **только содержимое** папки `build/` на корень вашего сайта (или в подпапку).

### 3. Выбор конфигурации по типу хостинга

#### Apache (самый распространенный) ✅ ГОТОВО
Файл `.htaccess` уже есть в `public/` и скопируется в `build/`. Этого обычно достаточно.

Если не работает, отредактируйте `.htaccess` на сервере или попросите у хостера включить `mod_rewrite`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx
Если у вас Nginx (обычно на хостингах с Node.js), попросите хостера добавить эту конфигурацию:

```nginx
location / {
  try_files $uri /index.html;
}
```

Или сам добавьте в конфиг (если есть доступ):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/your-app/build;
    
    location / {
        try_files $uri /index.html;
    }
}
```

#### Vercel / Netlify ✅ ГОТОВО
Файл `_redirects` уже создан в `public/` и будет работать автоматически.

#### GitHub Pages
Добавьте в `package.json` (замените `USERNAME` и `REPO`):

```json
"homepage": "https://USERNAME.github.io/REPO"
```

Затем пересоберите и загрузите.

#### Heroku / Node.js хостинги
Убедитесь, что сервер перенаправляет неизвестные маршруты:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(process.env.PORT || 5000);
```

#### Другие хостинги
Поищите в документации хостера строку вроде "SPA routing", "single page application", "client-side routing" или обратитесь в поддержку.

## 4. Проверка

1. Откройте приложение по основной ссылке
2. Перейдите на `/records` или `/admin`
3. Обновите страницу (F5 или Ctrl+R)
4. Если приложение загрузилось — ✅ все работает!

## Если все еще не работает

1. Откройте консоль браузера (F12 → Console)
2. Проверьте, какие ошибки там отображаются
3. Убедитесь, что файлы загружены правильно (смотрите в Network → index.html)
4. Свяжитесь с поддержкой хостера и скажите: "Нужно настроить SPA routing для React приложения"

## Где мой хостинг?

Если не знаете, какой тип хостинга используете:
- **Vercel, Netlify, GitHub Pages, Heroku** — используют их встроенные системы
- **Боль­шинство других** — Apache (обычно это виртуальный хостинг в России: Beget, Reg.ru, Hostinger, 1С-Битрикс и т.д.)
- **VPS / Dedicated** — может быть Nginx или Apache (смотрите документацию)


