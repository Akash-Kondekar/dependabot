import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import ProtocolManagement from "./ProtocolManagement";
import studyProtocolStore from "../../state/store/studyProtocol";
import { useSearchParams } from "react-router-dom";

const StudyProtocol = observer(() => {
    const [searchParams] = useSearchParams();
    const initialTabValue = searchParams.get("tab") === "1" ? 1 : 0;
    const [tabValue, setTabValue] = useState(initialTabValue);
    const protocols = studyProtocolStore.list;
    const pagination = studyProtocolStore.page;
    const [searchTerm, setSearchTerm] = useState("");
    const [lastSearchedTerm, setLastSearchedTerm] = useState("");
    const [unchangedSearchAttempt, setUnchangedSearchAttempt] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState({ open: false, protocol: null });

    const fetchProtocols = async (page, size) => {
        studyProtocolStore.load(page, size, searchTerm);
    };
    const handleDeleteProtocol = async id => {
        await studyProtocolStore.delete(id, false);
        fetchProtocols(pagination.page, pagination.size, searchTerm);
    };

    const handleUpdateProtocol = async payload => {
        await studyProtocolStore.update(payload, false);
    };

    useEffect(() => {
        if (tabValue === 0) {
            fetchProtocols();
        }
    }, [tabValue]);

    const handlePageChange = (event, newPage) => {
        fetchProtocols(newPage, pagination.size);
    };

    const handleSearch = (event, newPage) => {
        if (searchTerm !== lastSearchedTerm) {
            setUnchangedSearchAttempt(false);
            setLastSearchedTerm(searchTerm);
            fetchProtocols(newPage || 0, pagination.size);
        } else {
            // Indicates that user tried to search with the same term
            setUnchangedSearchAttempt(true);
            // auto-hide the feedback after a few seconds
            setTimeout(() => setUnchangedSearchAttempt(false), 3000);
        }
    };

    return (
        <>
            <ProtocolManagement
                protocols={protocols}
                pagination={pagination}
                tabValue={tabValue}
                setTabValue={setTabValue}
                handleSearch={handleSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                lastSearchedTerm={lastSearchedTerm}
                unchangedSearchAttempt={unchangedSearchAttempt}
                setUnchangedSearchAttempt={setUnchangedSearchAttempt}
                handlePageChange={handlePageChange}
                loading={studyProtocolStore.loading}
                handleDeleteProtocol={handleDeleteProtocol}
                handleUpdateProtocol={handleUpdateProtocol}
                detailsDialog={detailsDialog}
                setDetailsDialog={setDetailsDialog}
            ></ProtocolManagement>
        </>
    );
});
export default StudyProtocol;
