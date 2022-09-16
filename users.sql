CREATE DATABASE draw;
CREATE TABLE users (
    id SERIAL primary key,
    username VARCHAR(255) not null,
    password VARCHAR(255) not null
);
INSERT INTO users (username, password)
VALUES (
        'louie',
        '$2a$10$TtNGQcgNyDxa1j/srazFuOxbWwawFbvsV7cAaI1RPeRg8XJzM8lAu'
    ),
    (
        'tony',
        '$2a$10$MyyR1XmxZa0ik62245OUS.8ru20N1SFnZGR8H6gJ79AA51wKFd6TS'
    ),
    (
        'matthew',
        '$2a$10$ohbm2Z93xiNCL6MnLqKawuM3AErpkTwxIGE2p/vUE.qRNRLKvZfa6'
    ),
    (
        'tecky',
        '$2a$10$vBUWuVYJOnArYLD9FDS.g.vUZ.EqoAe3JCbntfp7d.Xn2OfxmYWM2'
    );
louie louie tony tony matthew matthew tecky 1234 / / / / / / / / / / / / / / / / / / / / / CREATE TABLE topics (
    id SERIAL primary key,
    topic VARCHAR(255) not null,
    difficulty VARCHAR(255) not null
);
INSERT INTO topics (topic, difficulty)
VALUES ('bird', 'easy'),
('car', 'easy'),
('toilet', 'medium'),
('bread', 'medium'),
('earphone', 'hard'),
('prison', 'hard');

INSERT INTO topics (topic, difficulty)
VALUES 
('leaves', 'easy'),
('birthday cake', 'medium'),
('ice cream', 'easy'),
('newspaper', 'easy'),
('pizza', 'easy'),
('book', 'easy'),
('bubblegum', 'hard'),
('orange', 'easy'),
('teddy Bear', 'medium'),
('apple tree', 'easy'),
('smile', 'hard'),
('music', 'easy'),
('cherry', 'easy'),
('timer', 'easy'),
('post office', 'hard'),
('kiwi', 'easy'),
('eyes', 'easy'),
('dinner', 'medium'),
('castle', 'easy'),
('pencil', 'easy'),
('pumpkin', 'easy'),
('soup', 'easy'),
('blanket', 'medium'),
('spider', 'easy'),
('skeleton', 'easy'),
('lake', 'easy'),
('ghost', 'easy'),
('golf', 'easy'),
('squirrel', 'easy'),
('cat', 'easy'),
('football', 'easy'),
('dinosaur', 'easy'),
('trophy', 'easy'),
('wind', 'easy'),
('button', 'easy'),
('bus', 'easy'),
('farm', 'easy'),
('vegetable', 'easy'),
('bird', 'easy'),
('jacket', 'easy'),
('fox', 'easy'),
('plate', 'easy'),
('snow', 'easy'),
('shopping mall', 'hard'),
('christmas', 'easy'),
('present', 'easy'),
('letter', 'easy'),
('holiday', 'easy'),
('wish', 'easy'),
('light', 'easy'),
('snowman', 'easy'),
('bell', 'easy'),
('angel', 'easy'),
('sun', 'easy');


