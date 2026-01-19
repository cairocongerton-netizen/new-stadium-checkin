import CheckInForm from '@/components/CheckInForm';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export default function Home() {
  return <CheckInForm />;
}
