CREATE DATABASE draw;

CREATE TABLE users (
    id SERIAL primary key,
    username VARCHAR(255) not null,
    password VARCHAR(255) not null
);

INSERT INTO users (username,password) VALUES 
('Louie','1234'),('Tony','1234'),('Matthew','1234'),('Tecky','1234');


/////////////////////




CREATE TABLE topics (
    id SERIAL primary key,
    topic VARCHAR(255) not null,
    difficulty VARCHAR(255) not null
);

INSERT INTO topics (topic,difficulty) VALUES 
('bird','easy'),('car','easy'),('toilet','medium'),('bread','medium'),('earphone','hard'),('prison','hard');
