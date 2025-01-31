const bcrypt = require('bcryptjs')

const userData = [
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: bcrypt.hashSync('password123', 10),
        age: 28,
        isAdmin: true,
        createdAt: new Date('2023-06-12T00:00:00Z'),
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: bcrypt.hashSync('welcome2023', 10),
        age: 24,
        isAdmin: false,
        createdAt: new Date('2023-07-20T00:00:00Z'),
    },
    {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        password: bcrypt.hashSync('securePass2023', 10),
        age: 35,
        isAdmin: false,
        createdAt: new Date('2023-08-15T00:00:00Z'),
    },
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: bcrypt.hashSync('admin123', 10),
        age: 30,
        isAdmin: true,
        createdAt: new Date('2023-09-01T00:00:00Z'),
    },
    {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        password: bcrypt.hashSync('mypassword', 10),
        age: 22,
        isAdmin: false,
        createdAt: new Date('2023-10-10T00:00:00Z'),
    },
];

module.exports = userData;
