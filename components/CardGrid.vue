<template>
  <div class="card-grid">
    <div
      v-for="card in cards"
      :key="card.id"
      class="card-item"
      role="button"
      tabindex="0"
      @click="openModal(card)"
      @keydown.enter.prevent="openModal(card)"
      @keydown.space.prevent="openModal(card)"
    >
      <img
        :src="getImagePath(card.id)"
        :alt="card.name ?? card.id"
        class="card-image"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
    </div>
  </div>

  <CardModal
    v-if="showModal && selectedCard"
    :show="showModal"
    :card="selectedCard!"
    @close="closeModal"
  />

  <div v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import CardModal from "./CardModal.vue";
import { Card } from "../types/card"; // Cardインターフェースをインポート
import { parseCsvData } from "../utils/csvParser"; // parseCsvData関数をインポート
import { withBase } from "vitepress";
import { getImagePath, getPlaceholderImagePath } from "../utils/imagePath"; // getPlaceholderImagePath をインポート

const cards = ref<Card[]>([]);
const showModal = ref(false);
const selectedCard = ref<Card | null>(null);
const errorMessage = ref<string | null>(null); // エラーメッセージ用のリアクティブ変数

const fetchAndParseCsv = async () => {
  try {
    const response = await fetch(withBase("cards.csv"));
    if (!response.ok) {
      // HTTPエラーの場合、早期リターン
      errorMessage.value = `カードデータの読み込みに失敗しました: HTTPステータス ${response.status}`;
      return;
    }
    const csvText = await response.text();

    const parseResult = parseCsvData(csvText);

    if (parseResult.isErr()) {
      // パースエラーの場合、早期リターン
      errorMessage.value = `カードデータのパース中にエラーが発生しました: ${parseResult.error.message}`;
      return;
    }

    cards.value = parseResult.value;
  } catch (error) {
    // 予期せぬネットワークエラーなど
    errorMessage.value = `カードデータの取得中に予期せぬエラーが発生しました: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
};

onMounted(() => {
  fetchAndParseCsv();
});

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = getPlaceholderImagePath();
  target.onerror = null; // 無限ループを防ぐため、これ以上エラーを発生させない
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
  color: var(--vp-c-danger-1, #e45649);
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
