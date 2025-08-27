import { NavLink } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import './Navbar.css'

const NavBar = () => {
    return (
        <nav className='navbar'>
            <div className='nav-links'>
                <NavLink className='nav-link' to="/">Home</NavLink>
                <NavLink className='nav-link' to="/projects">Projects</NavLink>
                <NavLink className='nav-link' to="/about">About</NavLink>
                <NavLink className='nav-link' to="/apps">Apps</NavLink>
            </div>
            <div className="social-icons">
                <a href="https://github.com/devinstanley" target="_blank" rel="noopener noreferrer" aria-label='GitHub'>
                    <FaGithub />
                </a>
                <a href="https://www.linkedin.com/in/devin-stanley1/" target="_blank" rel="noopener noreferrer" aria-label='LinkedIn'>
                    <FaLinkedin />
                </a>
            </div>
        </nav>
    );
};

export default NavBar;