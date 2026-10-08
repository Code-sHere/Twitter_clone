# 🐦 Twitter Clone — Full Stack Social Media Platform

A full-stack Twitter/X-inspired social media platform built with **React, TypeScript, Node.js, Express.js, and MongoDB Atlas**.

The application implements core social-media functionality such as creating tweets, likes, retweets, comments, following users, searching users and tweets, authentication, multilingual support, notifications, media uploads, subscriptions, OTP verification, and subscription-based tweet restrictions.

The project was designed not only as a CRUD application but as a complete full-stack system integrating multiple external services and real-world backend constraints.

---

## 🚀 Project Highlights

The Twitter Clone includes:

- 🔐 Firebase authentication
- 📱 Phone OTP verification
- 📧 Email OTP verification
- 🐦 Tweet creation
- ❤️ Likes
- 🔁 Retweets
- 💬 Comments
- 👥 Follow / unfollow
- 🔎 Tweet and user search
- 🌎 Multi-language support
- 💳 Razorpay subscriptions
- 📊 Subscription-based tweet limits
- 🖼️ Image uploads
- 🎙️ Audio tweet support
- ☁️ Cloudinary media storage
- 🔔 Browser notifications
- ⏰ Time-based feature restrictions
- 🗄️ MongoDB Atlas
- 🚀 Production deployment

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Next.js
- Tailwind CSS
- React components
- Firebase Authentication

## Backend

- Node.js
- Express.js
- JavaScript
- REST APIs
- Mongoose

## Database

- MongoDB Atlas

## Authentication

- Firebase Authentication
- OTP-based verification

## Email

- Brevo

## SMS

- Twilio

## Payments

- Razorpay

## Media Storage

- Cloudinary
- Image hosting for image uploads

## Development Tools

- Git
- GitHub
- VS Code
- Postman

 ---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React / Next.js UI   │
                    │ TypeScript           │
                    └──────────┬───────────┘
                               │
                         REST API Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express    │
                    │ Backend              │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
             ▼                 ▼                  ▼
       MongoDB Atlas       Firebase          External APIs
                              │             │       │
                              │             │       │
                              ▼             ▼       ▼
                         Authentication  Razorpay  Twilio
                                          Brevo    Cloudinary
```

---

# 🔐 Authentication System

The application uses Firebase Authentication for user authentication.

The authentication flow is designed to protect user-specific operations and provide secure access to the platform.

Users can:

- Register
- Login
- Logout
- Authenticate using Firebase
- Access protected features
- Verify their identity through OTP workflows

---

# 📱 OTP Verification

The project supports OTP-based verification for sensitive operations.

Two major OTP channels are implemented:

### 📧 Email OTP

Email OTP is used for operations requiring email verification.

The project uses **Brevo** for sending emails.

### 📱 Phone OTP

Phone OTP is implemented using **Twilio**.

The phone number can be retrieved from the registered user profile so that the user does not need to manually enter a different number.

---

# 🐦 Tweet System

Authenticated users can create tweets.

A tweet can contain text and supported media depending on the feature being used.

Core tweet operations include:

- Create tweet
- View tweets
- Like tweet
- Unlike tweet
- Retweet
- Remove retweet
- Comment
- View comments
- Delete/manage user content

---

# ❤️ Likes

Users can like tweets.

The system maintains:

- Like count
- Users who liked a tweet

The backend prevents duplicate likes from the same user.

---

# 🔁 Retweets

Users can retweet content.

The system tracks:

- Retweet count
- Users who retweeted

This allows the application to provide Twitter-like engagement functionality.

---

# 💬 Comments

Users can interact with tweets through comments.

Comments are associated with the relevant tweet and user.

This provides a basic conversation system around tweets.

---

# 👥 Follow System

Users can follow and unfollow other users.

The application tracks:

- Followers
- Following
- Follow state
- Followers count
- Following count

The frontend can display whether the current user is already following another user.

---

# 🔎 Search

The application provides search functionality.

Users can search for:

- Tweets
- Users
- Relevant social content

This makes it easier to discover content and accounts.

---

# 🌎 Multi-Language Support

The application supports multiple languages:

```text
English   → en
Spanish   → es
French    → fr
Hindi     → hi
Portuguese → pt
Chinese   → zh
```

The UI text is structured using localization JSON files.

Example:

```text
locales/
├── en/
├── es/
├── fr/
├── hi/
├── pt/
└── zh/
```

The language selection workflow includes OTP verification before changing the application's language for protected language-switching operations.

---

# 💳 Subscription System

The project includes a subscription system powered by **Razorpay**.

Users can upgrade their account to different plans.

Current plans:

| Plan | Price / Month | Tweet Limit |
|---|---:|---:|
| Free | ₹0 | 1 tweet/day |
| Bronze | ₹100 | 3 tweets/day |
| Silver | ₹300 | 5 tweets/day |
| Gold | ₹1000 | Unlimited |

---

# 📊 Subscription-Based Tweet Restrictions

The backend checks the user's subscription before allowing a tweet.

Example:

```text
Free
1 tweet/day

