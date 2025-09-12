// add css file
import '../pages/home.css';

// / Import all three images individually
import reflectionImg from '../assets/reflection.png';
import feedbackImg from '../assets/feedback.png';
import growthImg from '../assets/growth.png';
function Home() {
    const explinList = [
        {
            icone: reflectionImg,
            title: "Daily Reflection",
            description: "Log what you learned each day to improve retention and track your growth journey"
        },
        {
            icone: feedbackImg,
            title: "Mutual Feedback",
            description: "Give and receive feedback to build confidence and accountability in your learning."
        }, 
        {   
            icone: growthImg,
            title: "Visual Growth",
            description: "See your progress with charts, levels, and streaks that make learning motivating."
        }
    ];

    return (
        <>
        <div className="main-container">
            <div className="header">
                <h1>Welcome to NavGurukul</h1>
                <p>Mentor-Mentee Progress Tracker</p>
                <p>Track your learning journey, measure growth, and celebrate progress together. Built for pair programming excellence at NavGurukul.</p>
                <div className='head-button'>
                    <button className='head-buton-1'> Add Today's Learning</button>
                    <button className='head-buton-2'> View Progress</button>
                </div>
            </div>
            
            <div className="cards-container">
                {explinList.map((explain, id) => (
                    <div key={id} className="card">
                        <img src={explain.icone} alt={explain.title} />
                        <h2>{explain.title}</h2>
                        <p>{explain.description}</p>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
}

export default Home;
