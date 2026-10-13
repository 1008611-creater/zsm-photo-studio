# 阶段 18：移动端 360/390px 验收

日期：2026-10-05（Asia/Shanghai）

## 浏览器验收

- 390×844：快速模式首屏可渲染，`document.documentElement.scrollWidth === 390`，`document.body.scrollWidth === 390`。
- 360×800：快速模式可渲染，`document.documentElement.scrollWidth === 360`，`document.body.scrollWidth === 360`。
- 360×800 切换专家模式后仍保持 `scrollWidth === clientWidth`；CozyClay 内置导演台、提示词区、画幅选择和任务提交区均可访问。
- 专家模式在没有导入导演交接时将 Mock 生成按钮保持禁用，并显示“尚无导出交接”的下一步说明。
- 浏览器控制台无错误；内置静态 CozyClay 仅报告 analytics disabled 信息。

## 边界

- 本次验证是桌面浏览器的移动视口仿真，不等同于真实 iOS/Android 设备上的触摸、键盘和系统文件选择器验收。
- 未导入用户照片、未触发真实模型、支付或外部发布。

## 下一步

移动端布局基线已补齐。下一道真实联调闸门仍是用户提供已授权的模型接口合同、服务端凭证注入方式、账户/支付和长期作品存储方案；在资料齐全前继续保持 Mock/disabled。
