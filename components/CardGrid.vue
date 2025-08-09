<template>
  <div class="card-grid">
    <div v-for="cardId in cardIds" :key="cardId" class="card-item">
      <img
        :src="getImagePath(cardId)"
        :alt="`Card ${cardId}`"
        class="card-image"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { withBase } from 'vitepress';

const cardIds = ref<string[]>([]);

onMounted(async () => {
  try {
    // VitePressのpublicディレクトリからの相対パスでCSVファイルをフェッチ
    const response = await fetch("cards.csv");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let csvText = await response.text();
    csvText = csvText.replace(/\uFEFF/g, ''); // BOM文字を削除

    // CSVをパース
    const lines = csvText.replace(/\r?\n/g, '\n').trim().split('\n'); // 改行コードを正規化し、トリム
    const headers = lines[0].split(',').map(header => header.trim()); // ヘッダーをトリム
    const idIndex = headers.indexOf("id");

    if (idIndex === -1) {
      console.error('CSVファイルに"id"列が見つかりません。');
      return;
    }

    const parsedCardIds: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // 空行をスキップ
      const values = line.split(',').map(value => value.trim()); // 値をトリム
      if (values[idIndex]) {
        parsedCardIds.push(values[idIndex]);
      }
    }
    cardIds.value = parsedCardIds;
  } catch (error) {
    console.error(
      "CSVファイルの読み込みまたはパース中にエラーが発生しました:",
      error,
    );
  }
});

const getImagePath = (cardId: string) => {
  return withBase(`cards/${cardId}.avif`);
};
</script>

<style scoped>
.card-grid {
  display: grid;
  /* full-bleed: コンテンツ幅をブレークアウトしてビューポート全幅に */
  margin-inline: calc(50% - 50vw);
  width: 100vw;
  grid-template-columns: repeat(
    auto-fit,
    minmax(150px, 1fr)
  ); /* 最小150px、最大1frのグリッド */
  gap: 16px; /* グリッドアイテム間のスペース */
  padding: 20px;
  justify-content: center; /* グリッド全体を中央寄せ */
}

.card-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden; /* 画像がはみ出さないように */
  background-color: var(--vp-c-bg); /* テーマに追従 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: transform 150ms ease-out;
  will-change: transform;
}

.card-item:hover {
  transform: scale(1.05);
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain; /* 画像のアスペクト比を維持し、コンテナに収める */
  aspect-ratio: 63 / 88;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    padding: 10px;
  }
}
</style>
