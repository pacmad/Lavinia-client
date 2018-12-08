import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "react-router-redux";
import { createBrowserHistory } from "history";
import { configureStore, loadState, saveState } from "./store";
import { App } from ".";
import "./main.css";
import { debounce } from "lodash";

const persistedState = loadState();

const history = createBrowserHistory();
const store = configureStore(history, persistedState);

store.subscribe(
    debounce(() => {
        const currentState = store.getState();
        if (currentState.requestedDataState.enableAutoSave) {
            saveState(currentState);
        }
    }, 500)
);

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
);
