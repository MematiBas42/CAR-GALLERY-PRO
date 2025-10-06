# 🚗 Car Dealer Platform

A modern, full-stack car dealership management system built with Next.js 15, featuring advanced inventory management, customer reservations, and comprehensive admin tools.

## 🌐 Live Demo

**Production**: [https://car-dealer-lake-eight.vercel.app/](https://car-dealer-lake-eight.vercel.app/)

## ✨ Features

### 🎯 Core Functionality
- **Modern Car Inventory**: Browse and search vehicles with advanced filtering
- **Smart Reservations**: Multi-step booking system with date selection
- **Admin Dashboard**: Complete dealership management interface
- **Customer Management**: Track leads and customer interactions
- **Image Management**: AWS S3 integration with drag-and-drop uploads
- **Real-time Search**: Advanced filtering by make, model, price, and specifications

### 🔐 Authentication & Security
- **NextAuth v5**: Secure authentication with sessions
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Role-based Access**: Admin and customer user roles
- **Rate Limiting**: API protection with Upstash Redis
- **Input Validation**: Comprehensive data validation with Zod

### 📱 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching with next-themes
- **Loading States**: Smooth transitions and skeleton loaders
- **Image Optimization**: Next.js Image with Thumbhash placeholders
- **Rich Text Editor**: TinyMCE integration for content management

### 🛠 Technical Features
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 with presigned URLs
- **Email Service**: Resend integration for notifications
- **AI Integration**: OpenAI SDK for intelligent features
- **Search**: Advanced filtering and sorting capabilities


## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **State Management**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Icons**: Lucide React + React Simple Icons

### Backend
- **Database**: PostgreSQL
- **ORM**: Prisma with extensions
- **Authentication**: NextAuth v5
- **File Storage**: AWS S3
- **Email**: Resend
- **Rate Limiting**: Upstash Redis

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint + Prettier
- **Database Migrations**: Prisma Migrate
- **Development**: Turbopack (Next.js)

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **AWS S3** bucket (for file storage)
- **Resend** account (for emails)
- **TinyMCE** API key (for rich text editor)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/car-dealer.git
cd car-dealer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/car_dealer"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="your-s3-bucket-name"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"

# TinyMCE Rich Text Editor
NEXT_PUBLIC_TINYMCE_API_KEY="your-tinymce-api-key"

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# AI Integration (optional)
OPENAI_API_KEY="your-openai-api-key"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users & Sessions**: Authentication and user management
- **Classified Ads**: Vehicle listings with detailed specifications  
- **Make/Model/Variants**: Hierarchical vehicle taxonomy
- **Customers**: Lead and customer information
- **Images**: File metadata and relationships

## 🛡️ Authentication

The platform supports multiple authentication methods:

1. **Email/Password**: Traditional authentication with bcrypt hashing
2. **Two-Factor Authentication**: Optional SMS/email-based 2FA
3. **Session Management**: Secure session handling with NextAuth

### Default Admin Account
After seeding, you can log in with:
- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
car-dealer/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Main database schema
│   ├── migrations/           # Database migration files
│   └── seed/                 # Database seeding scripts
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (presentation)/   # Public-facing pages
│   │   ├── admin/           # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/          # Reusable React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── auth/            # Authentication components
│   │   ├── car/             # Vehicle-related components
│   │   ├── shared/          # Shared UI components
│   │   └── ui/              # Base UI components
│   ├── config/              # Configuration files
│   ├── lib/                 # Utility functions and clients
│   └── schemas/             # Zod validation schemas
├── public/                  # Static assets
└── emails/                  # Email templates
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev   # Create and apply new migration
npx prisma db push   # Push schema changes without migration
npx prisma db seed   # Seed database with sample data

# Deployment
npm run build && npm run start   # Build and start production
```

## 🌐 API Routes

The application provides RESTful API endpoints:

- **Authentication**: `/api/auth/*` - NextAuth endpoints
- **Vehicles**: `/api/cars/*` - Vehicle CRUD operations
- **Images**: `/api/images/*` - File upload and management
- **Taxonomy**: `/api/taxonomy/*` - Make/model data
- **Favourites**: `/api/favourites/*` - User favourites management

## 🎨 UI Components

Built with a comprehensive design system:

- **Form Components**: Input, Select, Checkbox, Radio groups
- **Data Display**: Tables, Cards, Carousels, Modals
- **Navigation**: Breadcrumbs, Pagination, Filters
- **Feedback**: Toast notifications, Loading states, Error boundaries

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px and above

## 🔒 Security Features

- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Input Sanitization**: HTML sanitization for user content
- **Rate Limiting**: API rate limiting with Upstash Redis
- **Secure Headers**: Security headers via Next.js middleware
- **Environment Variables**: Sensitive data stored securely

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🧪 Testing

To test the application:

1. **Admin Panel**: Visit `/admin/dashboard` with admin credentials
2. **Vehicle Browsing**: Browse inventory at `/inventory`
3. **Reservations**: Try booking a vehicle
4. **Image Uploads**: Test drag-and-drop file uploads
5. **Responsive Design**: Test on different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [GitHub Issues](https://github.com/your-username/car-dealer/issues)
2. Review the error logs in your console
3. Ensure all environment variables are correctly set
4. Verify database connectivity and migrations

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment and hosting
- **Prisma** - For the excellent database toolkit
- **Radix UI** - For the accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework

---

**Built with ❤️ using Next.js 15 and modern web technologies**
