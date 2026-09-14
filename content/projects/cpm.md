---
name: Customer Portfolio Management
order: 1
site: https://thales-mfi.com
tagline: Real-time customer portfolios across exchanges, brokers, and on-chain wallets.
stack:
  - Nuxt
  - NestJS
  - TypeScript
  - Bun
screenshots:
  - src: /screenshots/cpm-overview.webp
    alt: CPM overview. Option positions, open orders, connected exchanges, and a portfolio mix chart.
    caption: One customer, one page. Option positions with mark price and PnL, open orders, connected exchanges, and the asset mix.
    frame: cpm / overview
    width: 3024
    height: 1638
  - src: /screenshots/cpm-connections.webp
    alt: CPM trading accounts with an add-exchange dialog open, and a risk management panel beside them.
    caption: Add an exchange to a customer's accounts. Drawdown limits and non-cash exposure sit beside the balances, not on another page.
    frame: cpm / connections
    width: 3024
    height: 1644
---

Customer Portfolio Management (CPM) is a private platform I built for Thales MFI. An asset manager registers a customer's exchange API keys, MT5 broker accounts, and wallet addresses. CPM then shows that customer's balances, positions, orders, and risk across every venue on one page.

Exchange scanners sync spot, futures, and options holdings from Binance, Bybit, Deribit, Coinbase, Kraken, KuCoin, and other venues. MT5 covers traditional brokers. Chain scanners read wallets on Bitcoin, EVM chains, Solana, Polkadot, Sui, TON, Tron, XRP, and more. Scheduled jobs keep prices and balances current, and Socket.IO pushes each change to the open dashboard. Reports cover portfolio snapshots, asset history, transaction flow, and CSV export. A Telegram bot handles login and notifications.

The frontend is Nuxt. The API is NestJS on Bun, with PostgreSQL and TimescaleDB behind it. The source is private. The company site is the public face.
