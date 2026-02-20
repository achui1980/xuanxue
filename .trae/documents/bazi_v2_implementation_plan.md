# 八字能量算法 V2.0 实施计划

## 1. 目标
将现有的八字能量计算逻辑重构，完全对齐 `docs/bazi-energy-algorithm-v2.md` 规范。重点在于引入模块化计算、完善地支关系（三合、三会、相刑等）、增加特殊格局判定，并优化返回值结构以减轻 Store 层的负担。

## 2. 核心任务分解

### 2.1 基础数据与工具库升级 (`src/utils/tyme.js`)
- [ ] **补充常量定义**:
    - 添加 `SAN_HE` (地支三合局: 申子辰合水...)
    - 添加 `SAN_HUI` (地支三会局: 寅卯辰会木...)
    - 完善 `LIU_HE` / `LIU_CHONG` / `HEAVENLY_STEM_ELEMENTS` 等常量的导出（如果尚未导出）。
- [ ] **工具函数增强**:
    - 确保 `calculateBaZi` 能正确处理日柱和时柱的干支获取。

### 2.2 模块化计算函数实现 (`src/utils/tyme.js`)
将原有的 `calculateHourEnergy` 拆解为独立的纯函数：
- [ ] **`calculateDayImpact(userBazi, dayPillar)`**:
    - 实现日干 vs 日主（生助/同类/克/被克）。
    - 实现日支 vs 日支（六合/六冲）。
    - **新增**: 日支 vs 年支（六合/六冲）。
- [ ] **`calculateHourImpact(userBazi, dayPillar, hourPillar)`**:
    - 实现时干 vs 日主。
    - 实现时支 vs 日支（六合/六冲）。
    - 实现时支 vs 日柱地支（六合/六冲）。
    - 实现时支 vs 年支（岁破）。
- [ ] **`calculateShenShaImpact(userBazi, hourPillar)`**:
    - 封装神煞查找与分值计算（贵人+10, 文昌+6, 桃花+3, 驿马+2, 冲煞-15）。
    - 返回结构包含 `score`, `reasons`, `stars`, `clashes`。
- [ ] **`calculateSpecialCombo(userBazi, dayPillar, hourPillar)`**: (新功能)
    - 实现 **双合** (日柱+时柱同时合命主日支)。
    - 实现 **双冲** (日柱+时柱同时冲命主日支)。
    - 实现 **三合局** / **三会局** 判定。
    - 实现 日柱 vs 时柱 互作。

### 2.3 主入口函数实现 (`src/utils/tyme.js`)
- [ ] **实现 `calculateHourEnergyV2(userBazi, userGods, queryDate)`**:
    - 编排上述模块调用。
    - 汇总分数并限制范围 (20-95)。
    - 生成最终对象结构：`{ score, level, reasons, shenSha, clashes }`。
- [ ] **保留/标记旧函数**:
    - 标记 `calculateHourEnergy` 为 deprecated 或保留用于对比测试。

### 2.4 状态管理层适配 (`src/stores/energy.js`)
- [ ] **重构 `hoursData` 计算**:
    - 切换调用 `calculateHourEnergyV2`。
    - 移除 Store 中冗余的 `brief`, `elementHint`, `shenShaDesc` 等手动拼接逻辑，直接使用 V2 返回的结构化数据。
    - 适配 V2 返回的 `level` 字段。
- [ ] **清理无用代码**:
    - 删除 Store 中旧的评分映射逻辑。

### 2.5 测试与验证 (`src/utils/tyme.spec.js`)
- [ ] **单元测试升级**:
    - 为 `calculateDayImpact` 等子函数编写针对性测试。
    - 编写 `calculateHourEnergyV2` 的综合测试用例。
    - 验证特殊格局（如三合局）是否正确加分。
- [ ] **对比测试**:
    - 选取特定日期，对比 V1 和 V2 的输出差异，确保 V2 解决了"分数过于集中"的问题。

## 3. 执行顺序
1.  修改 `src/utils/tyme.js` 添加常量和子函数。
2.  实现 `calculateHourEnergyV2` 主函数。
3.  编写/运行单元测试验证 V2 逻辑。
4.  修改 `src/stores/energy.js` 接入 V2 算法。
5.  在浏览器中验证最终效果。
