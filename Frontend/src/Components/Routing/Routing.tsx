import { Route, Routes } from "react-router-dom";
import "./Routing.css";
import { Lobby } from "../Lobby/Lobby";
import { CodeBlock } from "../CodeBlock/CodeBlock";


function Routing(): JSX.Element {

    return (
        <div className="Routing">

            <Routes>
                {/* Default Route: */}
                {<Route path="/" element={<Lobby />} />}

                {<Route path="/lobby" element={<Lobby />} />}

                {<Route path="/code-block/:_id" element={<CodeBlock />} />}

            </Routes>

        </div>
    );
}

export default Routing;
