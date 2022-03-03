import logo from './logo.svg';
import './App.css';
import BpmnModelerApp from './pages/BpmnModeler/BpmnModeler';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import "highlight.js/styles/atom-one-dark-reasonable.css";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <BpmnModelerApp />
    </div>
  );
}

export default App;
