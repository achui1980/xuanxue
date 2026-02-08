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

## 🛠️ 常用命令

### 安装与运行

- 安装依赖: `npm install`
- 启动开发: `npm run dev` (默认端口 3000)
- 构建生产: `npm run build`
- 预览构建: `npm run preview`

### 代码质量

- Lint (自动修复): `npm run lint`
- 仅检查 Lint: `npx eslint .`
- 格式化代码: `npm run format`

### 测试 (Vitest)

- 运行所有测试: `npm run test` (Watch 模式)
- 运行所有测试 (一次性): `npx vitest run`
- **运行单个测试文件**: `npx vitest run src/utils/tyme.spec.js`
- **运行特定测试**: `npx vitest run -t "test name"`

## 📁 项目结构

- `src/components/`: Vue 组件 (PascalCase)
- `src/composables/`: 组合式函数 (`use*.js`)
- `src/stores/`: Pinia 状态管理
- `src/utils/`: 工具函数
- `src/components/icons/`: SVG 图标组件
- `src/components/common/`: 通用基础组件
- `@` 别名指向 `src`

## 🎨 代码风格

### 格式化

- **缩进**: 2 空格
- **分号**: 不使用
- **引号**: 单引号
- **行宽**: 100 字符
- **尾随逗号**: 无

### 导入规范

- **路径别名**: 必须使用 `@`
  - ✅ `import { useUserStore } from '@/stores/user'`
  - ❌ `import { useUserStore } from '../../stores/user'`
- **顺序**: Vue → 第三方 → 内部模块 → 相对路径 → 样式

### 命名约定

- **组件**: `PascalCase.vue` (如 `EnergyChart.vue`)
- **组合式函数**: `useCamelCase.js`
- **Store**: `camelCase.js`，导出 `useUserStore`
- **常量**: `SCREAMING_SNAKE_CASE`
- **CSS**: `kebab-case`，scoped 优先

### Vue 组件

- 必须使用 `<script setup>`
- Props: `const props = defineProps({ ... })`
- Emits: `const emit = defineEmits(['event'])`
- 复杂逻辑提取到 composables

### Pinia Store

- 使用 Setup Store 语法
- State: `ref`，Getters: `computed`，Actions: 普通函数
- 必须显式 `return` 暴露的状态和方法

### 错误处理

- Utils 函数入口检查参数
- 调用 `tyme4ts` 或 `Date` 转换使用 `try/catch`
- 提供合理的 fallback 默认值
- 保留中文错误日志方便调试

```javascript
try {
  const result = calculateBaZi(year, month, day, hour)
  return result
} catch (error) {
  console.error('计算失败:', error)
  return null
}
```

### CSS 变量使用

项目使用 CSS 变量系统，所有颜色必须通过变量引用：

- `--wood`, `--fire`, `--earth`, `--metal`, `--water` (五行色)
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--bg-primary`, `--bg-secondary`, `--bg-elevated`
- `--border-subtle`, `--border-light`, `--border-medium`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`

### 设计系统组件

- 使用 `BaseCard` 作为基础卡片容器
- 使用 `AppIcon` 和 `ElementIcon` 作为图标
- 按钮使用 `.btn`, `.btn-primary`, `.btn-secondary` 类
- 输入框使用 `.input` 类

### 响应式设计

- 移动端断点: `768px`
- 使用 CSS Grid 和 Flexbox
- 避免使用固定像素值，优先使用变量

### 数据隐私

- 所有用户数据仅存储在 `localStorage`
- **严禁**添加上传用户数据到云端的代码

## 🚫 禁止事项

- 不要在组件中使用 emoji，使用 SVG 图标
- 不要直接写死颜色值，使用 CSS 变量
- 不要使用 `console.log` 在生产代码中（错误日志除外）
- 不要提交包含 secrets 的文件

## ✅ 提交前检查

- [ ] 运行 `npm run lint` 无错误
- [ ] 运行 `npm run test` 全部通过
- [ ] 代码遵循命名约定
- [ ] 使用路径别名 `@`
- [ ] 添加适当的错误处理
