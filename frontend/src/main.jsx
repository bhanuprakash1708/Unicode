import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { UserProfileProvider } from './context/UserProfileContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <UserProfileProvider>
          <RouterProvider router={router} />
        </UserProfileProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </StrictMode>
);
