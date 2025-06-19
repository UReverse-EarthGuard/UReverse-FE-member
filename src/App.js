import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import Home from './pages/Home';
import MainLayout from './layout/MainLayout';
import NoAlarmLayout from './layout/NoAlarmLayout';
import LoginForm from './pages/auth/LoginForm';
import SignupForm from './pages/auth/SignupForm';
import ProductInfoForm from './pages/Sell/ProductInfoForm';
import UserAddressForm from './pages/Sell/UserAddressForm';
import { useRecoilState } from 'recoil';
import ProductReceipt from './pages/Sell/ProductReceipt';
import { authState } from './atoms/authState';
import { useEffect } from 'react';
import { setAuthStore } from './api/axiosInstance';
import MyPageHome from './pages/mypage/MyPageHome';
import SellComplete from './pages/Sell/SellComplete';
import EditInfo from './pages/mypage/EditInfo';
import PointHistoryPage from './pages/mypage/PointHistoryPage';
import RecoveryPasswordPage from './pages/auth/RecoveryPasswordPage';
import SalesHistoryPage from './pages/mypage/SalesHistoryPage';
import SalesCompletePage from './pages/mypage/SalesCompletePage';
import NotificationPage from './pages/notification/NotificationPage';
import LandingPage from './pages/LandingPage';
import KakaoLinkCallback from './pages/mypage/KakaoLinkCallback';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import PrivateRoute from './component/routes/PrivateRoute';
import PublicRoute from './component/routes/PublicRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <></>,
    children: [
      {
        path: '/',
        element: (
            <LandingPage />
        ),
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        ),
      },
      {
        path: '/signup',
        element: (
          <PublicRoute>
            <SignupForm />
          </PublicRoute>
        ),
      },
      {
        path: '/recovery-password',
        element: (
          <PublicRoute>
            <RecoveryPasswordPage />
          </PublicRoute>
        ),
      },
      {
        element: (
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        ),
        children: [
          { index: true, path: "/home", element: <Home /> },
          { path: "/mypage", element: <MyPageHome /> },
          { path: "/mypage/edit", element: <EditInfo /> },
          { path: "/my-page/points", element: <PointHistoryPage /> },
          { path: "/my-page/sales/tracking", element: <SalesHistoryPage /> },
          { path: "/my-page/sales", element: <SalesCompletePage /> },
          { path: "/notifications", element: <NotificationPage /> },
        ]
      },
      {
        element: <NoAlarmLayout />,
        children: [
          { path: '/kakao/callback', element: <KakaoLinkCallback /> },
          { path: '/signup/email-verified', element: <VerifyEmailPage /> },
        ],
      },
      {
        path: '/sell',
        element: (
          <PrivateRoute>
            {/* <CommonLayout /> */}
            <MainLayout />
          </PrivateRoute>
        ),
        children: [
          { path: 'product', element: <ProductInfoForm /> },
          { path: 'address', element: <UserAddressForm /> },
          { path: 'receipt', element: <ProductReceipt /> },
          { path: 'complete', element: <SellComplete /> },
        ],
      },
    ],
  },
]);

function App() {
  const [auth, setAuth] = useRecoilState(authState);

  useEffect(() => {
    setAuthStore({
      getAccessToken: () => {
        const saved = JSON.parse(localStorage.getItem('recoil-persist'));
        return saved?.authState?.accessToken || null;
      },
      setAuth: ({ accessToken, role }) => {
        setAuth({ accessToken, role });
      },
      resetAuth: () => {
        setAuth({ accessToken: null, role: null });
      },
    });
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
