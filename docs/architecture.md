# 技术架构与边界

## 产品与部署关系

- ANS 是现有 AI 社区，入口为 `ans.cauai.fun`，GitHub 项目为 `1008611-creater/ans-platform`；本产品作为独立学生创业项目在社区展示/入驻。
- 本产品使用独立产品身份，工作名暂建议“取景簿”，目标域名 `zsm.cauai.fun`。产品规划仓库为 `1008611-creater/zsm-photo-studio`（private）；它与 ANS 社区代码库分开管理，后续应用源码也放在这个产品仓库。
- 用户有三台服务器。产品部署位置、服务器 A/B/C 职责、现有网络/存储/数据库和资源配额还未形成可验证清单；架构决策需基于用户提供的脱敏部署资料，不猜测服务器能力。
- 首发目标是完整收费体验。下文模块可分阶段开发和验收，最终应集成为包含创作、生成、交付、账户与支付闭环的首发产品。

## 核心原则

- Web 产品分层：界面/项目编排、场景与导演台、异步生成任务、模型/地图/媒体适配器、持久化与计费。
- 所有外部模型都经服务端适配器调用；浏览器只持有短期用户会话，不持有服务商密钥。
- 可替换供应商。保存供应商中立的场景、相机、镜头、人物引用与生成任务描述；供应商参数另存为有版本的 provider payload。
- 长时生成走异步任务和 webhook/polling；必须支持幂等、超时、重试、取消（若上游支持）、失败原因、成本记录。
- 场景底层以标准化中间格式为中心，避免业务逻辑绑定 Minecraft/某单一引擎。
- 成本敏感：地图取数、几何转换、缩略图和预览尽量缓存；昂贵图/视频只在用户确认后排队。

## 建议逻辑组件

1. **Web 创作台**：项目、地点浏览、3D 视口、演员/道具面板、摄影机与分镜时间线、导出。
2. **API/BFF**：身份、权限、项目、上传签名、配额、任务状态、导出。
3. **场景处理器**：地点边界 → 许可兼容的地理/高程/建筑源 → 清洗/简化 → 场景中间格式 → 浏览器渲染资产。Arnis 可做实验性数据适配器，不预设直接嵌入生产。
4. **创作图/工作流网关**：连接用户现有的开源无线画布服务；把稳定工作流封装为受控模板，映射输入/输出，签名回调，处理版本漂移。
5. **模型网关**：图像、视频、可选文本/姿态模型适配器；能力清单、尺寸/时长校验、费用预估、任务追踪、速率限制和降级。
6. **持久化/媒体**：关系数据库保存用户、项目元数据、版本化 scene document、任务和账单；对象存储保存用户授权的输入和生成结果；CDN提供交付。
7. **计费/运营**：用量账本、额度预留/结算、退款/失败返还、审计日志、后台队列与告警。

## 建议实现策略（需看仓库后最终定栈）

- 前端：若用户给出的实际仓库采用 React，可优先延续其框架；三维层比较 Three.js / React Three Fiber / Babylon.js 后做小型性能原型，不能未测试就选定。
- 后端：复用无线画布所在服务器的既有 API/任务系统，或新增独立 TypeScript API；选择依赖现有部署、队列与鉴权能力。不要因“技术不限”而先拆微服务。
- MVP 部署可采用模块化单体 + 任务 worker + 对象存储；只有队列/场景转换负载独立增长后再拆服务。
- 选择会改变完整架构的关键变量：实际 repo、无线画布 fork/版本和其 API、导演台的相机/时间线格式、预计并发与GPU由谁付费、目标地区与支付渠道。

## 场景中间数据（概念草案）

```ts
type SceneProject = {
  version: 1;
  id: string;
  location?: { lat: number; lon: number; radiusM: number; source: string; capturedAt?: string };
  assets: Array<{ id: string; kind: 'terrain' | 'building' | 'prop' | 'actor'; uri: string; license?: string }>;
  actors: Array<{ id: string; assetId: string; transform: [number, number, number, number, number, number]; pose?: string }>;
  shots: Array<{ id: string; camera: { position: [number, number, number]; target: [number, number, number]; fov: number }; durationSec: number; movement?: string; notes?: string }>;
};
```

这是讨论用的数据契约草案，不是从 Arnis 或画布项目验证出的 schema；读到真实代码后要调整。

## 任务状态建议

`draft → validated → queued → running → succeeded | failed | canceled`。记录项目版本、输入资产引用、provider、model/version、耗时、用量与费用估算/结算、输出引用和可面向用户的错误。不得在日志中写出凭证或不必要的原始肖像数据。

## 接口边界

- `SceneAdapter`: bounds/location + source policy → scene document/assets + provenance.
- `StudioAdapter`: scene document + shot plan → preview/render/animation job.
- `WorkflowAdapter`: template id + typed input → normalized async job/result.
- `ImageAdapter` / `VideoAdapter`: normalized generation request → job/result/cost metadata.
- `SocialPackAdapter`: project + platform spec → aspect-ratio deliverables/caption draft; 不直接发布。

每个接口须有 mock 实现、契约测试、超时/错误映射与能力探测；真实 API 未拿到前不编造 endpoint。
