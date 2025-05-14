import { Redirect } from 'expo-router';

export default function Index() {
  // Chuyển hướng đến màn hình Splash mà không cần useEffect
  return <Redirect href="/(splash)/splash" />;
}