import apiFetch from './api';

// Connect関連の型定義
export type Connect = {
  id: string;
  user_id: string;
  name: string;
  pin_id_1: string; // 開始点と終了点
  pin_id_2: string[]; // 中間点の配列
  show: boolean;
};

export type CreateConnectRequest = {
  name: string;
  pin_id_1: string; // 開始点と終了点
  pin_id_2: string[]; // 中間点の配列
  show: boolean;
};

export type UpdateConnectRequest = {
  name?: string;
  pin_id_1?: string;
  pin_id_2?: string[];
  show?: boolean;
};

// Connect API関数

/**
 * Connectを作成
 * POST /api/connects
 */
export async function createConnect(data: CreateConnectRequest): Promise<Connect> {
  return apiFetch('/api/connects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ログイン中のユーザーのConnect一覧を取得
 * GET /api/connects
 */
export async function getConnects(): Promise<Connect[]> {
  return apiFetch('/api/connects', {
    method: 'GET',
  });
}

/**
 * Connectを更新
 * PUT /api/connects/:id
 */
export async function updateConnect(id: string, data: UpdateConnectRequest): Promise<Connect> {
  return apiFetch(`/api/connects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Connectを削除
 * DELETE /api/connects/:id
 */
export async function deleteConnect(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/connects/${id}`, {
    method: 'DELETE',
  });
}

