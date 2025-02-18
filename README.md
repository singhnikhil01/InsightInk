# InsightInk

A blog website.

## Description

InsightInk is a blog website project built using React.js for the front end, Node.js for the back end, and MongoDB for the database. It allows users to create, edit, and delete blog posts, comment on posts, and like posts. It also supports image uploads using AWS S3 and Google authentication using Firebase.

## Features

- User authentication (login/signup, Google authentication)
- Create, edit, and delete blog posts
- Comment on blog posts
- Like blog posts
- Responsive design
- Image upload using AWS S3

## Technologies Used

### Frontend
- **React.js**: A JavaScript library for building user interfaces.
- **CSS**: Styling for the web pages.
- **HTML**: Markup language for creating web pages.
- **Firebase**: Used for Google authentication.

### Backend
- **Node.js**: JavaScript runtime for server-side programming.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing data.
- **AWS S3**: Amazon Web Services Simple Storage Service for image uploads.
- **JWT**: JSON Web Tokens for authentication.

## Getting Started

### Prerequisites

- Node.js installed on your machine. You can download it [here](https://nodejs.org/).
- MongoDB installed on your machine or a MongoDB Atlas account. You can download it [here](https://www.mongodb.com/).
- AWS account for S3 bucket. You can sign up [here](https://aws.amazon.com/).
- Firebase account for Google authentication. You can sign up [here](https://firebase.google.com/).

### Installation

1. Clone the repository:

```bash
git clone https://github.com/singhnikhil01/InsightInk.git
cd InsightInk
```

2. Install dependencies for the backend:

```bash
cd backend
npm install
```

3. Install dependencies for the frontend:

```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the `backend` directory and add the following environment variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_BUCKET_NAME=your_aws_bucket_name
```

2. Create a `.env` file in the `frontend` directory and add the following environment variables:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd ../frontend
npm start
```

The frontend will be running on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Usage

### User Authentication

Users can sign up and log in using their email and password. Google authentication is also supported via Firebase.

### Creating a Blog Post

Authenticated users can create blog posts by clicking on the "Create Post" button. They can add a title, content, and upload images to the post.

### Editing and Deleting a Blog Post

Users can edit or delete their own blog posts by clicking on the "Edit" or "Delete" buttons on the post.

### Commenting on a Blog Post

Users can comment on any blog post by typing in the comment box and clicking the "Comment" button.

### Liking a Blog Post

Users can like any blog post by clicking the "Like" button on the post.

## Project Structure

```plaintext
InsightInk/
│
├── backend/
│   ├── controllers/        # Controllers for handling requests
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── app.js              # Main application file
│   └── server.js           # Server configuration
│
├── frontend/
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # React pages
│   │   ├── App.js          # Main React component
│   │   └── index.js        # Entry point for React
│   └── package.json        # Frontend dependencies
│
└── README.md               # Project documentation
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

If you have any questions or suggestions, feel free to reach out to the project maintainer.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Firebase](https://firebase.google.com/)
