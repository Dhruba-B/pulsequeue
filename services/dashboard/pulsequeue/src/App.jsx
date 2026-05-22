import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import MainLayout
from "./components/layout/MainLayout";

import DashboardPage
from "./pages/DashboardPage";

import JobsPage
from "./pages/JobsPage";

import WorkersPage
from "./pages/WorkersPage";

export default function App() {

  return (

      <BrowserRouter>

          <MainLayout>

              <Routes>

                  <Route
                      path="/"
                      element={<DashboardPage />}
                  />

                  <Route
                      path="/jobs"
                      element={<JobsPage />}
                  />

                  <Route
                      path="/workers"
                      element={<WorkersPage />}
                  />

              </Routes>

          </MainLayout>

      </BrowserRouter>
  );
}