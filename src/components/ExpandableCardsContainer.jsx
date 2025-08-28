import React, { useState, useEffect, useRef, useCallback } from 'react';
import ExpandableCard from './ExpandableCard';
import { nav } from 'framer-motion/client';
import './ExpandableCardsContainer.css';

const ExpandableCardsContainer = ({ cards, className = ""}) => {
    const [isNaveHovered, setIsNavHovered] = useState(false);
    const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
    const [inViewCardIndex, setInViewCardIndex] = useState(0);
    const navRef = useRef(null);
    const cardRefs = useRef([]);

    // Desktop Hover Handlers
    const handleNavEnter = () => setIsNavHovered(true);
    const handleNavLeave = () => {
        setIsNavHovered(false);
        setHoveredCardIndex(null);
    };

    const handleCardHover = (index) => setHoveredCardIndex(index);
    const handleCardLeave = () => setHoveredCardIndex(null);

    // Mobile Scroll Handler
    const handleScroll = useCallback(() => {
        if (window.innerWidth >= 768) return; // Only Done on Mobile

        const navContainer = navRef.current;
        if (!navContainer) return;

        const containerRect = navContainer.getBoundingClientRect();
        const containerCenter = containerRect.top + containerRect.hoveredCardIndex / 2;

        let closestCard = 0;
        let closestDistance = Infinity;

        cardRefs.current.forEach((card, index) => {
            if (!card) return;

            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.top + cardRect.height / 2;
            const distance = Math.abs(cardCenter - containerCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = index;
            }
        });

        setInViewCardIndex(closestCard);
    }, []);

    // Mobile Scroll Listener
    useEffect(() => {
        const navContainer = navRef.current;
        if (navContainer) {
            navContainer.addEventListener('scroll', handleScroll);
            handleScroll();
        }

        return () => {
            if (navContainer){
                navContainer.removeEventListener('scroll', handleScroll)
            }
        };
    }, [handleScroll]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768){
                setInViewCardIndex(0);
            } else {
                handleScroll();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleScroll]);

    return(
        <nav
            className={`hero-nav ${isNaveHovered ? 'nav-hover' : ''} ${className}`}
            onMouseEnter={handleNavEnter}
            onMouseLeave={handleNavLeave}
            ref={navRef}
        >
            {cards.map((card, index) => (
                <ExpandableCard
                    key={card.id || index}
                    card={card}
                    index={index}
                    isExpanded={hoveredCardIndex === index}
                    isInView={inViewCardIndex === index}
                    onHover={handleCardHover}
                    onLeave={handleCardLeave}
                    cardRef={el => cardRefs.current[index] = el}
                />
            ))}
        </nav>
    );
};

export default ExpandableCardsContainer;