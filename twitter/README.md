
Twitter Clone — Full-Stack Social Media Platform
A full-stack Twitter/X-inspired social media application built with React, TypeScript, Next.js, Node.js, Express, and MongoDB Atlas. It combines social networking features with authentication, media uploads, subscription-based tweet limits, notifications, multilingual support, and time-based access rules.

Live Demo: https://twitter-clone-dusky-alpha.vercel.app/
Frontend: Vercel
Backend: Render
Repository: Add your GitHub repository URL here

This is an independent portfolio project inspired by modern social media platforms. It is not affiliated with or endorsed by X Corp. or Twitter.

Table of Contents
Overview
Features
Technology Stack
Subscription Plans
How Key Features Work
Project Architecture
Getting Started
Environment Variables
Running Locally
Deployment
Security and Configuration Notes
Future Improvements
Author
Overview
The Twitter Clone is a full-stack social media application where users can create and interact with tweets, discover people and content, manage their profiles, follow other users, upload media, and access subscription plans. The project also explores real-world integration patterns such as third-party authentication, email and SMS delivery, cloud media storage, payment processing, and deployment across separate frontend and backend services.

Features
Social Networking
Create and publish tweets.
Like and unlike tweets.
Retweet content.
Comment on tweets.
Follow and unfollow other users.
View other users' profiles.
View follower and following lists.
Search for people and discover accounts.
Search tweets and explore recent content.
Media Uploads
Upload images with supported cloud media storage.
Support audio uploads where enabled in the application.
Use Cloudinary to store and deliver media assets.
Keep media URLs and asset metadata available to the application.
Authentication and Account Recovery
Firebase authentication integration, including Google sign-in where configured.
Email OTP delivery through Brevo for supported verification flows.
SMS OTP delivery through Twilio for supported phone verification flows.
Forgot-password functionality.
Time-based login restrictions for configured authentication flows.
Language-change verification: email OTP for French and mobile OTP for other supported language changes, as configured in the application.
Notifications
Enable or disable browser notifications through the profile/settings interface.
Display browser notifications for configured tweet keywords, including “cricket” and “science.”
Notification behavior depends on browser permission and the user's settings.
Search, Discovery, and News
Search for users.
Search tweets.
Explore recent tweets and content.
Display a news box intended for recent/last-24-hour news, depending on the application's configured data source and implementation.
Languages and Personalization
Multilingual interface using the application's i18n setup.
Supported languages: English, Spanish, French, Hindi, Portuguese, and Chinese.
Theme customization where enabled.
Profile update functionality.
Subscriptions and Payments
Razorpay subscription/payment integration.
Subscription-based daily tweet limits.
Backend checks to enforce plan limits and configured payment time windows.
Plan details are shown below; ensure the live configuration and payment provider settings match the values used in the deployed application.
Technology Stack
Area	Technologies / Services
Frontend	React.js, Next.js, TypeScript, JavaScript
Styling	Tailwind CSS and application-specific styling
Backend	Node.js, Express.js
Database	MongoDB Atlas, Mongoose
Authentication	Firebase Authentication
Email delivery	Brevo
SMS delivery	Twilio
Media storage	Cloudinary
Payments	Razorpay
Internationalization	i18next / react-i18next, where configured
Frontend hosting	Vercel
Backend hosting	Render
API communication	HTTP/REST APIs
Subscription Plans
The project has the following plan structure:

Plan	Price	Tweet Limit
Free	₹0	1 tweet per day
Bronze	₹100/month	3 tweets per day
Silver	₹300/month	5 tweets per day
Gold	₹1,000/month	Unlimited tweets
The backend should be treated as the source of truth for subscription status and tweet limits. Never rely only on frontend checks to enforce a plan.

How Key Features Work
1. Tweet Creation and Interactions
Users can publish tweets and interact with other users' content through likes, retweets, and comments. The backend exposes API routes for application operations and persists supported records in MongoDB Atlas.

2. Follow and Unfollow
Users can follow or unfollow other accounts. Profile pages can show follower and following lists, allowing users to explore social connections.

3. Search and Discovery
Search features help users find people and tweets. The interface also includes recent-content discovery and a news box intended to show news from the last 24 hours. The exact freshness and availability of news depend on the configured source/API.

4. Authentication and OTP
Firebase is used for configured authentication flows. Brevo and Twilio support email and SMS delivery for verification flows. OTP validation, expiry, rate limits, and purpose checks should be enforced on the server.

5. Media Handling
Cloudinary is used for media storage and delivery. The application can store media URLs and related metadata alongside its application records. Upload limits and permitted media types should be validated by the backend as well as the frontend.

6. Notifications
The browser Notification API is used for configured notifications. A user may need to grant browser permission, and notification settings should be persisted if they are expected to survive a refresh or a new session.

7. Language Switching
The interface supports English, Spanish, French, Hindi, Portuguese, and Chinese. In the configured verification flow, French language changes use email OTP, while other language changes use mobile OTP. The selected language should only be applied after the relevant verification succeeds.

