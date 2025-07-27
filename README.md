# Serat Electronics - Frontend

## 🚀 Features

### Dashboard
- **Upcoming Installments**: Beautiful dashboard showing clients with upcoming payments
- **Client Management**: View and manage all clients
- **Statistics**: Revenue tracking and payment status

### Comptabilité (Accounting)
- **Revenue Tracking**: Total revenue, cash vs installment payments
- **Sales Management**: View all sales with payment status
- **Invoice Generation**: PDF invoice download for each sale
- **Advanced Filtering**: Filter by date, client, payment type

### Client Management
- **Client Profiles**: Detailed client information
- **Sales History**: View all sales for each client
- **Payment Tracking**: Track installment payments
- **Invoice Management**: Generate and download invoices

## 🔧 API Endpoints Required

### Backend API for Upcoming Installments
The dashboard requires the following API endpoint to be implemented on the backend:

```
GET /api/installments/dashboard/upcoming
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `daysAhead`: Number of days to look ahead (default: 30)

**Expected Response:**
```json
{
  "customers": [
    {
      "customer": {
        "_id": "customer_id",
        "name": "John Doe",
        "phoneNumber": "0123456789",
        "cin": "12345678"
      },
      "upcomingInstallments": [
        {
          "_id": "installment_id",
          "installment": {
            "amount": 500,
            "dueDate": "2024-02-15T00:00:00Z",
            "status": "pending",
            "daysUntilDue": 5
          }
        }
      ],
      "totalUpcomingAmount": 1500,
      "overdueCount": 1,
      "pendingCount": 2
    }
  ],
  "stats": {
    "totalCustomers": 15,
    "totalUpcomingAmount": "25000.00",
    "totalOverdueCount": 5,
    "totalPendingCount": 25,
    "daysAhead": 30
  }
}
```

**Note:** Until this API is implemented, the dashboard will show demo data with a "Mode Démo" indicator.

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. The app will run on `http://localhost:4000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── container/          # Main application containers
│   ├── dashboard/      # Dashboard components
│   ├── pages/          # Page components
│   │   ├── client/     # Client management
│   │   └── comptabilite/ # Accounting features
├── config/             # Configuration files
│   └── api/           # API service files
└── layout/            # Layout components
```

## 🎨 Features

- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface
- **Real-time Updates**: Live data updates
- **PDF Generation**: Invoice downloads
- **Advanced Filtering**: Multiple filter options
- **Status Tracking**: Payment status with color coding
