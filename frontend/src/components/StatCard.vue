<template>
  <div class="stat-card">
    <div class="label">{{ title }}</div>
    <div class="value">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "" },
  value: { type: [Number,String], default: 0 }
});
</script>

<style scoped>
.stat-card {
  background: linear-gradient(180deg,#ffffff,#f8fbff);
  border: 1px solid #e6eef8;
  padding: 14px;
  border-radius: 8px;
  min-width: 160px;
  box-shadow: 0 2px 6px rgba(12,45,90,0.03);
}
.label { color:#516580; font-size:13px; margin-bottom:8px; }
.value { font-size:22px; font-weight:700; color:#0b4f83; }
</style>
