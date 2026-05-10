-- Updated booking status to pending for new bookings
-- Keep existing confirmed bookings as is
UPDATE "Booking" SET "status" = 'pending' WHERE "status" IS NULL OR "status" = '';
