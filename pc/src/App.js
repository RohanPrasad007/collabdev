import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
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
import EchoPage from "./page/EchoPage";
import ThreadPage from "./page/ThreadPage";
import TrackPage from "./page/TrackPage";

// Layout with sidebar
const WithSidebarLayout = () => {
  return (
    <div className="flex my-2 h-[98vh] gap-2">
      <div className="w-[500px] h-[98vh]">
        <SidebarContainer />
      </div>
      <div className="w-full">
        <Outlet /> {/* This renders the matched child route */}
      </div>
    </div>
  );
};

// Layout without sidebar
const WithoutSidebarLayout = () => {
  return (
    <div className="w-full h-[98vh]">
      <Outlet /> {/* This renders the matched child route */}
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

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      {/* Routes WITH sidebar */}
                      <Route element={<WithSidebarLayout />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/echo/:echoId" element={<EchoPage />} />
                        <Route path="/matrix/:slug" element={<MatrixPage />} />
                        <Route path="/thread/:id" element={<ThreadPage />} />
                        <Route path="/track/:id" element={<TrackPage />} />
                      </Route>

                      {/* Routes WITHOUT sidebar */}
                      <Route element={<WithoutSidebarLayout />}>
                        <Route path="/profile-info" element={<ProfileInfo />} />
                      </Route>
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

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default App;
