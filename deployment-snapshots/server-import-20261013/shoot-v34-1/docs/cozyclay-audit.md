# CozyClay 导演台只读审计与接入决策

日期：2026-09-30。范围：对 `NomaDamas/CozyClay` 公开仓库的只读核查，以及它与当前 `zsm-photo-studio` 的接入边界。没有克隆、修改、部署或调用上游服务。

## 结论先行

CozyClay 是目前候选中最适合做“低门槛 3D 导演台”的项目：它已经具备场景、人物/资产、摄影机、时间线、镜头和关键帧导出能力，且仍在持续开发。当前 zsm-photo-studio 不应直接复制它的源码或把它的文件格式变成产品核心数据；应保留自己的 `SceneDocument`，通过版本化的导入/导出适配器与 CozyClay 对接。

第一条可收费价值闭环应定义为：

```text
zsm 预设场景/镜头
  → 导出可验证的导演台素材包（概念底图 + depth/normal + camera + prompt + provenance）
  → Openlux 图片任务（当前仍为 Mock）
  → 生成结果回写为“演示/真实”明确可辨的素材卡
  → 下载社媒规格图片与拍摄沟通包
```

在用户提供 CozyClay 的可运行地址或明确的构建产物之前，不宣称已经嵌入 CozyClay；在用户提供 Openlux 服务端合同和凭证注入方式之前，不调用真实图片接口。

## 已核实的上游事实

| 项目 | 证据 | 对本项目的意义 |
| --- | --- | --- |
| 仓库活跃度 | `NomaDamas/CozyClay` 默认分支为 `main`；审计时约 741 stars、87 forks，2026-09-30 仍有提交 | 比当前其他候选更适合持续跟进，但不能替代本项目验收 |
| 技术栈 | `package.json` 使用 Vite、React、Three.js、`@react-three/fiber`、ReactFlow；要求 Node `>=22.19` | 适合独立运行或 iframe 嵌入；不能直接当作当前 Next 应用的内部组件 |
| 工程协议 | `src/project.js` 声明 `.cclayproject` JSON 项目文件和 `PROJECT_VERSION = 4`；示例文件含 `scenes`、`activeSceneId`、场景对象、`shotDocument`、`stage.characters` | 可作为外部交换格式的参考，必须经过 zsm 侧 schema 校验和迁移 |
| 对象表达 | 示例场景对象含稳定 `id`、`renderer`、`x/y/z`、`rot`、缩放、颜色、父子关系、占地/高度等字段 | 足以映射到 zsm 的概念场景和人物代理；不能据此声称真实地图或真人模型 |
| 镜头/导出 | `docs/project-authoring-export-contract.md` 规定 snapshot + ordered operation log；shot package 包含 plate、depth、normal、stills、prompt、metadata、workflow | 与“导演台先出可交付素材包”的产品路线一致，但其中协作服务和生产渲染仍是上游设计目标 |
| 关键帧包 | `src/keyframe-pack.js` 生成 first/last frame、可选 clip、`camera.json`、`prompt.txt`、`README.txt`；`src/workflow/keyframe-pack-request.js` 使用 `cozyclay:export-keyframe-pack` / `cozyclay:export-keyframe-pack-result` | 已核实的可复用边界是浏览器 iframe 的 `postMessage` 握手，不是一个已确认的公共 HTTP API |
| 场景节点 | `src/workflow/CozySceneNode.jsx` 通过 `/app/?embed=playview` iframe 显示预览，并从 iframe 请求关键帧包 | 将来可做受控嵌入；必须由用户提供实际部署 URL、跨域策略和构建版本后再联调 |
| 深度/法线 | `src/render-passes.js` 以同一 capture rig 输出 depth/normal，并显式定义 depth range | 可作为 zsm 的 conditioning 素材契约参考，当前 zsm 仍只能生成 Mock 占位 |
| 工作流 | `src/workflow/node-schema.js` 只证明其本地工作流节点和字段形状；没有证明存在可直接调用的远程画布服务 | 不猜 `hb.cauai.fun`、Toonflow 或其他服务的 endpoint、鉴权和节点 JSON |
| 许可证 | GitHub API 标记为 `AGPL-3.0`，仓库 `package.json` 为 `AGPL-3.0-or-later` | 商业产品集成前需做许可证决策；本仓库采用协议适配/独立实现，不复制上游源码 |

## 复用边界

### 可以复用的产品思路

- 单文件项目快照、稳定对象 ID、镜头和时间线字段。
- plate/depth/normal 使用同一镜头、帧范围和分辨率的约束。
- 关键帧包中的图片、相机 JSON、提示词和说明文档组成一个可交付物。
- iframe `postMessage` 作为“外部导演台 → zsm”的窄桥接协议。

### 当前不能宣称已经具备的能力

- 没有核实一个可长期依赖的公共 HTTP/SDK 导演台 API。
- 没有核实 CozyClay 的部署域名、反向代理、CORS、跨域消息白名单或登录方式。
- 没有核实其内置资产是否可商用，也不能把上游示例资产、人物或场景当作 zsm 的可售资源。
- 没有把 AGPL 源码复制进 zsm，也没有完成商业分发义务评估。
- 没有真实图片模型、深度视频、支付、社媒发布或云端项目持久化。

## zsm 的落地方案

1. `SceneDocument` 继续作为 zsm 的唯一产品合同，版本仍由 zsm 管理。
2. 新增独立的 `DirectorExport` 交换对象（不改变 `SceneDocument`）：包含 `sceneId`、`shotId`、`camera`、`frame`、`aspectRatio`、`references[]`、`provenance` 和 `licenseState`。
3. `cozyclayAdapter` 只做两件事：
   - 将 `DirectorExport` 转成用户明确提供的 CozyClay 导入格式；
   - 从受控 iframe 的关键帧包或用户下载文件解析回 `DirectorAssetPack`。
4. 在未拿到实际 CozyClay build 前，adapter 状态保持 `disabled`；UI 显示“待提供导演台地址/构建版本”，不得静默降级成真实结果。
5. 图片 provider 继续使用当前 provider-neutral `GenerationAdapter`。Openlux 只在服务端配置和接口合同确认后新增 provider；浏览器不接触密钥。
6. 所有输出保留 `provenance`、`demo`、`licenseState`、规格和成本未知字段；未知许可显示“未知”，不推断可商用。

## 下一步只需用户提供的资料

### 阻塞 CozyClay 联调

- 实际可访问的 CozyClay 构建地址，或用户指定的 fork/commit/build 包。
- 是否允许以 iframe 方式嵌入；若允许，提供预期父域名、跨域策略和登录要求。
- 希望使用的导入/导出路径：`.cclayproject` 文件、关键帧 ZIP，还是双方都要。
- 商业产品对 AGPL 的处理决定：独立服务隔离、按 AGPL 发布修改，或放弃直接集成。

### 可稍后提供

- 资产清单及每个资产的授权状态。
- 真实地图/Arnis 数据合同和来源证明。
- Openlux 的服务端 base URL、认证头注入方式、错误/异步规则、价格和限流。

在阻塞资料到齐前，当前仓库继续以概念场景和 Mock 图片任务开发，不修改上游项目。
