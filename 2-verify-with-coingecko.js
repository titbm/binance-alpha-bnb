// Шаг 2: Проверка через CoinGecko API - есть ли токены только на BNB Chain
// Запуск: node 2-verify-with-coingecko.js COINGECKO_API_KEY CMC_API_KEY

import https from 'https';
import fs from 'fs';

const COINGECKO_API_KEY = process.argv[2];
const CMC_API_KEY = process.argv[3];

if (!COINGECKO_API_KEY || !CMC_API_KEY) {
  console.error('❌ Укажите оба API ключа: node 2-verify-with-coingecko.js COINGECKO_KEY CMC_KEY');
  process.exit(1);
}

// Читаем данные из первого шага
if (!fs.existsSync('binance-alpha-bnb.json')) {
  console.error('❌ Файл binance-alpha-bnb.json не найден!');
  console.error('Сначала запустите: node 1-get-binance-alpha-bnb.js YOUR_API_KEY');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync('binance-alpha-bnb.json', 'utf-8'));
const tokens = data.tokens;

console.log('🔍 Проверяем токены через CoinGecko API...\n');
console.log('Всего токенов для проверки:', tokens.length);
console.log('Это займет некоторое время (CoinGecko имеет rate limit)...\n');

let checkedCount = 0;
let bnbOnlyTokens = [];
let multiChainTokens = [];
let notFoundTokens = [];

// Функция для получения детальной информации из CMC API v2
function getCMCTokenInfo(slug) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pro-api.coinmarketcap.com',
      path: `/v2/cryptocurrency/info?slug=${slug}`,
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
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
          if (json.data) {
            const coinData = Object.values(json.data)[0];
            resolve(coinData);
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

// Функция для поиска токена на CoinGecko по контракт адресу
function checkTokenOnCoinGecko(token) {
  return new Promise((resolve) => {
    const contractAddress = token.platform.token_address;
    
    // Используем CoinGecko API для получения информации о токене по контракт адресу
    const options = {
      hostname: 'api.coingecko.com',
      path: `/api/v3/coins/binance-smart-chain/contract/${contractAddress}?x_cg_demo_api_key=${COINGECKO_API_KEY}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-cg-demo-api-key': COINGECKO_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        checkedCount++;
        
        try {
          if (res.statusCode === 404) {
            console.log(`❓ [${checkedCount}/${tokens.length}] ${token.symbol} - Не найден на CoinGecko`);
            notFoundTokens.push(token);
            resolve();
            return;
          }

          const coinData = JSON.parse(responseData);
          
          // Получаем все платформы с непустыми адресами контрактов
          const platforms = coinData.platforms || {};
          const platformNames = Object.keys(platforms).filter(p => {
            // Фильтруем только платформы с реальными контрактными адресами
            const address = platforms[p];
            return address && address !== '' && address.length > 0;
          });
          
          if (platformNames.length === 0) {
            console.log(`❓ [${checkedCount}/${tokens.length}] ${token.symbol} - Нет данных о платформах`);
            notFoundTokens.push(token);
          } else if (platformNames.length === 1 && 
                     (platformNames[0].includes('binance') || 
                      platformNames[0].includes('bsc') || 
                      platformNames[0] === 'binance-smart-chain')) {
            // CoinGecko показывает только BNB Chain
            // Теперь проверяем детальную информацию из CMC API v2
            console.log(`   └─ CoinGecko: ${platformNames[0]} ✅`);
            console.log(`   └─ Запрашиваем детальную информацию из CMC...`);
            
            // Получаем детальную информацию из CMC
            getCMCTokenInfo(token.slug).then(cmcData => {
              if (!cmcData) {
                console.log(`   └─ CMC: Не удалось получить данные`);
                multiChainTokens.push({
                  ...token,
                  coingecko_id: coinData.id,
                  platforms: platformNames,
                  platformCount: platformNames.length,
                  platform_addresses: platforms,
                  reason: 'CMC data unavailable'
                });
                console.log(`⚠️  [${checkedCount}/${tokens.length}] ${token.symbol} - Мульти (нет данных CMC)`);
                resolve();
                return;
              }

              // Проверяем массив contract_address
              const contractAddresses = Array.isArray(cmcData.contract_address) 
                ? cmcData.contract_address 
                : [cmcData.contract_address];
              
              const cmcPlatforms = contractAddresses
                .filter(ca => ca && ca.platform)
                .map(ca => ({
                  id: ca.platform.coin?.id,
                  name: ca.platform.name
                }));

              console.log(`   └─ CMC платформы: ${cmcPlatforms.map(p => `${p.name} (ID: ${p.id})`).join(', ')}`);

              // Проверяем что ВСЕ платформы в CMC - это только BNB Chain (ID 1839)
              const onlyBNBinCMC = cmcPlatforms.length > 0 && 
                                   cmcPlatforms.every(p => p.id === '1839' || p.id === 1839);

              if (onlyBNBinCMC) {
                bnbOnlyTokens.push({
                  ...token,
                  coingecko_id: coinData.id,
                  platforms: platformNames,
                  platform_addresses: platforms,
                  cmc_platforms: cmcPlatforms
                });
                console.log(`✅ [${checkedCount}/${tokens.length}] ${token.symbol} - ТОЛЬКО BNB (оба источника совпадают)`);
              } else {
                multiChainTokens.push({
                  ...token,
                  coingecko_id: coinData.id,
                  platforms: platformNames,
                  platformCount: platformNames.length,
                  platform_addresses: platforms,
                  cmc_platforms: cmcPlatforms,
                  reason: 'CMC shows multiple chains'
                });
                console.log(`⚠️  [${checkedCount}/${tokens.length}] ${token.symbol} - Мульти (CMC: ${cmcPlatforms.map(p => p.name).join(', ')})`);
              }
              
              resolve();
            }).catch(err => {
              console.log(`   └─ CMC: Ошибка запроса - ${err.message}`);
              multiChainTokens.push({
                ...token,
                coingecko_id: coinData.id,
                platforms: platformNames,
                platformCount: platformNames.length,
                platform_addresses: platforms,
                reason: 'CMC request failed'
              });
              console.log(`⚠️  [${checkedCount}/${tokens.length}] ${token.symbol} - Мульти (ошибка CMC)`);
              resolve();
            });
          } else {
            // Мульти-чейн в CoinGecko
            console.log(`   └─ CoinGecko platforms: ${platformNames.join(', ')}`);
            multiChainTokens.push({
              ...token,
              coingecko_id: coinData.id,
              platforms: platformNames,
              platformCount: platformNames.length,
              platform_addresses: platforms
            });
            console.log(`⚠️  [${checkedCount}/${tokens.length}] ${token.symbol} - Мульти (${platformNames.length} chains в CoinGecko)`);
            resolve();
          }
        } catch (error) {
          console.error(`❌ [${checkedCount}/${tokens.length}] ${token.symbol} - Ошибка парсинга:`, error.message);
          notFoundTokens.push(token);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Ошибка запроса для ${token.symbol}:`, error.message);
      checkedCount++;
      notFoundTokens.push(token);
      resolve();
    });

    req.end();
  });
}

