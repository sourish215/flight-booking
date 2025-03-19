# FlightBooker

FlightBooker is a modern web application for booking flight tickets online. It provides a streamlined experience for users to search, compare, and book flights across multiple airlines.

**Live Demo:** [https://flight-booking-zkcy.vercel.app/](https://flight-booking-zkcy.vercel.app/)

## Features

- **User Authentication**: Secure sign-up and sign-in with email verification
- **Profile Management**: User profile creation and management
- **Flight Search**: Search for flights based on origin, destination, date, and passenger count
- **Booking Management**: View and manage your flight bookings
- **Real-time Notifications**: Instant notifications when booking status changes
- **Automated Status Updates**: A cron job runs every 5 minutes to update booking statuses
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices
- **System-based Theme**: Automatically adapts to user's system dark/light mode preference

## Flight Search Inputs That Should Return Results

1. **From: CCU to DEL (One Way)**

   - Departure: April 15, 2025
   - Passengers: 1 Adult
   - Class: Economy

2. **From: UDR to DEL (One Way)**

   - Departure: October 5, 2025
   - Passengers: 1 Adult
   - Class: Economy

3. **From: DEL to CCU (Round Trip)**
   - Departure: April 14, 2025
   - Return: April 15, 2025
   - Passengers: 1 Adult
   - Class: Economy

## Available Flight Routes

### Origins

- Ahmedabad, India (AMD)
- Bangalore, India (BLR)
- Bangkok, Thailand (BKK)
- Chennai, India (MAA)
- Delhi, India (DEL)
- Dubai, UAE (DXB)
- Goa, India (GOI)
- Hong Kong (HKG)
- Hyderabad, India (HYD)
- Jaipur, India (JAI)
- Kochi, India (COK)
- Kolkata, India (CCU)
- Kuala Lumpur, Malaysia (KUL)
- London, UK (LHR)
- Lucknow, India (LKO)
- Mumbai, India (BOM)
- New York, USA (JFK)
- Paris, France (CDG)
- Pune, India (PNQ)
- San Francisco, USA (SFO)
- Singapore (SIN)
- Sydney, Australia (SYD)
- Tokyo, Japan (NRT)
- Toronto, Canada (YYZ)
- Udaipur, India (UDR)

### Destinations

- Ahmedabad, India (AMD)
- Bangalore, India (BLR)
- Bangkok, Thailand (BKK)
- Chennai, India (MAA)
- Delhi, India (DEL)
- Dubai, UAE (DXB)
- Goa, India (GOI)
- Hong Kong (HKG)
- Hyderabad, India (HYD)
- Jaipur, India (JAI)
- Kochi, India (COK)
- Kolkata, India (CCU)
- Kuala Lumpur, Malaysia (KUL)
- London, UK (LHR)
- Lucknow, India (LKO)
- Mumbai, India (BOM)
- New York, USA (JFK)
- Paris, France (CDG)
- Pune, India (PNQ)
- San Francisco, USA (SFO)
- Singapore (SIN)
- Sydney, Australia (SYD)
- Tokyo, Japan (NRT)
- Toronto, Canada (YYZ)
- Udaipur, India (UDR)

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Real-time)
- **State Management**: React Context API
- **Notifications**: Sonner toast notifications
- **Automation**: GitHub Actions for scheduled tasks
- **Styling**: Tailwind CSS for responsive design

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

This application requires Supabase for authentication and database functionality. Make sure to set up the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Booking System

FlightBooker features a sophisticated booking system with the following workflow:

1. **Booking Creation**: When a user books a flight, the booking is initially set to "pending" status
2. **Automated Updates**: A cron job runs every 5 minutes (implemented via GitHub Actions) to check for pending bookings older than 45 seconds and updates them to "confirmed" status
3. **Real-time Notifications**: When a booking status changes to "confirmed", the user receives an instant notification in their browser
4. **Booking Management**: Users can view all their bookings and check status details

## Notifications System

The application uses a real-time notification system powered by:

- **Supabase Real-time**: Listens for changes to the bookings table
- **Sonner**: Modern toast notification library for displaying alerts
- **Client-side Listener**: A dedicated component that subscribes to booking updates for the authenticated user

This ensures users receive immediate feedback when their booking status changes without requiring page refreshes.