Bronze
3 tweets/day

Silver
5 tweets/day

Gold
Unlimited
```

The system prevents users from exceeding the tweet limit associated with their subscription.

Tweet usage resets daily.

---

# ⏰ Payment Time Restriction

As part of the project's business logic, subscription payments are restricted to a specific time window.

Payments are allowed between:

```text
10:00 AM – 11:00 AM IST
```

The backend checks Indian Standard Time before creating a subscription.

If a user attempts a payment outside the allowed window, the API rejects the request.

This demonstrates implementation of server-side time-based business rules.

---

# 🖼️ Image Upload

Users can upload images with supported content.

The project uses external image hosting/storage rather than storing large image files directly inside MongoDB.

The upload flow is approximately:

```text
User
  ↓
Frontend
  ↓
Image Upload Service
  ↓
Image URL
  ↓
Backend
  ↓
MongoDB
```

---

# 🎙️ Audio Tweet Feature

The application also supports audio content.

Users can:

- Record/upload audio
- Upload audio as part of tweet content
- Store the media externally
- Associate the media with the authenticated user

---

## 🎧 Audio Restrictions

Audio uploads have the following restrictions:

```text
Maximum duration: 5 minutes
Maximum file size: 100 MB
Allowed time: 2:00 PM – 7:00 PM IST
```

Before uploading audio, the user must complete the required OTP authentication flow.

---

# ☁️ Cloudinary Integration

Cloudinary is used for audio/media storage.

The flow is:

```text
Audio File
    ↓
Frontend
    ↓
Backend
    ↓
Cloudinary
    ↓
Cloudinary URL
    ↓
Database
```

Only the resulting media URL/reference needs to be associated with the application data.

---

# 🔔 Notification System

The application includes browser notification functionality.

Users can enable or disable notifications from their profile.

The notification system can detect tweets containing specific keywords such as:

```text
cricket
science
```

When matching content is detected, the browser Notification API can be used to display a notification.

---

# 🔔 Notification Preferences

Users can control whether browser notifications are enabled.

The preference should persist so that refreshing or reopening the application does not unexpectedly reset the user's selection.

---

# 🗄️ Database

MongoDB Atlas is used as the primary database.

Mongoose is used to define schemas and interact with MongoDB.

Major data entities include:

```text
User
Tweet
Assets
Subscription
Notification
```

---

# 👤 User Data

User information is used for:

- Authentication
- Profile information
- Followers/following
- Phone verification
- Email verification
- Subscription information
- Tweet ownership
- User preferences

---

# 🐦 Tweet Data

Tweets are associated with their author.

Typical tweet information includes:

```text
author
content
likes
retweets
comments
likedBy
retweetedBy
timestamp
```

---

# 📦 Assets

Media assets are handled separately from the primary tweet data.

The asset structure supports:

```text
author
assetsId
image
audio
timestamp
```

This keeps media references separate from the core tweet structure.

---

# 💰 Subscription Data

Subscription information contains details such as:

```text
userId
plan
planName
razorpayPlanId
razorpaySubscriptionId
amount
tweetLimit
tweetsUsed
status
currentPeriodStart
currentPeriodEnd
```

This allows the backend to determine the user's current subscription and usage.

---

# 🌐 API Architecture

The backend follows a REST API architecture.

Example API groups include:

```text
/api/auth
/api/tweets
/api/follow
/api/subscriptions
/api/language
/api/notifications
```

The exact routes may vary depending on the current backend implementation.

---

# 🔄 Example Tweet Flow

```text
User creates tweet
       ↓
Frontend validates request
       ↓
Authentication information
       ↓
Express API
       ↓
Validate user
       ↓
Check subscription
       ↓
Check daily tweet limit
       ↓
Save tweet
       ↓
Process notification logic
       ↓
Return response
       ↓
Update frontend
```

---

# 🔄 Example Subscription Flow

```text
User selects plan
       ↓
Frontend requests subscription
       ↓
Backend checks current IST time
       ↓
Validate allowed payment window
       ↓
Create Razorpay subscription
       ↓
Return Razorpay details
       ↓
Razorpay Checkout
       ↓
Payment
       ↓
Subscription information stored
       ↓
Tweet limits updated
```

---

# 🔄 Example Language Verification Flow

```text
User selects language
       ↓
