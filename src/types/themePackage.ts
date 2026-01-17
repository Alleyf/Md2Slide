export interface ThemeMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  homepage?: string;
  tags?: string[];
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemePackage {
  metadata: ThemeMetadata;
  theme: any; // 实际主题对象，可能包含颜色、字体等配置
  files: {
    css?: string;
    js?: string;
    assets?: string[]; // 资源文件路径
  };
}

export interface ThemeInstallSource {
  type: 'npm' | 'github' | 'url' | 'local';
  identifier: string; // 包名、仓库地址或URL
}

export interface ThemeMarketplaceConfig {
  repositories: ThemeRepository[];
  cacheDir?: string;
  maxCacheSize?: number;
}

export interface ThemeRepository {
  id: string;
  name: string;
  url: string;
  type: 'github' | 'npm' | 'custom';
  description: string;
}