import { afterEach } from '@testing-library/react';
import { cleanup } from '@testing-library/react';

// 每个测试后清理
afterEach(() => {
  cleanup();
});
