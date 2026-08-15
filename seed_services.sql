INSERT INTO public.available_services (id, category, name, price, duration_minutes, is_active, vehicle_types) VALUES 
('a3b1a8d5-3221-4f1b-90f7-ebf3458e0a81', 'Car Wash', 'Exterior Wash', 299, 20, true, ARRAY['car', 'suv', 'ev']),
('d8a39a04-5178-43e8-8b9a-4c2813134f55', 'Car Wash', 'Premium Wash', 599, 45, true, ARRAY['car', 'suv', 'ev']),
('b1154c1d-15e4-4115-be8d-71321457df78', 'Car Wash', 'Waterless Wash', 349, 30, true, ARRAY['car', 'suv', 'ev']),
('6c3c252a-9e32-4753-93d4-1a9805908cd5', 'Interior Cleaning', 'Vacuum Cleaning', 199, 15, true, ARRAY['car', 'suv', 'ev']),
('0e66d092-2cc3-4a17-ba42-b0cd3f7deab6', 'Interior Cleaning', 'Full Detailing', 1299, 90, true, ARRAY['car', 'suv', 'ev']),
('a1122ab9-99a5-4eb1-b0db-fc6efb9b77fa', 'Tire Air Service', 'Pressure Check & Refill', 49, 10, true, ARRAY['car', 'suv', 'ev', 'bike']),
('ccfc44b1-e1f9-4672-9b0d-eec65449efaf', 'Oil Check', 'Basic Inspection', 149, 15, true, ARRAY['car', 'suv']),
('62be64e0-7988-4cf5-9cd7-8c5e62f4b4a1', 'EV Charging', 'Fast Charging (CCS2)', 0, 0, true, ARRAY['ev']),
('7f0db3dc-bf91-443f-b0dc-08cdbbec3c0a', 'Valet Parking', 'Valet Pickup & Return', 99, 5, true, ARRAY['car', 'suv', 'ev'])
ON CONFLICT (id) DO NOTHING;
