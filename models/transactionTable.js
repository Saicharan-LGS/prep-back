export const TransactionTable = `
CREATE TABLE IF NOT EXISTS transaction_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_id INT,
    amount DECIMAL(10, 2),
    transaction_date DATE,
    transaction_time TIME,
    type VARCHAR(15),
    remark TEXT,
    ip TEXT
);
`;
