# FileUploader

**FileUploader** is a modern file upload application built with **Express.js**, **MySQL**, and **Sequelize**. It provides a secure platform for users to upload, manage, and download files while ensuring that only authorized users can access their data.

## Features

-   **User Authentication**: Secure signup and signin processes with JWT-based authentication.
-   **File Management**: Upload, list, download, update, and delete files.
-   **Authorization**: Ensure that users can only access their own files.
-   **RESTful API**: Well-defined routes for easy integration with front-end applications.

## Technologies Used

-   **Node.js**: JavaScript runtime for building server-side applications.
-   **Express.js**: Web framework for building RESTful APIs.
-   **MySQL**: Relational database management system for storing user and file data.
-   **Sequelize**: Promise-based ORM for Node.js to interact with MySQL.
-   **JWT (JSON Web Tokens)**: For secure user authentication.
-   **Multer**: Middleware for handling file uploads.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/mekan-allanov/ExpresssFileUpload.git
    cd ExpresssFileUpload

    Install dependencies:

    bash
    ```

npm install

Create a .env file in the root directory and add your database configuration:

plaintext

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret

Start the application:

bash

    npm start

API Endpoints
Authentication Module

    POST /signup: Create a new user account.
    POST /signin: Authenticate a user and return JWT tokens.
    POST /signin/new_token: Refresh the access token using a refresh token.
    GET /info: Get user information (requires authentication).
    GET /logout: Log out the current user (invalidate the session).
    GET /logout/all: Log out from all devices (invalidate all sessions).

File Upload Module

    POST /file/upload: Upload a new file (requires authentication).
    GET /file/list: List all files uploaded by the authenticated user.
    DELETE /file/delete/:id: Delete a specific file by ID (requires authentication).
    GET /file/:id: Get details of a specific file by ID (requires authentication).
    GET /file/download/:id: Download a specific file by ID (requires authentication).
    PUT /file/update/:id: Update a specific file by ID (requires authentication).

Usage

After starting the server, you can use tools like Postman or cURL to interact with the API. Make sure to include the JWT token in the Authorization header for protected routes.
