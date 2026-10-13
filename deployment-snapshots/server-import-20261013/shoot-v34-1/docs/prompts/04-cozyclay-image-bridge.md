# Prompt 04 — CozyClay 导演台与图片生成的首条真实接入准备

基于 `docs/cozyclay-audit.md`、`docs/stage-0-audit.md`、`docs/architecture-stage-1.md`、`docs/stage-2-verification.md` 和 `docs/stage-3-verification.md`，把 zsm-photo-studio 推进到“导演台素材包 → 图片任务适配器”的可验证接入阶段。

## 开始前

1. 读取所有适用的 `AGENTS.md`，检查当前分支和工作区改动；保留所有用户改动。
2. 只使用用户提供的 CozyClay 构建地址/commit、Openlux 官方接口合同和明确的服务端凭证注入方式。没有这些资料时停留在 Mock/disabled，不猜 endpoint、不搜索替代渠道、不自行注册或试连。
3. 不修改 Arnis、无线画布、Toonflow 或 ANS 上游项目；不部署、不 commit、不 push，不调用真实模型、支付或社媒接口。
4. 许可证状态未确认前，不复制 CozyClay AGPL 源码、样式或资源；只实现 zsm 自己的类型、校验器和协议适配层。

## 实现目标

### A. 导演台交换对象

- 新增版本化 `DirectorExport` / `DirectorAssetPack` 类型，不改变 `SceneDocument` 的既有版本。
- 至少包含：场景/镜头 ID、画幅、分辨率、相机位置/目标/FOV、帧范围、plate/depth/normal 引用、prompt、`provenance`、`licenseState`、`demo`。
- 对缺失或来源未知的素材显式报错或标记 `unknown`，不伪装成真实地图、真人模型或已生成成片。
- 为 `.cclayproject` 和关键帧 ZIP 各写一个独立解析边界；解析失败要有稳定错误码，不把上游字段泄漏进产品核心合同。

### B. CozyClay 桥接

- 若用户提供实际构建且允许嵌入，使用 origin 白名单的 iframe `postMessage`；不得继续使用 `*` 作为生产安全策略。
- 请求和回包至少带 `protocolVersion`、`requestId`、`shotId`、`sourceOrigin` 和 `provenance`；重复 requestId 不得重复导出。
- 超时、取消、未知回包、版本不兼容和 iframe 不可用都要映射到现有统一错误结构。
- 没有实际构建时，用可控 Mock iframe/fixture 测试相同协议；UI 明确显示“Mock 导演台”。

### C. Openlux 图片适配器

- 保持现有 provider-neutral `GenerationRequest`，只在服务端 adapter 中映射 `gpt-image-2.5-flare` 等用户确认的准确 ID。
- 浏览器只提交产品内请求；密钥只能由服务端读取，不能进入 bundle、localStorage、导出包、日志或测试快照。
- 对 `prompt`、输入图引用、`size`、`quality`、`format`、`response_format` 和数量做白名单校验；没有真实合同的字段保持 disabled。
- 真实返回的 URL/任务 ID/错误结构未经用户确认前不得写死；先提供 contract fixture 和 Mock provider。

### D. 产品体验

- 导演台页面能完成：选择概念场景 → 选择镜头 → 生成导演台素材包 → 提交图片 Mock → 查看来源/规格/状态。
- 结果卡必须显示 `Mock`、来源、许可状态、画幅、尺寸和“未接入真实报价”提示。
- 失败、重试、取消、无结果、任务重复提交和能力未配置均有可操作提示。
- 桌面 1280px 及以上、手机 360px/390px 无横向溢出；主要控件键盘可用。

## 验收

- 测试覆盖 schema 版本、迁移/拒绝、`.cclayproject` 与 ZIP fixture、origin 白名单、requestId 幂等、超时、取消、错误映射和 Mock 图片状态流转。
- 无真实服务配置仍可运行；任何“configured”状态都必须有用户提供的资料证据。
- 运行 typecheck、lint、测试、production build，并用真实浏览器走通 Mock 主路径。
- 只读检查 diff，确认未修改上游、未产生真实请求、未写入真实凭证、未改变阶段 0/2 报告。

## 完成汇报

说明实际改动、通过的检查、仍为 Mock/disabled 的边界、许可证和资产资料缺口，以及下一次真实联调前还需要用户提供的最小资料。没有阻塞当前本地 Mock 工作的资料时，不因提问而停工。
