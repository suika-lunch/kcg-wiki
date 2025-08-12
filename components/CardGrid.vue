/** * @file CardGrid.vue * @brief
カードのグリッド表示とモーダル表示を管理するVueコンポーネント。 * *
cards.csvからカードデータを読み込み、グリッド形式で表示します。 *
各カードをクリックすると詳細モーダルが表示されます。 *
データ取得とエラーハンドリングにはneverthrowを使用し、非同期処理の安全性を高めます。
*/
<template>
  <div class="card-grid">
    <div
      v-for="card in cards"
      :key="card.id"
      class="card-item"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      :aria-label="card.name ?? card.id"
      aria-controls="card-modal"
      @click="openModal(card)"
      @keydown.enter.prevent="openModal(card)"
      @keydown.space.prevent
      @keyup.space="openModal(card)"
    >
      <img
        :src="getImagePath(card.id)"
        :alt="card.name ?? card.id"
        class="card-image"
        loading="lazy"
        decoding="async"
        draggable="false"
        @error="onImageError"
      />
    </div>
  </div>

  <CardModal
    id="card-modal"
    v-if="showModal && selectedCard"
    :show="showModal"
    :card="selectedCard!"
    @close="closeModal"
  />

  <div
    v-if="errorMessage"
    class="error-message"
    role="alert"
    aria-atomic="true"
  >
    {{ errorMessage }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import CardModal from "./CardModal.vue";
import { Card } from "../types/card";
import { parseCsvData } from "../utils/csvParser";
import { withBase } from "vitepress";
import { getImagePath, getPlaceholderImagePath } from "../utils/imagePath";
import { fromAsyncThrowable, Result, err } from "neverthrow"; // neverthrowをインポート

const cards = ref<Card[]>([]);
const showModal = ref(false);
const selectedCard = ref<Card | null>(null);
const errorMessage = ref<string | null>(null);
const abortController = new AbortController();
const lastFocusedEl = ref<HTMLElement | null>(null);

// データ取得とパースのロジックを分離した関数
const loadCardsData = async (
  signal: AbortSignal,
): Promise<Result<Card[], Error>> => {
  const responseResult = await fromAsyncThrowable(
    () => fetch(withBase("cards.csv"), { signal }),
    (e) =>
      new Error(
        `Failed to fetch cards.csv: ${e instanceof Error ? e.message : String(e)}`,
      ),
  );

  if (responseResult.isErr()) {
    // AbortErrorの場合はエラーとして扱わない
    if (
      responseResult.error instanceof DOMException &&
      responseResult.error.name === "AbortError"
    ) {
      return err(new Error("Aborted")); // 特別なエラーを返して後で無視する
    }
    return err(responseResult.error);
  }
  const response = responseResult.value;

  if (!response.ok) {
    return err(
      new Error(
        `カードデータの読み込みに失敗しました: HTTPステータス ${response.status}`,
      ),
    );
  }

  const csvText = await response.text();
  const parseResult = parseCsvData<Card>(csvText);

  if (parseResult.isErr()) {
    return err(
      new Error(
        `カードデータのパース中にエラーが発生しました: ${parseResult.error.message}`,
      ),
    );
  }

  return parseResult;
};

onMounted(async () => {
  errorMessage.value = null; // 直前のエラーをクリア
  const result = await loadCardsData(abortController.signal);

  if (result.isOk()) {
    cards.value = result.value;
  } else {
    // AbortErrorの場合はエラーメッセージを表示しない
    if (result.error.message === "Aborted") {
      return;
    }
    errorMessage.value = result.error.message;
  }
});

onBeforeUnmount(() => abortController.abort());

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = getPlaceholderImagePath();
  target.onerror = null;
};

const openModal = (card: Card) => {
  lastFocusedEl.value =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  selectedCard.value = card;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCard.value = null;
  nextTick(() => {
    lastFocusedEl.value?.focus();
  });
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

.card-item:focus-visible {
  outline: 3px solid var(--vp-c-brand-1);
  outline-offset: 3px;
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
