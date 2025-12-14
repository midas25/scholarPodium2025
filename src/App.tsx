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
  accessories: string[];
};

export type Character = {
  id: string;
  createdAt: number;
  totalScore: number;
  gameScores: Record<GameModeId, number>;
} & CharacterAppearance;

export type User = {
  username: string;
  password: string;
  character?: Character;
};

type Page = "login" | "home" | "create" | "account" | "score";

const calculateTotalScore = (
  scores: Record<GameModeId, number>,
) => Object.values(scores).reduce((sum, value) => sum + value, 0);

const FALLBACK_AVATARS = [
  "🐯",
  "🐉",
  "🐰",
  "🦊",
  "🐼",
  "🦁",
  "🐸",
  "🐻",
];

const FALLBACK_COLORS = [
  "#FF6B35",
  "#4ECDC4",
  "#FFD93D",
  "#A78BFA",
  "#FB7185",
  "#34D399",
  "#60A5FA",
  "#F472B6",
];

const createEmptyGameScores = (): Record<GameModeId, number> => {
  return GAME_MODES.reduce(
    (acc, mode) => {
      acc[mode.id] = 0;
      return acc;
    },
    {} as Record<GameModeId, number>,
  );
};

const createPlaceholderCharacter = (
  username: string,
  displayName?: string,
): Character => {
  const appearance: CharacterAppearance = {
    name: displayName?.trim() || `${username}의 캐릭터`,
    avatar:
      FALLBACK_AVATARS[
        Math.floor(Math.random() * FALLBACK_AVATARS.length)
      ],
    color:
      FALLBACK_COLORS[
        Math.floor(Math.random() * FALLBACK_COLORS.length)
      ],
    accessories: [],
  };

  const scores = createEmptyGameScores();

  return {
    ...appearance,
    id: Date.now().toString(),
    createdAt: Date.now(),
    gameScores: scores,
    totalScore: calculateTotalScore(scores),
  };
};

const generateRandomGameScores = (): Record<
  GameModeId,
  number
> => {
  return GAME_MODES.reduce(
    (acc, mode) => {
      acc[mode.id] =
        Math.floor(Math.random() * 2000) + 4000;
      return acc;
    },
    {} as Record<GameModeId, number>,
  );
};

const distributeExistingScore = (
  total: number,
): Record<GameModeId, number> => {
  if (!Number.isFinite(total) || total <= 0) {
    return generateRandomGameScores();
  }

  const base = Math.floor(total / GAME_MODES.length);
  let remainder = total - base * GAME_MODES.length;

  const scores: Record<GameModeId, number> = {} as Record<
    GameModeId,
    number
  >;

  GAME_MODES.forEach((mode) => {
    const variation = Math.floor(Math.random() * 600) - 300;
    let value = base + variation;
    if (remainder > 0) {
      value += 1;
      remainder -= 1;
    }
    scores[mode.id] = Math.max(0, value);
  });

  const currentTotal = calculateTotalScore(scores);
  const diff = total - currentTotal;
  if (diff !== 0) {
    const firstMode = GAME_MODES[0].id;
    scores[firstMode] = Math.max(0, scores[firstMode] + diff);
  }

  return scores;
};

const normalizeCharacter = (raw: any): Character => {
  const fallbackScores = generateRandomGameScores();

  const legacyScores =
    typeof raw?.score === "number"
      ? distributeExistingScore(raw.score)
      : null;

  const normalizedGameScores = GAME_MODES.reduce(
    (acc, mode) => {
      const existingValue =
        raw?.gameScores?.[mode.id];
      if (typeof existingValue === "number") {
        acc[mode.id] = existingValue;
      } else if (legacyScores) {
        acc[mode.id] = legacyScores[mode.id];
      } else {
        acc[mode.id] = fallbackScores[mode.id];
      }
      return acc;
    },
    {} as Record<GameModeId, number>,
  );

  const totalScore =
    typeof raw?.totalScore === "number"
      ? raw.totalScore
      : calculateTotalScore(normalizedGameScores);

  return {
    id: String(raw?.id ?? Date.now().toString()),
    name: raw?.name ?? "플레이어",
    avatar: raw?.avatar ?? "🎮",
    color: raw?.color ?? "#FF6B35",
    accessories: Array.isArray(raw?.accessories)
      ? raw.accessories
      : [],
    createdAt:
      typeof raw?.createdAt === "number"
        ? raw.createdAt
        : Date.now(),
    gameScores: normalizedGameScores,
    totalScore,
  };
};

const normalizeUsersData = (
  raw: any,
): Record<string, User> => {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  return Object.entries(raw).reduce(
    (acc, [username, userData]) => {
      if (!userData || typeof userData !== "object") {
        return acc;
      }

      const normalizedUser: User = {
        username:
          (userData as User).username ?? username,
        password: (userData as User).password ?? "",
      };

      if ((userData as User).character) {
        normalizedUser.character = normalizeCharacter(
          (userData as User).character,
        );
      }

      acc[username] = normalizedUser;
      return acc;
    },
    {} as Record<string, User>,
  );
};

