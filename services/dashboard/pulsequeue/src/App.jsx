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

import WorkerControlPage
from "./pages/WorkerControlPage";

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

                  <Route
                      path="/worker-control"
                      element={<WorkerControlPage />}
                  />

              </Routes>

          </MainLayout>

      </BrowserRouter>
  );
}
