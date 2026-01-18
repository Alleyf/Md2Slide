// localStorage 工具函数

export const storageKeys = {
  THEME: 'md2slide-theme',
  MARKDOWN: 'md2slide-markdown',
  EDITOR_STATE: 'md2slide-editor-state',
  PREVIEW_NAV_POSITION: 'md2slide-preview-nav-position',
  APP_SETTINGS: 'md2slide-app-settings',
  AI_CONFIG: 'md2slide-ai-config',
  CUSTOM_THEME: 'md2slide-custom-theme',
  ENABLED_PLUGINS: 'md2slide-enabled-plugins',
  INSTALLED_THEMES: 'md2slide-installed-themes',
} as const;

/**
 * 从 localStorage 读取值
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * 写入值到 localStorage
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * 从 localStorage 删除值
 */
export const removeStorageItem = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * 读取主题设置
 */
export const getTheme = (): 'light' | 'dark' => {
  return getStorageItem<'light' | 'dark'>(storageKeys.THEME, 'dark');
};

/**
 * 保存主题设置
 */
export const setTheme = (theme: 'light' | 'dark'): void => {
  setStorageItem(storageKeys.THEME, theme);
};
