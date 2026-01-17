export interface FileItem {
  name: string;
  kind: 'file' | 'directory';
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  isStatic?: boolean;
  content?: string;
  children?: FileItem[];
}
