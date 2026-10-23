import tseslint from 'typescript-eslint';
import { configs } from '../../shared/eslint.config.mjs';

configs[1].rules = {
  ...configs[1].rules,
  '@typescript-eslint/prefer-nullish-coalescing': 'off'
};

export default tseslint.config(
  ...configs,
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
);
