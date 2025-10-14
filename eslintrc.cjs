/* ESLint config con límites entre módulos y buenas prácticas TS/NestJS */
module.exports = {
  root: true,
  env: { node: true, es2023: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    // Si usás reglas con chequeo de tipos, agregá:
    // project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'import', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:security/recommended'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  },
  rules: {
    // Estilo y calidad
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc', caseInsensitive: true }
    }],
    'import/no-default-export': 'off', // habilitalo si querés solo named exports
    'security/detect-object-injection': 'off', // demasiado ruidosa en codebase típica

    // --- LÍMITES ENTRE MÓDULOS ---
    // Bloquear dependencias desde output/* hacia cualquier módulo interno,
    // excepto los DTOs de liquidacion/presenters (DIP).
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          target: './src/modules/output',
          from: './src/modules',
          except: ['./src/modules/liquidacion/presenters']
        }
      ]
    }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      files: ['src/modules/output/**/*.{ts,tsx}'],
      rules: {
        // Solo permitir imports internos desde presenters
        'import/no-internal-modules': ['error', {
          allow: ['src/modules/liquidacion/presenters/**']
        }]
      }
    }
  ]
};
