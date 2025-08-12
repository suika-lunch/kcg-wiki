<script setup lang="ts">
import { ref, onMounted } from "vue";
import { parseCsvData } from "../utils/csvParser";
import { Judgment } from "../types/judgment";
import type { Card } from "../types/card";
import { useData } from 'vitepress'

const { site } = useData()
const judgments = ref<Judgment[]>([]);
const error = ref<string | null>(null);
const cardIdToNameMap = ref<Map<string, string>>(new Map());

onMounted(async () => {
  try {
    // カード情報を読み込み、マッピングを作成
    const cardResponse = await fetch(`${site.value.base}cards.csv`);
    if (!cardResponse.ok) {
      throw new Error(
        `HTTP error! status: ${cardResponse.status} for cards.csv`,
      );
    }
    const cardCsvText = await cardResponse.text();
    const cardResult = parseCsvData<Card>(cardCsvText);

    if (cardResult.isOk()) {
      cardResult.value.forEach((card) => {
        cardIdToNameMap.value.set(card.id, card.name);
      });
    } else {
      throw new Error(`Failed to parse cards.csv: ${cardResult.error.message}`);
    }

    // 裁定情報を読み込み、パース
    const judgmentResponse = await fetch(`${site.value.base}judgment.csv`);
    if (!judgmentResponse.ok) {
      throw new Error(
        `HTTP error! status: ${judgmentResponse.status} for judgment.csv`,
      );
    }
    const judgmentCsvText = await judgmentResponse.text();
    const judgmentResult = parseCsvData<Judgment>(judgmentCsvText);

    if (judgmentResult.isOk()) {
      judgments.value = judgmentResult.value.map((judgment) => {
        // 該当カードのIDを名前に変換し、最後のスラッシュを削除
        const cardIds = String(judgment["該当カード"])
          .split("/")
          .filter((id) => id.trim() !== "");
        const cardNames = cardIds.map(
          (id) => cardIdToNameMap.value.get(id.trim()) || id.trim(),
        );

        // 内容の最初の◆を削除
        const content = String(judgment["内容"]).replace(/^◆/, "");

        return {
          ...judgment,
          該当カード: cardNames.join(" / "),
          内容: content,
        };
      });
    } else {
      error.value = judgmentResult.error.message;
    }
  } catch (e: any) {
    error.value = e.message;
  }
});
</script>

<template>
  <div class="judgment-list">
    <p v-if="error" class="error-message">エラー: {{ error }}</p>
    <div v-else-if="judgments.length === 0">
      <p>裁定データを読み込み中...</p>
    </div>
    <div v-else>
      <div
        v-for="judgment in judgments"
        :key="judgment['裁定ID']"
        class="judgment-item"
      >
        <p>
          <strong>{{ judgment["該当カード"] }}</strong>
        </p>
        <p>{{ judgment["内容"] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.judgment-item {
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: var(--vp-c-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.error-message {
  color: var(--vp-c-danger-1, #e45649);
  font-weight: bold;
}
</style>
