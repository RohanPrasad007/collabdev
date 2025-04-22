import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignIn from './components/SignIn';
import Home from './components/Home';
import { useAuth } from './context/AuthContext';
import ProfileInfo from './components/ProfileInfo';
import Dashboard from './components/Dashboard';
import SidebarContainer from './components/SidebarContainer';
import Dialog from './components/Dialog';
import { UserProfileProvider } from './context/UserProfileContext';
import { MatrixProvider } from './context/matrixContext';
import { DialogsProvider } from './context/DialogsContext';
import { ThreadProvider } from './context/ThreadContext';

const App = () => {
  return (
    <Router>
      <UserProfileProvider>
        <MatrixProvider>
          <ThreadProvider>
            <DialogsProvider>
              <AuthProvider>
                <div className='w-full h-[98vh] gap-2 relative'>
                  <Routes>
                    <Route path="/home" element={
                      <ProtectedRoute>
                        <div className='flex my-2 h-[98vh] gap-2'>
                          <div className='w-[500px] h-[98vh]'>
                            <SidebarContainer />
                          </div>
                          <div className='w-full'>
                            <Home />
                          </div>
                        </div>
                      </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <div className='flex my-2 h-[98vh] gap-2'>
                          <div className='w-[500px] h-[98vh]'>
                            <SidebarContainer />
                          </div>
                          <div className='w-full'>
                            <Dashboard />
                          </div>
                        </div>
                      </ProtectedRoute>
                    } />

                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/profile-info" element={<ProfileInfo />} />
                    <Route path="/" element={<Navigate to="/signin" replace />} />
                  </Routes>
                  <Dialog />
                </div>
              </AuthProvider>
            </DialogsProvider>
          </ThreadProvider>
        </MatrixProvider>
      </UserProfileProvider>
    </Router>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" replace />;
};

export default App;