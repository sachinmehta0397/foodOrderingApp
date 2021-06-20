import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';  
import Home from './screens/home/Home';
import Details from './screens/details/Details';
import Checkout from './screens/checkout/Checkout';
import Profile from './screens/profile/Profile';
import { BrowserRouter as Router, Route } from 'react-router-dom';


class FoodApp extends Component { 
    constructor(){
        super()
        this.baseUrl = "http://localhost:8080/api/" //setting the baseUrl of the api
    }

   render(){
        return(
            <Router>
                <div className = 'main-conatiner'>
                    <Route exact path = '/' render={(props) => <Home {...props} baseUrl = {this.baseUrl}/>}/> {/* Route to home Page */ }
                    <Route path='/restaurant/:id' render={(props) => <Details {...props} baseUrl={this.baseUrl} />} /> {/* Route to restaurant details Page */}
                    <Route path='/profile' render={(props) => <Profile {...props} baseUrl={this.baseUrl} />} /> {/* Route to Profile Page */}
                    <Route path='/checkout' render={(props) => <Checkout {...props} baseUrl={this.baseUrl} />} /> {/* Route to Checkout Page */}
                </div>
            </Router> 
        )
    }
}
 

ReactDOM.render(
    <FoodApp/>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
