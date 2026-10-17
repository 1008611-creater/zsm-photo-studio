# 阶段 0｜技术与仓库审计

审计日期：2026-09-29（UTC；对应 Asia/Shanghai 日期为 2026-09-30）  
范围：Arnis、无线画布候选源码、Toonflow 导演台、`ans-platform` 与公开站点匿名入口。  
边界：只读上游；不部署、不调用模型、不发起支付、不访问或输出密钥。除本报告外不改上游项目。

## 结论

产品应是独立 Web 应用（目标域名 `zsm.cauai.fun`），交付完整的场景搭建、人物/镜头编排、图片与视频生成、社媒素材导出和收费闭环。推荐以版本化、供应商无关的 `SceneDocument` 为核心，采用模块化单体 + 异步生成任务 + 对象存储；暂不拆微服务。

| 项目 | 已验证边界 | 决策 |
| --- | --- | --- |
| Arnis | Tauri 桌面预览的地形/建筑数据与 Minecraft/Luanti 世界生成管线；未发现可直接嵌入网站的 HTTP 场景 API 或摄影级网格导出合同。 | 可做可选的地理数据/地形适配器；先做单地点 spike，不作主渲染器。方块世界导出留作可选。 |
| Infinite Canvas | 插件 SDK、节点宿主能力和图片/视频/文本生成接口；项目、素材与 AI 配置主要是浏览器本地工作流。 | 可选的工作流桥接/导入导出，不承担主站用户凭证、数据库、队列或账务。 |
| Toonflow 导演台 | 严格场景 JSON、内置人偶、物件/关节动画、相机关键帧与浏览器端图片/视频导出。 | 复用数据合同/交互经验并用适配层连接；不把当前节点当作稳定后端 API。 |
| ANS | 登录后的私密学生项目包、成果公开申请和管理员审批 API；没找到独立创业项目目录。 | 产品源码和收费业务保留独立仓库；ANS 展示入口按单独入驻/展示能力协调。 |

## 证据与实施边界

### Arnis

- 本地只读副本 `_research/arnis`，HEAD `71aa444bd6b973682db9187575b7f363b9c43373`，版本 3.2.0，Apache-2.0（独立来源文件仍须分别核许可）。
- `src/gui.rs:114-136` 将预览注册为 Tauri IPC 命令；`src/gui.rs:717-762` 提供地形、土地覆盖、建筑和立面预览。`src/preview_3d.rs:67-112` 返回有界高度网格二进制数据，建筑另以 GeoJSON 提供；这是桌面预览调用，不是 Web API。
- 输出足以原型化真实地点的灰白模地形/建筑基底，但没有已验证的标准化 glTF/GLB 场景输出、人物摆放合同、摄影机位体系或托管 HTTP API。方块世界生成不等于摄影级网站场景。
- 决策：先用一个旅行地点验证地形/建筑覆盖、坐标、许可署名、加载性能及转换结果；通过后再决定 Arnis 是后端数据适配器还是仅作可选世界导出。公开可取不代表免许可或免署名。

### Infinite Canvas / 无线画布

- 本地候选源码 `E:\codex\niannianai\zhuanhuiyuangong\infinite-canvas`，HEAD `ca2395fa31c16b1b95d6c74098bcd51e8f702dd5`。已有用户改动 `canvas-api/credits.js`、`canvas-api/routes-credits.js` 保持未改。
- `web/src/types/canvas-plugin.ts:22-28,41-68` 暴露图片/视频/文本生成、节点/连线访问、事件及插件私有存储；插件以 ESM 由宿主加载。`plugins/canvas/panorama` 是 360° 全景图片查看节点，不是地理/摄影导演台。
- `docs/content/docs/development/canvas-data-structure.zh-CN.mdx:12-17` 说明画布状态及媒体 Blob 主要保存在浏览器本地；README 也说明 AI 配置保存在浏览器并由前端直连兼容接口。因此，现有源码不能证明有适合商业 SaaS 的多租户后端 API、服务端密钥托管或可审计收费任务合同。
- 线上匿名 GET（2026-09-29 UTC）：`hb.cauai.fun` 返回 302，跳转 `/login.html`。登录后能力及本地源码与线上版本的对应关系未验证。
- 决策：不把浏览器 API Key、浏览器存储或插件 API 当作商业服务端信任边界。后续以版本化模板输入/输出和任务状态桥接；用户渠道资料未到前仅 mock。

### Toonflow / 导演台

