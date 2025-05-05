# ElMeet Subscription Backend

This backend service handles subscription management and payment processing for the ElMeet application.

## Technology Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: Database for storing user and subscription data
- **Mongoose**: MongoDB object modeling
- **Stripe**: Payment processing
- **JWT**: Authentication
- **Jest**: Testing

## Architecture

The backend follows a modular architecture with the following components:

1. **API Layer**: Express routes and controllers
2. **Service Layer**: Business logic
3. **Data Access Layer**: Database operations
4. **Integration Layer**: Third-party service integrations (Stripe)

## Features

- User authentication and authorization
- Subscription management
- Payment processing with Stripe
- Webhook handling for payment events
- Usage tracking and limits enforcement

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

## API Documentation

API documentation is available at `/api-docs` when the server is running.