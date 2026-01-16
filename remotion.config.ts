import { defineConfig } from '@remotion/cli/config';

export default defineConfig({
  // Set the default image format
  imageFormat: 'png',
  
  // Set the default pixel format
  pixelFormat: 'yuv420p',
  
  // Set the default codec
  codec: 'h264',
  
  // Set the default frame rate
  frameRate: 30,
  
  // Set the default resolution
  width: 1920,
  height: 1080,
  
  // Enable verbose logging
  logLevel: 'info',
});