- 本地源码 `E:\codex\aigc\tools\toonflow`，HEAD `d86cce6b689916ab73f75bc4c1f42a2a7424516c`。用户未提交的 `Dockerfile` 改动保持未改。
- `packages/nodes/director3dNode/src/scene.ts:11-38` 是 Zod strict scene：相机、灯光、基础几何体与内置 mannequin，可设置人偶关节 pose；对象最多 200 个。目前枚举没有 glTF/任意外部 mesh 资产入口。
- `sceneAnimation.ts:9-45` 定义最长 300 秒的导演方案、物件/关节动画轨道及相机帧。`renderMedia.ts:5-19,22-86` 在浏览器导出 PNG/MP4；视频依赖 `MediaRecorder`、可见页面及浏览器编码器，受 100MB 限制；`index.vue` 将结果写回画布图片/视频节点。
- 线上匿名 GET（2026-09-29 UTC）：`toonflow.cauai.fun` 返回 403。线上版本、授权后的接口及其与本地源码的 SHA 对应均未验证。
- 决策：借用导演台的场景/动画/相机合同与交互，不继承其基础几何/人偶限制作为最终资产格式。新产品需要版本化场景合同、外部资产引用、可替换渲染器和输出规格；单独评估服务端渲染与浏览器导出的质量和兼容性。

### ANS 学生项目展示

- 私有仓库 `1008611-creater/ans-platform` 默认分支 `main`；读取时远端 HEAD `e8c8cae6d83aa7cc6db760fcfcc0e1fcdf462914`（2026-09-29）。社区文档技术栈为 Next.js App Router、TypeScript、Prisma/PostgreSQL、NextAuth。
- `src/app/projects/page.tsx` 要求登录并只列当前用户项目；定位是默认私密的“学生项目包”。`src/app/projects/[id]/page.tsx` 同样要求登录并按拥有者取项目。
- `src/server/projects/publication.ts` 支持成果版本申请公开，阻止未确认事实/敏感内容并记录审计；管理员可审批后将成果设为 public，对应 `POST /api/projects/:id/publication`。但页面路由清单没有独立学生创业项目目录/入驻页面，不能推断新产品能自动出现在 ANS 公共展示中。
- `ANS-README.md`、`PROJECT_CONTEXT.md`、`docs/MRD.md` 定义 ANS 为 CAU 学生 AI 社区；`docs/MRD.md` 把公开作品广场列为后续阶段。根 `README.md` 仍以 prompts.chat/提示词库叙述为主，与社区当前文档不完全一致。
- 决策：向 ANS 管理方确认展示形态、审核人、所需材料和入口。ANS 展示与产品部署、账号、收费相互独立。

## 下一步实施决策

1. **先做 mock 原型**：产品自身定义 scene/shot/actor/media/job 版本合同；用 Toonflow 作适配参考，贯通“地点 → 场景预览 → 人物和机位 → 预览图导出”。旅行首发同时保留预设场景路线，避免地图覆盖率卡住核心体验。
2. **做单地点 spike**：对照预设场景与 Arnis 数据转换的画面质量、耗时、加载性能和素材许可，再决定是否把地图场景纳入首发默认路径。
3. **以模块化单体承载完整收费产品**：建议 Next.js/TypeScript（与 ANS 技术栈相容但独立部署）+ PostgreSQL + 异步 worker + 私有对象存储/CDN。前端先负责三维创作预览；服务端负责权限、任务、模型适配、成本/账务与资产元数据。先不拆微服务；模型服务端 adapter、失败返还、社媒素材导出和支付 adapter 均须有 mock/契约测试。
4. **真实服务后接**：收到用户提供的图像/视频渠道文档后再联调；拿到链动小铺官方商户 API/回调/退款/沙箱资料后再做支付验证；支付宝/微信留作后续。ANS 展示另行验收。

## 尚缺资料与阻塞级别

**阻塞部署拓扑与真实联调：**

1. 三台服务器脱敏清单：各自角色/系统、CPU/RAM/磁盘、GPU（如有）、公网/内网关系、域名反代、已用数据库/队列/对象存储及余量。请勿发送密码、私钥、完整 token 或未打码环境变量。
2. `hb.cauai.fun`、`toonflow.cauai.fun` 对应的部署版本标识（commit/build tag）和现存的接口/导入导出文档或样例；不需要登录凭证。
3. ANS 学生创业项目的实际展示/投稿负责人、审核流程和需要提交的材料；源码中未找到专用目录。

**不阻塞 mock 原型，但阻塞真实收费联调：**

- 图像/视频中转：用户后续提供服务名称、脱敏 API 文档/样例、精确模型 ID、异步状态/回调、限制与计费规则；不自行找替代渠道或索要聊天中的密钥。
- 支付：确认“链动小铺”具体产品/商户及 API、回调、退款、沙箱资料；到齐前只做接口和 mock，不做真实交易。此次没有真实模型调用或支付。

## 核验记录

- 产品仓库 `zsm-photo-studio`：分支 `main`，审计前 HEAD `58cbb3ad01820337b143c59527d6484efda40548`，工作区干净；本报告是本次唯一新增文件。
- Arnis、Toonflow、Infinite Canvas 的源码目录、HEAD 和本地差异如上；`E:\codex\huabu` 原有大量工作区改动未触碰。
- ANS 通过 GitHub CLI 读取私有仓库元数据、树及相关文件，未 clone/checkout/修改。
- 线上仅匿名 GET：HB 302 登录跳转，Toonflow 403；未登录、部署、调用模型、支付或进行外部写入。
