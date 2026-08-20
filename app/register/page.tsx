import { redirect } from 'next/navigation';
import { triggerAuthSplash } from '@/components/site/SplashScreen'
export default function RegisterRedirect() {
  redirect('/signup');
}
