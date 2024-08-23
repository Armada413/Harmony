CREATE TABLE users (
    id SERIAL PRIMARY KEY,              
    discord_id VARCHAR(20) UNIQUE NOT NULL ,
    reports SMALLINT DEFAULT 0,
    collaborator BOOLEAN DEFAULT false,
    served BOOLEAN DEFAULT false,
);


CREATE TABLE reports (
    id SERIAL PRIMARY KEY,      
    user_discord VARCHAR(20) REFERENCES users(discord_id),  
    suspect_discord VARCHAR(20) REFERENCES users(discord_id) NOT NULL,  
    type VARCHAR(50) NOT NULL,        
    offense VARCHAR(255) NOT NULL,      
    message_link VARCHAR(255),       
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP     
);

CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    suspect_discord VARCHAR(20) REFERENCES users(discord_id) NOT NULL,
    offense VARCHAR(255) NOT NULL,
    message_link VARCHAR(255),
    verdict INTEGER REFERENCES verdict(id),
    started TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished TIMESTAMP
);

CREATE TABLE verdict (
    id SERIAL PRIMARY KEY,
    suspect_discord VARCHAR(20) REFERENCES users(discord_id) NOT NULL,
    punishment VARCHAR(255) NOT NULL,
    until_when DATE NOT NULL,
    finished TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

CREATE TABLE jury_request (
    id SERIAL PRIMARY KEY,
    attending BOOLEAN,
    user_discord VARCHAR(20) REFERENCES users(discord_id) NOT NULL,
    case_id INTEGER REFERENCES cases(id) NOT NULL,
    backup INTEGER REFERENCES jury_request(id),
    violation BOOLEAN DEFAULT false,
    started TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished TIMESTAMP
);

CREATE TABLE jury_12 (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) NOT NULL,
    user_discord_1 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_2 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_3 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_4 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_5 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_6 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_7 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_8 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_9 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_10 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_11 VARCHAR(20) REFERENCES users(discord_id),
    user_discord_12 VARCHAR(20) REFERENCES users(discord_id),
    started TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished TIMESTAMP
);
-- ========================
INSERT INTO table (row_name) VALUES ('value');
