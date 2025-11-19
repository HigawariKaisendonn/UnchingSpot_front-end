import apiFetch from './api';

// Pin関連の型定義
export type Pin = {
  id: string;
  name: string;
  user_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  edited_at: string;
};

export type CreatePinRequest = {
  name: string;
  latitude: number;
  longitude: number;
};

export type UpdatePinRequest = {
  name: string;
  latitude: number;
  longitude: number;
};

// Pin API関数

/**
 * Pinを作成
 * POST /api/pins
 */
export async function createPin(data: CreatePinRequest): Promise<Pin> {
  return apiFetch('/api/pins', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * ログイン中のユーザーのPin一覧を取得
 * GET /api/pins
 */
export async function getPins(): Promise<Pin[]> {
  return apiFetch('/api/pins', {
    method: 'GET',
  });
}

/**
 * Pin詳細を取得
 * GET /api/pins/:id
 */
export async function getPin(id: string): Promise<Pin> {
  return apiFetch(`/api/pins/${id}`, {
    method: 'GET',
  });
}

/**
 * Pinを更新
 * PUT /api/pins/:id
 */
export async function updatePin(id: string, data: UpdatePinRequest): Promise<Pin> {
  return apiFetch(`/api/pins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Pinを削除
 * DELETE /api/pins/:id
 */
export async function deletePin(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/pins/${id}`, {
    method: 'DELETE',
  });
}

