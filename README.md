# Binance Alpha Tokens - BNB Chain Only

Веб-приложение для отслеживания токенов из Binance Alpha, которые существуют исключительно на BNB Chain.

## Особенности

- 🔍 Автоматическая проверка токенов через CoinGecko API
- 📊 Отображение цены, изменения за 24ч, объема и Market Cap
- 🔄 Автоматическое обновление данных раз в сутки
- 📱 Адаптивный дизайн
- ⚡ Быстрая сортировка по любому столбцу

## Установка

```bash
npm install
```

## Запуск

### Режим разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
npm run preview
```

## Обновление данных

### Вручную
```bash
npm run update-data
```

### Автоматически (раз в сутки)
Настройте планировщик задач (Task Scheduler в Windows или cron в Linux):

**Windows (Task Scheduler):**
```powershell
# Создать задачу, которая выполняется каждый день в 00:00
schtasks /create /tn "BinanceAlphaUpdate" /tr "cmd /c cd C:\Users\titbm\Desktop\BNBALPHAonBNB && npm run update-data" /sc daily /st 00:00
```

**Linux (crontab):**
```bash
# Добавить в crontab (выполняется каждый день в 00:00)
0 0 * * * cd /path/to/BNBALPHAonBNB && npm run update-data
```

## Структура проекта

```
BNBALPHAonBNB/
├── src/
│   ├── App.jsx              # Главный компонент
│   ├── App.css              # Стили приложения
│   ├── main.jsx             # Точка входа
│   └── index.css            # Глобальные стили
├── scripts/
│   └── update-data.js       # Скрипт обновления данных
├── public/
│   └── verified-bnb-only-coingecko.json  # Данные токенов
├── 1-get-binance-alpha-bnb.js   # Получение токенов из CMC
├── 2-verify-with-coingecko.js   # Проверка через CoinGecko
└── package.json
```

## API ключи

Приложение использует:
- **CoinMarketCap API** - для получения списка Binance Alpha токенов
- **CoinGecko API** - для проверки платформ каждого токена

Ключи хранятся в `scripts/update-data.js`

## Технологии

- React 18
- Vite
- Node.js
- CoinMarketCap API
- CoinGecko API

---

## 🚀 Деплой на Vercel + GitHub Actions

### Шаг 1: Создать репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Создайте новый репозиторий (например, `binance-alpha-bnb`)
3. **НЕ** инициализируйте с README/gitignore

### Шаг 2: Загрузить код в GitHub

```bash
cd C:\Users\titbm\Desktop\BNBALPHAonBNB
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/binance-alpha-bnb.git
git push -u origin main
```

### Шаг 3: Добавить API ключи в GitHub Secrets

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и добавьте:
   - Имя: `CMC_API_KEY`
   - Значение: `ef30cb6d6bd148e6960f80419729df0b`
4. Еще раз **New repository secret**:
   - Имя: `COINGECKO_API_KEY`
   - Значение: `CG-dyYHCWcC3Vcvt3PPYPjmmDLf`

### Шаг 4: Деплой на Vercel

1. Перейдите на https://vercel.com/
2. Войдите через GitHub
3. Нажмите **Add New** → **Project**
4. Выберите ваш репозиторий `binance-alpha-bnb`
5. Нажмите **Deploy**

**Готово!** 🎉

### Как это работает:

1. **GitHub Actions** автоматически запускает скрипты каждый день в 00:00 UTC
2. Скрипты обновляют файл `public/verified-bnb-only-coingecko.json`
3. GitHub Actions делает коммит с новыми данными
4. Vercel автоматически пересобирает и деплоит сайт
5. Ваше приложение всегда показывает актуальные данные!

### Ручной запуск обновления:

1. Откройте репозиторий на GitHub
2. Перейдите в **Actions**
3. Выберите **Update Token Data**
4. Нажмите **Run workflow**

### URL вашего приложения:

После деплоя Vercel даст вам URL вида:
- `https://binance-alpha-bnb.vercel.app`

### Мониторинг:

- **GitHub Actions**: Смотрите логи обновлений в разделе Actions
- **Vercel Dashboard**: Отслеживайте деплои и аналитику
