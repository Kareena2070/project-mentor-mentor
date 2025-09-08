
function Home() {
    const explinList = [
        {
            title: "Daily Reflection",
            description: "Log what you learned each day to improve retention and track your growth journey"
        },
        {
            title: "Mutual Feedback",
            description: "Give and receive feedback to build confidence and accountability in your learning."
        }, 
        {
            title: "Visual Growth",
            description: "See your progress with charts, levels, and streaks that make learning motivating."
        }
    ];

    return (
        <>
            <div className="header">
                <h1>Welcome to NavGurukul</h1>
                <p>Mentor-Mentee Progress Tracker</p>
                <p>Track your learning journey, measure growth, and celebrate progress together. Built for pair programming excellence at NavGurukul.</p>
                <button> 📝Add Today's Learning</button>
                <button> 📊View Progress</button>
            </div>
            
            <div className="cards-container">
                {explinList.map((explain, id) => (
                    <div key={id} className="card">
                        <h2>{explain.title}</h2>
                        <p>{explain.description}</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Home;
