// utils/csvParser.ts

/**
 * @file CSVデータパースユーティリティ
 * @description CSV文字列をパースし、Cardオブジェクトの配列に変換します。エラーハンドリングにはneverthrowを使用します。
 */

import { Result, ok, err } from "neverthrow";
import { Card } from "../types/card";

// 簡易CSV行パーサ: 二重引用符・エスケープ（二重二重引用符）とカンマ区切りに対応
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'; // エスケープされた引用符
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

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
    const headers = parseCsvLine(lines[0]);
    const required: (keyof Card)[] = ["id", "name", "kind", "type", "effect", "tags"];
  const missing = required.filter((h) => !headers.includes(h));
  if (missing.length) {
    return err(new Error(`必須ヘッダーが不足しています: ${missing.join(", ")}`));
  }


    const parsedCards: Card[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // 空行はスキップ

      const values = parseCsvLine(line);

      // ヘッダーと値の数が一致しない場合はエラー
      if (values.length !== headers.length) {
        return err(
          new Error(
            `CSVの行 ${i + 1} でヘッダーと値の数が一致しません。` +
              `ヘッダー数: ${headers.length}, 値数: ${values.length}`,
          ),
        );
      }

  const rec: Record<string, string> = {};
  headers.forEach((header, index) => {
    rec[header] = values[index] ?? "";
  });
  const card: Card = {
    id: rec["id"] ?? "",
    name: rec["name"] ?? "",
    kind: rec["kind"] ?? "",
    type: rec["type"] ?? "",
    effect: rec["effect"] ?? "",
    tags: rec["tags"] ?? "",
  };
  parsedCards.push(card);
    }

    return ok(parsedCards);
  } catch (error) {
    // 予期せぬエラーが発生した場合
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};
