export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: 'nextSlide' | 'prevSlide' | 'toggleFullscreen' | 'toggleEditor';
  description: string;
}

export interface ShortcutConfig {
  nextSlide: string[];
  prevSlide: string[];
  toggleFullscreen: string[];
  toggleEditor: string[];
}

export const defaultShortcuts: ShortcutConfig = {
  nextSlide: [' ', 'ArrowRight', 'Enter'],
  prevSlide: ['ArrowLeft', 'Backspace'],
  toggleFullscreen: ['f', 'F11'],
  toggleEditor: ['e'],
};

export const shortcutDescriptions: Record<string, string> = {
  ' ': '空格键',
  'ArrowRight': '右方向键',
  'ArrowLeft': '左方向键',
  'Enter': '回车键',
  'Backspace': 'Backspace 键',
  'f': 'F 键',
  'F11': 'F11 键',
  'e': 'E 键',
};
