import React from 'react';

const App = () => {
  const features = [
    { id: 1, text: 'No Brackets' },
    { id: 2, text: 'Zen Mode' },
    { id: 3, text: 'Fast Search' },
  ];

  return (
    <div className="react-app">
      <header className="app-header">
        <h1>React Untangled</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#docs">Docs</a></li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        <div className="card-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <h3>{feature.text}</h3>
              <p>Experience the future of code reading.</p>
              <button onClick={() => alert('Clicked!')}>
                <span>Explore</span>
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>Built with ❤️ and no brackets.</p>
      </footer>
    </div>
  );
};

export default App;
