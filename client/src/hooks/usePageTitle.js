import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'QnAi';

        if (path === '/') title = 'QnAi - Home';
        else if (path === '/login') title = 'QnAi - Login';
        else if (path === '/register') title = 'QnAi - Join';
        else if (path === '/dashboard') title = 'QnAi - Dashboard';
        else if (path === '/profile') title = 'QnAi - Profile';
        else if (path === '/history') title = 'QnAi - History';
        else if (path.startsWith('/jobs/')) title = 'QnAi - Job Details';
        else if (path.startsWith('/interview/')) title = 'QnAi - Interface Mode';
        else if (path.startsWith('/practice/')) title = 'QnAi - Practice Mode';
        else if (path.startsWith('/analysis/')) title = 'QnAi - Analysis';

        document.title = title;
    }, [location]);
};

export default usePageTitle;
