import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoginPage } from "./components/LoginPage";
import { MainPage } from "./components/MainPage";
import { CreateCharacter } from "./components/CreateCharacter";
import { AccountPage } from "./components/AccountPage";
import { ScoreSubmissionPage } from "./components/ScoreSubmissionPage";
import {
  ApiPlayerPayload,
  ApiPlayerRecord,
  fetchPlayers,
  submitScoreUpdate,
  upsertPlayer,
} from "./lib/api";
import { DEFAULT_AVATAR } from "./assets/avatars";

export const GAME_MODES = [
  { id: "dance", label: "game1" },
  { id: "rhythm", label: "game2" },
  { id: "puzzle", label: "game3" },
  { id: "raid", label: "game4" },
] as const;

export type GameModeId = (typeof GAME_MODES)[number]["id"];

export type CharacterAppearance = {
  name: string;
  avatar: string;
  color: string;
  mbti: string;
};

export type Character = {
  id: string;
  createdAt: number;
  gameScores: Record<GameModeId, number>;
} & CharacterAppearance;

export type User = {
  username: string;
  password: string;
  character?: Character;
};

type Page = "login" | "home" | "create" | "account" | "score";

const pageToPath: Record<Page, string> = {
  login: "/login",
  home: "/home",
  create: "/create",
  account: "/account",
  score: "/score",
};

type GameColumn = "game1" | "game2" | "game3" | "game4";

const GAME_MODE_COLUMN_MAP: Record<GameModeId, GameColumn> = {
  dance: "game1",
  rhythm: "game2",
  puzzle: "game3",
  raid: "game4",
};

const createEmptyGameScores = (): Record<GameModeId, number> => {
  return GAME_MODES.reduce(
    (acc, mode) => {
      acc[mode.id] = 0;
      return acc;
    },
    {} as Record<GameModeId, number>,
  );
};

const normalizePath = (path: string) => {
  if (!path) return "/login";
  const trimmed = path.endsWith("/") && path !== "/"
    ? path.slice(0, -1)
    : path;
  return trimmed || "/";
};

const pathToPage = (path: string): Page => {
  const normalized = normalizePath(path).toLowerCase();
  switch (normalized) {
    case "/home":
      return "home";
    case "/create":
      return "create";
    case "/account":
      return "account";
    case "/score":
      return "score";
    case "/login":
    case "/":
    default:
      return "login";
  }
};

const getInitialPage = (): Page => {
  if (typeof window === "undefined") return "login";
  return pathToPage(window.location.pathname);
};

const buildGameScoresFromRecord = (
  record: ApiPlayerRecord,
): Record<GameModeId, number> => {
  return GAME_MODES.reduce(
    (acc, mode) => {
      const column = GAME_MODE_COLUMN_MAP[mode.id];
      const value = record[column] ?? 0;
      acc[mode.id] = typeof value === "number" ? value : 0;
      return acc;
    },
    {} as Record<GameModeId, number>,
  );
};

const convertApiPlayerToUser = (player: ApiPlayerRecord): User => {
  const gameScores = buildGameScoresFromRecord(player);
  const character: Character = {
    id: player.id ? String(player.id) : player.username,
    name: player.name ?? player.username,
    avatar: player.avatar ?? DEFAULT_AVATAR,
    color: player.color ?? "#FF6B35",
    mbti: typeof player.mbti === "string" ? player.mbti : "INFP",
    createdAt:
      typeof player.createdAt === "number"
        ? player.createdAt
        : Date.now(),
    gameScores,
  };

  return {
    username: player.username,
    password: player.password ?? "",
    character,
  };
};

const mapPlayersToUsers = (
  players: ApiPlayerRecord[],
): Record<string, User> => {
  return players.reduce((acc, player) => {
    const normalized = convertApiPlayerToUser(player);
    acc[normalized.username] = normalized;
    return acc;
  }, {} as Record<string, User>);
};

const userToApiPayload = (user: User): ApiPlayerPayload | null => {
  if (!user.character) {
    return null;
  }

  const scoresByColumn: Record<GameColumn, number> = {
    game1: user.character.gameScores.dance ?? 0,
    game2: user.character.gameScores.rhythm ?? 0,
    game3: user.character.gameScores.puzzle ?? 0,
    game4: user.character.gameScores.raid ?? 0,
  };

  return {
    username: user.username,
    password: user.password,
    name: user.character.name,
    avatar: user.character.avatar,
    color: user.character.color,
    mbti: user.character.mbti,
    createdAt: user.character.createdAt,
    ...scoresByColumn,
  };
};

