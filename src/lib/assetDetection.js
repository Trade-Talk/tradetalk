/**
 * Multi-Asset Symbol Detection and Display
 * Supports: Stocks ($), Crypto (#), Commodities (&), Forex (@), Bonds (^), REITs (%)
 */

import React from 'react'
import InlineStockPill from '../components/market/InlineStockPill'

export const ASSET_TYPES = {
  STOCK: 'stock',
  CRYPTO: 'crypto',
  COMMODITY: 'commodity',
  FOREX: 'forex',
  BOND: 'bond',
  REIT: 'reit'
}

export const ASSET_PREFIXES = {
  [ASSET_TYPES.STOCK]: '$',
  [ASSET_TYPES.CRYPTO]: '#',
  [ASSET_TYPES.COMMODITY]: '&',
  [ASSET_TYPES.FOREX]: '@',
  [ASSET_TYPES.BOND]: '^',
  [ASSET_TYPES.REIT]: '%'
}

/**
 * Extract all asset symbols from text
 * Returns: { stocks: [], crypto: [], commodities: [], forex: [], bonds: [], reits: [] }
 */
export const extractAssets = (text) => {
  if (!text) return { stocks: [], crypto: [], commodities: [], forex: [], bonds: [], reits: [] }

  return {
    stocks: Array.from(new Set((text.match(/\$[A-Z]{1,10}/g) || []).map(s => s.slice(1)))),
    crypto: Array.from(new Set((text.match(/#[A-Z]{2,10}/g) || []).map(s => s.slice(1)))),
    commodities: Array.from(new Set((text.match(/&[A-Z]{3,10}/g) || []).map(s => s.slice(1)))),
    forex: Array.from(new Set((text.match(/@[A-Z]{6}/g) || []).map(s => s.slice(1)))),
    bonds: Array.from(new Set((text.match(/\^[A-Z0-9]{4,10}/g) || []).map(s => s.slice(1)))),
    reits: Array.from(new Set((text.match(/%[A-Z]{4,10}/g) || []).map(s => s.slice(1))))
  }
}

/**
 * Get all symbols regardless of type
 */
export const getAllSymbols = (text) => {
  const assets = extractAssets(text)
  return [
    ...assets.stocks.map(s => ({ type: ASSET_TYPES.STOCK, symbol: s })),
    ...assets.crypto.map(s => ({ type: ASSET_TYPES.CRYPTO, symbol: s })),
    ...assets.commodities.map(s => ({ type: ASSET_TYPES.COMMODITY, symbol: s })),
    ...assets.forex.map(s => ({ type: ASSET_TYPES.FOREX, symbol: s })),
    ...assets.bonds.map(s => ({ type: ASSET_TYPES.BOND, symbol: s })),
    ...assets.reits.map(s => ({ type: ASSET_TYPES.REIT, symbol: s }))
  ]
}

/**
 * Render text with inline asset pills
 * Replaces $SYMBOL, #CRYPTO, etc. with interactive pills
 */
export const renderTextWithAssets = (text, onAssetClick) => {
  if (!text) return null

  const assets = getAllSymbols(text)
  if (assets.length === 0) return text

  // Create regex pattern for all asset types
  const pattern = /(\$[A-Z]{1,10}|#[A-Z]{2,10}|&[A-Z]{3,10}|@[A-Z]{6}|\^[A-Z0-9]{4,10}|%[A-Z]{4,10})/g
  
  const parts = []
  let lastIndex = 0
  let match

  const regex = new RegExp(pattern)
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add asset pill
    const fullSymbol = match[0]
    const prefix = fullSymbol[0]
    const symbol = fullSymbol.slice(1)
    
    // Determine asset type from prefix
    const assetType = Object.keys(ASSET_PREFIXES).find(
      key => ASSET_PREFIXES[key] === prefix
    )

    parts.push(
      <AssetPill
        key={`${symbol}-${match.index}`}
        symbol={symbol}
        type={assetType}
        onClick={() => onAssetClick?.(symbol, assetType)}
      />
    )

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * Asset Pill Component
 * Renders appropriate pill based on asset type
 */
const AssetPill = ({ symbol, type, onClick }) => {
  const getAssetColor = () => {
    switch (type) {
      case ASSET_TYPES.STOCK:
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      case ASSET_TYPES.CRYPTO:
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      case ASSET_TYPES.COMMODITY:
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      case ASSET_TYPES.FOREX:
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case ASSET_TYPES.BOND:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      case ASSET_TYPES.REIT:
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const getAssetIcon = () => {
    switch (type) {
      case ASSET_TYPES.STOCK: return '📈'
      case ASSET_TYPES.CRYPTO: return '🪙'
      case ASSET_TYPES.COMMODITY: return '🥇'
      case ASSET_TYPES.FOREX: return '💱'
      case ASSET_TYPES.BOND: return '📊'
      case ASSET_TYPES.REIT: return '🏠'
      default: return '💼'
    }
  }

  const prefix = ASSET_PREFIXES[type] || '$'

  // For stocks, use the full InlineStockPill component
  if (type === ASSET_TYPES.STOCK) {
    return <InlineStockPill symbol={symbol} onClick={onClick} />
  }

  // For other assets, use simple pill (can be enhanced later)
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-all hover:scale-105 ${getAssetColor()}`}
    >
      <span>{getAssetIcon()}</span>
      {prefix}{symbol}
    </button>
  )
}

/**
 * Get asset category info for UI display
 */
export const getAssetCategoryInfo = (type) => {
  const info = {
    [ASSET_TYPES.STOCK]: {
      name: 'Stocks',
      emoji: '📈',
      color: 'blue',
      example: '$AAPL'
    },
    [ASSET_TYPES.CRYPTO]: {
      name: 'Crypto',
      emoji: '🪙',
      color: 'purple',
      example: '#BTC'
    },
    [ASSET_TYPES.COMMODITY]: {
      name: 'Commodities',
      emoji: '🥇',
      color: 'yellow',
      example: '&GOLD'
    },
    [ASSET_TYPES.FOREX]: {
      name: 'Forex',
      emoji: '💱',
      color: 'green',
      example: '@USDINR'
    },
    [ASSET_TYPES.BOND]: {
      name: 'Bonds',
      emoji: '📊',
      color: 'gray',
      example: '^10YIND'
    },
    [ASSET_TYPES.REIT]: {
      name: 'REITs',
      emoji: '🏠',
      color: 'orange',
      example: '%EMBASSY'
    }
  }
  
  return info[type] || info[ASSET_TYPES.STOCK]
}

/**
 * Backward compatibility - extract stock symbols only
 */
export const extractStockSymbols = (text) => {
  return extractAssets(text).stocks
}
