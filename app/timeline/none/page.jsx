'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TimelinePage from '../[conversationId]/page';

export default function TimelineNonePage() {
  // This route exists just to handle the /timeline/none case
  // The main TimelinePage component handles showing the "no conversation selected" state
  return <TimelinePage />;
}
