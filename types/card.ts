// types/card.ts

/**
 * @file Card インターフェースの定義
 * @description アプリケーション全体で使用されるカードデータの型を定義します。
 */

export interface Card {
  id: string;
  name: string;
  kind: string;
  type: string;
  effect: string;
  tags: string;
}
