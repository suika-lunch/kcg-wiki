// utils/imagePath.ts

/**
 * @file 画像パスユーティリティ
 * @description カードIDに基づいて画像ファイルのパスを生成します。
 */

import { withBase } from "vitepress";

/**
 * カードIDに基づいて画像ファイルのパスを生成します。
 * @param cardId カードのID
 * @returns 画像ファイルの絶対パス
 */
export const getImagePath = (cardId: string): string => {
  return withBase(`cards/${cardId}.avif`);
};

/**
 * プレースホルダ画像のパスを生成します。
 * @returns プレースホルダ画像の絶対パス
 */
export const getPlaceholderImagePath = (): string => {
  return withBase(`placeholder.avif`);
};
