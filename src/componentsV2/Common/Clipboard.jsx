import React from "react";
import Button from "@mui/material/Button";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { ShowSuccess, ShowWarning } from "./Toast";

const CLEANUP_TIMEOUT = 100;

export const Copy = ({
    component,
    text = "",
    icon = false,
    className = "clipboard-content",
    fontSize = "inherit",
    color = "inherit",
}) => {
    const [isRendered, setRendered] = React.useState(false);
    const refContent = React.useRef(null);

    React.useEffect(() => {
        const element = refContent.current;
        if (element !== null) {
            let selection = window.getSelection();
            let range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            navigator.clipboard
                .writeText(text)
                .then(() => {
                    ShowSuccess("Content Copied Successfully");
                })
                .catch(() => {
                    ShowWarning("Error copying text to clipboard");
                });

            // Remove content from Dom.
            setTimeout(() => {
                setRendered(false);
            }, CLEANUP_TIMEOUT);
        }
    }, [isRendered]);

    const Content = () => {
        if (component) {
            return component;
        }

        if (text) {
            //adding default value to prevent warning
            return <textarea defaultValue={text} />;
        }

        return null;
    };

    return (
        <>
            {icon ? (
                <IconButton
                    size="small"
                    onClick={() => {
                        setRendered(true);
                    }}
                    aria-label="Copy content"
                    color={color}
                >
                    <Tooltip title="Copy" aria-label="Copy to Clipboard">
                        <FileCopyIcon fontSize={fontSize} />
                    </Tooltip>
                </IconButton>
            ) : (
                <Button
                    type="primary"
                    onClick={() => {
                        setRendered(true);
                    }}
                >
                    Copy
                </Button>
            )}
            {isRendered && (
                <div
                    className={className}
                    contentEditable={true}
                    suppressContentEditableWarning="true"
                    ref={refContent}
                    style={{
                        position: "fixed",
                        width: "500px",
                        left: "-999px",
                    }}
                >
                    <Content />
                </div>
            )}
        </>
    );
};