Determine verification method
       ↓
French
   ↓
Email OTP

Other supported languages
   ↓
Phone OTP
       ↓
User enters OTP
       ↓
Backend verifies OTP
       ↓
Language preference updated
       ↓
Application switches language
```

---

# 🔐 Backend Validation

The backend performs validation for important operations.

Examples include:

- User ID validation
- Language validation
- OTP validation
- Subscription validation
- Tweet limit validation
- Media restrictions
- Time-based restrictions
- Authentication checks

Business rules are enforced on the backend instead of relying only on frontend validation.

---

# 🧪 API Testing

During development, APIs were tested using **Postman** and direct HTTP requests.

Example:

```text
POST
/api/follow/:userId
```

The API can return information such as:

```json
{
  "success": true,
  "isFollowing": true,
  "followersCount": 1,
  "followingCount": 0
}
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

## 2. Install frontend dependencies

```bash
cd client
npm install
```

## 3. Install backend dependencies

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

Create the required environment files.

Example backend variables:

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

BREVO_API_KEY=
EMAIL_FROM=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use the exact variable names required by your current implementation.

**Never commit real credentials to GitHub.**

---

# ▶️ Run the Backend

```bash
cd server
npm run dev
```

The backend will normally run on:

```text
http://localhost:5000
```

---

# ▶️ Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Then open the frontend development URL shown by Next.js.

---

# 🗃️ MongoDB Atlas

The project uses MongoDB Atlas as the cloud database.

The backend connects to MongoDB through Mongoose.

Example connection flow:

```text
Express Server
      ↓
Mongoose
      ↓
MongoDB Atlas
      ↓
Collections
```

---

# 🚀 Deployment

The application uses a separate frontend/backend deployment architecture.

Typical architecture:

```text
                    GitHub
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
      Frontend                 Backend
       Vercel                  Render
          │                       │
          │                       ├── MongoDB Atlas
          │                       ├── Firebase
          │                       ├── Twilio
          │                       ├── Brevo
          │                       ├── Razorpay
          │                       └── Cloudinary
          │
          └──────── API Requests ──┘
```

---

# 🌍 Production Considerations

When deploying the application, make sure:

- Frontend API URL points to the production backend
- Backend environment variables are configured
- MongoDB Atlas allows the production backend connection
- Firebase authorized domains include the production frontend domain
- Twilio credentials are configured correctly
- Brevo credentials are configured
- Razorpay credentials are configured
- Cloudinary credentials are configured
- CORS allows the production frontend origin

---

# 🧠 Challenges Solved

This project involved solving several real-world full-stack problems.

### MongoDB Atlas

Handled:

- Database connection issues
- IP whitelist configuration
- Mongoose schema validation
- ObjectId validation

### Authentication

Handled:

- Firebase configuration
- Production authorized domains
- OTP verification
- Authentication state

### Twilio

Handled:

- Trial-account restrictions
- SMS authentication
- Phone verification
- Production considerations

### Email

Implemented email-based OTP functionality using Brevo.

### Payments

Implemented Razorpay subscription logic with:

- Multiple plans
- Payment restrictions
- Subscription state
- Tweet usage limits

### Media

Implemented external media storage instead of storing large files directly in MongoDB.

### Deployment

Worked through:

- Vercel configuration
- Render backend deployment
- CORS
- Environment variables
- Firebase authorized domains
- Production API URLs

---

# 📚 What I Learned

This project significantly improved my understanding of full-stack development.

I worked with:

- React
- TypeScript
- Next.js
- Node.js
- Express.js
- MongoDB
- Mongoose
- Firebase
- Twilio
- Brevo
- Razorpay
- Cloudinary
- REST APIs
- Authentication
- OTP verification
- Payment integration
- Subscription architecture
- File/media uploads
- Browser notifications
- Internationalization
- Deployment
- Environment variables
- CORS
- Production debugging

Most importantly, the project helped me understand how multiple independent services can be integrated into one production-style application.

---

# 🔮 Future Improvements

Potential improvements include:

- Real-time messaging
- WebSocket-based notifications
- Advanced recommendation system
- Hashtags and trending topics
- Bookmark functionality
- Improved media processing
- Video uploads
- Advanced notification preferences
- Admin dashboard
- Automated testing
- Docker support
- CI/CD pipeline
- Rate limiting
- Redis caching
- Improved search with indexing
- Better mobile responsiveness

---

# 👨‍💻 Developer

**Vansh**

Full Stack MERN Developer

GitHub:

https://github.com/Code-sHere

---

# 📄 License

This project was developed as a portfolio and learning project demonstrating full-stack development, API integration, authentication, payment integration, database management, and deployment.
