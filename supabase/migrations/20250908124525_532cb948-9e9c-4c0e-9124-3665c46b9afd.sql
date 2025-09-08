-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create software table for tracking software applications
CREATE TABLE public.software (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  category TEXT NOT NULL,
  description TEXT,
  website TEXT,
  api_endpoint TEXT,
  status_page TEXT,
  tags TEXT[] DEFAULT '{}',
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  uptime_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100),
  integrations_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('excellent', 'good', 'fair', 'poor', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_logs table for tracking metrics over time
CREATE TABLE public.performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  software_id UUID NOT NULL REFERENCES public.software(id) ON DELETE CASCADE,
  response_time_ms INTEGER,
  uptime_percentage DECIMAL(5,2),
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for dashboard activity feed
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  software_id UUID REFERENCES public.software(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('software_added', 'performance_improved', 'performance_degraded', 'uptime_alert', 'integration_detected')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for software
CREATE POLICY "Users can view their own software" 
ON public.software 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own software" 
ON public.software 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own software" 
ON public.software 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own software" 
ON public.software 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for performance_logs
CREATE POLICY "Users can view performance logs for their software" 
ON public.performance_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.software 
    WHERE software.id = performance_logs.software_id 
    AND software.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert performance logs" 
ON public.performance_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.software 
    WHERE software.id = performance_logs.software_id 
    AND software.user_id = auth.uid()
  )
);

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_software_updated_at
  BEFORE UPDATE ON public.software
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();