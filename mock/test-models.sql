--Placeholder data to use for testing

INSERT into composers (first_name, last_name, dob) VALUES ('Ludwig', 'Beethoven', STR_TO_DATE('1770-03-26', '%Y-%m-%d'));
INSERT into composers (first_name, last_name, dob) VALUES ('Wolfgang', 'Mozart', STR_TO_DATE('1756-12-05', '%Y-%m-%d'));
INSERT into composers (first_name, last_name, dob) VALUES ('Johann', 'Bach', STR_TO_DATE('1685-03-31', '%Y-%m-%d'));
INSERT into musical_works (title, composer_id) VALUES ('Symphony 5', (SELECT id FROM composers WHERE last_name = 'Beethoven' LIMIT 1));
INSERT into musical_works (title, composer_id) VALUES ('Eine Kleine Nachtmusik', (SELECT id FROM composers WHERE last_name = 'Mozart' LIMIT 1));
INSERT into musical_works (title, composer_id) VALUES ('Symphony 9', (SELECT id FROM composers WHERE last_name = 'Beethoven' LIMIT 1));
INSERT into musical_works (title, composer_id) VALUES ('Double Violin Concerto', (SELECT id FROM composers WHERE last_name = 'Bach' LIMIT 1));
INSERT into movements (title, order_num, musical_work_id) VALUES ('Allegro', 1, (SELECT id FROM musical_works WHERE title = 'Symphony 5' LIMIT 1));
INSERT into movements (title, order_num, musical_work_id) VALUES ('Adagio', 2, (SELECT id FROM musical_works WHERE title = 'Double Violin Concerto' LIMIT 1));
INSERT into tags (content) VALUES ('happy');
INSERT into movements_tags (movement_id, tag_id) VALUES ((SELECT id FROM movements WHERE title = 'Allegro' LIMIT 1),(SELECT id FROM tags WHERE content = 'happy' LIMIT 1));