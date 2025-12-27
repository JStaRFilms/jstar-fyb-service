import { signUpAction } from '@/features/auth/actions';

export default async function RegisterPage() {
    await signUpAction();
    return null; // Redirects immediately
}
