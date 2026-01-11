# Smart Rent

Smart Rent is a web application designed for managing car rentals from both companies and individuals. The platform provides a comprehensive solution for users to manage reservations, payments, notifications, and vehicle listings, all while ensuring a seamless user experience.

## Features

- **User Roles**: Different roles for users, including Admin, Vehicle Owners, and Regular Users, each with specific functionalities.
- **Reservations**: Users can create, update, and view their reservations easily.
- **Payments**: Integration with payment providers like Stripe for secure payment processing.
- **Notifications**: Users receive notifications for important updates regarding their reservations and payments.
- **Image Uploads**: Vehicle owners can upload images of their vehicles for listings.
- **Dashboards**: Role-specific dashboards for Admins, Owners, and Users to manage their activities and view statistics.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Prisma
- **Database**: PostgreSQL

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/stelko0u/SmartRent.git
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` to `.env` and fill in the required variables.

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` to view the application.

## Database Setup

Make sure to set up your PostgreSQL database and run the Prisma migrations:

```bash
npx prisma migrate dev --name init
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
