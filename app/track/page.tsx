import type { Metadata } from 'next';
import TrackClient from './TrackClient';

export const metadata: Metadata = {
  title: 'Visitor Analytics & Logs | Mithran Birthday',
  description: 'Live visitor tracking dashboard and user access logs.',
};

export default function TrackPage() {
  return <TrackClient />;
}
