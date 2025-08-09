<template>
  <div class="card-grid">
    <div v-for="cardId in cardIds" :key="cardId" class="card-item">
      <img
        :src="getImagePath(cardId)"
        :alt="`Card ${cardId}`"
        class="card-image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const cardIds = ref<string[]>([]);

onMounted(async () => {
  try {
    // VitePressのpublicディレクトリからの相対パスでCSVファイルをフェッチ
    const response = await fetch("./cards.csv");
    const csvText = await response.text();

    // CSVをパース
    const lines = csvText.trim().split("\r\n"); // Windowsの改行コードを考慮
    const headers = lines[0].split(",");
    const idIndex = headers.indexOf("id");

    if (idIndex === -1) {
      console.error('CSVファイルに"id"列が見つかりません。');
      return;
    }

    const parsedCardIds: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
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
  return `./images/cards/${cardId}.avif`;
};
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
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
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.card-item:hover {
  transform: scale(1.05);
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain; /* 画像のアスペクト比を維持し、コンテナに収める */
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
