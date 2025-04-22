import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import { useAuth } from "./context/AuthContext";
import ProfileInfo from "./components/ProfileInfo";
import Dashboard from "./components/Dashboard";
import SidebarContainer from "./components/SidebarContainer";
import Dialog from "./components/Dialog";
import { UserProfileProvider } from "./context/UserProfileContext";
import { MatrixProvider } from "./context/matrixContext";
import { DialogsProvider } from "./context/DialogsContext";
import { ThreadProvider } from "./context/ThreadContext";
import MatrixPage from "./page/MatrixPage";

// Create a layout component for protected routes with sidebar
const ProtectedLayout = ({ children }) => {
  return (
    <div className="flex my-2 h-[98vh] gap-2">
      <div className="w-[500px] h-[98vh]">
        <SidebarContainer />
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <UserProfileProvider>
        <MatrixProvider>
          <ThreadProvider>
            <DialogsProvider>
              <AuthProvider>
                <div className="w-full h-[98vh] gap-2 relative">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route
                      path="/"
                      element={<Navigate to="/signin" replace />}
                    />
                    <Route path="/profile-info" element={<ProfileInfo />} />

                    {/* Protected routes with sidebar */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <ProtectedLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/home" element={<Home />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/matrix/:slug" element={<MatrixPage />} />
                    </Route>
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
