import React from "react";
import { marked } from "marked";
import versionHistoryFile from "../../mds/Analytics/_index.md?raw";

export const History = () => {
    // const [apiError, setAPIError] = React.useState(false);
    const [data, setData] = React.useState("Loading"); // All Employees Data.

    React.useEffect(() => {
        fetch(versionHistoryFile)
            .then(resp => resp.text())
            .then(response => {
                setData(response);
            });
    }, []);

    return (
        <div style={{ margin: "10px" }} dangerouslySetInnerHTML={{ __html: marked(data) }}></div>
    );
};
