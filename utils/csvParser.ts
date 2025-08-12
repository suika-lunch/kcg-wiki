// utils/csvParser.ts

/**
 * @file CSVデータパースユーティリティ
 * @description CSV文字列をパースし、指定された型のオブジェクトの配列に変換します。エラーハンドリングにはneverthrowを使用します。
 */

import { Result, ok, err } from "neverthrow";
import Papa from "papaparse";

/**
 * CSV文字列をパースして指定された型のオブジェクトの配列に変換します。
 * @param csvText パースするCSV文字列
 * @returns 成功した場合は指定された型のオブジェクトの配列、失敗した場合はErrorオブジェクトを含むResult型
 */
export const parseCsvData = <T>(csvText: string): Result<T[], Error> => {
  try {
    const results = Papa.parse<T>(csvText, {
      header: true, // 最初の行をヘッダーとして扱う
      skipEmptyLines: true, // 空行をスキップ
      dynamicTyping: true, // 数値や真偽値を自動変換
      transformHeader: (header) => header.trim(), // ヘッダーの空白を除去
    });

    if (results.errors.length > 0) {
      // PapaParseが検出したエラーを返す
      return err(new Error(results.errors.map((e) => e.message).join("; ")));
    }

    // パースされたデータをそのまま返す
    return ok(results.data);
  } catch (error) {
    // 予期せぬエラーが発生した場合
    return err(error instanceof Error ? error : new Error(String(error)));
  }
};
