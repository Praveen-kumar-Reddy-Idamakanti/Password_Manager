# 3FA Password Vault

## Overview
3FA Password Vault is a highly secure password management system that utilizes three-factor authentication (3FA) to store and protect user credentials. The authentication factors include:
1. **Main Root Email & Password**
2. **Biometric Authentication (In Progress)**
3. **Google Authenticator - TOTP**

The system ensures that stored credentials remain encrypted and secure, with functionalities to add, edit, and manage passwords.

## Features
- Secure login with 3FA authentication.
- Encrypted credential storage using MongoDB.
- User-friendly React-based interface.
- Ability to store and retrieve credentials securely.
- Edit and update stored credentials (Work in Progress).
- Production deployment preparations.

## Technologies Used
- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**:
  - Root Email & Password (Completed)
  - Google Authenticator - TOTP (Completed)
  - Biometrics (In Progress)
- **Encryption**: AES for storing passwords securely

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js
- MongoDB
- Google Authenticator app for TOTP

### Steps to Run the Project
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/3fa-password-vault.git
   cd 3fa-password-vault
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   TOTP_SECRET=your_totp_secret
   ```
4. Start the backend server:
   ```sh
   npm run server
   ```
5. Start the frontend:
   ```sh
   npm run client
   ```
6. Open the application in your browser and test login & authentication.

## Future Improvements
- Complete biometric authentication integration.
- Improve UI/UX for credential management.
- Deployment on cloud services (e.g., Vercel, AWS, or DigitalOcean).
- Implement role-based access control for enhanced security.

## Contributing
If you'd like to contribute, please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License.

---
### Note
Since the project is still under development, certain features like editing credentials and full production deployment are yet to be completed. Stay tuned for updates!

