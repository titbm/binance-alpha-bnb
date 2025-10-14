// Скрипт для автоматического обновления данных
// Запускает оба скрипта последовательно и копирует результат в public

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const CMC_API_KEY = 'ef30cb6d6bd148e6960f80419729df0b';
const COINGECKO_API_KEY = 'CG-dyYHCWcC3Vcvt3PPYPjmmDLf';

console.log('🚀 Начинаем обновление данных...\n');

// Функция для запуска скрипта с выводом в консоль
function runScript(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { 
      cwd: rootDir,
      stdio: 'inherit' // Показываем вывод в реальном времени
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Script exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', reject);
  });
}

async function updateData() {
  try {
    // Шаг 1: Получаем токены Binance Alpha на BNB Chain
    console.log('📥 Шаг 1: Получаем токены Binance Alpha на BNB Chain...\n');
    await runScript('node', ['1-get-binance-alpha-bnb.js', CMC_API_KEY]);
    console.log('\n✅ Токены получены\n');

    // Шаг 2: Проверяем через CoinGecko API и CMC API v2
    console.log('🔍 Шаг 2: Проверяем токены через CoinGecko и CMC API...');
    console.log('   Это займет около 5 минут...\n');
    await runScript('node', ['2-verify-with-coingecko.js', COINGECKO_API_KEY, CMC_API_KEY]);
    console.log('\n✅ Проверка завершена\n');

    // Шаг 3: Копируем результат в public для веб-приложения
    console.log('📋 Шаг 3: Копируем данные...');
    const sourceFile = path.join(rootDir, 'verified-bnb-only-coingecko.json');
    const publicDir = path.join(rootDir, 'public');
    
    // Создаем папку public если её нет
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const destFile = path.join(publicDir, 'verified-bnb-only-coingecko.json');
    fs.copyFileSync(sourceFile, destFile);
    console.log('✅ Данные скопированы в public/\n');

    console.log('🎉 Обновление данных завершено успешно!');
    console.log(`📊 Результаты сохранены в: ${destFile}`);

  } catch (error) {
    console.error('❌ Ошибка при обновлении данных:', error.message);
    process.exit(1);
  }
}

updateData();
