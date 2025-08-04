import { Link } from 'react-router-dom';
import './Navbar.css'

const NavBar = () => {
    return (
        <nav className='navbar'>
            <Link className='home-icon' to="/">Home</Link>
            <Link className='nav-link' to="/projects">Projects</Link>
            <Link className='nav-link' to="/about">About</Link>
        </nav>
    );
};

export default NavBar;