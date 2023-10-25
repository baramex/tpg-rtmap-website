import { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Route, RouterProvider, Routes, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { AlertContainer } from './components/Misc/Alerts';
import Home from './components/Home';
import "./styles/main.css";
import "./styles/tailwind.css";
import Error404 from './components/404';

const router = createBrowserRouter(createRoutesFromElements(
    <Route path="*" element={<App />} />
));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router} />
);

function App() {
    const [data, setData] = useState({});
    const [alerts, setAlerts] = useState([]);

    function addAlert(alert) {
        setAlerts(a => [...a, { id: Date.now() + Math.round(Math.random() * 1000), ...alert }]);
    }

    const props = { data, setData, addAlert };

    return (
        <>
            <AlertContainer alerts={alerts} setAlerts={setAlerts} />
            <Routes>
                <Route exact path="/" element={<Home {...props} />} />

                <Route path='*' element={<Error404 />} />
            </Routes>
        </>
    );
}