// Проверяем все токены с задержкой (CoinGecko Demo API: 30 запросов/минуту)
async function checkAllTokens() {
  for (let i = 0; i < tokens.length; i++) {
    await checkTokenOnCoinGecko(tokens[i]);
    // Задержка 2 секунды между запросами (30 запросов в минуту для Demo API)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Проверка завершена!\n');
  console.log('📊 РЕЗУЛЬТАТЫ:');
  console.log('─'.repeat(60));
  console.log('Проверено токенов:', checkedCount);
  console.log('Только BNB Chain:', bnbOnlyTokens.length);
  console.log('Мульти-чейн:', multiChainTokens.length);
  console.log('Не найдено на CoinGecko:', notFoundTokens.length);
  console.log('Процент BNB-only:', ((bnbOnlyTokens.length / checkedCount) * 100).toFixed(1) + '%');

  // Сохраняем результаты
  const result = {
    timestamp: new Date().toISOString(),
    total_checked: checkedCount,
    bnb_only_count: bnbOnlyTokens.length,
    multi_chain_count: multiChainTokens.length,
    not_found_count: notFoundTokens.length,
    bnb_only_tokens: bnbOnlyTokens,
    multi_chain_tokens: multiChainTokens,
    not_found_tokens: notFoundTokens
  };

  const filename = 'verified-bnb-only-coingecko.json';
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  console.log('\n💾 Результаты сохранены в:', filename);

  // Выводим список токенов только на BNB
  if (bnbOnlyTokens.length > 0) {
    console.log('\n🎯 ТОКЕНЫ ТОЛЬКО НА BNB CHAIN:');
    console.log('─'.repeat(60));
    bnbOnlyTokens.forEach((token, i) => {
      console.log(`${i + 1}. ${token.name} (${token.symbol})`);
    });
  }
}

checkAllTokens().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
