import React from 'react';
import './ExpandableCards.css';

const ExpandableCard = ({
    card, 
    index,
    isExpanded,
    isInView,
    onHover,
    onLeave,
    cardRef
}) => {
    return (
        <a
            ref={cardRef}
            href={card.link}
            className={`hero-card ${isExpanded ? 'card-expanded': ''} ${isInView ? 'card-in-view': ''}`}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={onLeave}
            onFocus={() => onHover(index)}
            onBlur={onLeave}
        >
            <h3>{card.title}</h3>
            <p className='short-description'>{card.shortDescription}</p>
            <div className='card-sub-description'>{card.subDescription}</div>
        </a>
    );
};

export default ExpandableCard;