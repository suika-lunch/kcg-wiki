// types/judgment.ts
/**
 * @file judgment.ts
 * @brief 裁定データの型定義。
 *
 * 裁定ID、該当カード、内容を含む裁定データの構造を定義します。
 */
export interface Judgment {
  裁定ID: number;
  該当カード: string;
  内容: string;
}
