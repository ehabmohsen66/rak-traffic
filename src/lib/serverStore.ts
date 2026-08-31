import fs from 'fs';
import path from 'path';
import { 
  AppState, 
  User, 
  Task, 
  TaskComment, 
  AuditLog, 
  Notification, 
  EmailLog, 
  EmailConfig, 
  Client, 
  RecurrenceRule 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_TASKS, 
  INITIAL_RECURRENCE_RULES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_EMAIL_CONFIG,
  INITIAL_EMAIL_LOGS
} from './mockData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rak_traffic_data.json');
const AVATARS_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');

export function getInitialServerState(): AppState {
  return {
    users: INITIAL_USERS,
    clients: INITIAL_CLIENTS,
    tasks: INITIAL_TASKS,
    recurrenceRules: INITIAL_RECURRENCE_RULES,
    auditLogs: INITIAL_AUDIT_LOGS,
    notifications: INITIAL_NOTIFICATIONS,
    emailLogs: INITIAL_EMAIL_LOGS,
    emailConfig: INITIAL_EMAIL_CONFIG,
    comments: {},
    currentUserId: 'usr-farah',
    currentRole: 'admin',
    language: 'en'
  };
}

let inMemoryState: AppState | null = null;
let writePromise: Promise<void> = Promise.resolve();

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
  }
}

/**
 * Load server state from disk (or initialize from defaults if not present)
 */
export async function getServerState(): Promise<AppState> {
  if (inMemoryState) {
    return inMemoryState;
  }

  ensureDirectories();

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = await fs.promises.readFile(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);

      // Merge users with full priority to user-saved customizations (avatar, email, department, name, role)
      let mergedUsers = INITIAL_USERS;
      if (Array.isArray(parsed.users)) {
        mergedUsers = INITIAL_USERS.map((initUser) => {
          const savedUser = parsed.users.find((u: User) => u.id === initUser.id);
          return savedUser ? {
            ...initUser,
            ...savedUser,
            email: savedUser.email || initUser.email,
            avatar: savedUser.avatar || initUser.avatar,
            name: savedUser.name || initUser.name,
            department: savedUser.department || initUser.department,
            role: savedUser.role || initUser.role
          } : initUser;
        });

        parsed.users.forEach((u: User) => {
          if (!mergedUsers.some((m) => m.id === u.id)) {
            mergedUsers.push(u);
          }
        });
      }

      const loadedState: AppState = {
        ...getInitialServerState(),
        ...parsed,
        users: mergedUsers,
        emailLogs: parsed.emailLogs || INITIAL_EMAIL_LOGS,
        emailConfig: { ...INITIAL_EMAIL_CONFIG, ...(parsed.emailConfig || {}) }
      };
      inMemoryState = loadedState;

      return loadedState;
    } catch (err) {
      console.error('Failed to read server data file, falling back to defaults:', err);
    }
  }

  const fallbackState = getInitialServerState();
  inMemoryState = fallbackState;
  await persistServerState(fallbackState);
  return fallbackState;
}

/**
 * Atomic write to disk to prevent corrupt partial writes
 */
export async function persistServerState(state: AppState): Promise<void> {
  ensureDirectories();
  inMemoryState = state;

  const tempFile = path.join(DATA_DIR, `data_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.tmp`);
  const jsonContent = JSON.stringify(state, null, 2);

  // Queue writes sequentially
  writePromise = writePromise.then(async () => {
    try {
      await fs.promises.writeFile(tempFile, jsonContent, 'utf-8');
      await fs.promises.rename(tempFile, DATA_FILE);
    } catch (err) {
      console.error('Failed to atomically write server state:', err);
      try {
        if (fs.existsSync(tempFile)) {
          await fs.promises.unlink(tempFile);
        }
      } catch {
        // ignore cleanup error
      }
    }
  });

  return writePromise;
}

/**
 * Update server state safely via an updater function
 */
export async function updateServerState(
  updater: (prevState: AppState) => AppState | Promise<AppState>
): Promise<AppState> {
  const currentState = await getServerState();
  const newState = await updater(currentState);
  await persistServerState(newState);
  return newState;
}

/**
 * Update a user profile on the server (email, avatar, department, name, role)
 */
export async function updateUserOnServer(
  userId: string, 
  updates: Partial<User>
): Promise<{ user: User | null; state: AppState }> {
  let updatedUser: User | null = null;

  const newState = await updateServerState((state: AppState) => {
    const userIndex = state.users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) return state;

    const current = state.users[userIndex];
    updatedUser = {
      ...current,
      ...updates
    };

    const newUsers = [...state.users];
    newUsers[userIndex] = updatedUser;

    // Update avatar/name in comments
    const newComments = { ...state.comments };
    if (updates.avatar || updates.name) {
      Object.keys(newComments).forEach((taskId) => {
        newComments[taskId] = newComments[taskId].map((cmt: TaskComment) => {
          if (cmt.userId === userId) {
            return {
              ...cmt,
              ...(updates.avatar ? { userAvatar: updates.avatar } : {}),
              ...(updates.name ? { userName: updates.name } : {})
            };
          }
          return cmt;
        });
      });
    }

    return {
      ...state,
      users: newUsers,
      comments: newComments
    };
  });

  return { user: updatedUser, state: newState };
}

/**
 * Save user avatar file to public uploads
 */
export async function saveUserAvatarFile(
  userId: string, 
  base64Data: string
): Promise<string> {
  ensureDirectories();

  // If already a remote URL (http/https), return as is
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  // If base64 data URI
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Data;
  }

  const extension = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
  const fileName = `avatar_${userId.replace(/[^a-zA-Z0-9_-]/g, '')}_${Date.now()}.${extension}`;
  const filePath = path.join(AVATARS_DIR, fileName);
  const fileBuffer = Buffer.from(matches[2], 'base64');

  await fs.promises.writeFile(filePath, fileBuffer);
  return `/uploads/avatars/${fileName}`;
}
