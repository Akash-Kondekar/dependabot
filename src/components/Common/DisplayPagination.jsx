import React from "react";
import Pagination from "@mui/material/Pagination";
import { Stack } from "@mui/material";

export const DisplayPagination = ({ page, pageCount, setCurrentPage, total }) => {
    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                justifyContent: "flex-start",
                mb: 1,
                ml: 4,
            }}
        >
            {total && total > 10 && (
                <Pagination
                    size="large"
                    count={pageCount}
                    page={page}
                    onChange={setCurrentPage}
                    hideNextButton={page === pageCount}
                    hidePrevButton={page === 1}
                />
            )}
        </Stack>
    );
};
