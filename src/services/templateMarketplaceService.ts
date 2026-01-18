import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';

export interface Template {
  id: string;
  name: string;
  type: 'md' | 'html';
  description: string;
  content: string;
  previewImage?: string;
  isCustom?: boolean;
}

class TemplateMarketplaceService {
  private templates: Template[] = [
    {
      id: 'report-template',
      name: '会议周报模板',
      type: 'html',
      description: '标准的会议记录与周报模板，包含参会人员、会议时间及各项目进展。',
      content: '<ul class="report_ul">\n    <li><strong>参会人员</strong></li>\n</ul>\n<p style="margin-left: 40px;"><span style="font-size: 10pt;">范财胜、郭书羽、舒雨翔、王茂森（远程）、罗淇（远程）</span></p>\n<ul class="report_ul">\n    <li><strong>记录人</strong></li>\n</ul>\n<p style="margin-left: 40px;">范财胜</p>\n<ul class="report_ul">\n    <li><strong>会议时间</strong></li>\n</ul>\n<p style="margin-left: 40px;">19：00-21：00</p>\n<ul class="report_ul">\n    <li><strong>IQTS</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>CMIS</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>CDAE/国重点</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>SMDB</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>SRDB</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>ETMS</strong>\n    <ul class="report_ul">\n        <ul>\n            <li><strong>已完成</strong>\n            <ul class="report_ul">\n                <li><strong>整体概述</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>前台</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>人员管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>教学教务</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>统计管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>资源管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>运营管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>系统管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>财务管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>移动端</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>功能测试</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n            </ul>\n            </li>\n            <li><strong>下周目标</strong>\n            <ul class="report_ul">\n                <li><strong>整体概述</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>统计管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>订单管理</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>移动端</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n                <li><strong>功能测试</strong>\n                <ol class="report_ol">\n                    <li class="report_content"></li>\n                </ol>\n                </li>\n            </ul>\n            </li>\n        </ul>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>DBServ</strong>\n    <ul class="report_ul">\n        <li>已完成<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n            <li class="report_content"></li>\n        </ol>\n        </li>\n        <li>下周目标<br />\n        <ol class="report_ol">\n            <li class="report_content"></li>\n        </ol>\n        </li>\n    </ul>\n    </li>\n</ul>\n<ul class="report_ul">\n    <li><strong>相关说明</strong>\n    <ol class="report_ol">\n        <li class="report_content"></li>\n    </ol>\n    </li>\n</ul>'
    },
    {
      id: 'default-md',
      name: '标准 Markdown 模板',
      type: 'md',
      description: '一个标准的幻灯片模板，包含标题、列表和图片。',
      content: '# 标题\n\n## 第一页\n- 要点 1\n- 要点 2\n\n---\n\n## 第二页\n![示例图片](https://picsum.photos/800/600)'
    },
    {
      id: 'business-report',
      name: '商业报告模板',
      type: 'md',
      description: '专业且简洁的商业报告模板。',
      content: '# 2026 年度商业报告\n\n## 核心目标\n- 增长 50%\n- 优化流程\n\n---\n\n## 市场分析\n> 市场正在快速变化，我们需要敏捷应对。'
    },
    {
      id: 'modern-html',
      name: '现代 HTML 模板',
      type: 'html',
      description: '使用现代 CSS 布局的 HTML 模板。',
      content: '<div class="section">\n  <h1>现代 HTML 演示</h1>\n  <p class="tagline">基于 Grid 和 Flexbox 的布局</p>\n</div>\n\n<style>\n  .section {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    padding: 3rem;\n    border-radius: 20px;\n    text-align: center;\n  }\n</style>'
    }
  ];

  constructor() {
    this.loadCustomTemplates();
  }

  private loadCustomTemplates() {
    const customTemplates = getStorageItem<Template[]>(storageKeys.CUSTOM_TEMPLATES, []);
    // 过滤掉可能存在的重复 ID
    const builtInIds = new Set(this.templates.map(t => t.id));
    const uniqueCustom = customTemplates.filter(t => !builtInIds.has(t.id));
    this.templates = [...this.templates, ...uniqueCustom.map(t => ({ ...t, isCustom: true }))];
  }

  getTemplates(): Template[] {
    return [...this.templates];
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  addTemplate(template: Template) {
    const newTemplate = { ...template, isCustom: true };
    this.templates.push(newTemplate);
    
    this.saveCustomTemplates();
  }

  updateTemplateName(id: string, newName: string) {
    const template = this.templates.find(t => t.id === id);
    if (template) {
      template.name = newName;
      if (template.isCustom) {
        this.saveCustomTemplates();
      }
    }
  }

  deleteTemplate(id: string) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      // 允许删除自定义模板
      if (this.templates[index].isCustom) {
        this.templates.splice(index, 1);
        this.saveCustomTemplates();
        return true;
      }
    }
    return false;
  }

  updateTemplate(template: Template) {
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      this.templates[index] = { ...template };
      if (template.isCustom) {
        this.saveCustomTemplates();
      }
    }
  }

  private saveCustomTemplates() {
    // 仅保存自定义模板
    const customOnly = this.templates.filter(t => t.isCustom);
    setStorageItem(storageKeys.CUSTOM_TEMPLATES, customOnly);
  }
}

export const templateMarketplaceService = new TemplateMarketplaceService();
