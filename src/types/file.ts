export interface FileItem {
  name: string;
  path: string; // 全路径，用于标识文件
  kind: 'file' | 'directory';
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  isStatic?: boolean;
  content?: string;
  children?: FileItem[];
}
