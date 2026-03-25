import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';
import Dashboard from '@pages/Dashboard';
import Products from '@pages/Products';
import Users from '@pages/Users';
import Platform from '@pages/Platform';
import Companies from '@pages/Companies';
import Services from '@pages/Services';
import Tags from '@pages/Tags';
import Profile from '@pages/Profile';
import Login from '@pages/Login';
import Plans from '@pages/Plans';
import Features from '@pages/Features';
import Subscriptions from '@pages/Subscriptions';
import Reviews from '@pages/Reviews';
import CuratedLists from '@pages/CuratedLists';
import Sponsorships from '@pages/Sponsorships';
import Experiments from '@pages/Experiments';
import TagProposals from '@pages/TagProposals';
import Entitlements from '@pages/Entitlements';
import FeatureOverrides from '@pages/FeatureOverrides';
import Follows from '@pages/Follows';
import Likes from '@pages/Likes';
import MediaManagement from '@pages/Media';
import SearchManagement from '@pages/SearchManagement';
import AdminSettings from '@pages/AdminSettings';
import Imports from '@pages/Imports';
import Analytics from '@pages/Analytics';
import AnalyticsExport from '@pages/AnalyticsExport';
import Industries from '@pages/Industries';
import Categories from '@pages/Categories';
import Expertises from '@pages/Expertises';
import GooglePlaces from '@pages/GooglePlaces';
import Places from '@pages/Places';
import SponsoredAds from '@pages/SponsoredAds';
import GlobalNotifications from '@pages/GlobalNotifications';
import Roles from '@pages/Roles';
import SocialPlatforms from '@pages/SocialPlatforms';
import QuoteRequests from '@pages/QuoteRequests';
import QuoteResponses from '@pages/QuoteResponses';
import { Toaster } from '@/components/ui/sonner-toaster';

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><AuthLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="services" element={<Services />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
            <Route path="profile" element={<Profile />} />
            <Route path="platform" element={<Platform />} />
            <Route path="tags" element={<Tags />} />
            <Route path="plans" element={<Plans />} />
            <Route path="features" element={<Features />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="curated-lists" element={<CuratedLists />} />
            <Route path="sponsorships" element={<Sponsorships />} />
            <Route path="experiments" element={<Experiments />} />
            <Route path="tag-proposals" element={<TagProposals />} />
            <Route path="entitlements" element={<Entitlements />} />
            <Route path="feature-overrides" element={<FeatureOverrides />} />
            <Route path="follows" element={<Follows />} />
            <Route path="likes" element={<Likes />} />
            <Route path="media" element={<MediaManagement />} />
            <Route path="search" element={<SearchManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="imports" element={<Imports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics-export" element={<AnalyticsExport />} />
            <Route path="industries" element={<Industries />} />
            <Route path="categories" element={<Categories />} />
            <Route path="expertises" element={<Expertises />} />
            <Route path="google-places" element={<GooglePlaces />} />
            <Route path="places" element={<Places />} />
            <Route path="sponsored-ads" element={<SponsoredAds />} />
            <Route path="global-notifications" element={<GlobalNotifications />} />
            <Route path="roles" element={<Roles />} />
            <Route path="social-platforms" element={<SocialPlatforms />} />
            <Route path="quote-requests" element={<QuoteRequests />} />
            <Route path="quote-responses" element={<QuoteResponses />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
        <Toaster />
      </>
    </Router>
  );
}

export default App;
