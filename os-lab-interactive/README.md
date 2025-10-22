# OS_VLab

This project is an educational web app that demonstrates Operating System algorithms with interactive visualizations using Firebase.

## Local Development

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Set up Firebase Emulators:**

    - Install firebase tools: `npm i -g firebase-tools`
    - Login: `firebase login`
    - Init: `firebase init` → enable **Hosting**, **Functions**, **Firestore**, **Storage**, and **Emulators**.
    - Start emulators: `firebase emulators:start`

3.  **Set up Environment Variables:**

    Create a `.env.local` file in the `frontend` directory with the following content:

    ```
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id
    ```

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

## Deployment

1.  **Build the Frontend:**

    ```bash
    npm run build
    ```

2.  **Deploy to Firebase:**

    ```bash
    firebase deploy --only hosting,functions,firestore:rules,storage:rules
    ```
