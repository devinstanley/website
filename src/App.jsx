import {Routes, Route} from 'react-router-dom';
import MainLayout from './layouts/MainLayout'
import './App.css';
import About from './pages/About';
import Projects from './pages/Projects';
import Home from './pages/Home';
import Apps from './pages/Apps';
import { Analytics } from '@vercel/analytics/react';
import ParticleSim from "./web-apps/ParticleSim/ParticleSim";

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={ <MainLayout/> }>
          <Route index element={<Home/>}/>
          <Route path='projects' element={<Projects/>}/>
          <Route path='about' element={<About/>}/>
          <Route path='apps' element={<Apps/>}/>
          <Route path='apps/particle-sim' element={<ParticleSim showControls="true"/>}/>
        </Route>
      </Routes>
      <Analytics/>
    </>
  )
}

export default App;
