# 🚀 Быстрый гайд по деплою

## Что вам нужно:
- Аккаунт на GitHub (бесплатно)
- Аккаунт на Vercel (бесплатно, можно войти через GitHub)

---

## 📋 Пошаговая инструкция

### 1️⃣ Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. Repository name: `binance-alpha-bnb` (или любое другое)
3. **Public** или **Private** - на ваш выбор
4. **НЕ ставьте галочки** на "Add a README" и т.д.
5. Нажмите **Create repository**

### 2️⃣ Загрузите код (выполните в PowerShell)

```powershell
cd C:\Users\titbm\Desktop\BNBALPHAonBNB

# Инициализируем git
git init
git add .
git commit -m "Initial commit: Binance Alpha BNB Chain tracker"

# Подключаем к GitHub (ЗАМЕНИТЕ ВАШ_USERNAME на ваш логин!)
git remote add origin https://github.com/ВАШ_USERNAME/binance-alpha-bnb.git
git branch -M main
git push -u origin main
```

💡 **Если Git попросит авторизацию:**
- Используйте Personal Access Token (GitHub → Settings → Developer settings → Personal access tokens)

### 3️⃣ Добавьте API ключи в GitHub

1. Откройте ваш репозиторий на GitHub
2. **Settings** (справа вверху) → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**

**Добавьте первый секрет:**
- Name: `CMC_API_KEY`
- Secret: `ef30cb6d6bd148e6960f80419729df0b`
- **Add secret**

**Добавьте второй секрет:**
- Name: `COINGECKO_API_KEY`
- Secret: `CG-dyYHCWcC3Vcvt3PPYPjmmDLf`
- **Add secret**

### 4️⃣ Задеплойте на Vercel

1. Откройте https://vercel.com/
2. Нажмите **Continue with GitHub**
3. Авторизуйтесь
4. Нажмите **Add New...** → **Project**
5. Найдите репозиторий `binance-alpha-bnb`
6. Нажмите **Import**
7. **Deploy** (оставьте все настройки по умолчанию)

⏳ Подождите 1-2 минуты...

### 5️⃣ Готово! 🎉

Vercel покажет вам URL вашего сайта:
```
https://binance-alpha-bnb.vercel.app
```

---

## ⚙️ Что происходит автоматически:

### Каждый день в 00:00 UTC (03:00 МСК):
1. GitHub Actions запускает скрипты
2. Собирает свежие данные из CoinMarketCap
3. Проверяет через CoinGecko (~5 минут)
4. Обновляет файл данных
5. Делает коммит в репозиторий
6. Vercel автоматически пересобирает сайт

### Вы можете:
- ✅ Смотреть логи в GitHub → **Actions**
- ✅ Запускать обновление вручную (Actions → Run workflow)
- ✅ Следить за деплоями в Vercel Dashboard

---

## 🔧 Полезные команды

### Запустить обновление вручную прямо сейчас:
1. GitHub → ваш репозиторий
2. **Actions** → **Update Token Data**
3. **Run workflow** → **Run workflow**

### Локальная разработка:
```bash
npm run dev        # Запустить приложение локально
npm run build      # Собрать для продакшена
npm run update-data # Обновить данные вручную
```

---

## ❓ Частые вопросы

**Q: Как изменить время обновления?**
A: Отредактируйте `.github/workflows/update-data.yml`, строка с `cron`

**Q: Можно ли использовать другой хостинг?**
A: Да! Netlify, Railway, Render - работают аналогично

**Q: Сколько это стоит?**
A: **Бесплатно!** GitHub Actions дает 2000 минут/месяц, Vercel - безлимитный хостинг

**Q: Как посмотреть ошибки?**
A: GitHub → Actions → выберите запуск → смотрите логи

---

## 🆘 Нужна помощь?

Если что-то не работает, проверьте:
1. ✅ API ключи правильно добавлены в GitHub Secrets
2. ✅ Репозиторий публичный или у Vercel есть доступ к приватным
3. ✅ В Actions нет ошибок (красный крестик)