const gameModeToColumn = (mode: GameModeId): GameColumn => {
  return GAME_MODE_COLUMN_MAP[mode];
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);
  const [currentUser, setCurrentUser] = useState<string | null>(
    null,
  );
  const [users, setUsers] = useState<Record<string, User>>({});
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);
  const hasNormalizedPath = useRef(false);
  const hasRestoredSession = useRef(false);

  const findUserByUsername = useCallback(
    (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) return null;

      if (users[trimmed]) {
        return { username: trimmed, user: users[trimmed]! };
      }

      const lower = trimmed.toLowerCase();
      const entry = Object.entries(users).find(
        ([key]) => key.toLowerCase() === lower,
      );
      if (!entry) return null;
      return { username: entry[0], user: entry[1] };
    },
    [users],
  );


  const updateHistoryPath = useCallback(
    (page: Page, method: "pushState" | "replaceState" = "pushState") => {
      if (typeof window === "undefined") return;
      const targetPath = pageToPath[page];
      if (window.location.pathname === targetPath) return;
      window.history[method]({}, "", targetPath);
    },
    [],
  );

  const navigate = useCallback(
    (page: Page, options?: { replace?: boolean }) => {
      setCurrentPage(page);
      updateHistoryPath(
        page,
        options?.replace ? "replaceState" : "pushState",
      );
    },
    [updateHistoryPath],
  );

  const loadUsers = useCallback(async () => {
    try {
      const players = await fetchPlayers();
      setUsers(mapPlayersToUsers(players));
    } catch (error) {
      console.error("플레이어 데이터를 불러오지 못했습니다.", error);
    } finally {
      setHasLoadedUsers(true);
    }
  }, []);

  const persistUser = useCallback(async (user: User) => {
    const payload = userToApiPayload(user);
    if (!payload) return;
    await upsertPlayer(payload);
  }, []);

  const resolvePageAccess = useCallback(
    (page: Page): Page => {
      if (!hasLoadedUsers) {
        return page;
      }

      if (page === "score") return "score";
      if (!currentUser) {
        return "login";
      }

      const currentCharacter = users[currentUser]?.character;

      if (!currentCharacter && (page === "home" || page === "account")) {
        return "create";
      }

      if (currentCharacter && page === "create") {
        return "home";
      }

      if (page === "login") {
        return currentCharacter ? "home" : "create";
      }

      return page;
    },
    [currentUser, users, hasLoadedUsers],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentPage !== "home") return;

    const intervalId = window.setInterval(() => {
      loadUsers();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [currentPage, loadUsers]);

  useEffect(() => {
    if (hasNormalizedPath.current) return;
    updateHistoryPath(currentPage, "replaceState");
    hasNormalizedPath.current = true;
  }, [currentPage, updateHistoryPath]);

  useEffect(() => {
    const allowedPage = resolvePageAccess(currentPage);
    if (allowedPage !== currentPage) {
      setCurrentPage(allowedPage);
      updateHistoryPath(allowedPage, "replaceState");
    }
  }, [currentPage, resolvePageAccess, updateHistoryPath]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => {
      const pageFromPath = pathToPage(window.location.pathname);
      setCurrentPage(pageFromPath);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (hasRestoredSession.current) return;
    if (!hasLoadedUsers) return;
    if (typeof window === "undefined") return;

    const storedCurrentUser = localStorage.getItem(
      "festivalCurrentUser",
    );

    if (storedCurrentUser && users[storedCurrentUser]) {
      setCurrentUser(storedCurrentUser);
      setCurrentPage(pathToPage(window.location.pathname));
    } else {
      localStorage.removeItem("festivalCurrentUser");
    }

    hasRestoredSession.current = true;
  }, [hasLoadedUsers, users]);

  const handleLogin = (
    username: string,
    password: string,
  ): boolean => {
    if (!hasLoadedUsers) return false;
    const found = findUserByUsername(username);
    if (!found) return false;
    const { username: resolvedUsername, user } = found;

    const hasStoredPassword =
      typeof user.password === "string" && user.password.length > 0;
    if (hasStoredPassword && user.password !== password) {
      return false;
    }

    setCurrentUser(resolvedUsername);
    localStorage.setItem("festivalCurrentUser", resolvedUsername);
    if (user.character) {
      navigate("home");
    } else {
      navigate("create");
    }
    return true;
  };

  const handleSignup = (
    username: string,
    password: string,
  ): boolean => {
    const existing = findUserByUsername(username);
    if (existing) {
      return false;
    }
    const normalizedUsername = username.trim();
    setUsers((prev) => ({
      ...prev,
      [normalizedUsername]: {
        username: normalizedUsername,
        password,
      },
    }));
    setCurrentUser(normalizedUsername);
    localStorage.setItem("festivalCurrentUser", normalizedUsername);
    navigate("create");
    return true;
  };

  const handleCreateCharacter = (
    character: CharacterAppearance,
  ) => {
    if (!currentUser) return;

    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      gameScores: createEmptyGameScores(),
      createdAt: Date.now(),
    };

    const existingUser = users[currentUser];
    const updatedUser: User = {
      ...existingUser,
      character: newCharacter,
    };

    setUsers((prev) => ({
      ...prev,
      [currentUser]: updatedUser,
    }));

    persistUser(updatedUser).catch((error) => {
      console.error("캐릭터 생성 동기화 실패:", error);
    });

    navigate("home");
  };

  const handleUpdateCharacter = (
    character: CharacterAppearance,
  ) => {
    if (!currentUser || !users[currentUser].character) return;

    const updatedCharacter: Character = {
      ...users[currentUser].character!,
      ...character,
    };

    const updatedUser: User = {
      ...users[currentUser],
      character: updatedCharacter,
    };

    setUsers((prev) => ({
      ...prev,
      [currentUser]: updatedUser,
    }));

    persistUser(updatedUser).catch((error) => {
      console.error("캐릭터 업데이트 실패:", error);
    });
  };

  const handleSubmitScore = async (
    username: string,
    gameId: GameModeId,
    score: number,
    accessCode: string,
  ): Promise<boolean> => {
    if (!Number.isFinite(score) || score < 0) return false;
    const found = findUserByUsername(username);
    if (!found) return false;
    const { username: resolvedUsername, user: existingUser } = found;
    if (!existingUser.character) {
      return false;
    }

    const sanitizedScore = Math.floor(score);
    const updatedScores = {
      ...existingUser.character.gameScores,
      [gameId]: sanitizedScore,
    };

    const updatedCharacter: Character = {
      ...existingUser.character,
      gameScores: updatedScores,
    };

    const updatedUser: User = {
      ...existingUser,
      character: updatedCharacter,
    };

    setUsers((prev) => ({
      ...prev,
      [resolvedUsername]: updatedUser,
    }));

    try {
      await submitScoreUpdate(
        resolvedUsername,
        gameModeToColumn(gameId),
        sanitizedScore,
        accessCode,
      );
      return true;
    } catch (error) {
      console.error("점수 업데이트 실패:", error);
      setUsers((prev) => ({
        ...prev,
        [resolvedUsername]: existingUser,
      }));
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("festivalCurrentUser");
    navigate("login");
  };

  const getAllCharacters = (): (Character & {
    username: string;
  })[] => {
    return Object.entries(users)
      .filter(([_, user]) => user.character)
      .map(([username, user]) => ({
        ...user.character!,
        username,
      }));
  };

  if (!hasLoadedUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        데이터를 불러오는 중입니다…
      </div>
    );
  }

  if (currentPage === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  if (currentPage === "create") {
    return (
      <CreateCharacter
        onCreateCharacter={handleCreateCharacter}
        onBack={() => navigate("login")}
      />
    );
  }

  if (
    currentPage === "account" &&
    currentUser &&
    users[currentUser].character
  ) {
    return (
      <AccountPage
        character={users[currentUser].character!}
        username={currentUser}
        onUpdateCharacter={handleUpdateCharacter}
        onBack={() => navigate("home")}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "score") {
    const hasCharacter = currentUser
      ? Boolean(users[currentUser]?.character)
      : false;
    const backTarget = currentUser
      ? hasCharacter
        ? "home"
        : "create"
      : "login";

    return (
      <ScoreSubmissionPage
        allCharacters={getAllCharacters()}
        onSubmitScore={handleSubmitScore}
        onBack={() => navigate(backTarget)}
      />
    );
  }

  if (
    currentPage === "home" &&
    currentUser &&
    users[currentUser].character
  ) {
    return (
      <MainPage
        currentCharacter={users[currentUser].character!}
        currentUsername={currentUser}
        allCharacters={getAllCharacters()}
        onNavigateToAccount={() => navigate("account")}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
