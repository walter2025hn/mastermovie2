import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { AppRemoteConfig, BlockedUserRecord } from '../types';

export const CURRENT_APP_VERSION = '2.1.0';

export const DEFAULT_REMOTE_CONFIG: AppRemoteConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Estamos realizando tareas de optimización en los servidores. Por favor, vuelve a intentar en unos minutos.',
  latestVersion: '2.1.0',
  minRequiredVersion: '2.0.0',
  updateUrl: 'https://github.com/walter2025hn/mastermovie2/releases',
  forceUpdate: false,
  updateMessage: '¡Nueva versión oficial disponible con mejoras de velocidad, controles en pantalla y mayor estabilidad!',
  globalAnnouncement: '¡Bienvenidos a Master Movie! Disfruta de las mejores películas y series en alta velocidad.',
  showAnnouncement: false,
  adminPin: '1234',
  updatedAt: new Date().toISOString(),
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class RemoteControlService {
  private configDocRef() {
    if (!db) return null;
    return doc(db, 'app_config', 'general');
  }

  // Real-time listener for application configuration & kill switch
  public subscribeToConfig(callback: (config: AppRemoteConfig) => void): () => void {
    const docRef = this.configDocRef();
    if (!docRef) {
      callback(DEFAULT_REMOTE_CONFIG);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<AppRemoteConfig>;
          callback({
            ...DEFAULT_REMOTE_CONFIG,
            ...data,
          });
        } else {
          // Initialize document in Firestore if it doesn't exist yet
          try {
            await setDoc(docRef, DEFAULT_REMOTE_CONFIG);
          } catch (e) {
            console.warn('Could not auto-seed app_config document:', e);
          }
          callback(DEFAULT_REMOTE_CONFIG);
        }
      },
      (error) => {
        console.warn('Error reading app_config stream from Firestore:', error);
        callback(DEFAULT_REMOTE_CONFIG);
      }
    );

    return unsubscribe;
  }

  // Update remote application settings from Admin Panel
  public async updateConfig(updates: Partial<AppRemoteConfig>): Promise<void> {
    const docRef = this.configDocRef();
    const path = 'app_config/general';
    if (!docRef) throw new Error('Base de datos no inicializada');

    try {
      const snap = await getDoc(docRef);
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (snap.exists()) {
        await updateDoc(docRef, payload);
      } else {
        await setDoc(docRef, { ...DEFAULT_REMOTE_CONFIG, ...payload });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Real-time listener to check if current logged in user is blocked
  public listenUserBlockedStatus(
    username: string,
    callback: (blocked: boolean, reason?: string) => void
  ): () => void {
    if (!db || !username) {
      callback(false);
      return () => {};
    }

    const cleanUsername = username.trim().toLowerCase();
    const userDocRef = doc(db, 'blocked_users', cleanUsername);

    return onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BlockedUserRecord;
          if (data.active !== false) {
            callback(true, data.reason || 'Tu acceso a Master Movie ha sido suspendido por la administración.');
            return;
          }
        }
        callback(false);
      },
      (err) => {
        console.warn('Error checking blocked status:', err);
        callback(false);
      }
    );
  }

  // Get all blocked users (Admin Panel)
  public async getBlockedUsers(): Promise<BlockedUserRecord[]> {
    if (!db) return [];
    const path = 'blocked_users';
    try {
      const colRef = collection(db, path);
      const snap = await getDocs(colRef);
      const list: BlockedUserRecord[] = [];
      snap.forEach((d) => {
        const item = d.data() as BlockedUserRecord;
        list.push({
          username: d.id,
          reason: item.reason || '',
          blockedAt: item.blockedAt || '',
          active: item.active !== false,
        });
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }

  // Block a user by username (Admin Panel)
  public async blockUser(username: string, reason: string): Promise<void> {
    if (!db) throw new Error('Base de datos no disponible');
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) throw new Error('Nombre de usuario inválido');

    const path = `blocked_users/${cleanUsername}`;
    try {
      const userDocRef = doc(db, 'blocked_users', cleanUsername);
      await setDoc(userDocRef, {
        username: cleanUsername,
        reason: reason || 'Acceso revocado por el administrador',
        blockedAt: new Date().toISOString(),
        active: true,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Unblock a user (Admin Panel)
  public async unblockUser(username: string): Promise<void> {
    if (!db) throw new Error('Base de datos no disponible');
    const cleanUsername = username.trim().toLowerCase();
    const path = `blocked_users/${cleanUsername}`;
    try {
      const userDocRef = doc(db, 'blocked_users', cleanUsername);
      await deleteDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // Check if an update is strictly required based on semver
  public isUpdateRequired(installedVersion: string, minRequiredVersion: string): boolean {
    return this.compareVersions(installedVersion, minRequiredVersion) < 0;
  }

  // Check if a newer version exists
  public hasNewerVersion(installedVersion: string, latestVersion: string): boolean {
    return this.compareVersions(installedVersion, latestVersion) < 0;
  }

  public compareVersions(v1: string, v2: string): number {
    const parts1 = (v1 || '0').split('.').map((p) => parseInt(p, 10) || 0);
    const parts2 = (v2 || '0').split('.').map((p) => parseInt(p, 10) || 0);
    const maxLen = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLen; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }
}

export const remoteControlService = new RemoteControlService();
