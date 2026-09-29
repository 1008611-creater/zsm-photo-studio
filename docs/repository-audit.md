# 产品定位与已验证复用候选

这不是新产品的既有工程架构。下列代码树分别属于用户或开源项目，尚无任何生产集成授权；本文件只记只读盘点证据。

## ANS 社区承载项目

- GitHub CLI 只读查询确认仓库 `1008611-creater/ans-platform` 当前为 private，默认分支 `main`，简介为“ANS 组织官网与 AI 原生社区平台（基于 prompts-chat 复用改造）”。查询时间：2026-09-29（Asia/Shanghai）。
- 仓库 `PROJECT_CONTEXT.md` 将 ANS 定位为面向 CAU 学生的 AI 能力社区，并说明其与 CAUHub 独立；技术栈记载为 Next.js App Router、React、TypeScript、PostgreSQL/Prisma、NextAuth、next-intl。`ANS-README.md` 记载社区账号、模板/工作流、额度、学生项目等方向。
- 根 `README.md` 仍描述 prompts.chat/提示词库及其自托管能力，与当前 ANS 社区产品上下文存在叙述差异。计划项目入驻方式应以站点现状及 `ANS-README.md`、`PROJECT_CONTEXT.md`、社区 PRD/MRD 等一手材料为准。
- 当前用户意图：新写真创作产品作为学生创业项目展示/入驻 ANS 社区，独立使用 `zsm.cauai.fun`。这不代表产品源码已经并入 `ans-platform`，也不代表产品页面、路由或部署已经创建。
- 以上为仓库元数据和文档核对，不是对社区线上页面、登录态、入驻流程或生产部署的端到端验证。

## Arnis 上游

- 官方仓库：`https://github.com/louis-e/arnis`。已只读浅克隆到 `_research/arnis`；本次分析时 HEAD `71aa444bd6b973682db9187575b7f363b9c43373`（2026-09-29），`Cargo.toml` 版本 3.2.0，Apache-2.0，另含注明 LGPL-2.1-or-later 来源的 Luanti 映射文件。
- README 明确它生成反映真实地理/地形/建筑的 Minecraft Java、Bedrock、Luanti 世界，主要使用 OpenStreetMap 和高程数据。CLI bbox 选区生成，不是现成托管网页 API。
- 它的桌面应用是 Rust + Tauri；`src/gui.rs` 注册桌面命令；`src/preview_3d.rs` 和 GUI 的 `preview3d.js` 支持选区地形、Overture 建筑、土地覆盖的交互 3D 地图预览。此预览接近灰白模基底，地图楼形/高程受开放数据质量限制。
- 当前 GUI/preview 的证据是 Tauri IPC 桌面调用和 MapLibre 预览，没有证据证明上游提供稳定的 Web 服务、可供商业网站远程调用的 HTTP API，或用于人物摆放/拍照导演的 glTF/GLB 摄影级 scene export。虽然仓库还含 3D 模型体素化/游戏世界生成功能，这不等于它具备网站可直接消费的摄影场景管线。
- 结论：**概念可行，原样接入不够**。可选路线为：A) 抽取/封装场景数据及预览服务为后端任务；B) 基于预览管线独立导出标准网格/GLB；C) 用可许可地图/城市 3D 与高程直接构建 web 场景，Arnis 留作可选方块世界导出。路线须先做一个地点 spike 测数据、性能、外观和输出格式。

## 用户的两个产品站点

- `https://hb.cauai.fun` 经 HTTP 重定向到 `https://one.cauai.fun/auth/hb.html`，网页 title 为 “CAUAI One · 无限画布”。这是登录门控后的已部署服务；匿名网页检查不能证明已登录后的接口行为。
- 盘点本机 `E:\codex\huabu\AGENTS.md`（治理仓；不是 authoritative app source）：指出 hb 属于开源无限画布 `basketikun/infinite-canvas` 的 fork，部署版本服务漫画/视频工作台，与 AI 剧情画布 `ai.cauai.fun/studio` 是不同产品。该仓 git 状态很脏；本轮未改动。
- `https://toonflow.cauai.fun` 可打开，title “Toonflow”。本机 `E:\codex\aigc\tools\toonflow` 是 `HBAI-Ltd/Toonflow-app` 类型的 Bun/TypeScript/Vue 3/Electrobun monorepo，MIT；包含独立 web/server、image/video generation 节点和 `director3dNode`。此本地项目有用户未提交改动，**本轮没有修改**；线上发布 SHA/部署拓扑/授权边界待确认。
- Toonflow README 将产品描述为 AI 短剧创作平台，不能由本次公网首页访问证明具体接口/登录能力。本地源码具复用潜力；建议嵌入或复用 director3d node / workflow capability 时先核对主应用 schema 与授权，不复制整个产品。

## 外部素材与合规

“公开地图资料就不需要授权”不准确：公开可取不意味着没有署名、数据库或服务条款。每种数据源和代码/模型/3D 人物资产仍要建立 licence/attribution 审核及资产来源记录。Arnis 本身的 Apache License 也不会自动覆盖它调用的数据源或其相关资产。
