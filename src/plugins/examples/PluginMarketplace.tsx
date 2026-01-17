import React, { useState, useEffect } from 'react';
import { PluginManifest } from '../../types/plugin';
import { pluginLoader } from '../PluginLoader';

interface PluginMarketplaceProps {
  onPluginInstall?: (pluginId: string) => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ onPluginInstall }) => {
  const [availablePlugins, setAvailablePlugins] = useState<PluginManifest[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from a plugin registry
      // For demo purposes, we'll create mock plugins
      const mockPlugins: PluginManifest[] = [
        {
          id: 'code-runner',
          name: 'Code Runner',
          version: '1.0.0',
          description: 'Execute code snippets directly in slides',
          author: 'Md2Slide Team',
          homepage: 'https://github.com/md2slide/plugins',
          license: 'MIT',
        },
        {
          id: 'mermaid-diagrams',
          name: 'Mermaid Diagrams',
          version: '1.0.0',
          description: 'Create beautiful diagrams and charts',
          author: 'Md2Slide Team',
          homepage: 'https://github.com/md2slide/plugins',
          license: 'MIT',
        },
        {
          id: 'presentation-analytics',
          name: 'Presentation Analytics',
          version: '1.0.0',
          description: 'Track engagement and viewer metrics',
          author: 'Md2Slide Team',
          homepage: 'https://github.com/md2slide/plugins',
          license: 'MIT',
        },
        {
          id: 'export-templates',
          name: 'Export Templates',
          version: '1.0.0',
          description: 'Additional export formats and templates',
          author: 'Md2Slide Team',
          homepage: 'https://github.com/md2slide/plugins',
          license: 'MIT',
        }
      ];

      setAvailablePlugins(mockPlugins);
      
      // Simulate installed plugins
      setInstalledPlugins(['code-runner']);
    } catch (error) {
      console.error('Error loading plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (pluginId: string) => {
    setInstalling(prev => ({ ...prev, [pluginId]: true }));
    
    try {
      // In a real implementation, this would install the plugin
      // For demo, we'll simulate installation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInstalledPlugins(prev => [...prev, pluginId]);
      onPluginInstall?.(pluginId);
      alert(`Plugin "${pluginId}" installed successfully!`);
    } catch (error) {
      console.error(`Error installing plugin ${pluginId}:`, error);
      alert(`Failed to install plugin: ${error}`);
    } finally {
      setInstalling(prev => ({ ...prev, [pluginId]: false }));
    }
  };

  const handleUninstall = (pluginId: string) => {
    if (window.confirm(`Are you sure you want to uninstall "${pluginId}"?`)) {
      setInstalledPlugins(prev => prev.filter(id => id !== pluginId));
      alert(`Plugin "${pluginId}" uninstalled.`);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading plugins...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Plugin Marketplace</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {availablePlugins.map(plugin => (
          <div 
            key={plugin.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
                  {plugin.name}
                </h3>
                <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                  v{plugin.version} by {plugin.author}
                </p>
                <p style={{ margin: '0 0 16px 0', color: '#444' }}>
                  {plugin.description}
                </p>
              </div>
              {installedPlugins.includes(plugin.id) ? (
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  INSTALLED
                </span>
              ) : null}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {installedPlugins.includes(plugin.id) ? (
                <button
                  onClick={() => handleUninstall(plugin.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Uninstall
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(plugin.id)}
                  disabled={installing[plugin.id]}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    cursor: installing[plugin.id] ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {installing[plugin.id] ? 'Installing...' : 'Install'}
                </button>
              )}
              
              {plugin.homepage && (
                <a 
                  href={plugin.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '14px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Details
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {availablePlugins.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontSize: '16px'
        }}>
          No plugins available in the marketplace
        </div>
      )}
    </div>
  );
};