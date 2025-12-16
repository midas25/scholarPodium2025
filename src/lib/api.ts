const DEFAULT_API_BASE =
  "https://broad-bad-9cd25.rtioalb2250.workers.dev";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE;

export type ApiPlayerRecord = {
  id?: string;
  username: string;
  password?: string;
  name: string;
  avatar: string;
  color: string;
  accessories?: string[];
  createdAt?: number;
  totalScore?: number;
  game1?: number;
  game2?: number;
  game3?: number;
  game4?: number;
};

export type ApiPlayerPayload = {
  username: string;
  password: string;
  name: string;
  avatar: string;
  color: string;
  accessories: string[];
  createdAt: number;
  game1: number;
  game2: number;
  game3: number;
  game4: number;
};

const buildUrl = (path: string) => {
  const trimmedBase = API_BASE_URL.replace(/\/$/, "");
  return `${trimmedBase}${path}`;
};

export async function fetchPlayers(): Promise<ApiPlayerRecord[]> {
  const response = await fetch(buildUrl("/players"));
  if (!response.ok) {
    throw new Error(`Failed to load players: ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid player payload");
  }
  return data;
}

export async function upsertPlayer(
  payload: ApiPlayerPayload,
): Promise<void> {
  const response = await fetch(buildUrl("/players"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to persist player: ${response.status}`,
    );
  }
}

export async function submitScoreUpdate(
  username: string,
  gameColumn: string,
  score: number,
  password = '1345',
): Promise<void> {
  const response = await fetch(buildUrl('/scores'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, gameColumn, score, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to submit score: ${response.status}`,
    );
  }
}
