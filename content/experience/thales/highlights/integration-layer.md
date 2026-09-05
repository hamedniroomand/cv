---
title: One integration layer for 16 chains and 12 exchanges
order: 2
---

Designed a unified integration layer over heterogeneous chain providers and exchange APIs. Every source sits behind one contract with its own fetching flow, so adding a chain or an exchange is a single-module change and each source is testable on its own.
