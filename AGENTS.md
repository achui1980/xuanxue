# AGENTS.md - 玄学时机应用 (AI 代理开发指南)

本文件提供给在此代码库中工作的 AI 编码代理（如 Copilot, Cursor, Claude, OpenCode）使用。
请遵循以下构建命令、代码风格和工程约定。

## 📋 项目概览
- **类型**: Vue 3 SPA (Composition API)
- **状态管理**: Pinia (Setup Stores)
- **构建工具**: Vite
- **测试框架**: Vitest
- **语言**: JavaScript (ESM)
- **核心库**: `tyme4ts` (八字/农历计算)

## 🛠️ 常用命令 (可以直接复制执行)

### 安装与运行
- 安装依赖: `npm install`
- 启动开发: `npm run dev` (默认端口 3000)
- 构建生产: `npm run build`
- 预览构建: `npm run preview`

### 代码质量
- Lint (自动修复): `npm run lint` (ESLint)
- 仅检查 Lint: `npx eslint .`
- 格式化代码: `npm run format` (Prettier)

### 测试 (Vitest)
- 运行所有测试: `npm run test` (默认 Watch 模式)
- 运行所有测试 (一次性): `npx vitest run`
- **运行单个测试文件**:
  ```bash
  npx vitest run src/utils/tyme.spec.js
  ```
- **运行特定测试用例** (按名称匹配):
  ```bash
  npx vitest run -t "should have correct WU_XING values"
  ```

## 📁 项目结构
- `src/components/`: Vue 组件 (PascalCase, `<script setup>`)
- `src/composables/`: 组合式函数 (`use*.js`)
- `src/stores/`: Pinia 状态管理 (`*.js`, Setup Store 模式)
- `src/utils/`: 工具函数 (特别是 `tyme.js` 核心算法)
- `vite.config.js`: 配置了 `@` 别名指向 `src`

## 🤖 AI 工具规则
- **Cursor**: 未检测到 `.cursor/rules/` 或 `.cursorrules`。
- **Copilot**: 未检测到 `.github/copilot-instructions.md`。
*请严格遵循本文档中的约定。*

## 🎨 代码风格与约定

### 1. 格式化 (Prettier/EditorConfig)
- **缩进**: 2 空格
- **分号**: 不使用 (`semi: false`)
- **引号**: 单引号 (`singleQuote: true`)
- **行宽**: 100 字符
- **尾随逗号**: 无 (`trailingComma: "none"`)

### 2. 导入规范
- **路径别名**: 必须优先使用 `@` 指向 `src` 目录。
  - ✅ `import { useUserStore } from '@/stores/user'`
  - ❌ `import { useUserStore } from '../../stores/user'`
- **顺序**:
  1. Vue 核心 (`import { ref } from 'vue'`)
  2. 第三方库 (`import { defineStore } from 'pinia'`)
  3. 内部模块 (`@/stores/...`, `@/utils/...`)
  4. 相对路径 (仅限紧密耦合的同级文件)
  5. 样式文件

### 3. 命名约定
- **组件文件**: `PascalCase.vue` (如 `EnergyChart.vue`)
- **组合式函数**: `useCamelCase.js` (如 `useBeijingTime.js`)
- **Store 文件**: `camelCase.js` (如 `user.js`)，导出 `useUserStore`
- **常量**: `SCREAMING_SNAKE_CASE` (如 `WU_XING`)
- **CSS 类名**: `kebab-case` (scoped 优先)

### 4. Vue 组件模式
- 必须使用 `<script setup>` 语法。
- Props 定义: `const props = defineProps({ ... })`
- Emits 定义: `const emit = defineEmits(['event-name'])`
- 尽量保持视图逻辑简单，复杂逻辑提取到 `composables` 或 `utils`。

### 5. Pinia Store 模式
- 使用 Setup Store 语法 (`defineStore('id', () => { ... })`)。
- State 使用 `ref`，Getters 使用 `computed`，Actions 使用普通函数。
- 必须显式 `return` 需要暴露的状态和方法。

### 6. 类型与错误处理 (JavaScript)
由于没有 TypeScript，请遵循以下防御性编程习惯：
- **输入校验**: 在 Utils 函数入口处检查参数有效性。
- **外部调用**: 调用 `tyme4ts` 或处理 `Date` 转换时，必须使用 `try/catch` 包裹。
  ```javascript
  try {
    const solarTime = SolarTime.fromYmdHms(...)
    // ...
  } catch (error) {
    console.error('计算八字失败:', error) // 保留中文错误日志方便调试
    return null // 返回安全的空值或默认值
  }
  ```
- **默认值**: `computed` 或函数返回值应提供合理的 fallback (如能量分数默认 50)，防止 UI 崩溃。

### 7. 数据隐私
- 所有用户数据 (生辰、偏好) 仅存储在浏览器的 `localStorage` 中。
- **严禁**添加任何将用户数据上传至云端的代码。
