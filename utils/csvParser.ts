// utils/csvParser.ts

/**
 * @file CSVデータパースユーティリティ
 * @description CSV文字列をパースし、Cardオブジェクトの配列に変換します。エラーハンドリングにはneverthrowを使用します。
 */

import { Result, ok, err } from "neverthrow";
import { Card } from "../types/card";
import Papa from "papaparse"; // papaparseをインポート

/**
 * CSV文字列をパースしてCardオブジェクトの配列に変換します。
 * @param csvText パースするCSV文字列
 * @returns 成功した場合はCardオブジェクトの配列、失敗した場合はErrorオブジェクトを含むResult型
 */
export const parseCsvData = (csvText: string): Result<Card[], Error> => {
  try {
    const results = Papa.parse<Card>(csvText, {
      header: true, // 最初の行をヘッダーとして扱う
      skipEmptyLines: true, // 空行をスキップ
      dynamicTyping: true, // 数値や真偽値を自動変換（今回はすべて文字列なので影響は少ない）
      transformHeader: (header) => header.trim(), // ヘッダーの空白を除去
    });

    if (results.errors.length > 0) {
      // PapaParseが検出したエラーを返す
      return err(new Error(results.errors.map((e) => e.message).join("; ")));
    }

    // 必須ヘッダーのチェック
    const required: (keyof Card)[] = [
      "id",
      "name",
      "kind",
      "type",
      "effect",
      "tags",
    ];
    const headers = results.meta.fields || []; // ヘッダーがない場合は空配列
    const missing = required.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      return err(
        new Error(`必須ヘッダーが不足しています: ${missing.join(", ")}`),
      );
    }

    // パースされたデータをCard型にマッピング
    const parsedCards: Card[] = results.data.map((row: any) => {
      // PapaParseはdynamicTyping:trueでも全てをCard型に保証しないため、明示的にキャスト
      const card: Card = {
        id: String(row.id || ""),
        name: String(row.name || ""),
        kind: String(row.kind || ""),
        type: String(row.type || ""),
        effect: String(row.effect || ""),
        tags: String(row.tags || ""),
      };
      return card;
    });

    return ok(parsedCards);
  } catch (error) {
    // 予期せぬエラーが発生した場合
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};
