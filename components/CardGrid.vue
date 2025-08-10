<template>
  <div class="card-grid">
    <div
      v-for="card in cards"
      :key="card.id"
      class="card-item"
      @click="openModal(card)"
    >
      <img
        :src="getImagePath(card.id)"
        :alt="`Card ${card.id}`"
        class="card-image"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>

  <CardModal :show="showModal" :card="selectedCard" @close="closeModal" />

  <div v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { withBase } from "vitepress";
import CardModal from "./CardModal.vue";

interface Card {
  id: string;
  name: string;
  kind: string;
  type: string;
  effect: string;
  tags: string;
}

const cards = ref<Card[]>([]);
const showModal = ref(false);
const selectedCard = ref<Card | null>(null);
const errorMessage = ref<string | null>(null); // エラーメッセージ用のリアクティブ変数

const parseCsv = async () => {
  try {
    const response = await fetch("cards.csv");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let csvText = await response.text();
    csvText = csvText.replace(/\uFEFF/g, "");

    const lines = csvText.replace(/\r?\n/g, "\n").trim().split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());

    const parsedCards: Card[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const values = line.split(",").map((value) => value.trim());

      const card: Partial<Card> = {};
      headers.forEach((header, index) => {
        (card as any)[header] = values[index];
      });
      parsedCards.push(card as Card);
    }
    cards.value = parsedCards;
  } catch (error) {
    console.error(
      "CSVファイルの読み込みまたはパース中にエラーが発生しました:",
      error,
    );
    errorMessage.value = "カードデータの読み込み中にエラーが発生しました。"; // ユーザー向けメッセージ
  }
};

onMounted(() => {
  parseCsv();
});

const getImagePath = (cardId: string) => {
  return withBase(`cards/${cardId}.avif`);
};

const openModal = (card: Card) => {
  selectedCard.value = card;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCard.value = null;
};
</script>

<style scoped>
/* 既存のスタイル */
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
  cursor: pointer; /* クリック可能であることを示す */
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

.error-message {
  color: red;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
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
