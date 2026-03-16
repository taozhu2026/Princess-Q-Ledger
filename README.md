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

未配置 Supabase 环境变量时，会退回到本地浏览器存储里的演示数据，方便继续开发 UI。

如果要接入 Supabase：

1. 复制 `.env.example` 为 `.env.local`
2. 填入：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `AUTH_EMAIL_FROM`
   - 可选：`AUTH_EMAIL_REPLY_TO`、`AUTH_EMAIL_PRODUCT_NAME`
3. 在 Supabase 中依次执行：
   - `supabase/migrations/202603160001_init.sql`
   - `supabase/migrations/202603160002_real_data_foundation.sql`
   - `supabase/migrations/202603160003_fix_recursive_rls.sql`
4. 在 Resend 中验证发信域名，并确保 `AUTH_EMAIL_FROM` 使用该域名下的发件地址
5. 在 Supabase Auth 的 URL Configuration 中，把站点 URL 和 Redirect URLs 配到 `/auth/callback`
6. 重新部署，让服务端环境变量生效

项目现在会由应用服务端调用 Supabase Admin 生成注册确认 / Magic Link / 重置密码链接，再通过 Resend 发出事务邮件，不再依赖 Supabase 默认测试 SMTP。

## 当前实现

- 首页：月概览、结算建议、最近记录
- 账单：筛选、编辑、删除
- 统计：分类占比、双方对比、6 个月趋势
- 设置：本地模式下支持成员切换；Supabase 模式下支持真实登录账号、邀请链接、主题和分类管理
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
