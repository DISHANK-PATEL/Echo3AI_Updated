import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PodcastGrid from '../components/dashboard/PodcastGrid';
import DashboardCursor from '../components/dashboard/DashboardCursor';
import DashboardBackground from '../components/dashboard/DashboardBackground';
import { useNavigate } from 'react-router-dom';
import { useInternetIdentityAuth } from '../components/InternetIdentityLogin';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useInternetIdentityAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