const pageToPath: Record<Page, string> = {
  login: "/login",
  home: "/home",
  create: "/create",
  account: "/account",
  score: "/score",
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);
  const [currentUser, setCurrentUser] = useState<string | null>(
    null,
  );
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isUsersLoaded, setIsUsersLoaded] = useState(false);
  const hasNormalizedPath = useRef(false);
  const hasRestoredSession = useRef(false);

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

  const resolvePageAccess = useCallback(
    (page: Page): Page => {
      if (page === "score") return "score";
      if (!currentUser) {
        return page === "login" ? "login" : "login";
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
    [currentUser, users],
  );

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
    // Load users from localStorage
    const savedUsers = localStorage.getItem("festivalUsers");
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      const normalized = normalizeUsersData(parsed);
      setUsers(normalized);
      localStorage.setItem(
        "festivalUsers",
        JSON.stringify(normalized),
      );
    } else {
      // Initialize with some mock data
      const mockUsers: Record<string, User> = {
        "1": {
          username: "1",
          password: "1",
          character: {
            id: "1",
            name: "불타는 호랑이",
            avatar: "🐯",
            color: "#FF6B35",
            accessories: ["왕관", "목걸이"],
            createdAt: Date.now() - 86400000,
            gameScores: {
              dance: 4200,
              rhythm: 3600,
              puzzle: 3100,
              raid: 3900,
            },
            totalScore: 14800,
          },
        },
        mystic: {
          username: "mystic",
          password: "1",
          character: {
            id: "2",
            name: "신비한 용",
            avatar: "🐉",
            color: "#4ECDC4",
            accessories: ["마법지팡이"],
            createdAt: Date.now() - 172800000,
            gameScores: {
              dance: 3600,
              rhythm: 3800,
              puzzle: 3300,
              raid: 4100,
            },
            totalScore: 14800,
          },
        },
        bunny: {
          username: "bunny",
          password: "1",
          character: {
            id: "3",
            name: "귀여운 토끼",
            avatar: "🐰",
            color: "#FFD93D",
            accessories: ["모자"],
            createdAt: Date.now() - 259200000,
            gameScores: {
              dance: 3100,
              rhythm: 2900,
              puzzle: 3500,
              raid: 3300,
            },
            totalScore: 12800,
          },
        },
      };
      const normalizedMock = normalizeUsersData(mockUsers);
      setUsers(normalizedMock);
      localStorage.setItem(
        "festivalUsers",
        JSON.stringify(normalizedMock),
      );
    }
    setIsUsersLoaded(true);
  }, []);

  useEffect(() => {
    if (!isUsersLoaded || hasRestoredSession.current) return;
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
  }, [isUsersLoaded, users]);

  const saveUsers = (updatedUsers: Record<string, User>) => {
    setUsers(updatedUsers);
    localStorage.setItem(
      "festivalUsers",
      JSON.stringify(updatedUsers),
    );
  };

  const handleLogin = (
    username: string,
    password: string,
  ): boolean => {
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser(username);
      localStorage.setItem("festivalCurrentUser", username);
      if (user.character) {
        navigate("home");
      } else {
        navigate("create");
      }
      return true;
    }
    return false;
  };

  const handleSignup = (
    username: string,
    password: string,
  ): boolean => {
    if (users[username]) {
      return false; // User already exists
    }
    const newUsers = {
      ...users,
      [username]: { username, password },
    };
    saveUsers(newUsers);
    setCurrentUser(username);
    localStorage.setItem("festivalCurrentUser", username);
    navigate("create");
    return true;
  };

  const handleCreateCharacter = (
    character: CharacterAppearance,
  ) => {
    if (!currentUser) return;

    const gameScores = createEmptyGameScores();
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      gameScores,
      totalScore: calculateTotalScore(gameScores),
      createdAt: Date.now(),
    };

    const updatedUsers = {
      ...users,
      [currentUser]: {
        ...users[currentUser],
        character: newCharacter,
      },
    };
    saveUsers(updatedUsers);
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

    const updatedUsers = {
      ...users,
      [currentUser]: {
        ...users[currentUser],
        character: updatedCharacter,
      },
    };
    saveUsers(updatedUsers);
  };

  const handleSubmitScore = (
    username: string,
    gameId: GameModeId,
    score: number,
  ): boolean => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return false;
    if (!Number.isFinite(score) || score < 0) return false;

    const existingUser = users[trimmedUsername];
    if (!existingUser || !existingUser.character) {
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
      totalScore: calculateTotalScore(updatedScores),
    };

    const updatedUsers = {
      ...users,
      [trimmedUsername]: {
        ...existingUser,
        character: updatedCharacter,
      },
    };

    saveUsers(updatedUsers);
    return true;
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
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

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
        onNavigateToScoreEntry={() => navigate("score")}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
