<script setup lang="ts">
  const ROWS = [
    { instrument: 'BTC-DEC', side: 'buy', width: 72 },
    { instrument: 'ETH-SEP', side: 'sell', width: 44 },
  ];
</script>

<template>
  <VisualFrame
    class="cpm-visual"
    label="Customer Portfolio Management: exchanges, wallets, and brokers in one book"
    title="cpm / overview"
    note="live"
  >
    <div class="cpm-body">
      <div class="cpm-venues">
        <span class="cpm-venues__active">Exchange</span>
        <span>Wallet</span>
        <span>Broker</span>
      </div>
      <div class="cpm-rows">
        <div class="cpm-row cpm-row--head">
          <span>instrument</span><span>side</span><span>pnl</span>
        </div>
        <div
          v-for="row in ROWS"
          :key="row.instrument"
          class="cpm-row"
        >
          <span>{{ row.instrument }}</span
          ><span>{{ row.side }}</span
          ><span class="cpm-bar"><i :style="{ '--w': row.width }" /></span>
        </div>
      </div>
    </div>
    <template #bottom>
      <span><span class="accent">$</span> scan venues</span><span>one book</span>
    </template>
  </VisualFrame>
</template>
