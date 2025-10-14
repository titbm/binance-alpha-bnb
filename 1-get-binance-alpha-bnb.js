// Шаг 1: Получить все токены Binance Alpha, которые есть на BNB Chain
// Запуск: node 1-get-binance-alpha-bnb.js CMC_API_KEY

import https from 'https';
import fs from 'fs';

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('❌ Укажите CMC API ключ: node 1-get-binance-alpha-bnb.js YOUR_API_KEY');
  process.exit(1);
}

const BINANCE_ALPHA_CATEGORY_ID = '6762acaeb5d1b043d3342f44';

console.log('🔍 Получаем токены Binance Alpha...\n');

const options = {
  hostname: 'pro-api.coinmarketcap.com',
  path: `/v1/cryptocurrency/category?id=${BINANCE_ALPHA_CATEGORY_ID}&limit=500`,
  method: 'GET',
  headers: {
    'X-CMC_PRO_API_KEY': API_KEY,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (!json.data || !json.data.coins) {
        console.error('❌ Ошибка: неожиданный формат ответа');
        console.error(json);
        process.exit(1);
      }

      const allTokens = json.data.coins;
      
      // Фильтруем только токены на BNB Chain (platform id = 1839)
      const bnbTokens = allTokens.filter(token => {
        return token.platform && token.platform.id === 1839;
      });

      console.log('✅ Всего токенов Binance Alpha:', allTokens.length);
      console.log('✅ Токенов на BNB Chain:', bnbTokens.length);
      console.log('');

      // Сохраняем результат
      const result = {
        timestamp: new Date().toISOString(),
        total_binance_alpha: allTokens.length,
        bnb_chain_count: bnbTokens.length,
        tokens: bnbTokens
      };

      const filename = 'binance-alpha-bnb.json';
      fs.writeFileSync(filename, JSON.stringify(result, null, 2));
      
      console.log('💾 Сохранено в:', filename);
      console.log('');
      console.log('📋 Первые 10 токенов:');
      console.log('─'.repeat(60));
      bnbTokens.slice(0, 10).forEach((token, i) => {
        console.log(`${i + 1}. ${token.name} (${token.symbol}) - Rank #${token.cmc_rank || 'N/A'}`);
      });
      
      if (bnbTokens.length > 10) {
        console.log(`... и еще ${bnbTokens.length - 10} токенов`);
      }
      
      console.log('');
      console.log('➡️  Теперь запустите: node 2-verify-with-coingecko.js');

    } catch (error) {
      console.error('❌ Ошибка:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка запроса:', error.message);
  process.exit(1);
});

req.end();
