# Stage 09 verification record

Date: 2026-10-02 (Asia/Shanghai)

## 现状与缺口

当前仓库已经有导演台、Mock 图片任务、OpenLux provider 边界和图片结果卡。通过 OpenLux 官方文档补齐了图片接口合同，但仓库没有读取任何密钥，也没有向 OpenLux 发起请求。阶段 09 因此完成“可审计、默认关闭、可继续核验”的离线准备，不宣称真实渠道已接通。

## 本阶段完成

- 新增 `docs/openlux-contract.md`，按 A/B/C/D 证据级别登记已知事实和真实调用阻塞项。
- 根据官方文档确认并登记 `https://api.openlux.ai/v1`、`POST /images/generations`、`POST /images/edits`、Bearer 认证及 GPT Image 2.5 参数约束。
- 新增 `app/lib/server/openlux-capabilities.ts`，仅暴露用户提供的三个模型 ID；Flare/Sunburst 的官方字段已登记，参考图能力仍为 `unknown`，全部 `enabled: false`。
- `GET /api/image-generation` 提供不含密钥的 provider readiness 和能力矩阵，未配置时明确返回 `disabled`。
- 保持 `POST /api/image-generation` 的真实调用闸门：缺少服务端开关、endpoint、凭证或路径时不调用 fetch；未确认的参考图字段直接拒绝。
- provider 错误消息、响应解析和请求映射保持供应商字段隔离，不把凭证、原始图片或完整渠道响应写入结果。

## 实际检查

- `npm run typecheck` 通过。
- `npm run lint` 通过。
- `npm test` 通过：5 个测试文件、23 个测试。
- `npm run build` 通过：Next.js 16.3.7，`/api/image-generation` 为 Node.js route handler。
- 测试只使用本地 fake fetch；未读取 `.env.local` 或服务器密钥，未调用真实模型、支付、视频、社媒或部署服务。

## 受控真实验收记录

- 用户明确授权一次真实图片测试；服务端通过本地 `.env.local` 读取 Key，进程级临时开启真实调用，测试后已停止服务，配置文件仍保持 `OPENLUX_REAL_CALLS_ENABLED=false`。
- 使用 `gpt-image-2.5-flare` 的一次图片请求返回本地 `502 UPSTREAM`，未得到图片结果；没有证据表明生成成功或产生扣费。
- 随后执行不计费的 `GET https://api.openlux.ai/v1/models` 返回 200；当前 Key 可见的目标模型中只有 `gpt-image-2.5-sunburst-c`。
- 用户再次明确授权后，已直接向官方 `POST https://api.openlux.ai/v1/images/generations` 发起一次 `gpt-image-2.5-sunburst-c` 测试：HTTP 200、返回 1 个图片结果和 URL。URL 未写入日志或仓库，也未宣称长期可下载。
- 本地开发服务和真实调用开关均已关闭；本次只证明渠道调用成功，不代表产品 route 已完成正式交付闭环，计费以 OpenLux 控制台为准。

## 当前仍未验证

- 图片 Base URL、生成/编辑 endpoint、认证头和 GPT Image 2.5 主要参数已经由官方文档确认；任务查询/取消、URL 有效期、幂等保证、数据保留和可结算价格仍未知。
- `gpt-image-2.5-sunburst-c` 出现在用户提供信息和价格页，并被当前 Key 的模型列表返回；但未出现在官方图片生成 operation 枚举中，仍需单独受控验证其生成参数。
- 尚未进行真实浏览器付费验收；因此不能宣称“OpenLux 已接入”或“图片已经真实生成并可长期下载”。
- 运行时凭证泄漏检查只能覆盖静态代码和本地假响应；没有真实凭证时无法验证实际运行时注入路径。

## 下一步闸门

下一步若要继续真实验收，需要用户再次明确授权使用 `gpt-image-2.5-sunburst-c` 发起一次可能产生费用的测试；在此之前保持 disabled。
