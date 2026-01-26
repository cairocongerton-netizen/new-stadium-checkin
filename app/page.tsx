import PinCheckIn from '@/components/PinCheckIn';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export default function Home() {
  return <PinCheckIn />;
}
