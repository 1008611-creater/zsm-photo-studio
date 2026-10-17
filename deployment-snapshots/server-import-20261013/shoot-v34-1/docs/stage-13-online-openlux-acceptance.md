# 阶段 13：线上 OpenLux 图片受控验收记录

日期：2026-10-02（Asia/Shanghai）

## 结果

- 线上服务：`https://zsm.cauai.fun`
- 路由：`POST /api/image-generation`
- 模型：`gpt-image-2.5-sunburst-c`
- 参数：`n=1`、`1024x1024`、`low`、`webp`、`response_format=url`
- 请求类型：文字生图；未发送参考图片
- 服务返回：`status=succeeded`，包含 1 个输出
- 结果 URL：未写入日志、仓库或持久化存储；仅在进程内读取状态

## 开关与凭证处理

- 测试前，凭证通过服务器私有 `.env.local` 注入，文件权限为 `600`。
- 测试期间临时开启 `OPENLUX_REAL_CALLS_ENABLED=true`。
- 测试完成后已恢复 `OPENLUX_REAL_CALLS_ENABLED=false`，并重启服务。
- 当前线上 `GET /api/image-generation` 返回 `state=disabled`，不会继续向 OpenLux 发起请求。
- 密钥未写入源码、浏览器 bundle、任务快照、日志、导出文件或 Git。

## 证据边界

- 本记录证明线上路由能在受控配置下收到 OpenLux 的成功响应，不等于已经完成生产级图片存储、长期下载、支付或批量任务系统。
- 本次没有持久化输出图片，也没有把临时 URL 作为长期交付地址。
- OpenLux 的 URL 有效期、计费次数、取消、异步任务和数据保留规则仍以官方账户与文档为准，当前代码未作额外推断。
- 浏览器端真实付费验收尚未完成；本次为受控 HTTP 验收。

## 后续建议

在恢复真实调用前，应先补齐临时结果代理/下载策略、订单与成本记录，并为每次真实调用设置单次确认和服务端审计记录。默认继续保持真实调用关闭。
