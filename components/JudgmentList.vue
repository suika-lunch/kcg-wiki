/** * @file JudgmentList.vue * @brief 裁定リストを表示するVueコンポーネント。 *
* judgment.csvから裁定データを読み込み、表示します。 *
裁定データ内のカードIDをcards.csvから取得したカード名に変換します。 *
エラーハンドリングにはneverthrowを使用し、非同期処理の安全性を高めます。 */
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fromAsyncThrowable } from "neverthrow";
import { parseCsvData } from "../utils/csvParser";
import { Judgment } from "../types/judgment";
import type { Card } from "../types/card";
import { useData } from "vitepress";

const { site } = useData();
const judgments = ref<Judgment[]>([]);
const error = ref<string | null>(null);
const cardIdToNameMap = ref<Map<string, string>>(new Map());

const processJudgmentData = (
  judgment: Judgment,
  cardIdToNameMap: Map<string, string>,
): Judgment => {
  const cardIds = String(judgment["該当カード"])
    .split("/")
    .filter((id) => id.trim() !== "");
  const cardNames = cardIds.map(
    (id) => cardIdToNameMap.get(id.trim()) || id.trim(),
  );
  const content = String(judgment["内容"]).replace(/^◆/, "");

  return {
    ...judgment,
    該当カード: cardNames.join(" / "),
    内容: content,
  };
};

onMounted(async () => {
  const loadData = async () => {
    // カード情報を読み込み、マッピングを作成
    const cardResponseResult = await fromAsyncThrowable(
      () => fetch(`${site.value.base}cards.csv`),
      (e) =>
        new Error(
          `Failed to fetch cards.csv: ${e instanceof Error ? e.message : String(e)}`,
        ),
    );

    if (cardResponseResult.isErr()) {
      throw cardResponseResult.error;
    }
    const cardResponse = cardResponseResult.value;

    if (!cardResponse.ok) {
      throw new Error(
        `HTTP error! status: ${cardResponse.status} for cards.csv`,
      );
    }

    const cardCsvText = await cardResponse.text();
    const cardResult = parseCsvData<Card>(cardCsvText);

    if (cardResult.isErr()) {
      throw new Error(`Failed to parse cards.csv: ${cardResult.error.message}`);
    }

    cardResult.value.forEach((card) => {
      cardIdToNameMap.value.set(card.id, card.name);
    });

    // 裁定情報を読み込み、パース
    const judgmentResponseResult = await fromAsyncThrowable(
      () => fetch(`${site.value.base}judgment.csv`),
      (e) =>
        new Error(
          `Failed to fetch judgment.csv: ${e instanceof Error ? e.message : String(e)}`,
        ),
    );

    if (judgmentResponseResult.isErr()) {
      throw judgmentResponseResult.error;
    }
    const judgmentResponse = judgmentResponseResult.value;

    if (!judgmentResponse.ok) {
      throw new Error(
        `HTTP error! status: ${judgmentResponse.status} for judgment.csv`,
      );
    }

    const judgmentCsvText = await judgmentResponse.text();
    const judgmentResult = parseCsvData<Judgment>(judgmentCsvText);

    if (judgmentResult.isErr()) {
      throw new Error(
        `Failed to parse judgment.csv: ${judgmentResult.error.message}`,
      );
    }

    judgments.value = judgmentResult.value.map((judgment) =>
      processJudgmentData(judgment, cardIdToNameMap.value),
    );
  };

  const result = await fromAsyncThrowable(loadData, (e) => {
    return new Error(
      `Error loading data: ${e instanceof Error ? e.message : String(e)}`,
    );
  });

  if (result.isErr()) {
    error.value = result.error.message;
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
