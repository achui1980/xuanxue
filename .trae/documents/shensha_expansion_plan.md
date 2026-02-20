# 神煞系统扩展计划 (ShenSha Expansion Plan)

用户已确认优先实施 **1.3 完善神煞系统**。本计划旨在大幅扩充现有的神煞库，提升八字分析的深度和趣味性。

## 1. 目标神煞列表 (Target ShenSha List)

我们将引入以下高频使用的神煞：

*   **吉神 (Positive/Auspicious)**:
    *   **天乙贵人 (Tian Yi Gui Ren)**: 最强的贵人星，解危济难。需区分阴阳贵人（阳贵、阴贵）。
    *   **太极贵人 (Tai Ji Gui Ren)**: 主聪明好学、喜玄学宗教。
    *   **文昌贵人 (Wen Chang Gui Ren)**: 主学业、才华、考试运。
    *   **天德/月德贵人 (Tian/Yue De Gui Ren)**: 主逢凶化吉、福气。
    *   **红鸾/天喜 (Hong Luan/Tian Xi)**: 主婚恋、喜庆之事。
    *   **金舆 (Jin Yu)**: 主富贵、交通工具（现代指车）。

*   **凶煞/中性 (Negative/Neutral)**:
    *   **羊刃 (Yang Ren)**: 主刚强、急躁、易受伤（身弱为帮身，身强为忌）。
    *   **魁罡 (Kui Gang)**: 主性格刚烈、掌权、聪明。
    *   **劫煞 (Jie Sha)**: 主破财、阻碍。
    *   **孤辰/寡宿 (Gu Chen/Gua Su)**: 主孤独、六亲缘薄。

## 2. 实施步骤 (Implementation Steps)

### 2.1 算法实现 (`src/utils/tyme.js`)
*   **扩展 `calculateShenSha` 函数**:
    *   目前该函数仅返回 5 种基础神煞。
    *   需要编写新的查找逻辑（Lookup Tables 或 条件判断）。
    *   **输入**: 年干/年支、日干/日支。
    *   **输出**: 神煞名称数组。

### 2.2 数据结构更新 (`src/stores/energy.js`)
*   在 `calculateHourEnergy` 中调用新的神煞算法。
*   将神煞结果存储在 `energy.shenSha` 字段中。
*   **评分权重调整**:
    *   天乙贵人: +5分
    *   天德/月德: +3分
    *   文昌: +2分
    *   羊刃 (视身强弱而定，暂定 -2分 或 +2分)
    *   红鸾/天喜: +2分 (主要影响情感运势)

### 2.3 UI 展示更新
*   **组件**: `src/components/RealTimeClock.vue` 或 `TodayTab.vue`。
*   **展示方式**:
    *   在时辰卡片上增加神煞标签（Tags）。
    *   吉神用 <span style="color: #d4a373">金色/红色</span> 高亮。
    *   凶煞用 <span style="color: #6c757d">灰色/黑色</span> 标记。
*   **解释文案**: 点击神煞标签，弹出简短解释（Tooltip）。

## 3. 技术细节 (Technical Details)

### 查法示例 (部分)
*   **天乙贵人**:
    *   甲戊并牛羊 (丑、未)
    *   乙己鼠猴乡 (子、申)
    *   丙丁猪鸡位 (亥、酉)
    *   壬癸蛇兔藏 (巳、卯)
    *   庚辛逢虎马 (寅、午)
*   **太极贵人**:
    *   甲乙生人子午中，丙丁鸡兔定亨通...
*   **红鸾/天喜**:
    *   基于生年支（属相）查流日/流时支。
    *   鼠人见卯为红鸾，见酉为天喜...

## 4. 验证计划 (Verification)
*   编写单元测试 `src/utils/tyme.spec.js`。
*   针对特定八字案例（如：甲子日生人），验证在丑时是否出现“天乙贵人”。
