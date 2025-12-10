-- =============================================
-- 修復 Row Level Security (RLS) 政策
-- 針對 406 Not Acceptable 錯誤
-- =============================================

-- 1. 先移除所有現有政策
DROP POLICY IF EXISTS "Allow public read access on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow public insert access on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow public update access on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow public read access on period_logs" ON public.period_logs;
DROP POLICY IF EXISTS "Allow public insert access on period_logs" ON public.period_logs;
DROP POLICY IF EXISTS "Allow public update access on period_logs" ON public.period_logs;
DROP POLICY IF EXISTS "Allow public read access on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow public insert access on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow public update access on notification_queue" ON public.notification_queue;

-- 2. 暫時停用 RLS（簡單的解決方案，適合開發環境）
ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 注意：此設定適合開發和測試環境
-- 正式上線前，建議根據需求啟用並設定適當的 RLS 政策
-- =============================================
