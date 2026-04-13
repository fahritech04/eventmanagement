-- ============================================
-- SEED DATA - Multi-Tenant Event Management
-- ============================================

-- Tenant 1: Rose Wedding Organizer
INSERT INTO tenants (id, name, slug, email, phone, address, plan) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rose Wedding Organizer', 'rose-wo', 'info@rosewedding.id', '+6281234567001', 'Jl. Sudirman No. 123, Jakarta Selatan', 'premium');

-- Tenant 2: Bintang Event Organizer  
INSERT INTO tenants (id, name, slug, email, phone, address, plan) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bintang Event Organizer', 'bintang-eo', 'hello@bintangevent.id', '+6281234567002', 'Jl. Gatot Subroto No. 45, Bandung', 'basic');

-- ============================================
-- USERS (password: "password123" hashed with bcrypt)
-- ============================================
INSERT INTO users (id, tenant_id, email, password_hash, name, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@rosewedding.id', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOmKJjYTlOP/eRiOVCvWuPNzQ1YLmJYOi', 'Sari Dewi', 'owner', '+6281234567010'),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'coordinator@rosewedding.id', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOmKJjYTlOP/eRiOVCvWuPNzQ1YLmJYOi', 'Rina Kartika', 'admin', '+6281234567011'),
('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'admin@bintangevent.id', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOmKJjYTlOP/eRiOVCvWuPNzQ1YLmJYOi', 'Budi Santoso', 'owner', '+6281234567020');

-- ============================================
-- EVENTS for Tenant 1 (Rose Wedding Organizer)
-- ============================================
INSERT INTO events (id, tenant_id, title, description, client_name, client_email, client_phone, event_date, event_time, venue, venue_address, budget, actual_cost, status, event_type, created_by) VALUES
('aaaa0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pernikahan Andi & Maya', 'Pernikahan adat Jawa modern dengan konsep garden party', 'Andi Wijaya', 'andi@email.com', '+6281234567100', '2026-05-15', '10:00', 'The Springs Club', 'Jl. Raya Serpong, Tangerang Selatan', 250000000, 180000000, 'in_progress', 'wedding', '11111111-1111-1111-1111-111111111111'),
('aaaa0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pernikahan Reza & Putri', 'Intimate wedding dengan tema rustic outdoor', 'Reza Mahendra', 'reza@email.com', '+6281234567101', '2026-06-20', '14:00', 'Villa Alam Sari', 'Jl. Puncak Raya Km 87, Bogor', 180000000, 0, 'planning', 'wedding', '11111111-1111-1111-1111-111111111111'),
('aaaa0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Anniversary PT Maju Bersama', 'Perayaan ulang tahun ke-25 perusahaan', 'Hendra Gunawan', 'hendra@majubersama.co.id', '+6281234567102', '2026-04-30', '19:00', 'Hotel Mulia Senayan', 'Jl. Asia Afrika, Jakarta', 500000000, 350000000, 'in_progress', 'corporate', '22222222-2222-2222-2222-222222222222'),
('aaaa0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Pernikahan Dimas & Anisa', 'Pernikahan internasional tema minimalis elegan', 'Dimas Prasetyo', 'dimas@email.com', '+6281234567103', '2026-03-10', '09:00', 'Ayana MidPlaza', 'Jl. Jenderal Sudirman, Jakarta', 350000000, 340000000, 'completed', 'wedding', '11111111-1111-1111-1111-111111111111'),
('aaaa0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sweet 17 Nayla', 'Sweet seventeen party tema neon glow', 'Ibu Ratna (Orang tua)', 'ratna@email.com', '+6281234567104', '2026-07-12', '18:00', 'Ballroom Ritz Carlton', 'Mega Kuningan, Jakarta', 150000000, 0, 'planning', 'birthday', '22222222-2222-2222-2222-222222222222');

-- ============================================
-- VENDORS for Tenant 1
-- ============================================
INSERT INTO vendors (id, tenant_id, name, category, contact_person, phone, email, description, rating) VALUES
('bbbb0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Catering Nusantara Rasa', 'catering', 'Ibu Santi', '+6281234567200', 'order@nusantararasa.id', 'Spesialis catering wedding & corporate, menu Indonesia & internasional', 4.8),
('bbbb0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dekorasi Sentuhan Emas', 'dekorasi', 'Pak Rizky', '+6281234567201', 'info@sentuhanemas.id', 'Dekorasi pelaminan & venue wedding premium', 4.9),
('bbbb0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Studio Foto Lensa Abadi', 'fotografer', 'Kevin', '+6281234567202', 'booking@lensaabadi.id', 'Fotografer & videografer wedding cinematic', 4.7),
('bbbb0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MC Raka Entertainment', 'mc', 'Raka Pratama', '+6281234567203', 'raka@entertainment.id', 'MC wedding trilingual (Indonesia, English, Jawa)', 4.6),
('bbbb0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Melody Band', 'musik', 'Andi Musik', '+6281234567204', 'booking@melodyband.id', 'Band akustik & full band untuk wedding', 4.5),
('bbbb0006-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MUA Cantik Sempurna', 'makeup', 'Dina Makeup', '+6281234567205', 'dina@cantiksempurna.id', 'Makeup artist & hairdo bridal', 4.9),
('bbbb0007-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Percetakan Maju Jaya', 'lainnya', 'Pak Hasan', '+6281234567206', 'order@majujaya.id', 'Undangan, souvenir, dan merchandise wedding', 4.3),
('bbbb0008-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Trans Anugerah Rental', 'transport', 'Budi Driver', '+6281234567207', 'rental@transanugerah.id', 'Rental mobil pengantin & shuttle tamu', 4.4);

