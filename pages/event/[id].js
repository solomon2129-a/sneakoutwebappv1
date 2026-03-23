import { useEffect } from 'react';
import { useRouter } from 'next/router';

// All events now live at /e/[id] (Firestore-backed).
// This route redirects any old /event/[id] links to the correct page.
export default function EventRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) router.replace('/e/' + id);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
