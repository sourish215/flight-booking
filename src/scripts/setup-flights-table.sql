-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  cabin_class TEXT NOT NULL CHECK (cabin_class IN ('Economy', 'Premium Economy', 'Business', 'First')),
  stops INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert sample flight data
INSERT INTO flights (
  flight_number, airline, origin, destination, 
  departure_time, arrival_time, duration, 
  price, available_seats, cabin_class, stops
) VALUES
-- Delhi to Mumbai flights
('AI101', 'Air India', 'DEL', 'BOM', '2025-03-15 08:00:00+05:30', '2025-03-15 10:15:00+05:30', 135, 5500, 120, 'Economy', 0),
('6E302', 'IndiGo', 'DEL', 'BOM', '2025-03-15 10:30:00+05:30', '2025-03-15 12:40:00+05:30', 130, 4800, 180, 'Economy', 0),
('UK969', 'Vistara', 'DEL', 'BOM', '2025-03-15 14:15:00+05:30', '2025-03-15 16:30:00+05:30', 135, 6200, 90, 'Economy', 0),
('SG123', 'SpiceJet', 'DEL', 'BOM', '2025-03-15 16:45:00+05:30', '2025-03-15 19:00:00+05:30', 135, 4500, 150, 'Economy', 0),
('AI103', 'Air India', 'DEL', 'BOM', '2025-03-15 19:30:00+05:30', '2025-03-15 21:45:00+05:30', 135, 5800, 110, 'Economy', 0),

-- Mumbai to Delhi flights
('AI102', 'Air India', 'BOM', 'DEL', '2025-03-16 07:30:00+05:30', '2025-03-16 09:45:00+05:30', 135, 5600, 115, 'Economy', 0),
('6E303', 'IndiGo', 'BOM', 'DEL', '2025-03-16 11:00:00+05:30', '2025-03-16 13:10:00+05:30', 130, 4900, 175, 'Economy', 0),
('UK970', 'Vistara', 'BOM', 'DEL', '2025-03-16 15:00:00+05:30', '2025-03-16 17:15:00+05:30', 135, 6300, 85, 'Economy', 0),
('SG124', 'SpiceJet', 'BOM', 'DEL', '2025-03-16 17:30:00+05:30', '2025-03-16 19:45:00+05:30', 135, 4600, 145, 'Economy', 0),
('AI104', 'Air India', 'BOM', 'DEL', '2025-03-16 20:15:00+05:30', '2025-03-16 22:30:00+05:30', 135, 5900, 105, 'Economy', 0),

-- Delhi to Bangalore flights
('AI201', 'Air India', 'DEL', 'BLR', '2025-03-15 07:15:00+05:30', '2025-03-15 10:00:00+05:30', 165, 6500, 100, 'Economy', 0),
('6E401', 'IndiGo', 'DEL', 'BLR', '2025-03-15 09:45:00+05:30', '2025-03-15 12:30:00+05:30', 165, 5800, 160, 'Economy', 0),
('UK501', 'Vistara', 'DEL', 'BLR', '2025-03-15 13:30:00+05:30', '2025-03-15 16:15:00+05:30', 165, 7200, 80, 'Economy', 0),
('SG301', 'SpiceJet', 'DEL', 'BLR', '2025-03-15 16:00:00+05:30', '2025-03-15 18:45:00+05:30', 165, 5500, 140, 'Economy', 0),
('AI203', 'Air India', 'DEL', 'BLR', '2025-03-15 18:30:00+05:30', '2025-03-15 21:15:00+05:30', 165, 6800, 95, 'Economy', 0),

-- Bangalore to Delhi flights
('AI202', 'Air India', 'BLR', 'DEL', '2025-03-16 06:45:00+05:30', '2025-03-16 09:30:00+05:30', 165, 6600, 98, 'Economy', 0),
('6E402', 'IndiGo', 'BLR', 'DEL', '2025-03-16 10:15:00+05:30', '2025-03-16 13:00:00+05:30', 165, 5900, 155, 'Economy', 0),
('UK502', 'Vistara', 'BLR', 'DEL', '2025-03-16 14:00:00+05:30', '2025-03-16 16:45:00+05:30', 165, 7300, 75, 'Economy', 0),
('SG302', 'SpiceJet', 'BLR', 'DEL', '2025-03-16 17:30:00+05:30', '2025-03-16 20:15:00+05:30', 165, 5600, 135, 'Economy', 0),
('AI204', 'Air India', 'BLR', 'DEL', '2025-03-16 19:45:00+05:30', '2025-03-16 22:30:00+05:30', 165, 6900, 90, 'Economy', 0),

-- Premium Economy flights
('UK971', 'Vistara', 'DEL', 'BOM', '2025-03-15 09:00:00+05:30', '2025-03-15 11:15:00+05:30', 135, 8500, 40, 'Premium Economy', 0),
('UK972', 'Vistara', 'BOM', 'DEL', '2025-03-16 10:30:00+05:30', '2025-03-16 12:45:00+05:30', 135, 8600, 38, 'Premium Economy', 0),
('UK503', 'Vistara', 'DEL', 'BLR', '2025-03-15 11:30:00+05:30', '2025-03-15 14:15:00+05:30', 165, 9800, 35, 'Premium Economy', 0),
('UK504', 'Vistara', 'BLR', 'DEL', '2025-03-16 12:00:00+05:30', '2025-03-16 14:45:00+05:30', 165, 9900, 32, 'Premium Economy', 0),

-- Business class flights
('AI105', 'Air India', 'DEL', 'BOM', '2025-03-15 07:30:00+05:30', '2025-03-15 09:45:00+05:30', 135, 15000, 20, 'Business', 0),
('AI106', 'Air India', 'BOM', 'DEL', '2025-03-16 08:00:00+05:30', '2025-03-16 10:15:00+05:30', 135, 15200, 18, 'Business', 0),
('AI205', 'Air India', 'DEL', 'BLR', '2025-03-15 08:15:00+05:30', '2025-03-15 11:00:00+05:30', 165, 18500, 15, 'Business', 0),
('AI206', 'Air India', 'BLR', 'DEL', '2025-03-16 09:30:00+05:30', '2025-03-16 12:15:00+05:30', 165, 18700, 14, 'Business', 0);
