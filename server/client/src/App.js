import { Route, Routes } from "react-router-dom";
import DefaultLayout from "./Layouts/DefaultLayout";
import Index from "./pages/Index/Index";
import "./Global.css"
import Format from "./pages/Format/Format";
import Create from "./pages/Create/Create";
import Result from "./pages/Result/Result";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Index />}/>
        <Route exact path="create" element={<Create />}/>
        <Route exact path="format" element={<Format />}/>
        <Route exact path="result" element={<Result />}/>
        <Route path="*" element={<NotFound />}/>
      </Route>

      <Route path="/">
        <Route exact path="login"/>
        <Route exact path="register"/>
      </Route>
    </Routes>
    
    </>
  );  
}

export default App;
