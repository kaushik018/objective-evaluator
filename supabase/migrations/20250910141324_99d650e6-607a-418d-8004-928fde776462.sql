-- Enable realtime for software table
ALTER TABLE public.software REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.software;

-- Enable realtime for activity_logs table  
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.activity_logs;

-- Enable realtime for performance_logs table
ALTER TABLE public.performance_logs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.performance_logs;