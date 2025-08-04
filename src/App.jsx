import {Routes, Route} from 'react-router-dom';
import MainLayout from './layouts/MainLayout'
import './App.css';
import About from './pages/About';
import Projects from './pages/Projects';
import Home from './pages/Home';

function App() {

  return (
      <Routes>
        <Route path='/' element={ <MainLayout/> }>
          <Route index element={<Home/>}/>
          <Route path='projects' element={<Projects/>}/>
          <Route path='about' element={<About/>}/>
        </Route>
      </Routes>
  )
}

export default App
