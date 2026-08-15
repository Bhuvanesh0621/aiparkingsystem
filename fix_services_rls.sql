-- 1. Grant read access to everyone
CREATE POLICY "Anyone can view available services" 
  ON public.available_services FOR SELECT 
  USING (true);

-- 2. (Optional) Let admins manage services
CREATE POLICY "Admins can manage services" 
  ON public.available_services FOR ALL 
  USING (public.is_admin());
