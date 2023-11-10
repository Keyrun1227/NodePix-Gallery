# NodePix Gallery

NodePix Gallery is a full-stack web application developed using Node.js, Express, MongoDB, and Passport.js. It provides users with a seamless experience to upload, edit, and view images in a gallery format.

## Features

- **Google OAuth Login:** Users can log in using their Google accounts.
- **Image Upload:** Users can upload images, which are then processed and displayed in the gallery.
- **Image Editing:** Uploaded images are resized, converted to WebP format, and stored with a unique name.
- **Gallery View:** Users can view their uploaded images in a responsive gallery format.
- **Logout:** Users can securely log out from their accounts.

## Technologies Used

- Node.js: Backend JavaScript runtime.
- Express.js: Web application framework for Node.js.
- MongoDB (with Mongoose): NoSQL database for storing user and image data.
- Passport.js (Google OAuth): Authentication middleware for Node.js.
- Multer: Middleware for handling file uploads.
- Sharp: Image processing library for resizing and format conversion.
- EJS (Embedded JavaScript Templates): Templating engine for rendering dynamic content.

## Getting Started

1. **Clone the Repository:**
   git clone https://github.com/Keyrun1227/nodepix-gallery.git
   cd nodepix-gallery
   
2. **Install Dependencies:**
    npm install
   
3. **Set Up Environment Variables:**
    Create a .env file in the project root with your Google OAuth credentials and MongoDB URI.
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    MONGODB_URI=your_mongodb_uri
    SESSION_SECRET=your_session_secret
   
4. **Run the Application:**
    npm start
   
6. **Open in Browser:**
   Visit http://localhost:3000 in your browser.
