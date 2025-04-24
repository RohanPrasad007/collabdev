# CollabDev 🚀

A modern collaborative development platform where programmers can work together with real-time video calls, chat, and task management.

## 🌟 Features

CollabDev combines everything you need for remote collaborative coding in one place:

- ✅ **Google login** using Firebase authentication
- 📹 **1:1 video calls** with WebRTC for real-time collaboration
- 🔒 **Encrypted messaging and file sharing** for secure communication
- 📋 **Task boards** (similar to Trello) for project management
- 💻 **Cross-platform** - works both as a website and desktop application

## 🚀 Getting Started

### Website Version

1. Navigate to the website directory:

   ```bash
   cd /website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Desktop App

1. Navigate to the PC directory:

   ```bash
   cd /pc
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the desktop app in development mode:
   ```bash
   npm run electron:serve
   ```

## 🔧 Configuration

You'll need to update the Firebase settings to connect to your own Firebase project:

### For the website:

Edit the configuration file at `/website/config.js`:

```javascript
// Example config.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### For the desktop app:

Edit the configuration file at `/pc/firebase.js`:

```javascript
// Example firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export default firebaseConfig;
```

## 📱 Screenshots

### Video Calls

![Video Call Feature](./demo/videocall.png?text=Video+Calls)

### Chat Interface

![Chat Interface](./doc/chat.png?text=Chat+Interface)

### Task Board

![Task Board](./doc/track.png?text=Task+Board)

## 👥 Team

Meet the awesome people behind CollabDev:

- **[Rohan Prasad](https://github.com/RohanPrasad007)** - Team Leader, WebRTC Specialist
- **[Riddhi Chavan](https://github.com/Riddhi-chavan)** - Frontend/Backend Developer
- **[Riya Sharma](https://github.com/riyasharma)** - UI/UX Designer

## 💡 Inspiration

Our platform draws inspiration from some of the best collaboration tools out there:

- **Discord's** real-time communication features
- **Slack's** intuitive user interface
- **Trello's** task management approach

## 🤝 How to Contribute

We welcome contributions from the community! Here's how you can help make CollabDev even better:

1. **Fork the repository** on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/RohanPrasad007/collabdev.git
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and commit them:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push** to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
6. Submit a **Pull Request** to the main repository

### Contribution Guidelines

- Follow the existing code style
- Add comments to your code where necessary
- Update documentation if you change functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Got questions? Feel free to reach out to our team at `007rohanprasad@gmail.com`

---

Happy coding! 👩‍💻👨‍💻
