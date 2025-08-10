// utils/csvParser.ts

/**
 * @file CSVデータパースユーティリティ
 * @description CSV文字列をパースし、Cardオブジェクトの配列に変換します。エラーハンドリングにはneverthrowを使用します。
 */

import { Result, ok, err } from "neverthrow";
import { Card } from "../types/card";

/**
 * CSV文字列をパースしてCardオブジェクトの配列に変換します。
 * @param csvText パースするCSV文字列
 * @returns 成功した場合はCardオブジェクトの配列、失敗した場合はErrorオブジェクトを含むResult型
 */
export const parseCsvData = (csvText: string): Result<Card[], Error> => {
  try {
    // BOM (Byte Order Mark) の除去
    let cleanedCsvText = csvText.replace(/\uFEFF/g, "");

    // 改行コードを正規化し、空行を除去して行に分割
    const lines = cleanedCsvText.replace(/\r?\n/g, "\n").trim().split("\n");
    if (lines.length === 0) {
      return err(new Error("CSVデータが空です。"));
    }

    // ヘッダーのパース
    const headers = lines[0].split(",").map((header) => header.trim());

    const parsedCards: Card[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // 空行はスキップ

      const values = line.split(",").map((value) => value.trim());

      // ヘッダーと値の数が一致しない場合はエラー
      if (values.length !== headers.length) {
        return err(
          new Error(
            `CSVの行 ${i + 1} でヘッダーと値の数が一致しません。` +
              `ヘッダー数: ${headers.length}, 値数: ${values.length}`,
          ),
        );
      }

      const card: Partial<Card> = {};
      headers.forEach((header, index) => {
        (card as any)[header] = values[index];
      });
      parsedCards.push(card as Card);
    }

    return ok(parsedCards);
  } catch (error) {
    // 予期せぬエラーが発生した場合
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};
