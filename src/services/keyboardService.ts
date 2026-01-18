import { ShortcutConfig, defaultShortcuts } from '../types/keyboard';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';

export interface KeyboardService {
  getShortcuts(): ShortcutConfig;
  setShortcuts(config: ShortcutConfig): void;
  setShortcut(action: keyof ShortcutConfig, shortcut: string): void;
  resetToDefaults(): void;
  getDefaultShortcuts(): ShortcutConfig;
  validateShortcut(shortcut: string): boolean;
  isShortcutConflict(shortcut: string, action: keyof ShortcutConfig): boolean;
  getActionForKeyboardEvent(event: KeyboardEvent): keyof ShortcutConfig | null;
}

class KeyboardServiceImpl implements KeyboardService {
  private static instance: KeyboardServiceImpl;
  private shortcuts: ShortcutConfig;

  private constructor() {
    this.shortcuts = this.loadShortcuts();
  }

  public static getInstance(): KeyboardServiceImpl {
    if (!KeyboardServiceImpl.instance) {
      KeyboardServiceImpl.instance = new KeyboardServiceImpl();
    }
    return KeyboardServiceImpl.instance;
  }

  private loadShortcuts(): ShortcutConfig {
    const stored = getStorageItem<ShortcutConfig>(storageKeys.SHORTCUTS, defaultShortcuts);
    return { ...defaultShortcuts, ...stored };
  }

  public getShortcuts(): ShortcutConfig {
    return { ...this.shortcuts };
  }

  public setShortcuts(config: ShortcutConfig): void {
    this.shortcuts = { ...defaultShortcuts, ...config };
    setStorageItem(storageKeys.SHORTCUTS, this.shortcuts);
  }

  public resetToDefaults(): void {
    this.shortcuts = { ...defaultShortcuts };
    setStorageItem(storageKeys.SHORTCUTS, this.shortcuts);
  }

  public validateShortcut(shortcut: string): boolean {
    // 验证快捷键格式是否有效
    const parts = shortcut.toLowerCase().split('+');
    const validModifiers = ['ctrl', 'meta', 'shift', 'alt'];
    const validKeys = [
      'backspace', 'tab', 'enter', 'shift', 'ctrl', 'alt', 'capslock', 'escape',
      'space', 'pageup', 'pagedown', 'end', 'home', 'arrowleft', 'arrowup', 'arrowright', 'arrowdown',
      'insert', 'delete', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
      '`', '-', '=', '[', ']', '\\', ';', '\'', ',', '.', '/', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'
    ];

    if (parts.length === 0) return false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      // 如果是最后一个部分，它必须是有效按键
      if (i === parts.length - 1) {
        if (!validKeys.includes(part)) {
          return false;
        }
      } else {
        // 其他部分必须是修饰键
        if (!validModifiers.includes(part)) {
          return false;
        }
      }
    }

    return true;
  }

  public setShortcut(action: keyof ShortcutConfig, shortcut: string): void {
    const updatedShortcuts = { ...this.shortcuts };
    updatedShortcuts[action] = [shortcut];
    this.setShortcuts(updatedShortcuts);
  }

  public getDefaultShortcuts(): ShortcutConfig {
    return { ...defaultShortcuts };
  }

  public isShortcutConflict(shortcut: string, action: keyof ShortcutConfig): boolean {
    const normalizedShortcut = shortcut.toLowerCase();
    
    // 检查是否与其他动作的快捷键冲突
    for (const [otherAction, otherShortcuts] of Object.entries(this.shortcuts)) {
      if (otherAction !== action) {
        for (const otherShortcut of otherShortcuts) {
          if (otherShortcut.toLowerCase() === normalizedShortcut) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  public getActionForKeyboardEvent(event: KeyboardEvent): keyof ShortcutConfig | null {
    // 构建当前按键事件的字符串表示
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.metaKey) modifiers.push('meta');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    
    // 获取按键名
    let key = event.key.toLowerCase();
    // 标准化某些按键名
    if (key === ' ') key = 'space';
    if (key === 'arrowup') key = 'up';
    if (key === 'arrowdown') key = 'down';
    if (key === 'arrowleft') key = 'left';
    if (key === 'arrowright') key = 'right';
    if (key === 'escape') key = 'esc';
    if (key === 'control') key = 'ctrl';
    if (key === 'alt') key = 'alt';
    if (key === 'shift') key = 'shift';
    if (key === 'meta') key = 'meta';
    
    // 组合修饰键和按键
    const eventString = [...modifiers, key].join('+');
    
    // 遍历所有快捷键配置，查找匹配项
    for (const [action, shortcuts] of Object.entries(this.shortcuts)) {
      for (const shortcut of shortcuts) {
        if (shortcut.toLowerCase() === eventString) {
          return action as keyof ShortcutConfig;
        }
      }
    }
    
    return null;
  }
}

export const keyboardService = KeyboardServiceImpl.getInstance();