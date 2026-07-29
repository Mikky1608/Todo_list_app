import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to connect to host computer's localhost
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5000/api' 
  : 'http://localhost:5000/api';
