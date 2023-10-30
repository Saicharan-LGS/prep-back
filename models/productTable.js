export const productTable = `
    CREATE TABLE IF NOT EXISTS product_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        data_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip VARCHAR(20),
        status BOOLEAN
      );
    `;
