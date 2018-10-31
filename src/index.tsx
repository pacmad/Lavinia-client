import * as React from "react";
import { Route, Switch } from "react-router";
import { ConnectedLayout } from "./Layout";
// tslint:disable-next-line:no-implicit-dependencies
import { hot } from "react-hot-loader";

export const App = hot(module)(() => (
    <Switch>
        <Route path="/" component={ConnectedLayout} />
    </Switch>
));
