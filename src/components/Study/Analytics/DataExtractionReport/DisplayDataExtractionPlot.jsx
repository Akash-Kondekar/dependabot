import React from "react";
import { observer } from "mobx-react";
import ReactFlow, {
    Background,
    Controls,
    Panel,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { Chrono } from "react-chrono";
import { BasicButton, Confirm } from "../../../Common";
import { formatHTMLTextForResults } from "../../../../utils";
import dataextractionreport from "../../../../state/store/study/analytics/data-extraction-report";

const PARENTS_NODES = {
    ROOT: "ROOT",
    POPULATION: "POPULATION",
    ROOT_EXCLUSION: "ROOT_EXCLUSION",
};

const nodeTypeToHighlight = ["ANALYSABLE", "FINAL_EXPOSED"];

const getTimelineData = dataExtractionReport => {
    const timelinePlotList = [];

    const flattenNestedChildren = members => {
        let children = [];
        return members
            .map(m => {
                if (m.children && m.children.length) {
                    children = [...children, ...m.children];
                }
                return m;
            })
            .concat(children.length ? flattenNestedChildren(children) : children);
    };

    const transformDataExtractionReportData = data => {
        const label = data.nodeType;
        const text = data.line;

        timelinePlotList.push({
            title: "",
            cardTitle: label,
            cardDetailedText: [text],
        });

        if (data.children && data.children.length > 0) {
            const startingNode = data.nodeType;

            data.children.forEach(item => {
                const target = timelinePlotList.findIndex(pl => pl?.cardTitle === startingNode);
                timelinePlotList[target]?.cardDetailedText?.push(
                    formatHTMLTextForResults(item?.line)
                );
                if (item.children && item.children.length > 0) {
                    item.children.forEach(content => {
                        if (content.children && content.children.length > 0) {
                            if (content.line !== "") {
                                timelinePlotList.push({
                                    title: "",
                                    cardTitle: content.nodeType,
                                    cardDetailedText: [formatHTMLTextForResults(content.line)],
                                });
                                const target = timelinePlotList.findIndex(
                                    item => item?.cardTitle === content.nodeType
                                );
                                const eligibleMembers = flattenNestedChildren(content.children);

                                const cardDetailedList = eligibleMembers.map(item => {
                                    if (nodeTypeToHighlight.includes(item.nodeType)) {
                                        return formatHTMLTextForResults(`<b> ${item.line} </b>`);
                                    }
                                    return formatHTMLTextForResults(item.line);
                                });

                                timelinePlotList[target].cardDetailedText.push(...cardDetailedList);
                            }
                        }
                    });
                }
            });
        }
    };
    transformDataExtractionReportData(dataExtractionReport);
    return timelinePlotList;
};

export const DataExtractionTimelinePlot = observer(() => {
    const [plotData, setPlotData] = React.useState([]);

    React.useEffect(() => {
        const transformedData = getTimelineData(dataextractionreport.data);
        setPlotData(transformedData);
    }, []);

    if (plotData.length === 0) {
        return;
    }

    return (
        <div style={{ height: "max-content" }}>
            <Chrono
                disableToolbar={true}
                disableInteraction={true}
                enableQuickJump={false}
                enableLayoutSwitch={false}
                items={plotData}
                mode="VERTICAL"
                parseDetailsAsHTML={true}
                lineWidth={10}
                timelinePointShape="square"
                // When read more is set to true, card height is fixed and since library does not support setting individual item height
                // cardDetailedText will have to be set as max-content or we can make useReadMore false.
                useReadMore={false}
                scrollable={false}
                fontSizes={{
                    cardTitle: "1.5rem", // Large titles for better readability
                    cardSubtitle: "1.125rem", // Larger subtitles
                    cardText: "1rem", // Standard readable text size
                    title: "1.25rem", // Prominent timeline titles
                }}
            />
        </div>
    );
});

const getTransformedData = data => {
    let counter = 1;

    const edges = [];
    const nodes = [];

    const customNodeStyles = {
        borderRadius: "14px",
        borderColor: "#B4B2B2",
        width: 300,
        fontSize: "14px",
        textAlign: "left",
    };

    function transformData(node, parentId = 1, depth = 0, xDepth = 0, yPosition = 0) {
        const nodeId = String(counter++);
        const MAX_LENGTH = 500;
        const label = node.line;

        let xPosition = node.nodeType === PARENTS_NODES.ROOT ? 500 : xDepth;

        if (label.length > MAX_LENGTH) {
            xPosition = xPosition - 300;
        }

        // Add the current node to the nodes array
        if (label !== "") {
            nodes.push({
                id: nodeId,
                data: { label },
                position: { x: xPosition, y: yPosition },
                style: customNodeStyles,
                nodeType: node.nodeType,
            });
        }

        // If this node is not the root, add an edge from the parent to this node
        if (parentId) {
            const edge = {
                id: `e${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                label: node.nodeType,
            };
            edges.push(edge);
        }

        if (node.children && node.children.length > 0) {
            node.children.forEach((child, index) => {
                const parent = node.nodeType;
                const target = nodes.find(item => item?.nodeType === parent);

                const parentNodePosition = target?.position?.x;
                //Position child nodes to the right of parent node
                let xDepth = parentNodePosition + 500;

                let yDepth = depth + 1;

                //If the text length is more, increment ydepth twice so that the boxes dont overlap.

                if (target?.data?.label?.length > MAX_LENGTH) {
                    yDepth = yDepth + 1;
                }

                let yPosition = yDepth * 260;

                //keep the first child aligned with parent and at a different height so they dont overlap.
                if (index === 0) {
                    xDepth = parentNodePosition;
                }

                // Special case: Adjust "Control" node to the left
                if (child.nodeType === "CONTROL") {
                    xDepth = parentNodePosition + 400 * 2; // Move it left
                }

                // Special case: Adjust "FINAL_EXPOSED" node to print straight down
                if (child.nodeType === "FINAL_EXPOSED") {
                    xDepth = parentNodePosition; // Move it left
                }

                // Special case: Adjust "Exposed Exclusion" node to the left
                if (child.nodeType.includes("_EXCLUSION")) {
                    xDepth = parentNodePosition + 400; // Move it left
                    yPosition = yDepth * 260 - 100;
                }

                transformData(child, nodeId, yDepth, xDepth, yPosition);
            });
        }
    }

    transformData(data);

    return {
        nodes: nodes,
        edges: edges,
    };
};

export const DisplayFlowChart = observer(() => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [flowInstance, setFlowInstance] = React.useState(null);
    const [initialTransformedData, setInitialTransformedData] = React.useState({});
    const { data } = dataextractionreport;

    const { setViewport } = useReactFlow();

    const defaultViewport = { x: 0, y: 0, zoom: 0.7 };

    const getFlowchartData = () => {
        const flowChartData = getTransformedData(data);

        if (flowChartData && Object.keys(flowChartData).length > 0) {
            setNodes(flowChartData.nodes);
            setEdges(flowChartData.edges);
            setViewport(defaultViewport);
        }
    };

    React.useEffect(() => {
        getFlowchartData();
    }, [data]);

    React.useEffect(() => {
        if (flowInstance) {
            const flow = flowInstance.toObject();
            setInitialTransformedData(JSON.stringify(flow));
        }
    }, [flowInstance]);

    if (nodes.length === 0 || edges.length === 0) {
        return;
    }

    const customStyles = {
        wordWrap: "break-word",
        borderRadius: "14px",
    };

    const onRestore = () => {
        const restoreFlow = async () => {
            const flow = initialTransformedData && JSON.parse(initialTransformedData);

            if (flow) {
                const { isConfirmed } = await Confirm(
                    "Restore view",
                    "Are you sure you want to reset to initial view?"
                );
                if (isConfirmed) {
                    setNodes(flow.nodes || []);
                    setEdges(flow.edges || []);
                    setViewport(defaultViewport);
                }
            }
        };

        restoreFlow();
    };

    return (
        <div style={{ height: "100vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                style={customStyles}
                onInit={setFlowInstance}
            >
                <Controls />
                <Background />

                <Panel position="top-right">
                    <BasicButton
                        color="primary"
                        variant="outlined"
                        handleClick={onRestore}
                        sx={{ mr: 1 }}
                        buttonText="Reset To Initial State"
                    />
                </Panel>
            </ReactFlow>
        </div>
    );
});
