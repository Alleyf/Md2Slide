import JSZip from 'jszip';
import { BasePlugin } from './BasePlugin';
import { PluginAPI, PluginManifest } from '../types/plugin';
import { FileItem } from '../types/file';

export class DownloadPlugin extends BasePlugin {
  static manifest: PluginManifest = {
    id: 'download-plugin',
    name: '文件下载助手',
    description: '支持通过右键菜单下载单个文件或整个目录的压缩包',
    version: '1.0.0',
    author: 'Md2Slide',
    tags: ['utility', 'file-management'],
    icon: 'Download',
    features: ['context-menu']
  };

  async initialize(api: PluginAPI): Promise<void> {
    // 注册右键菜单项
    api.registerContextMenuAction({
      id: 'download-item',
      label: (item) => item.kind === 'directory' ? '下载目录压缩包' : '下载此文件',
      icon: 'Download',
      onClick: async (item) => {
        if (item.kind === 'directory') {
          await this.downloadDirectory(item);
        } else {
          this.downloadFile(item);
        }
      }
    });
  }

  async destroy(): Promise<void> {
    // 插件销毁时的清理工作
  }

  private async getLatestContent(file: FileItem): Promise<string> {
    // 优先使用传入的 content
    if (file.content) return file.content;
    
    // 尝试从 localStorage 获取
    const filePath = file.path || file.name;
    const storageKey = `md2slide_file_${filePath}`;
    const savedContent = localStorage.getItem(storageKey);
    if (savedContent !== null) return savedContent;
    
    // 如果是静态文件，尝试从服务器获取
    if (file.isStatic) {
      try {
        const response = await fetch(`/${filePath}`);
        if (response.ok) {
          return await response.text();
        }
      } catch (error) {
        console.error('Failed to fetch static file content for download:', error);
      }
    }
    
    return '';
  }

  private async downloadFile(file: FileItem) {
    const content = await this.getLatestContent(file);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async downloadDirectory(dir: FileItem) {
    const zip = new JSZip();
    await this.addFolderToZip(zip, dir);
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dir.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async addFolderToZip(zip: JSZip, folder: FileItem) {
    const folderZip = zip.folder(folder.name);
    if (!folderZip) return;

    if (folder.children) {
      for (const item of folder.children) {
        if (item.kind === 'directory') {
          await this.addFolderToZip(folderZip, item);
        } else {
          const content = await this.getLatestContent(item);
          folderZip.file(item.name, content);
        }
      }
    }
  }
}
