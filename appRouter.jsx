// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LogInForm from '../src/components/loginForm';


function AppRouter() {
    return (
        <Router>
            <Switch>
                <Route path="/login" component={LogInForm} />
            </Switch>
        </Router>
    );
}

export default AppRouter;