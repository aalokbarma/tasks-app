/**
 * @format
 */

import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';

import App from './src/app/App';
import {name as appName} from './app.json';
import {registerBackgroundMessageHandler} from './src/services/notifications/fcmHandlers';

// Android requires the background handler to be registered at the entry file.
registerBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
