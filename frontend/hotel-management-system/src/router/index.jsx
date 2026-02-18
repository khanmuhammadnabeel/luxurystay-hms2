
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded route components

// Public
const Home = lazy(() => import('../pages/public/Home'));
const Rooms = lazy(() => import('../pages/public/Rooms'));
const RoomDetail = lazy(() => import('../pages/public/RoomDetail'));
const Contact = lazy(() => import('../pages/public/Contact'));

// Auth
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Guest
const Dashboard = lazy(() => import('../pages/guest/Dashboard'));
const Bookings = lazy(() => import('../pages/guest/Bookings'));
const Profile = lazy(() => import('../pages/guest/Profile'));

// Staff
const Receptionist = lazy(() => import('../pages/staff/Receptionist'));
const Housekeeping = lazy(() => import('../pages/staff/Housekeeping'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const RoomManagement = lazy(() => import('../pages/admin/RoomManagement'));

// 404 Page
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Color-Theme Page
const ThemeShowcase = lazy(() => import('../pages/showcase/TestTheme'));

// ComponentShowcase
const ComponentShowcase = lazy(() => import('../pages/showcase/ComponentShowcase'));
const CompositeShowcase = lazy(() => import('../pages/showcase/CompositeShowcase'));

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Home /> },
  { path: '/rooms', element: <Rooms /> },
  { path: '/rooms/:id', element: <RoomDetail /> },
  { path: '/contact', element: <Contact /> },

  // Color-Theme route
  { path: '/color-theme', element: <ThemeShowcase /> },

  // ComponentShowcase route
  { path: '/components', element: <ComponentShowcase /> },
  { path: '/composite', element: <CompositeShowcase /> },

  // Auth routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  // Guest routes (will add protection later)
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/bookings', element: <Bookings /> },
  { path: '/profile', element: <Profile /> },

  // Staff routes
  { path: '/receptionist', element: <Receptionist /> },
  { path: '/housekeeping', element: <Housekeeping /> },

  // Admin routes
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/users', element: <UserManagement /> },
  { path: '/admin/rooms', element: <RoomManagement /> },

  // 404 route - must be last
  { path: '*', element: <NotFound /> }
]);

export default router;