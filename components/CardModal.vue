<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="modal-mask"
      @click.self="emit('close')"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'modalTitle'"
      tabindex="-1"
      ref="modalRef"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h3 id="modalTitle">{{ card.name }}</h3>
          <button
            class="modal-close-button"
            @click="emit('close')"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="card-image-container">
            <img
              :src="getImagePath(card.id)"
              :alt="card.name || card.id"
              class="modal-card-image"
              @error="onImageError"
            />
          </div>
          <div class="card-details">
            <p><strong>カード種類:</strong> {{ card.kind }}</p>
            <p><strong>タイプ:</strong> {{ card.type }}</p>
            <p><strong>効果:</strong> {{ card.effect }}</p>
            <p><strong>タグ:</strong> {{ card.tags }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { Card } from "../types/card"; // Cardインターフェースをインポート
import { getImagePath, getPlaceholderImagePath } from "../utils/imagePath"; // getPlaceholderImagePath をインポート

// イベントエミットの型定義を強化
interface CardModalEmits {
  (event: "close"): void;
}

const props = defineProps<{
  show: boolean;
  card: Card; // cardを必須プロパティに変更
}>();

const emit = defineEmits<CardModalEmits>(); // 型引数を使用

const modalRef = ref<HTMLElement | null>(null);
let previouslyFocusedElement: HTMLElement | null = null;

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      previouslyFocusedElement = document.activeElement as HTMLElement;
      nextTick(() => {
        if (modalRef.value) {
          modalRef.value.focus();
        }
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    }
  },
);

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = getPlaceholderImagePath();
  target.onerror = null; // 無限ループを防ぐため、これ以上エラーを発生させない
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.show) {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* 既存のスタイル */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
  justify-content: center;
  align-items: center;
  outline: none;
}

.modal-container {
  width: 90%;
  max-width: 1000px;
  margin: auto;
  padding: 20px 30px;
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin-top: 0;
  color: var(--vp-c-text-1);
  font-size: 1.5em;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: var(--vp-c-text-2);
  line-height: 1;
}

.modal-body {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card-image-container {
  flex: 1;
  min-width: 250px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.modal-card-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-details {
  flex: 2;
  min-width: 300px;
  color: var(--vp-c-text-1);
  line-height: 1.6;
}

.card-details p {
  margin-bottom: 8px;
}

/* モーダルアニメーション */
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }

  .card-image-container,
  .card-details {
    min-width: unset;
    width: 100%;
  }

  .modal-card-image {
    max-height: 60vh;
    object-fit: contain;
  }
}
</style>