-- ============================================
-- EVENT_VENDORS (Assignment vendor ke event)
-- ============================================
INSERT INTO event_vendors (id, tenant_id, event_id, vendor_id, agreed_price, payment_status, notes) VALUES
('cccc0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0001-0001-0001-0001-000000000001', 45000000, 'dp_paid', 'Paket 1000 pax, menu internasional'),
('cccc0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0002-0002-0002-0002-000000000002', 35000000, 'dp_paid', 'Dekorasi garden party tema putih-emas'),
('cccc0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0003-0003-0003-0003-000000000003', 25000000, 'paid', 'Paket foto+video full day, 2 fotografer + 1 videografer'),
('cccc0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0004-0004-0004-0004-000000000004', 15000000, 'pending', 'MC resepsi & akad'),
('cccc0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0006-0006-0006-0006-000000000006', 12000000, 'dp_paid', 'Makeup pengantin + 4 bridesmaids'),
('cccc0006-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0002-0002-0002-0002-000000000002', 'bbbb0001-0001-0001-0001-000000000001', 30000000, 'pending', 'Paket 500 pax menu nusantara'),
('cccc0007-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0002-0002-0002-0002-000000000002', 'bbbb0003-0003-0003-0003-000000000003', 20000000, 'pending', 'Paket foto pre-wedding + wedding'),
('cccc0008-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'bbbb0001-0001-0001-0001-000000000001', 80000000, 'dp_paid', 'Paket 2000 pax gala dinner'),
('cccc0009-0009-0009-0009-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'bbbb0005-0005-0005-0005-000000000005', 25000000, 'paid', 'Full band 3 jam + DJ');

-- ============================================
-- DEADLINES
-- ============================================
INSERT INTO deadlines (id, tenant_id, event_id, title, description, due_date, priority, status, assigned_to) VALUES
('dddd0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Fitting baju pengantin', 'Fitting baju pengantin di butik Vera Wang', '2026-04-14T10:00:00+07:00', 'high', 'pending', 'Sari Dewi'),
('dddd0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Kirim undangan ke percetakan', 'Desain final undangan sudah ACC, kirim ke percetakan', '2026-04-15T17:00:00+07:00', 'urgent', 'pending', 'Rina Kartika'),
('dddd0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Konfirmasi menu catering', 'Final menu dan jumlah pax untuk catering', '2026-04-20T12:00:00+07:00', 'high', 'pending', 'Sari Dewi'),
('dddd0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Technical meeting dengan venue', 'Koordinasi teknis layout, listrik, dan parkir', '2026-04-25T14:00:00+07:00', 'medium', 'pending', 'Rina Kartika'),
('dddd0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Pelunasan vendor dekorasi', 'Transfer sisa pembayaran ke Dekorasi Sentuhan Emas', '2026-05-01T17:00:00+07:00', 'high', 'pending', 'Sari Dewi'),
('dddd0006-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Rehearsal dinner', 'Gladi bersih dan makan malam bersama keluarga', '2026-05-13T18:00:00+07:00', 'medium', 'pending', 'Sari Dewi'),
('dddd0007-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'Finalisasi rundown acara', 'Rundown final termasuk speech CEO dan entertainment', '2026-04-18T12:00:00+07:00', 'urgent', 'in_progress', 'Rina Kartika'),
('dddd0008-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'Kirim hampers ke direksi', 'Hampers anniversary untuk 10 direksi dan komisaris', '2026-04-25T10:00:00+07:00', 'medium', 'pending', 'Sari Dewi'),
('dddd0009-0009-0009-0009-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0004-0004-0004-0004-000000000004', 'Kirim thank you card', 'Kirim kartu terima kasih ke semua tamu', '2026-03-20T17:00:00+07:00', 'low', 'completed', 'Rina Kartika'),
('dddd0010-0010-0010-0010-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0004-0004-0004-0004-000000000004', 'Serah terima album foto', 'Album foto wedding diserahkan ke klien', '2026-04-10T10:00:00+07:00', 'medium', 'completed', 'Sari Dewi');

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (id, tenant_id, event_id, vendor_id, amount, payment_date, payment_type, payment_method, status, invoice_number, notes) VALUES
('eeee0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0001-0001-0001-0001-000000000001', 22500000, '2026-03-01', 'dp', 'transfer', 'paid', 'INV-2026-001', 'DP 50% catering'),
('eeee0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0002-0002-0002-0002-000000000002', 17500000, '2026-03-05', 'dp', 'transfer', 'paid', 'INV-2026-002', 'DP 50% dekorasi'),
('eeee0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0003-0003-0003-0003-000000000003', 25000000, '2026-02-20', 'full', 'transfer', 'paid', 'INV-2026-003', 'Full payment foto+video'),
('eeee0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0006-0006-0006-0006-000000000006', 6000000, '2026-03-15', 'dp', 'qris', 'paid', 'INV-2026-004', 'DP 50% makeup'),
('eeee0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0001-0001-0001-0001-000000000001', 22500000, NULL, 'full', 'transfer', 'pending', 'INV-2026-005', 'Pelunasan catering'),
('eeee0006-0006-0006-0006-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'bbbb0002-0002-0002-0002-000000000002', 17500000, NULL, 'full', 'transfer', 'pending', 'INV-2026-006', 'Pelunasan dekorasi'),
('eeee0007-0007-0007-0007-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'bbbb0001-0001-0001-0001-000000000001', 40000000, '2026-03-20', 'dp', 'transfer', 'paid', 'INV-2026-007', 'DP 50% catering gala dinner'),
('eeee0008-0008-0008-0008-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'bbbb0005-0005-0005-0005-000000000005', 25000000, '2026-03-25', 'full', 'transfer', 'paid', 'INV-2026-008', 'Full payment Melody Band'),
('eeee0009-0009-0009-0009-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0004-0004-0004-0004-000000000004', NULL, 340000000, '2026-03-05', 'full', 'transfer', 'paid', 'INV-2026-009', 'Full settlement semua vendor');

-- ============================================
-- MEETINGS
-- ============================================
INSERT INTO meetings (id, tenant_id, event_id, title, description, meeting_date, duration_minutes, location, meeting_type, attendees, status, notes) VALUES
('ffff0001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Meeting menu tasting', 'Tasting menu catering bersama klien', '2026-04-14T11:00:00+07:00', 90, 'Restoran Nusantara Rasa, Kemang', 'offline', ARRAY['Andi Wijaya', 'Maya Putri', 'Sari Dewi', 'Ibu Santi'], 'scheduled', 'Bawa daftar pilihan menu 3 paket'),
('ffff0002-0002-0002-0002-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0001-0001-0001-000000000001', 'Review desain undangan', 'Review final desain undangan sebelum cetak', '2026-04-13T15:00:00+07:00', 60, NULL, 'online', ARRAY['Andi Wijaya', 'Rina Kartika', 'Pak Hasan'], 'scheduled', 'Link Zoom akan dikirim H-1'),
('ffff0003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0002-0002-0002-0002-000000000002', 'Site visit venue Villa Alam Sari', 'Kunjungan ke venue untuk survey lokasi', '2026-04-20T09:00:00+07:00', 120, 'Villa Alam Sari, Puncak', 'offline', ARRAY['Reza Mahendra', 'Putri Handayani', 'Sari Dewi', 'Pak Rizky'], 'scheduled', 'Berangkat dari Jakarta jam 7 pagi'),
('ffff0004-0004-0004-0004-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0003-0003-0003-000000000003', 'Briefing tim event anniversary', 'Briefing final seluruh tim dan vendor', '2026-04-28T10:00:00+07:00', 120, 'Hotel Mulia Senayan', 'offline', ARRAY['Rina Kartika', 'Hendra Gunawan', 'Tim Vendor'], 'scheduled', 'Bawa rundown final dan layout venue'),
('ffff0005-0005-0005-0005-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0005-0005-0005-0005-000000000005', 'Konsultasi konsep Sweet 17', 'Diskusi konsep dan tema pesta', '2026-04-22T14:00:00+07:00', 90, 'Kafe Kopi Kenangan, Sudirman', 'offline', ARRAY['Ibu Ratna', 'Nayla', 'Sari Dewi'], 'scheduled', 'Siapkan mood board dan referensi tema neon');

-- ============================================
-- WEBHOOK CONFIGS for Tenant 1
-- ============================================
INSERT INTO webhook_configs (id, tenant_id, url, secret, events_subscribed, is_active) VALUES
('99990001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://n8n.example.com/webhook/event-reminder', 'webhook-secret-rose-wo', ARRAY['deadline.approaching', 'deadline.overdue', 'payment.due', 'event.reminder'], true);
