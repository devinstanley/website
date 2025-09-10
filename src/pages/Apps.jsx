import "../web-apps/ParticleSim/ParticleSim";
import ExpandableCardsContainer from '../components/ExpandableCardsContainer';
import "../styles/Apps.css"

const navigationCards = [
        {
            id: 'particle-sim',
            title: "Simple Particle Sim",
            shortDescription: "A simple particle simulator with mouse interaction. ",
            subDescription: (
                <>
                    <div className="line">
                    </div>
                    <div className="line">
                    </div>
                </>
            ),
            link: "apps/particle-sim"
        }
    ]

const Apps = () =>{
    return (
        <div className="app-cards">
            <ExpandableCardsContainer cards={navigationCards}/>
        </div>
    )
}

export default Apps;
