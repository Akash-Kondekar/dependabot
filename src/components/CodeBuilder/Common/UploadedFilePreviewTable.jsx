import React from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

const CSVPreviewTable = ({ csvData }) => {
    if (!csvData || csvData.length === 0) return null;

    const rows = csvData;
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);
    const firstThreeColumns = headers.slice(0, 3);
    const previewColumns = [...firstThreeColumns, ...(headers.length > 3 ? ["..."] : [])];

    return (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {previewColumns.map((header, index) => (
                                <TableCell key={index}>{header}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {previewColumns.map((colIndex, index) =>
                                    index > 2 ? (
                                        <TableCell key={index}>...</TableCell>
                                    ) : (
                                        <TableCell key={index}>{row[index]}</TableCell>
                                    )
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default CSVPreviewTable;
