CREATE DATABASE Restaurant;
show databases;
use Restaurant;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    zipcode VARCHAR(10) NOT NULL,
    preference ENUM('veg', 'nonveg') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
create table Login(
username VARCHAR(100) not null,
password VARCHAR(100) not null
);
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,  -- Link to the user
    item_name VARCHAR(255),
    item_price DECIMAL(10, 2),
    quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)  NULL,
    phone VARCHAR(20)  NULL,
    email VARCHAR(255)  NULL,
    reservation_date DATE  NULL,   -- Changed from 'date' to 'reservation_date'
    reservation_time TIME  NULL, -- Changed from 'time' to 'reservation_time'
    welcomenote TEXT,
    guests INT  NULL,
    table_name VARCHAR(50) ,   -- Changed from 'table' to 'table_name'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE reservations ADD confirmation_message TEXT;

INSERT INTO reservations (name, welcomenote) VALUES ('Customer Name', 'Dear Customer,\n\nThank you for choosing Grand Luxe Interface! We are thrilled to confirm your reservation with us.\n\nWe can\'t wait to welcome you!\n\nThe details of your reservation are as follows:\n\nIf you have any special requests or require further assistance, please do not hesitate to reach out.\n\nBest regards,\nThe Grand Luxe Interface Team');


ALTER TABLE users ADD COLUMN submission_time DATETIME;


drop database Restaurant;
SELECT DATABASE();
select* from users;
select* from Login;
select* from reservations;
drop table login;
drop table reservations;