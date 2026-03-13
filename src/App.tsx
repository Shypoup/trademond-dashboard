import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Platform from './pages/Platform';
import Companies from './pages/Companies';
import Services from './pages/Services';
import Tags from './pages/Tags';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Plans from './pages/Plans';
import Features from './pages/Features';
import Subscriptions from './pages/Subscriptions';
import Reviews from './pages/Reviews';
import CuratedLists from './pages/CuratedLists';
import Sponsorships from './pages/Sponsorships';
import Experiments from './pages/Experiments';
import TagProposals from './pages/TagProposals';
import Entitlements from './pages/Entitlements';
import FeatureOverrides from './pages/FeatureOverrides';
import Follows from './pages/Follows';
import Likes from './pages/Likes';
import MediaManagement from './pages/Media';
import SearchManagement from './pages/SearchManagement';
import AdminSettings from './pages/AdminSettings';
import Imports from './pages/Imports';
import { Toaster } from '@/components/ui/sonner-toaster';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('trademond_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="services" element={<Services />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
            <Route path="platform" element={<Platform />} />
            <Route path="tags" element={<Tags />} />
            <Route path="listings" element={<Products />} /> {/* Redirecting for demo */}

            {/* New administrative routes */}
            <Route path="plans" element={<Plans />} />
            <Route path="features" element={<Features />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="curated-lists" element={<CuratedLists />} />
            <Route path="sponsorships" element={<Sponsorships />} />
            <Route path="experiments" element={<Experiments />} />

            {/* Newly requested complete routes */}
            <Route path="tag-proposals" element={<TagProposals />} />
            <Route path="entitlements" element={<Entitlements />} />
            <Route path="feature-overrides" element={<FeatureOverrides />} />
            <Route path="follows" element={<Follows />} />
            <Route path="likes" element={<Likes />} />
            <Route path="media" element={<MediaManagement />} />
            <Route path="search" element={<SearchManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="imports" element={<Imports />} />

            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
        <Toaster />
      </>
    </Router>
  );
}

export default App;
