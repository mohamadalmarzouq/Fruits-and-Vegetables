# Capacitor Mobile App Setup Guide

## ✅ What's Been Done

1. ✅ Capacitor installed and configured
2. ✅ iOS project created (`frontend/ios/`)
3. ✅ Android project created (`frontend/android/`)
4. ✅ Build scripts added to `package.json`
5. ✅ Configuration files set up

## 📱 Next Steps

### Prerequisites

Before you can build and run the apps, you need:

#### For iOS:
- [ ] **Xcode** installed from Mac App Store (free)
- [ ] **CocoaPods** installed: `sudo gem install cocoapods`
- [ ] **Apple Developer Account** ($99/year) - for app store submission

#### For Android:
- [ ] **Android Studio** installed (free)
- [ ] **Java Development Kit (JDK)** - usually comes with Android Studio
- [ ] **Google Play Developer Account** ($25 one-time) - for app store submission

### Development Workflow

#### 1. Build Your Web App
```bash
cd frontend
npm run build
```

#### 2. Sync to Native Projects
```bash
npm run cap:sync
```
This copies your built web app to iOS and Android projects.

#### 3. Open in Native IDEs

**iOS:**
```bash
npm run cap:open:ios
```
This opens Xcode. Then:
- Select a simulator or connected device
- Click the "Play" button to run

**Android:**
```bash
npm run cap:open:android
```
This opens Android Studio. Then:
- Wait for Gradle sync to complete
- Select an emulator or connected device
- Click the "Run" button

### Testing

1. **Test in Browser First** (easiest)
   ```bash
   npm run dev
   ```
   - Most bugs will show up here
   - Fix in Cursor, test instantly

2. **Test on iOS Simulator**
   - Open in Xcode
   - Select iPhone simulator
   - Run the app

3. **Test on Android Emulator**
   - Open in Android Studio
   - Create/start an emulator
   - Run the app

4. **Test on Real Devices** (recommended)
   - Connect iPhone via USB
   - Connect Android phone via USB
   - Enable developer mode on devices
   - Run from Xcode/Android Studio

## 🔧 Common Commands

```bash
# Build web app
npm run build

# Sync to native projects
npm run cap:sync

# Open iOS in Xcode
npm run cap:open:ios

# Open Android in Android Studio
npm run cap:open:android

# Copy web assets only (faster than sync)
npm run cap:copy
```

## 📝 Important Notes

### API Configuration
- The app uses your backend API URL from environment variables
- For production, update `VITE_API_URL` in your build
- For development, you can use `http://localhost:5000` or your Render backend URL

### File Structure
```
frontend/
  ├── ios/          # iOS native project (Xcode)
  ├── android/      # Android native project (Android Studio)
  ├── src/          # Your React code (edit here)
  ├── dist/         # Built web app (auto-generated)
  └── capacitor.config.json  # Capacitor configuration
```

### Workflow
1. **Edit code in Cursor** → `frontend/src/`
2. **Build** → `npm run build`
3. **Sync** → `npm run cap:sync`
4. **Test** → Open in Xcode/Android Studio

## 🐛 Troubleshooting

### iOS Issues

**"xcode-select: error: tool 'xcodebuild' requires Xcode"**
- Solution: Install Xcode from Mac App Store
- After installing, run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**"CocoaPods is not installed"**
- Solution: `sudo gem install cocoapods`
- Then in `frontend/ios/App/`: `pod install`

### Android Issues

**"Android Studio not found"**
- Solution: Install Android Studio
- Make sure Android SDK is installed

**"Gradle sync failed"**
- Solution: Open Android Studio, let it download dependencies
- Check internet connection

## 🚀 App Store Submission

### iOS (App Store)
1. Open project in Xcode
2. Configure signing (Team, Bundle ID)
3. Archive: Product → Archive
4. Upload to App Store Connect
5. Submit for review

### Android (Google Play)
1. Open project in Android Studio
2. Build → Generate Signed Bundle/APK
3. Upload to Google Play Console
4. Submit for review

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Setup Guide](https://capacitorjs.com/docs/ios)
- [Android Setup Guide](https://capacitorjs.com/docs/android)

## ✅ Current Status

- ✅ Capacitor installed
- ✅ iOS project created
- ✅ Android project created
- ⏳ Xcode setup needed (install Xcode)
- ⏳ Android Studio setup needed (install Android Studio)
- ⏳ Native plugins to add (Camera, Push Notifications, etc.)

