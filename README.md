# IntraRefer - Job Referral Platform

A comprehensive MERN stack application that connects job seekers with referrers to facilitate meaningful career opportunities through employee referrals.

## 🚀 Features

### Core Functionality

- **Role-based Authentication**: Job Seekers, Referrers, and Admin roles
- **Referral System**: Post and apply for job referrals
- **Application Management**: Track application status and manage responses
- **Premium Subscription**: ₹99/month for unlimited features via Razorpay
- **AI-powered Matching**: Smart job-skill matching algorithm
- **File Uploads**: Resume and avatar uploads via Cloudinary

### User Roles

#### Job Seekers

- Create detailed profiles with skills and experience
- Browse and search referral opportunities
- Apply to referrals (3 per week for free users)
- Track application status
- Premium features with subscription

#### Referrers

- Post job referral opportunities
- Manage incoming applications
- Accept/reject applications with feedback
- Company-based profile management

#### Admin

- User management and analytics
- Content moderation
- Payment and subscription tracking
- Platform statistics and insights

## 🛠 Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Razorpay** payment integration
- **Cloudinary** for file storage
- **Express Rate Limiting** and security middleware

### Frontend

- **React.js** with functional components and hooks
- **React Router** for navigation
- **React Query** for state management and API calls
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling

## 📁 Project Structure

```
IntraRefer-mern/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth and validation middleware
│   ├── scripts/           # Database seeding scripts
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd IntraRefer-mern
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Environment Setup**

   Create `.env` file in the `server` directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/IntraRefer

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server
   PORT=5000
   NODE_ENV=development

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**

   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

### Database Seeding

To populate the database with sample data:

```bash
cd server
npm run seed
```

## 💳 Payment Integration

The platform integrates with Razorpay for subscription payments:

- **Monthly Plan**: ₹99/month
- **Yearly Plan**: ₹990/year (17% savings)

### Premium Features

- Unlimited job applications
- Verified badge on profile
- AI-powered job matching
- Resume analyzer
- Higher visibility to referrers
- Priority customer support

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- File upload restrictions

## 📱 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload avatar
- `POST /api/users/upload-resume` - Upload resume

### Referrals

- `GET /api/referrals` - Get all referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals/:id` - Get referral by ID
- `PUT /api/referrals/:id` - Update referral
- `DELETE /api/referrals/:id` - Delete referral

### Applications

- `GET /api/applications` - Get applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id/status` - Update application status

### Payments

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/subscription-status` - Get subscription status

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Animations**: Framer Motion animations
- **Intuitive Navigation**: Role-based navigation
- **Real-time Feedback**: Toast notifications
- **Loading States**: Skeleton screens and spinners
- **Form Validation**: Real-time form validation
- **Accessibility**: WCAG compliant components

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Seed database
cd server && npm run seed
```

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-specific page components
- **Contexts**: React context for state management
- **Services**: API service functions
- **Hooks**: Custom React hooks
- **Utils**: Utility functions

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or cloud MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment

1. Build the React app: `npm run build`
2. Deploy to Netlify, Vercel, or similar platforms
3. Update API base URL in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Email: support@IntraRefer.com
- Documentation: [docs.IntraRefer.com](https://docs.IntraRefer.com)

## 🙏 Acknowledgments

- React.js team for the amazing framework
- MongoDB team for the database
- Razorpay for payment processing
- Cloudinary for file storage
- All contributors and users of the platform

---

**IntraRefer** - Connecting careers, one referral at a time. 🚀
