CREATE DATABASE draw;
CREATE TABLE users (
    id SERIAL primary key,
    username VARCHAR(255) unique not null,
    password VARCHAR(255) not null
);
CREATE TABLE topics (
    id SERIAL primary key,
    topic VARCHAR(255) not null,
    difficulty VARCHAR(255) not null
);
CREATE TABLE records (
    id SERIAL primary key,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    score INTEGER not null,
    created_at TIMESTAMP with time zone
);

INSERT INTO records (user_id, score)
VALUES (
        145,
        10
    );


SELECT users.username,score FROM users left JOIN records ON users.id = records.user_id;

DROP table topics;

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
('prison', 'hard'),
('leaves', 'easy'),
('birthday cake', 'medium'),
('ice cream', 'easy'),
('newspaper', 'easy'),
('pizza', 'easy'),
('book', 'easy'),
('bubblegum', 'hard'),
('orange', 'easy'),
('teddy bear', 'medium'),
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
('city', 'easy'),
('mountain', 'easy'),
('pizza', 'easy'),
('hand', 'easy'),
('map', 'easy'),
('sushi', 'easy'),
('fast food', 'easy'),
('feet', 'easy'),
('fruit', 'easy'),
('coffee', 'easy'),
('phone', 'easy'),
('chocolate', 'easy'),
('sandwich', 'easy'),
('flower', 'easy'),
('balloon', 'easy'),
('house', 'easy'),
('ocean', 'easy'),
('floor', 'easy'),
('door', 'easy'),
('window', 'easy'),
('grass', 'easy'),
('ice', 'easy'),
('milkshake', 'easy'),
('summer', 'easy'),
('moon', 'easy'),
('candy', 'easy'),
('cookie', 'easy'),
('dream', 'easy'),
('space', 'easy'),
('camera', 'easy'),
('tea', 'easy'),
('car', 'easy'),
('train', 'easy'),
('aircraft', 'easy'),
('wave', 'easy'),
('tecky', 'easy'),
('family', 'easy'),
('bootcamp', 'easy'),
('dragon', 'easy'),
('sword', 'easy'),
('unicorn', 'easy'),
('sun', 'easy');


