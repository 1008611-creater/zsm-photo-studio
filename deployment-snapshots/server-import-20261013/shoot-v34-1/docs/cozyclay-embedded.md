# CozyClay 内置导演台

取景簿的专家模式现在使用同源静态内置版本，不再通过 iframe 访问 `cozyclay.org`：

- 页面入口：`/studio`
- 内置导演台：`/cozyclay/app/index.html?embed=scene`
- 构建命令：`npm run cozyclay:build`
- 产物目录：`public/cozyclay/`

## 中文化边界

上游 CozyClay 子模块保持原样。中文界面由 `scripts/cozyclay-zh-overlay.js` 在浏览器端覆盖项目选择器和常用导演台控件；这避免直接改写上游源码，也便于后续随上游升级补齐词条。少数上游动态内容、帮助页或扩展模块可能仍显示英文，不能把当前覆盖称为完整翻译。

## 构建与资源

构建脚本从 `vendor/CozyClay` 生成 Vite 静态产物，并将运行时需要的 `ardy`、`demo`、`fonts`、`media`、`models`、`scenes` 镜像到站点根目录的 `public/`，同时把编辑器启动所需的最小 unicode-font-resolver 数据放入 `public/cozyclay/unicode-font-resolver/`。因此部署 Next 应用时必须同时发布这些静态目录。构建脚本会移除上游 Cloudflare Analytics beacon，并把可选 motion 客户端改为同源调用；内置页面还带有同源 Content-Security-Policy，阻止上游脚本向 CozyClay 云端和第三方 CDN 发起请求。本地内置版本不会主动访问 CozyClay 的云端域名。取景簿的 `/ardy/health` 与 `/v1/motion/me` 只返回明确的 disabled 状态，不能视为已配置 motion 服务。

## 许可证与来源

内置页面使用同源 Content-Security-Policy；即使上游脚本保留了云端或 CDN 地址，浏览器也不会向这些外部地址发起请求。

当前子模块来源为 CozyClay，提交 `9bede6054ca955fd578235abdf4745077a08ba80`，许可证为 `AGPL-3.0-or-later`。对应许可证与第三方声明随产物复制到 `public/cozyclay/`，上游源码保留在 `vendor/CozyClay`，未在本项目中修改。若将该内置版本提供给外部用户，应继续遵守 AGPL 的源代码提供和版权声明要求。

## 尚未内置的服务端能力

CozyClay 的可选云端 motion/健康检查服务没有被猜测或接入。若上游界面请求 `/ardy/health` 等服务端接口，当前只保证同源静态编辑器和本地项目选择入口可加载；这些请求不是取景簿已接入 CozyClay 云服务的证明。
