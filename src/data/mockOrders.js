export const mockOrders = [
    {
        id: 'ORD-78291',
        customer: 'Alice Johnson',
        date: '2024-03-10',
        total: 45.50,
        status: 'Pending',
        items: [
            { name: 'Amoxicillin 250mg', quantity: 1 }
        ]
    },
    {
        id: 'ORD-78292',
        customer: 'Bob Smith',
        date: '2024-03-09',
        total: 15.00,
        status: 'Accepted',
        items: [
            { name: 'Paracetamol 500mg', quantity: 2 }
        ]
    },
    {
        id: 'ORD-78293',
        customer: 'Carol White',
        date: '2024-03-09',
        total: 32.00,
        status: 'Dispatched',
        items: [
            { name: 'Cough Syrup 100ml', quantity: 1 }
        ]
    }
];
