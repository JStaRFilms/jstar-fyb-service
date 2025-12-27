import { signInAction } from '@/features/auth/actions';

export default async function LoginPage() {
    await signInAction();
    return null; // Redirects immediately
}
