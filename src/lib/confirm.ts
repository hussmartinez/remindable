import { Alert, Platform } from 'react-native';

/** Yes/no confirmation that also works on web, where Alert buttons are not supported. */
export function confirm(message: string, onYes: () => void, yes: string, no: string) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onYes();
    return;
  }
  Alert.alert('', message, [
    { text: no, style: 'cancel' },
    { text: yes, style: 'destructive', onPress: onYes },
  ]);
}
