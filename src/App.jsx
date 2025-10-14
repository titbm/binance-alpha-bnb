import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'cmc_rank', direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    loadData()
    // Проверка обновления файла каждую минуту
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/verified-bnb-only-coingecko.json')
      const data = await response.json()
      setTokens(data.bnb_only_tokens)
      setLastUpdate(new Date(data.timestamp))
      setLoading(false)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
      setLoading(false)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Фильтрация по поиску
  const filteredTokens = tokens.filter(token => {
    const query = searchQuery.toLowerCase()
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query)
    )
  })

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    // Для вложенных значений (например, quote.USD.price)
    if (sortConfig.key === 'price') {
      aValue = a.quote?.USD?.price || 0
      bValue = b.quote?.USD?.price || 0
    } else if (sortConfig.key === 'change_24h') {
      aValue = a.quote?.USD?.percent_change_24h || 0
      bValue = b.quote?.USD?.percent_change_24h || 0
    } else if (sortConfig.key === 'volume_24h') {
      aValue = a.quote?.USD?.volume_24h || 0
      bValue = b.quote?.USD?.volume_24h || 0
    } else if (sortConfig.key === 'market_cap') {
      aValue = a.quote?.USD?.market_cap || a.quote?.USD?.fully_diluted_market_cap || 0
      bValue = b.quote?.USD?.market_cap || b.quote?.USD?.fully_diluted_market_cap || 0
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.00'
    if (price < 0.00000001) return `$${price.toFixed(12)}`
    if (price < 0.0001) return `$${price.toFixed(10)}`
    if (price < 0.01) return `$${price.toFixed(8)}`
    if (price < 1) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatNumber = (num, fallback = null) => {
    const value = num || fallback
    if (!value || value === 0) return 'N/A'
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (percent) => {
    if (!percent) return '0%'
    const formatted = Math.abs(percent).toFixed(2)
    return percent >= 0 ? `↗${formatted}%` : `↘${formatted}%`
  }

  // Drag to scroll handlers
  const handleMouseDown = (e) => {
    const container = e.currentTarget
    setIsDragging(true)
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
    container.style.cursor = 'grabbing'
  }

  const handleMouseLeave = (e) => {
    setIsDragging(false)
    e.currentTarget.style.cursor = 'grab'
  }

  const handleMouseUp = (e) => {
    setIsDragging(false)
    e.currentTarget.style.cursor = 'grab'
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const container = e.currentTarget
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 2 // Скорость скролла
    container.scrollLeft = scrollLeft - walk
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="header-top">
          <div className="logo-section">
            <div className="bnb-logo">⬢</div>
            <div>
              <h1 className="title">Binance Alpha BNB Chain</h1>
              <p className="subtitle">Tracking {tokens.length} tokens</p>
            </div>
          </div>
          <div className="header-actions">
            {lastUpdate && (
              <div className="update-time">
                Updated {Math.floor((new Date() - lastUpdate) / 60000)}m ago
              </div>
            )}
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="controls">
          <div className="search-container">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <button className="reset-btn" onClick={() => setSearchQuery('')}>
              Reset Filters
            </button>
          )}
        </div>
      </header>

      <div 
        className="table-container"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <table className="token-table">
          <thead>
            <tr>
              <th className="th-number">#</th>
              <th className="th-token" onClick={() => handleSort('name')}>
                <div className="th-content">
                  Token {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                </div>
              </th>
              <th className="th-right" onClick={() => handleSort('price')}>
                <div className="th-content">
                  Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                </div>
              </th>
              <th className="th-right" onClick={() => handleSort('change_24h')}>
                <div className="th-content">
                  24h Change {sortConfig.key === 'change_24h' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                </div>
              </th>
              <th className="th-right" onClick={() => handleSort('volume_24h')}>
                <div className="th-content">
                  24h Volume {sortConfig.key === 'volume_24h' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                </div>
              </th>
              <th className="th-right" onClick={() => handleSort('market_cap')}>
                <div className="th-content">
                  Market Cap {sortConfig.key === 'market_cap' && (sortConfig.direction === 'asc' ? '↓' : '↑')}
                </div>
              </th>
              <th className="th-link">
                <div className="th-content">
                  Link
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token, index) => {
              const change24h = token.quote?.USD?.percent_change_24h || 0
              const isPositive = change24h >= 0

              return (
                <tr key={token.id} className="token-row">
                  <td className="td-number">{index + 1}</td>
                  <td className="td-token">
                    <div className="token-info">
                      <div>
                        <div className="token-name">{token.name}</div>
                        <div className="token-symbol">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-right">
                    {formatPrice(token.quote?.USD?.price)}
                  </td>
                  <td className={`td-right ${isPositive ? 'positive' : 'negative'}`}>
                    {formatPercent(change24h)}
                  </td>
                  <td className="td-right">
                    {formatNumber(token.quote?.USD?.volume_24h)}
                  </td>
                  <td className="td-right">
                    {formatNumber(token.quote?.USD?.market_cap, token.quote?.USD?.fully_diluted_market_cap)}
                  </td>
                  <td className="td-link">
                    <a 
                      href={`https://coinmarketcap.com/currencies/${token.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cmc-link"
                    >
                      CMC ↗
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
