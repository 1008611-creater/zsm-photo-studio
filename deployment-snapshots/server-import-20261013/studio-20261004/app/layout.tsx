import type { Metadata } from "next";
import "./styles.css";
import "./studio.css";
import "./studio-enhancements.css";
import "./studio-beta.css";
import "./visual-upgrade.css";
import "./product-refresh.css";

export const metadata: Metadata = {
  title: "取景簿 · 把想象拍成一场旅行",
  description: "为旅行、情侣写真与穿搭创作的场景摄影工作室。快速模式先从照片与风格开始，专家模式提供导演台控制；生成服务按页面状态启用。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
