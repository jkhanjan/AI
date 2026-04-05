import React from "react";
import { RouterProvider } from "react-router-dom";
import { Router } from "./app/Router";

const App = () => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <RouterProvider router={Router} />
    </div>
  );
};

export default App;