// src/App.jsx
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import router from "@/router/appRouter";


function App() {



  return (

      <RouterProvider router={router} />

  );
}

export default App;
