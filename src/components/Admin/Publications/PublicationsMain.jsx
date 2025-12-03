import React, { useState } from "react";
import { AddPublications } from "./AddPublications";
import {
    ARTICLE_ADDED_SUCCESS_MESSAGE,
    baseMRTOptions,
    SNACK_SEVERITY,
} from "../../../constants/index";
import { SnackMessage } from "../../Common/SnackMessage";

import { formatDateFieldAndAddSlNo } from "../../../utils";
import publication from "../../../state/store/admin/publications";
import { observer } from "mobx-react";
import { MaterialReactTable } from "material-react-table";
import { MRTDataTableTitle } from "../../Common/MRTDataTableTitle.jsx";
import { ShowSuccess } from "../../../componentsV2/Common/Toast";

export const Publications = observer(() => {
    const [displayMessage, setDisplayMessage] = useState(false);

    // Converted MRT columns
    const AdminPublicationsTableColumns = [
        {
            accessorKey: "slNo",
            header: "Sl No",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "pmID",
            header: "PM ID",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "pmcID",
            header: "PMC ID",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "title",
            header: "Title",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
        {
            accessorKey: "journalName",
            header: "Journal Name",
            enableColumnActions: false,
            enableColumnFilter: true,
            enableSorting: false,
            filterVariant: "autocomplete",
            maxSize: 30,
        },
        {
            accessorKey: "publicationDate",
            header: "Publication Date",
            enableColumnActions: false,
            enableColumnFilter: false,
            enableSorting: false,
            maxSize: 30,
        },
    ];

    React.useEffect(() => {
        publication.load();
    }, []);

    const addNewPublications = async data => {
        await publication.add(data);
        ShowSuccess("Article Saved Successfully");
    };

    const IsArticleAlreadyPresent = (articleId, type) => {
        for (let index = 0; index < publication.list.length; index++) {
            const element = publication.list[index];
            if (element[type] === articleId.toString()) {
                return true;
            }
        }
        return false;
    };

    if (publication.loading) {
        return "Loading...";
    }

    return (
        <div>
            {displayMessage && (
                <SnackMessage
                    open={displayMessage}
                    handleClose={setDisplayMessage}
                    severity={SNACK_SEVERITY.SUCCESS}
                    message={ARTICLE_ADDED_SUCCESS_MESSAGE}
                />
            )}
            <AddPublications
                addNewPublications={addNewPublications}
                IsArticleAlreadyPresent={IsArticleAlreadyPresent}
            />
            <MaterialReactTable
                columns={AdminPublicationsTableColumns}
                data={formatDateFieldAndAddSlNo(publication.list, "publicationDate")}
                enableColumnFilters={publication?.list?.length > 0}
                enableSorting={publication?.list?.length > 0}
                enableColumnActions={publication?.list?.length > 0}
                showGlobalFilter={publication?.list?.length > 0}
                {...baseMRTOptions}
                renderTopToolbarCustomActions={() => {
                    return <MRTDataTableTitle title="Publications" />;
                }}
            />
        </div>
    );
});
