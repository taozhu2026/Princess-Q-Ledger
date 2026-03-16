# 公主Q的账本

一个面向情侣日常使用的共享账本，中文界面、手机优先、支持 PWA 安装和离线草稿。

## 技术栈

- Next.js 16
- TypeScript
- Tailwind CSS v4
- TanStack Query
- Zustand
- Supabase schema 预置

## 本地开发

```bash
npm install
npm run dev
```

默认会使用本地浏览器存储里的演示数据直接运行，不依赖外部后端。

如果要接入 Supabase：

1. 复制 `.env.example` 为 `.env.local`
2. 填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 在 Supabase 中执行 `supabase/migrations/202603160001_init.sql`

## 当前实现

- 首页：月概览、结算建议、最近记录
- 账单：筛选、编辑、删除
- 统计：分类占比、双方对比、6 个月趋势
- 设置：成员切换、主题、分类管理、邀请链接、PWA 安装、离线草稿入口
- 记一笔：底部抽屉，3 步主路径
- PWA：manifest、service worker、安装提示
- 测试：核心结算与统计逻辑单元测试

## 命令

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
