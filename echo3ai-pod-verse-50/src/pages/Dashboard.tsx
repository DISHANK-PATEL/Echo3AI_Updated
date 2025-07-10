import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PodcastGrid from '../components/dashboard/PodcastGrid';
import DashboardCursor from '../components/dashboard/DashboardCursor';
import DashboardBackground from '../components/dashboard/DashboardBackground';
// import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // Removed loading and isAuthenticated state
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Dashboard loaded. Authentication check skipped.');
    // fetch('/auth/status', { credentials: 'include' })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (!data.isAuthenticated) {
    //       navigate('/');
    //     } else {
    //       setIsAuthenticated(true);
    //     }
    //     setLoading(false);
    //   })
    //   .catch(() => {
    //     navigate('/');
    //     setLoading(false);
    //   });
  }, []);

  // Removed loading and isAuthenticated checks

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <DashboardBackground />
      <DashboardCursor />
      <div className="relative z-10">
        <DashboardHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <PodcastGrid searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Dashboard;
