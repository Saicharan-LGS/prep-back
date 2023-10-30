

export const staffTable=
`CREATE TABLE IF NOT EXISTS staff_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(15),
    data_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(20),
    status BOOLEAN,
    role VARCHAR(20)
  );
`;