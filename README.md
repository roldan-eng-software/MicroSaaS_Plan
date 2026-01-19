# Marcenaria Business Management

This is a full-stack web application designed to help a small woodworking business manage its customers and budgets. It provides a simple and efficient way to handle client information and create, track, and manage budgets.

## Features

- **Customer Management:**
  - Create, edit, and delete customer records.
  - Store important customer information such as name, address, contact details, and CPF/CNPJ.
  - View a list of all customers.

- **Budget Management:**
  - Create, edit, and delete budgets.
  - Associate budgets with customers.
  - Automatically calculate the final budget amount based on subtotal and discount.
  - Manage budget status (e.g., draft, approved, rejected).

- **PDF and Email:**
  - Generate a PDF of a budget.
  - Send a budget to a customer via email.

- **User Authentication:**
  - Secure login system to protect business data.

## Technologies Used

- **Backend:**
  - **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
  - **Supabase:** An open source Firebase alternative for the database and authentication.
  - **Python:** The programming language used for the backend.

- **Frontend:**
  - **React:** A JavaScript library for building user interfaces.
  - **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
  - **Vite:** A fast build tool for modern web development.
  - **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Python](https://www.python.org/) 3.7+ and `pip`
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/marcenaria-business-management.git
   cd marcenaria-business-management
   ```
2. **Backend Setup:**
- Navigate to the backend directory:
```bash
cd backend
```
- Install Python dependencies:
```bash
pip install -r requirements.txt
```
- Create a .env file and add your Supabase credentials:
```bash
cp .env.example .env
```
- Run the backend server:
```bash
uvicorn main:app --reload
```
3. **Frontend Setup:**
- Navigate to the frontend directory:
```bash
cd frontend
```
- Install JavaScript dependencies:
```bash
npm install
```
- Run the frontend development server:
```bash
npm run dev
```
## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
