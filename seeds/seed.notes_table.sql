INSERT INTO notes (id, note_name, modified, folder_id, content)
VALUES
  (1, 'Dogs', now() - '29 days'::INTERVAL, 1, 'dogs dogs'),
  (2, 'Cats', now() - '29 days'::INTERVAL, 2, 'cats cats'),
  (3, 'Pigs', now() - '29 days'::INTERVAL, 3, 'pigs pigs'),
  (4, 'Birds', now() - '26 days'::INTERVAL, 1, 'birds birds'),
  (5, 'Bears', now() - '26 days'::INTERVAL, 2, 'bears bears'),
  (6, 'Horses', now() - '26 days'::INTERVAL, 3, 'horses horses'),
  (7, 'Tigers', now() - '23 days'::INTERVAL, 1, 'tigers tigers'),
  (8, 'Wolves', now() - '23 days'::INTERVAL, 2, 'wolves wolves'),
  (9, 'Elephants', now() - '23 days'::INTERVAL, 3, 'elephants elephants'),
  (10, 'Lions', now() - '20 days'::INTERVAL, 1, 'lions lions'),
  (11, 'Monkeys', now() - '20 days'::INTERVAL, 2, 'monkeys monkeys'),
  (12, 'Bats', now() - '20 days'::INTERVAL, 3, 'bats bats');