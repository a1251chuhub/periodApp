-- =============================================
-- Supabase Database Setup for Period App
-- =============================================

-- 1. 建立 app_users 資料表
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ragic_id INTEGER NOT NULL DEFAULT 0,
    ragic_member_id TEXT,
    line_user_id TEXT NOT NULL UNIQUE,
    locale TEXT DEFAULT 'zh-TW',
    avg_cycle_days INTEGER DEFAULT 28,
    avg_period_days INTEGER DEFAULT 5,
    luteal_phase_days INTEGER DEFAULT 14,
    next_period_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立 period_logs 資料表
CREATE TABLE IF NOT EXISTS public.period_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    flow_level TEXT,
    symptoms JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 建立 notification_queue 資料表
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
    target_date DATE NOT NULL,
    message_key TEXT NOT NULL,
    message_params JSONB,
    status TEXT DEFAULT 'pending'
);

-- 4. 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_app_users_line_user_id ON public.app_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_period_logs_user_id ON public.period_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_period_logs_start_date ON public.period_logs(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_target_date ON public.notification_queue(target_date);

-- =============================================
-- Row Level Security (RLS) 設定
-- =============================================

-- 啟用 RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- app_users 政策：允許所有人讀取和新增（因為使用 anon key）
CREATE POLICY "Allow public read access on app_users"
    ON public.app_users
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access on app_users"
    ON public.app_users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access on app_users"
    ON public.app_users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- period_logs 政策：允許所有人讀取和新增
CREATE POLICY "Allow public read access on period_logs"
    ON public.period_logs
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access on period_logs"
    ON public.period_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access on period_logs"
    ON public.period_logs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- notification_queue 政策：允許所有人讀取和新增
CREATE POLICY "Allow public read access on notification_queue"
    ON public.notification_queue
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access on notification_queue"
    ON public.notification_queue
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access on notification_queue"
    ON public.notification_queue
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- =============================================
-- 完成！
-- =============================================
