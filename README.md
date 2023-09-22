<div align="center">
<img src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/ddeeef20-2dfa-449e-bd3d-62238d7c9be0" width="160" >
<img src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/e6b2d2a2-5158-429e-b1af-ea679b14fc11" width="150">
<h1>Amity Ui-Kit for React native open-source (Native modules)</h1>
  ** This is the beta version. The repo will be updated frequently. Please keep in touch **
</div>
<div align="center">
 <img width="250" alt="Screenshot_2566-07-24_at_19 16 20-removebg-preview" src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/ce60425f-b478-408b-88c3-341d00263760">
 <img width="286" alt="Screenshot_2566-07-24_at_19 16 20-removebg-preview" src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-OpenSource/assets/112688936/843d3dc7-094f-4e29-812b-9fc864a96c14">
</div>

## Getting started
Our AmityUIKit include user interfaces to enable fast integration of standard Amity Social features into new or existing applications. Furthermore, our React Native UIKit supports integration with **React Native CLI**, providing you with a flexible experience to seamlessly integrate social features into your existing React Native application.
### Try Sample app
This repository also includes a built-in sample app which you can use to test your code while customizing it, or even explore our UIKit features with just a few installations!
#### Run sample app with Native module
Use yarn

1. Install packages
```
cd example
```
```
yarn
```
2. Configure your apiKey,apiRegion,apiEndpoint,userId,displayName in /example/src/App.tsx file(https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource/blob/main/example/src/App.tsx) first before run the sample app
<img width="1503" alt="Screenshot 2566-09-18 at 00 32 49" src="https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource/assets/112688936/2939ed92-3bfd-4a90-b2a7-f5aafccef084">

3. Go back to your root folder (`cd ..`) and Choose to run between iOS or Android
   
4. Install modules and sync file
```sh
yarn
```
5. Run sample app
```sh
yarn example ios
```

or
```
yarn example android
```

### Installation
Here are the steps to install ui-kit together with another React Native project.
```sh
1. git clone https://github.com/AmityCo/Amity-Social-UIKit-React-Native-CLI-OpenSource.git
2. cd Amity-Social-Cloud-UIKit-React-Native-OpenSource
3. yarn or npm install
4. yarn pack or npm pack
```

This step will build the app and return amityco-asc-react-native-ui-kit-x.x.x.tgz file in inside the folder

Then, inside another project, Copy tgz file to your application folder where you need to use ui-kit:

```sh
1. yarn add ./amity-react-native-social-ui-kit-x.x.x.tgz
2. yarn add react-native-safe-area-context \react-native-image-picker \@react-native-async-storage/async-storage \react-native-svg@13.4.0 \react-native-screens \react-native-video \react-native-create-thumbnail@1.6.0 \@react-native-community/netinfo
```
### iOS Configuration
```sh
npx pod-install

```
### Android Configuration

Build project gradle with your Android Studio

### Add Camera permission (only iOS)
Add following permissions to `info.plist` file (ios/{YourAppName}/Info.plist)

```sh
 <key>NSCameraUsageDescription</key>
 <string>App needs access to the camera to take photos.</string>
 <key>NSMicrophoneUsageDescription</key>
 <string>App needs access to the microphone to record audio.</string>
 <key>NSCameraUsageDescription</key>
 <string>App needs access to the camera to take photos.</string>
 <key>NSPhotoLibraryUsageDescription</key>
 <string>App needs access to the gallery to select photos.</string>
```

### Usage

```js
import * as React from 'react';

import {
  AmityUiKitSocial,
  AmityUiKitProvider,
} from 'amity-react-native-social-ui-kit';

export default function App() {
  return (
    <AmityUiKitProvider
      apiKey="API_KEY"
      apiRegion="API_REGION"
      userId="userId"
      displayName="displayName"
      apiEndpoint="https://api.{API_REGION}.amity.co"
    >
      <AmityUiKitSocial />
    </AmityUiKitProvider>
  );
}
```

```
### Documentation


Please refer to our online documentation at https://docs.amity.co or contact a Ui-Kit representative at **clientsolutiomns@amity.co** for support.



```
