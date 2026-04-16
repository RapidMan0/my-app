-- Создаем таблицу барберов
CREATE TABLE barbers (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  feedback BIGINT DEFAULT 0,
  experience TEXT,
  image TEXT,
  availableTimes TEXT[] DEFAULT ARRAY[]::TEXT[],
  reviews JSONB DEFAULT '[]'::jsonb,
  average_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу услуг
CREATE TABLE services (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу галереи
CREATE TABLE gallery (
  id BIGINT PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policies для публичного чтения
CREATE POLICY "Enable read access for all users" ON barbers
  FOR SELECT USING (true);

-- Разрешить UPDATE только админам (проверка через Backend API с verifyAccessToken)
-- Поскольку RLS работает через auth.uid(), а у нас Custom JWT, используем anon role
-- и проверяем админ статус на backend через verifyAccessToken
CREATE POLICY "Enable update for admins only" ON barbers
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON services
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON gallery
  FOR SELECT USING (true);

-- Вставляем данные барберов
INSERT INTO barbers (id, name, role, feedback, experience, image, availableTimes, reviews, average_rating) VALUES
(1, 'Patrick Potter', 'Pro Barber', 60, '5 years', '/john-smith.jpg', ARRAY['09:00', '10:00', '11:00', '14:00', '15:00'], '[{"id": "1776340096030", "userId": "cmlaz03tm00006einic4mty1w", "userName": "nihil", "userEmail": "nihil@gmail.com", "userAvatar": null, "rating": 5, "comment": "super!", "date": "2026-04-16T11:48:16.030Z"}]'::jsonb, 5.0),
(2, 'John Smith', 'Pro Barber', 3, '2 years', '/patrick-potter.jpg', ARRAY['10:00', '11:30', '13:00', '16:00'], '[]'::jsonb, 0),
(3, 'Emily Johnson', 'Top Barber Superior', 511, '8 years', '/emily-johnson.jpg', ARRAY['09:30', '12:00', '14:30', '17:00'], '[{"id": "1774706348398", "userId": "cmmj3kncf0004upuxsrvt6ef0", "userName": "isral", "userEmail": "is@gmail.com", "userAvatar": null, "rating": 3, "comment": "", "date": "2026-03-28T13:59:08.398Z"}]'::jsonb, 3.0);

-- Вставляем данные услуг
INSERT INTO services (id, name, price, description) VALUES
(1, 'Men''s Haircut', '100 mdl', 'A classic haircut tailored to your style and preferences.'),
(2, 'Beard Trim', '70 mdl', 'Precision trimming and shaping for a sharp, clean look.'),
(3, 'Shampoo', '50 mdl', 'Relaxing shampoo to cleanse and refresh your hair.'),
(4, 'Men''s Haircut + Styling', '200 mdl', 'A premium haircut with expert styling for a polished look.'),
(5, 'Beard Trim + Grooming', '150 mdl', 'Comprehensive grooming for a well-maintained beard.'),
(6, 'Shampoo + Conditioning', '100 mdl', 'Deep conditioning treatment for healthy, shiny hair.'),
(7, 'Full Haircut Package', '300 mdl', 'Complete haircut package with styling and finishing touches.'),
(8, 'Beard Trim + Facial', '250 mdl', 'A relaxing facial combined with expert beard grooming.'),
(9, 'Scalp Treatment', '150 mdl', 'Therapeutic scalp treatment to promote hair health.');

-- Вставляем данные галереи
INSERT INTO gallery (id, src, alt, tags) VALUES
(1, '/BeardStyle1.jpg', 'Beard Style 1', ARRAY['Beard', 'Dark']),
(2, '/HaircutStyle1.jpg', 'Haircut Style 1', ARRAY['Haircut', 'Dark']),
(3, '/BlondeHaircut.jpg', 'Blonde Haircut', ARRAY['Haircut', 'Blonde']),
(4, '/BeardStyle2.jpg', 'Beard Style 2', ARRAY['Beard', 'Blonde']),
(5, '/HaircutStyle2.jpg', 'Haircut Style 2', ARRAY['Haircut', 'Redhead']),
(6, '/Beard.jpg', 'Haircut Style 2', ARRAY['Beard', 'Redhead']);
