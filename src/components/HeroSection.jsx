import React from 'react';
import ExpandableCardsContainer from './ExpandableCardsContainer';
import './HeroSection.css';

const HeroSection = ({ heroData, navigationCards }) => {
    return (
        <section className="hero">
            <div className="hero-introduction">
                <img    
                    src={heroData.headshot}
                    alt={heroData.name}
                    className="hero-headshot"
                />
                <h1 className='hero-name'>{heroData.name}</h1>
                <p className="hero-description">{heroData.description}</p>
            </div>

            <ExpandableCardsContainer cards={navigationCards} />
        </section>
    );
};

export default HeroSection;