import React from 'react';
import Header from '../components/Header';
import '../styles/theme.css';
import '../styles/About.css';

const About = () => {
  return (
    <div className="app-container">
      <Header />
      
      <div className="container">
        <main className="home-content about-content">
          <div className="intro-section">
            <h1>About MovieMap</h1>
            <p className="subtitle">The story behind our interactive filming locations explorer</p>
          </div>
          
          <section className="about-section">
            <h2>Our Purpose</h2>
            <p>
              MovieMap is an interactive platform that lets film and TV enthusiasts explore 
              famous filming locations around the world. We connect fans with the real-world 
              places where their favorite scenes were shot, making it easier to plan visits or simply 
              learn more about the locations behind the magic of cinema.
            </p>
          </section>
          
          <section className="about-section">
            <h2>An AI-Powered Project</h2>
            <p>
              MovieMap represents a unique experiment in software development—the entire project, 
              from initial concept to final implementation, was created using Large Language Models (LLMs).
              Every line of code, database structure, and design element was generated through 
              AI-assisted development.
            </p>
            <p>
              This project follows the LLM code generation workflow described by 
              <a href="https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/" target="_blank" rel="noopener noreferrer"> Harper Reed</a>, 
              where the development process is broken down into:
            </p>
            <ul>
              <li>Idea honing through conversational AI</li>
              <li>Planning and breaking down specifications into manageable steps</li>
              <li>Executing development through incremental code generation</li>
              <li>Refining and testing the implementation</li>
            </ul>
            <p>
              MovieMap demonstrates how modern AI tools can transform the development process,
              enabling faster creation while maintaining code quality and functionality.
            </p>
          </section>
          
          <section className="about-section developer-profile">
            <h2>About the Developer</h2>
            <div className="profile-content">
              <div className="profile-image">
                <img 
                  src="/images/profile.jpg" 
                  alt="Nathan Marcus" 
                  className="profile-photo"
                />
              </div>
              <div className="profile-info">
                <h3>Nathan Marcus</h3>
                <p className="profile-title">Product Management Professional</p>
                <p>
                  I'm a product management professional with over nine years of experience, 
                  currently working at Salesforce Commerce Cloud. Based in Austin, Texas, 
                  I'm passionate about using technology to create meaningful products.
                </p>
                <p>
                  This project represents my exploration into AI-assisted development and 
                  how it can transform the way we build software products. MovieMap combines 
                  my interests in film, technology, and innovative development approaches.
                </p>
                <div className="social-links">
                  <a href="https://www.linkedin.com/in/marcustechnologies/" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2>Technology Stack</h2>
            <p>
              MovieMap is built using modern web technologies:
            </p>
            <ul>
              <li>Frontend: React with Vite, Mapbox GL JS</li>
              <li>Backend: Node.js, Express</li>
              <li>Database: Firebase Firestore</li>
              <li>Authentication: Firebase Auth for moderator access</li>
            </ul>
          </section>
          
          <section className="about-section">
            <h2>Open Source & Deployment</h2>
            <p>
              MovieMap is an open source project. You can find the source code in our 
              <a href="https://github.com/nathanmarcus/moviemaps" target="_blank" rel="noopener noreferrer"> GitHub repository</a>.
            </p>
            <p>
              The application is deployed using the following strategy:
            </p>
            <ul>
              <li>Frontend: Hosted on Netlify with continuous deployment from the GitHub repository</li>
              <li>Backend API: Implemented as Netlify Functions for serverless deployment</li>
              <li>Database: Firebase Firestore cloud database for persistent storage across environments</li>
            </ul>
            <p>
              This deployment approach provides a scalable, maintenance-free infrastructure that automatically 
              scales with user demand.
            </p>
          </section>
        </main>
        
        <footer className="footer">
          <p>© {new Date().getFullYear()} MovieMap | Discover film locations around the world</p>
        </footer>
      </div>
    </div>
  );
};

export default About;