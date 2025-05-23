import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/guards/AuthGuard';
import adminRoutes from './adminRoutes';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import NotFound from '../pages/NotFound';

const renderRoute = (route) => {
  const Component = route.element;
  const { FeatureGuard } = useFeatureAccess();

  let element = (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );

  // Apply feature guard if route requires specific feature
  if (route.meta?.requiresSubscription && route.meta?.feature) {
    element = (
      <FeatureGuard feature={route.meta.feature}>
        {element}
      </FeatureGuard>
    );
  }

  // Apply auth guard to all admin routes
  if (route.path.startsWith('/admin')) {
    element = (
      <AuthGuard>
        {element}
      </AuthGuard>
    );
  }

  return (
    <Route
      key={route.path}
      path={route.path}
      element={element}
    />
  );
};

const AppRoutes = () => {
  const routes = [
    adminRoutes,
    // Add other route groups here
  ];

  return (
    <Routes>
      {routes.map(routeGroup => {
        const Layout = routeGroup.element;
        
        return (
          <Route
            key={routeGroup.path}
            path={routeGroup.path}
            element={<Layout />}
          >
            {routeGroup.children.map(renderRoute)}
          </Route>
        );
      })}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;