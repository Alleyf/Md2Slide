export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: 'nextSlide' | 'prevSlide' | 'toggleFullscreen' | 'toggleEditor' | 'duplicateLine' | 'deleteLine' | 'moveLineUp' | 'moveLineDown' | 'insertBold' | 'insertItalic' | 'insertStrikethrough' | 'insertCode' | 'insertLink' | 'insertImage' | 'insertVideo' | 'insertCodeBlock' | 'insertHeading1' | 'insertHeading2' | 'insertHeading3' | 'insertList' | 'insertOrderedList' | 'insertTodo' | 'insertQuote' | 'insertTable' | 'insertFormula' | 'insertMathBlock' | 'insertPageBreak' | 'saveFile';
  description: string;
}

export interface ShortcutConfig {
  nextSlide: string[];
  prevSlide: string[];
  toggleFullscreen: string[];
  toggleEditor: string[];
  duplicateLine: string[];
  deleteLine: string[];
  moveLineUp: string[];
  moveLineDown: string[];
  formatContinuation: string[];
  saveFile: string[];
  newFile: string[];
  openFile: string[];
  exportPdf: string[];
  exportPptx: string[];
  toggleTheme: string[];
  showHelp: string[];
  showSettings: string[];
  undo: string[];
  redo: string[];
  find: string[];
  findNext: string[];
  findPrev: string[];
  replace: string[];
  selectAll: string[];
  copy: string[];
  cut: string[];
  paste: string[];
  insertBold: string[];
  insertItalic: string[];
  insertStrikethrough: string[];
  insertCode: string[];
  insertLink: string[];
  insertImage: string[];
  insertVideo: string[];
  insertCodeBlock: string[];
  insertHeading1: string[];
  insertHeading2: string[];
  insertHeading3: string[];
  insertList: string[];
  insertOrderedList: string[];
  insertTodo: string[];
  insertQuote: string[];
  insertTable: string[];
  insertFormula: string[];
  insertMathBlock: string[];
  insertPageBreak: string[];
  formatDocument: string[];
}

export const defaultShortcuts: ShortcutConfig = {
  nextSlide: [' ', 'ArrowRight'],
  prevSlide: ['ArrowLeft', 'Backspace'],
  toggleFullscreen: ['f', 'F11'],
  toggleEditor: ['e'],
  duplicateLine: ['ctrl+d', 'meta+d'],
  deleteLine: ['ctrl+shift+d', 'meta+shift+d'],
  moveLineUp: ['alt+arrowup'],
  moveLineDown: ['alt+arrowdown'],
  formatContinuation: ['enter'],
  saveFile: ['ctrl+s', 'meta+s'],
  newFile: ['ctrl+n', 'meta+n'],
  openFile: ['ctrl+o', 'meta+o'],
  exportPdf: ['ctrl+shift+p', 'meta+shift+p'],
  exportPptx: ['ctrl+shift+e', 'meta+shift+e'],
  toggleTheme: ['ctrl+shift+t', 'meta+shift+t'],
  showHelp: ['f1'],
  showSettings: ['ctrl+,', 'meta+,'],
  undo: ['ctrl+z', 'meta+z'],
  redo: ['ctrl+y', 'meta+shift+z'],
  find: ['ctrl+f', 'meta+f'],
  findNext: ['f3', 'ctrl+g', 'meta+g'],
  findPrev: ['shift+f3', 'ctrl+shift+g', 'meta+shift+g'],
  replace: ['ctrl+h', 'meta+h'],
  selectAll: ['ctrl+a', 'meta+a'],
  copy: ['ctrl+c', 'meta+c'],
  cut: ['ctrl+x', 'meta+x'],
  paste: ['ctrl+v', 'meta+v'],
  insertBold: ['ctrl+b', 'meta+b'],
  insertItalic: ['ctrl+i', 'meta+i'],
  insertStrikethrough: ['ctrl+shift+s', 'meta+shift+s'],
  insertCode: ['ctrl+e', 'meta+e'],
  insertLink: ['ctrl+k', 'meta+k'],
  insertImage: ['ctrl+shift+i', 'meta+shift+i'],
  insertVideo: ['ctrl+alt+m', 'meta+alt+m'],
  insertCodeBlock: ['ctrl+shift+k', 'meta+shift+k'],
  insertHeading1: ['ctrl+1', 'meta+1'],
  insertHeading2: ['ctrl+2', 'meta+2'],
  insertHeading3: ['ctrl+3', 'meta+3'],
  insertList: ['ctrl+l', 'meta+l'],
  insertOrderedList: ['ctrl+shift+l', 'meta+shift+l'],
  insertTodo: ['ctrl+shift+t', 'meta+shift+t'],
  insertQuote: ['ctrl+shift+q', 'meta+shift+q'],
  insertTable: ['ctrl+alt+t', 'meta+alt+t'],
  insertFormula: ['ctrl+m', 'meta+m'],
  insertMathBlock: ['ctrl+shift+m', 'meta+shift+m'],
  insertPageBreak: ['ctrl+shift+enter', 'meta+shift+enter'],
  formatDocument: ['ctrl+shift+f', 'meta+shift+f'],
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
  'ctrl+d': 'Ctrl+D',
  'meta+d': 'Cmd+D',
  'ctrl+shift+d': 'Ctrl+Shift+D',
  'meta+shift+d': 'Cmd+Shift+D',
  'alt+arrowup': 'Alt+↑',
  'alt+arrowdown': 'Alt+↓',
  'ctrl+b': 'Ctrl+B',
  'meta+b': 'Cmd+B',
  'ctrl+i': 'Ctrl+I',
  'meta+i': 'Cmd+I',
  'ctrl+shift+s': 'Ctrl+Shift+S',
  'meta+shift+s': 'Cmd+Shift+S',
  'ctrl+e': 'Ctrl+E',
  'meta+e': 'Cmd+E',
  'ctrl+k': 'Ctrl+K',
  'meta+k': 'Cmd+K',
  'ctrl+shift+i': 'Ctrl+Shift+I',
  'meta+shift+i': 'Cmd+Shift+I',
  'ctrl+alt+m': 'Ctrl+Alt+M',
  'meta+alt+m': 'Cmd+Alt+M',
  'ctrl+shift+k': 'Ctrl+Shift+K',
  'meta+shift+k': 'Cmd+Shift+K',
  'ctrl+1': 'Ctrl+1',
  'meta+1': 'Cmd+1',
  'ctrl+2': 'Ctrl+2',
  'meta+2': 'Cmd+2',
  'ctrl+3': 'Ctrl+3',
  'meta+3': 'Cmd+3',
  'ctrl+l': 'Ctrl+L',
  'meta+l': 'Cmd+L',
  'ctrl+shift+l': 'Ctrl+Shift+L',
  'meta+shift+l': 'Cmd+Shift+L',
  'ctrl+shift+t': 'Ctrl+Shift+T',
  'meta+shift+t': 'Cmd+Shift+T',
  'ctrl+shift+q': 'Ctrl+Shift+Q',
  'meta+shift+q': 'Cmd+Shift+Q',
  'ctrl+alt+t': 'Ctrl+Alt+T',
  'meta+alt+t': 'Cmd+Alt+T',
  'ctrl+m': 'Ctrl+M',
  'meta+m': 'Cmd+M',
  'ctrl+shift+m': 'Ctrl+Shift+M',
  'meta+shift+m': 'Cmd+Shift+M',
  'ctrl+shift+enter': 'Ctrl+Shift+Enter',
  'meta+shift+enter': 'Cmd+Shift+Enter',
  'ctrl+s': 'Ctrl+S',
  'meta+s': 'Cmd+S',
};
