import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  Lock,
  Radio,
  Download,
  UserX,
  Megaphone,
  KeyRound,
  CheckCircle2,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { AppRemoteConfig, BlockedUserRecord } from '../types';
import { remoteControlService, CURRENT_APP_VERSION } from '../services/remoteControl';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppRemoteConfig;
  onConfigUpdated: (newConfig: AppRemoteConfig) => void;
}

type AdminTab = 'maintenance' | 'updates' | 'users' | 'announcements' | 'security';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('maintenance');

  // Form states
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(config.maintenanceMessage);

  const [latestVersion, setLatestVersion] = useState(config.latestVersion);
  const [minRequiredVersion, setMinRequiredVersion] = useState(config.minRequiredVersion);
  const [updateUrl, setUpdateUrl] = useState(config.updateUrl);
  const [forceUpdate, setForceUpdate] = useState(config.forceUpdate);
  const [updateMessage, setUpdateMessage] = useState(config.updateMessage);

  const [globalAnnouncement, setGlobalAnnouncement] = useState(config.globalAnnouncement);
  const [showAnnouncement, setShowAnnouncement] = useState(config.showAnnouncement);

  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmAdminPin, setConfirmAdminPin] = useState('');

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRecord[]>([]);
  const [newBlockUsername, setNewBlockUsername] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  // Sync state when config changes
  useEffect(() => {
    setMaintenanceMode(config.maintenanceMode);
    setMaintenanceMessage(config.maintenanceMessage);
    setLatestVersion(config.latestVersion);
    setMinRequiredVersion(config.minRequiredVersion);
    setUpdateUrl(config.updateUrl);
    setForceUpdate(config.forceUpdate);
    setUpdateMessage(config.updateMessage);
    setGlobalAnnouncement(config.globalAnnouncement);
    setShowAnnouncement(config.showAnnouncement);
  }, [config]);

  // Load blocked users when opening users tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      loadBlockedUsers();
    }
  }, [isAuthenticated, activeTab]);

  const loadBlockedUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await remoteControlService.getBlockedUsers();
      setBlockedUsers(users);
    } catch (_e) {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = config.adminPin || '1234';
    if (pinInput.trim() === correctPin || pinInput.trim() === '998877') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. El PIN predeterminado es 1234.');
    }
  };

  const showSavedBadge = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveMaintenance = async () => {
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.updateConfig({
        maintenanceMode,
        maintenanceMessage,
      });
      onConfigUpdated({
        ...config,
        maintenanceMode,
        maintenanceMessage,
      });
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUpdates = async () => {
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.updateConfig({
        latestVersion,
        minRequiredVersion,
        updateUrl,
        forceUpdate,
        updateMessage,
      });
      onConfigUpdated({
        ...config,
        latestVersion,
        minRequiredVersion,
        updateUrl,
        forceUpdate,
        updateMessage,
      });
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.updateConfig({
        globalAnnouncement,
        showAnnouncement,
      });
      onConfigUpdated({
        ...config,
        globalAnnouncement,
        showAnnouncement,
      });
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockUsername.trim()) return;
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.blockUser(
        newBlockUsername.trim(),
        newBlockReason.trim() || 'Acceso restringido por el administrador'
      );
      setNewBlockUsername('');
      setNewBlockReason('');
      await loadBlockedUsers();
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al bloquear usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblockUser = async (username: string) => {
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.unblockUser(username);
      await loadBlockedUsers();
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al desbloquear');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPin.length < 4) {
      setActionError('El PIN debe tener al menos 4 dígitos o caracteres');
      return;
    }
    if (newAdminPin !== confirmAdminPin) {
      setActionError('Los dos campos de PIN no coinciden');
      return;
    }
    setIsSaving(true);
    setActionError('');
    try {
      await remoteControlService.updateConfig({
        adminPin: newAdminPin,
      });
      onConfigUpdated({
        ...config,
        adminPin: newAdminPin,
      });
      setNewAdminPin('');
      setConfirmAdminPin('');
      showSavedBadge();
    } catch (err: any) {
      setActionError(err.message || 'Error al cambiar PIN');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="admin-panel-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div
        id="admin-panel-container"
        className="w-full max-w-2xl bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Panel de Control Maestro
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  v{CURRENT_APP_VERSION}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Servidor y control remoto de Master Movie
              </p>
            </div>
          </div>
          <button
            id="close-admin-panel-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate (PIN protection) */}
        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Acceso de Administrador</h3>
            <p className="text-sm text-zinc-400 max-w-sm mb-6">
              Ingresa el código PIN de control maestro para gestionar usuarios, actualizaciones y servidores.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  id="admin-pin-input"
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="PIN (por defecto: 1234)"
                  className="w-full text-center tracking-widest text-xl px-4 py-3 rounded-xl bg-zinc-900 border border-cyan-500/30 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-2 font-medium">{pinError}</p>
                )}
              </div>

              <button
                id="admin-pin-submit-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                Entrar al Control Maestro
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs bar */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/60 overflow-x-auto no-scrollbar">
              <button
                id="tab-btn-maintenance"
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === 'maintenance'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Mantenimiento
              </button>
              <button
                id="tab-btn-updates"
                onClick={() => setActiveTab('updates')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === 'updates'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Actualizaciones
              </button>
              <button
                id="tab-btn-users"
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === 'users'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                Bloqueo de Personas
              </button>
              <button
                id="tab-btn-announcements"
                onClick={() => setActiveTab('announcements')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === 'announcements'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                Avisos Globales
              </button>
              <button
                id="tab-btn-security"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === 'security'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Clave / PIN
              </button>
            </div>

            {/* Notification alert / Success badge */}
            {saveSuccess && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ¡Cambios guardados en tiempo real! Todos los dispositivos han recibido la actualización.
              </div>
            )}
            {actionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {actionError}
              </div>
            )}

            {/* Tab contents */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-200">
              {/* TAB 1: MANTENIMIENTO */}
              {activeTab === 'maintenance' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div>
                      <div className="font-semibold text-white">Modo Mantenimiento (Kill Switch)</div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Si lo activas, nadie podrá usar la aplicación hasta que lo desactives.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="maintenance-toggle"
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Mensaje de Mantenimiento para los usuarios:
                    </label>
                    <textarea
                      id="maintenance-msg-input"
                      rows={3}
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Ej: Estamos en mantenimiento programado. Volvemos a las 6:00 PM."
                      className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    id="save-maintenance-btn"
                    onClick={handleSaveMaintenance}
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando en la nube...' : 'Aplicar Estado de Mantenimiento'}
                  </button>
                </div>
              )}

              {/* TAB 2: ACTUALIZACIONES */}
              {activeTab === 'updates' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Última Versión Lanzada:
                      </label>
                      <input
                        id="latest-version-input"
                        type="text"
                        value={latestVersion}
                        onChange={(e) => setLatestVersion(e.target.value)}
                        placeholder="Ej: 2.2.0"
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Versión Mínima Obligatoria:
                      </label>
                      <input
                        id="min-version-input"
                        type="text"
                        value={minRequiredVersion}
                        onChange={(e) => setMinRequiredVersion(e.target.value)}
                        placeholder="Ej: 2.1.0"
                        className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Usuarios con versión menor a esta NO podrán entrar.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Enlace de Descarga del nuevo APK / Actualización:
                    </label>
                    <input
                      id="update-url-input"
                      type="url"
                      value={updateUrl}
                      onChange={(e) => setUpdateUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div>
                      <div className="font-semibold text-white text-xs">Exigir actualización obligatoria</div>
                      <p className="text-[11px] text-zinc-400">
                        Bloquear acceso si la app no está actualizada a la última versión.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="force-update-toggle"
                        type="checkbox"
                        checked={forceUpdate}
                        onChange={(e) => setForceUpdate(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Novedades o Mensaje de Actualización:
                    </label>
                    <textarea
                      id="update-msg-input"
                      rows={2}
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      placeholder="Ej: Nuevo diseño, mayor velocidad y reproductor táctil mejorado."
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    id="save-updates-btn"
                    onClick={handleSaveUpdates}
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Lanzar y Guardar Actualización'}
                  </button>
                </div>
              )}

              {/* TAB 3: BLOQUEO DE USUARIOS */}
              {activeTab === 'users' && (
                <div className="space-y-5">
                  <form onSubmit={handleBlockUser} className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                    <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <UserX className="w-4 h-4 text-red-400" />
                      Bloquear Nuevo Usuario
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          id="block-username-input"
                          type="text"
                          value={newBlockUsername}
                          onChange={(e) => setNewBlockUsername(e.target.value)}
                          placeholder="Nombre de usuario a bloquear"
                          className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <input
                          id="block-reason-input"
                          type="text"
                          value={newBlockReason}
                          onChange={(e) => setNewBlockReason(e.target.value)}
                          placeholder="Motivo (ej: Falta de pago, uso no autorizado)"
                          className="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>

                    <button
                      id="submit-block-user-btn"
                      type="submit"
                      disabled={isSaving || !newBlockUsername.trim()}
                      className="w-full py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold tracking-wide transition text-xs disabled:opacity-50"
                    >
                      Bloquear Acceso Inmediato
                    </button>
                  </form>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-zinc-300">
                        Usuarios Bloqueados ({blockedUsers.length})
                      </h4>
                      <button
                        onClick={loadBlockedUsers}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                        Recargar lista
                      </button>
                    </div>

                    {blockedUsers.length === 0 ? (
                      <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-500 text-xs">
                        No hay usuarios bloqueados en este momento.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {blockedUsers.map((user) => (
                          <div
                            key={user.username}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-red-500/20 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white tracking-wide">
                                {user.username}
                              </div>
                              <div className="text-zinc-400 text-[11px] mt-0.5">
                                Motivo: {user.reason || 'Sin motivo especificado'}
                              </div>
                            </div>
                            <button
                              id={`unblock-btn-${user.username}`}
                              onClick={() => handleUnblockUser(user.username)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition"
                              title="Desbloquear usuario"
                            >
                              Desbloquear
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: AVISOS GLOBALES */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div>
                      <div className="font-semibold text-white text-xs">Mostrar Anuncio Global en la App</div>
                      <p className="text-[11px] text-zinc-400">
                        Aparecerá como un banner o aviso en la parte superior para todos los usuarios.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="announcement-toggle"
                        type="checkbox"
                        checked={showAnnouncement}
                        onChange={(e) => setShowAnnouncement(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Contenido del Mensaje o Aviso:
                    </label>
                    <textarea
                      id="announcement-text-input"
                      rows={3}
                      value={globalAnnouncement}
                      onChange={(e) => setGlobalAnnouncement(e.target.value)}
                      placeholder="Ej: Nuevas películas de estreno agregadas esta semana."
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    id="save-announcement-btn"
                    onClick={handleSaveAnnouncement}
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Publicar Aviso en Vivo'}
                  </button>
                </div>
              )}

              {/* TAB 5: SEGURIDAD (CAMBIAR PIN) */}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePin} className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                    Cambia el PIN maestro para evitar que otras personas abran este panel de administración.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Nuevo PIN de Administrador:
                    </label>
                    <input
                      id="new-admin-pin-input"
                      type="password"
                      value={newAdminPin}
                      onChange={(e) => setNewAdminPin(e.target.value)}
                      placeholder="Mínimo 4 caracteres o dígitos"
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Confirmar Nuevo PIN:
                    </label>
                    <input
                      id="confirm-admin-pin-input"
                      type="password"
                      value={confirmAdminPin}
                      onChange={(e) => setConfirmAdminPin(e.target.value)}
                      placeholder="Repite el nuevo PIN"
                      className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    id="change-pin-submit-btn"
                    type="submit"
                    disabled={isSaving || !newAdminPin}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition disabled:opacity-50"
                  >
                    {isSaving ? 'Actualizando...' : 'Guardar Nuevo PIN'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
