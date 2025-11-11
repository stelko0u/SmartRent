import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const useAuth = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (!session) {
            router.push('/auth/signin');
        } else {
            setLoading(false);
        }
    }, [session, status, router]);

    return { session, loading };
};

export default useAuth;