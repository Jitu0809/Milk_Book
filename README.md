# MilkBook – monthly milk bill calculator (offline, personal use)

No backend, no database. Everything is saved on the phone using AsyncStorage
(React Native's equivalent of localStorage).

## 1. Set up (one time)
```bash
npx create-expo-app@latest MilkBook --template blank
cd MilkBook
npx expo install @react-native-async-storage/async-storage @react-native-community/datetimepicker expo-print expo-sharing react-native-safe-area-context
```
Then copy `App.js` and the `src/` folder from this package over the new project.

## 2. Run
```bash
npx expo start
```
Scan the QR with the Expo Go app on your phone.

## 3. Install on mom's phone without any store (Android)
```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview   # set "buildType": "apk" for preview in eas.json
```
Download the .apk from the link, send it to her phone and install it.
(Or build locally: `npx expo prebuild && cd android && ./gradlew assembleRelease`.)

## How to use
1. **Users** tab – add each person (name + usual litres per day).
2. **New bill** – pick user, from/to dates, check the price (save as default once),
   add skipped days and any days with different quantity. The total updates live.
3. **Save bill** – opens the detailed bill. Tap **Save / Share PDF** or **Print**.
4. **Bills** tab – all bills grouped by user, with filter chips.
