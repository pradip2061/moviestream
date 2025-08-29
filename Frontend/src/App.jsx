import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";   // ✅ Import Provider
import store from "../store/store";
import NavBar from "./components/NavBar";
import SingleVideoWatch from "./pages/SingleVideoWatch";
import ScrollToTop from "./components/ScrollToTop";

const Movies = lazy(() => import("./pages/Movies"));
const TvShows = lazy(() => import("./pages/TvShows"));
const Genere = lazy(() => import("./pages/Genere"));
const Home = lazy(() => import("./pages/Home"));

const NotFound = () => <h1>404 - Page Not Found</h1>;

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <ScrollToTop />
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tvshows" element={<TvShows />} />
            <Route path="/genere" element={<Genere />} />
              <Route path="/getsinglevideo/:id" element={<SingleVideoWatch />} />
            {/* NotFound route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
