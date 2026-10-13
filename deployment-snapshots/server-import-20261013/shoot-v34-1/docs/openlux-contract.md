# OpenLux contract and readiness matrix

Date: 2026-10-02 (Asia/Shanghai)

本文件只记录仓库事实、用户已确认信息和 OpenLux 官方公开文档，不代表已经完成真实调用。官方资料来源：[OpenLux Getting Started](https://doc.openlux.ai/en)、[OpenLux image operation](https://doc.openlux.ai/en/reference/v1?leaf=328094105&op=post-v1-images-generations)、[OpenLux image edit operation](https://doc.openlux.ai/en/reference/v1?leaf=328094105&op=post-v1-images-edits)。

## 已确认事实

| 项目 | 当前值 | 证据 | 实现状态 |
| --- | --- | --- | --- |
| Provider | OpenLux | 用户提供 + 官方文档 | 已建立服务端 adapter |
| API base URL | `https://api.openlux.ai/v1` | A：官方 Getting Started | `.env.example` 已给出默认值 |
| 图片生成 endpoint | `POST /v1/images/generations` | A：官方 Image operation | 内部路径 `/images/generations` |
| 图片编辑 endpoint | `POST /v1/images/edits` | A：官方 Image edit operation | 内部路径 `/images/edits`，产品入口仍关闭 |
| 认证 | `Authorization: Bearer <API Key>` | A：官方 operation schema | 仅服务端读取 |
| 模型 | `gpt-image-2.5-flare`、`gpt-image-2.5-sunburst` | A：官方生成 operation schema | 能力字段已登记，真实调用关闭 |
| `gpt-image-2.5-sunburst-c` | 用户提供 + 价格页出现；本次使用配置 Key 调用 `GET /v1/models` 返回可见，并完成一次 HTTP 200 图片生成 | B/C；仍未出现在生成 operation 枚举 | 仅登记已实测的 `1024x1024`、`low`、`webp`、`url` 组合 |
| 请求字段 | `model`、`prompt`、`n`、`size`、`quality`、`format`、`response_format` | A：官方 2.5 schema；C：用户成功示例 | provider 内部映射 |
| `prompt` | 必填，最多 1000 字符 | A：官方 schema | 已校验 |
| `n` | 1–10，默认 1 | A：官方 schema | 已校验 |
| `quality` | `low`、`medium`、`high`、`xhigh`、`max`、`auto` | A：官方 schema | 已校验 |
| `format` | `png`、`jpeg`、`webp` | A：官方 gateway schema | 已校验 |
| `response_format` | `url` 或 `b64_json` | A：官方 schema | 已解析 |
| `size` | `auto` 或文档列出的尺寸；自定义尺寸有像素、倍数、比例约束 | A：官方 schema；B：sunburst-c 的 `1024x1024` 成功调用 | 已做本地约束校验 |

## 仍需保持未知的内容

| 项目 | 当前状态 |
| --- | --- |
| 参考图在产品中的上传、临时处理和删除流程 | 官方编辑接口已说明 multipart 图片字段；本产品已接入一次性服务端 multipart 边界，真实调用仍由开关和用户确认控制 |
| URL 有效期和长期下载保证 | 官方生成 schema 只说明返回 URL，未确认保存期限 |
| 是否异步、任务查询、取消和 webhook | 图片生成文档未给出可依赖的任务状态协议；当前按同步响应边界处理 |
| 幂等键和重复提交保证 | 未在官方图片 operation 中确认 |
| 价格、配额、限流窗口 | 价格页有展示，但当前项目尚未登记可结算价格表 |
| OpenLux 数据保留与删除 | 未确认 |

## 本地实现边界

- `app/lib/server/openlux.ts` 负责 provider 专有请求和响应映射；默认 base URL/path 已依据官方文档填写，但 `OPENLUX_REAL_CALLS_ENABLED` 默认仍为 `false`。
- `app/lib/server/openlux-capabilities.ts` 暴露三个用户提供的模型 ID；Flare/Sunburst 的字段来自官方 operation，`sunburst-c` 仅记录当前 token 的模型可见性，其他能力仍未知。
- `app/api/image-generation/route.ts` 的 GET 只返回不含密钥的 readiness；POST 在真实开关、密钥和配置缺失时不调用 fetch。
- 参考图默认只在浏览器本地预览；用户明确确认且真实调用开启时，才通过一次性 multipart 发送到编辑 endpoint，不写入任务快照、日志或长期存储。
- 单元测试只使用本地 fake fetch；真实 Key 只用于下面记录的一次受控测试，没有写入日志或仓库。

## 受控真实测试

- 使用当前用户配置的 OpenLux Key，对 `gpt-image-2.5-sunburst-c` 发起一次单图请求：`n=1`、`size=1024x1024`、`quality=low`、`format=webp`、`response_format=url`。
- OpenLux 返回 HTTP 200、一个结果对象和 URL；URL 未写入日志、仓库或持久化存储，因而本次只证明渠道调用成功，不证明长期交付或 URL 有效期。
- 真实开关仍保持关闭；后续产品调用必须继续经过用户授权和服务端配置。

## 真实验收闸门

1. 官方合同资料已经确认（本次已完成）。
2. 用户把 API Key 写入本地未跟踪 `.env.local` 的 `OPENLUX_API_KEY`，不在聊天中粘贴。
3. 用户明确授权一次可能产生费用的真实图片测试。

在第 2、3 项完成前，系统保持 disabled，不会因为默认 endpoint 存在而自动调用 OpenLux。

## 2026-10-08 本轮授权验证追加

- 用户明确授权McGrox失败后OpenLux；/models实时只列gpt-image-2.5-sunburst-c和flare-c。使用独立OpenLux凭据，四次/images/edits multipart双参考请求均HTTP200，高质量high、1024×1536、n=1；请求b64_json并保存完整解码原图。Sunburst-c的此组合本轮得到真实验证，不推断与完整Sunburst底层身份等价。
- 当前专用2.5编辑官方页：https://doc.openlux.ai/en/reference/v1/images/edits?leaf=c%3A1790765179104，说明图片数组、小于16张/50MB、quality高质量、竖幅等。旧op链接当前会落到其他模型合同，不能据旧链接盲套。专用编辑页未列1000字符上限，本轮2731附近字符的请求实测接受；旧adapter上限不在本轮修改范围。
- 详细候选/失败与视觉检查见beta-runbook.md v18；网站默认provider与真实开关保持原值，操作员脚本的--channel=openlux是显式选择，没有应用自动供应商兜底。
