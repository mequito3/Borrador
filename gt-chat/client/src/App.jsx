import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import AgentDashboard from "./pages/AgentDashboard";
import ClientWidgetTest from "./views/ClientWidgetTest";
import PrivateRoute from "./routes/PrivateRoute";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AgentDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/test-widget" element={<ClientWidgetTest />} />
    </Routes>
  </Router>
);

export default App;
