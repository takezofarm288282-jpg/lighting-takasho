import { Route, Switch } from "wouter";
import { RunableBadge } from "./components/ui/runable-badge";
import SelectorPage from "./pages/selector";
import CasesPage from "./pages/cases";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={SelectorPage} />
        <Route path="/cases" component={CasesPage} />
      </Switch>
      <RunableBadge />
    </>
  );
}

export default App;
