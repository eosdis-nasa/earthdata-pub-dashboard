import React from "react";
import Header from "./header"; 
import Hero from "./hero"; 
import Home from "./home";
import GettingStarted from "./getting_started";
import DataPubGuidelines from "./data_publication_guidelines";
import "./overview.css"; 
import TopButton from '../TopButton/TopButton';
import Footer from '../Footer/footer';
import { useLocation } from "react-router-dom";

const App = ({ keyword }) => {
  const location = useLocation();
  const routes = {
    "/getting_started": <GettingStarted location={location} />,
    "/data_publication_guidelines": <DataPubGuidelines location={location} />
  };
  
  const renderComponent = () => routes[location.pathname] || (
    <>
      <Hero />
      <Home />
    </>
  );  

  return (
    <div className="help">
      <Header keyword={keyword} />
      <main className="home">{renderComponent()}</main>
      <section className='page__section--top' role="navigation" aria-label="Click to go to top of page">
        <TopButton />
      </section>
      <Footer api={{'authenticated': true}} apiVersion={{'versionNumber': '1.1.0'}} />
    </div>
  );
};

export default App;