8. Subscription and Time-Based Rules
Razorpay handles configured payment flows. The backend enforces plan-based tweet limits and any configured time windows. Time restrictions should be checked on the server using the intended timezone, rather than relying on the user's device clock.

Project Architecture
At a high level, the application is divided into:

Frontend: React/Next.js UI for feeds, profiles, forms, search, settings, subscriptions, and interactions.
Backend: Express APIs for application logic, validation, authorization, and integration with external services.
Database: MongoDB Atlas accessed through Mongoose models.
External services: Firebase, Brevo, Twilio, Cloudinary, and Razorpay.
Hosting: Frontend deployed to Vercel and backend deployed to Render.
Typical request flow:

A user interacts with the frontend.
The frontend calls the backend API where server-side processing is required.
The backend validates the request and checks authentication, permissions, limits, or time rules.
The backend reads/writes data in MongoDB Atlas and/or calls the relevant external service.
The response is returned to the frontend for display.
Getting Started
Prerequisites
Install or prepare the following:

Node.js and npm
A MongoDB Atlas cluster and connection string
Firebase project credentials for the authentication methods used
Brevo API credentials and a verified sender for email delivery
Twilio credentials and a configured sender/phone number for SMS
Cloudinary credentials for media storage
Razorpay credentials for payment functionality
You can run the core application locally without enabling every third-party integration, but features that depend on a provider will not work until that provider is configured.

Environment Variables
Create environment files locally. Do not commit secrets to GitHub.

Backend .env
The names below are descriptive placeholders. Match them to the exact names referenced by your backend code.

PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:3000

# Firebase (include only the variables your backend actually uses)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

# Brevo email
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
Frontend .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
If Firebase client-side configuration is used, add the corresponding NEXT_PUBLIC_ Firebase variables required by your code. Use the exact variable names referenced in your project.

Important: Never put private API keys, database credentials, Razorpay secrets, Twilio auth tokens, or Cloudinary API secrets in NEXT_PUBLIC_ variables. Anything prefixed with NEXT_PUBLIC_ in Next.js may be exposed to the browser.

Running Locally
The exact commands depend on your repository layout. If your frontend and backend are in separate directories, a typical setup is:

1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_REPOSITORY_DIRECTORY
Replace the placeholders with your actual repository URL and folder name.

2. Install backend dependencies
cd backend
npm install
Create the backend .env file and configure the required values.

3. Start the backend
Use the start script defined in backend/package.json, for example:

npm run dev
If your project uses a different script, run the script listed in that package file.

4. Install frontend dependencies
Open another terminal:

cd frontend
npm install
Create .env.local and set NEXT_PUBLIC_BACKEND_URL to your local backend URL.

5. Start the frontend
npm run dev
Open the local URL printed by Next.js, commonly http://localhost:3000.

If your repository uses a root-level frontend instead of a frontend/ directory, run the frontend commands from the correct directory. Check each package.json for the available scripts.

Deployment
Frontend — Vercel
Import the frontend repository/project into Vercel.
Configure the required frontend environment variables.
Set NEXT_PUBLIC_BACKEND_URL to the deployed Render backend URL.
Deploy and test authentication, API requests, and client-side routing.
Backend — Render
Create a web service for the backend.
Configure the build and start commands according to backend/package.json.
Add backend environment variables in the Render dashboard.
Configure MongoDB Atlas network access for the deployed backend.
Set allowed CORS origins to the production frontend domain.
Check logs and test all provider integrations after deployment.
Live application: https://twitter-clone-dusky-alpha.vercel.app/

Security and Configuration Notes
Keep all secrets in environment variables and provider dashboards.
Validate inputs and verify user permissions on the backend.
Enforce tweet limits, time restrictions, subscription status, and OTP validation server-side.
Use OTP expiration, attempt limits, and resend cooldowns.
Verify Razorpay payment signatures on the backend before granting paid access.
Configure CORS to allow only trusted frontend origins in production.
Validate media type and size before uploading files.
Do not expose sensitive user information in logs or API responses.
Test provider failures and rate limits; trial accounts may have delivery restrictions.
Browser notifications require permission and may behave differently across browsers.
Ensure the 24-hour news box uses a valid data source and filters content by publication time if strict freshness is required.
Future Improvements
Potential next steps for the project:

Add automated unit and integration tests.
Add API documentation with Swagger/OpenAPI.
Add CI/CD checks and deployment workflows.
Improve accessibility and loading/error states.
Add pagination or infinite scrolling for feeds and search.
Add stronger monitoring, structured logging, and rate limiting.
Add comprehensive notification preference persistence and delivery tests.
Improve news-source attribution, timestamps, and stale-content handling.
Author
Vansh
Full Stack MERN Developer

GitHub: https://github.com/Code-sHere
Live Project: https://twitter-clone-dusky-alpha.vercel.app/
If you find this project interesting, feel free to explore the live demo and the source repository.

