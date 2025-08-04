import { useState } from "react";
import About from "../pages/About"

const Tabs = () => {
    const [activeTab, setActiveTab] = useState('about');

    return (
        <div className="tabs-container">
            <div className="tab-buttons">
                <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'active' : ''}>About Me</button>
            </div>
            <div className="tab-content">
                {activeTab === 'about' && <About/>}
            </div>
        </div>
        
    )
}

export default Tabs;