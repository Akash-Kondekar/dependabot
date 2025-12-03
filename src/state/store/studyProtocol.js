import { action, makeObservable } from "mobx";
import { v4 as uuid } from "uuid";
import BaseStore from "./base";
import { CONTACT_ADMIN_MESSAGE, CONTENT_TYPE_APPLICATION_PDF } from "../../constants";
import http from "../../lib/http";
import { ShowError, ShowSuccess } from "../../components/Common";
import StudyProtocol from "../model/studyProtocol";
import events from "../../lib/events.js";
import { filter } from "lodash";
import session from "./session";

const STAGGER_ID = uuid();

const INITIAL_STATE = {
    id: undefined,
    title: "",
    description: undefined,
    fileName: undefined,
    fileStoragePath: undefined,
    fileSize: undefined,
    contentType: CONTENT_TYPE_APPLICATION_PDF,
    userId: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    deleted: false,
};

const INITIAL_PAGEABLE = {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
};

export class StudyProtocolStore extends BaseStore {
    constructor() {
        super();

        makeObservable(this, {
            load: action,
            update: action,
            upload: action,
            delete: action,
            restore: action,
            download: action,
            downloadProtocolForJobId: action,
            fetchAuditLogs: action,
            setLoading: action,
            setStudyProtocols: action,
            appendStudyProtocol: action,
            set: action,
        });
        events.on("auth.logout", this.reset.bind(this));
    }

    observable() {
        return { loading: false, list: [], page: INITIAL_PAGEABLE, studyProtocol: INITIAL_STATE };
    }

    set(protocol) {
        this.studyProtocol = protocol;
    }

    setStudyProtocols(list, page) {
        this.list = list;
        this.page = page;
    }

    addNewStudyProtocol(protocol) {
        // Ensure list is an array before pushing
        if (!this.list || !Array.isArray(this.list)) {
            this.list = [];
        }
        if (protocol) {
            this.list.push(protocol);
        }
    }

    appendStudyProtocol(index, protocol) {
        this.list[index] = protocol;
    }

    setLoading(status) {
        this.loading = status;
    }

    reset() {
        this.loading = false;
        this.list = [];
        this.page = INITIAL_PAGEABLE;
        this.studyProtocol = INITIAL_STATE;
    }

    async load(page = 0, size = 10, searchTerm) {
        searchTerm = encodeURIComponent(searchTerm);
        try {
            const term = searchTerm ? `&term=${searchTerm}` : "";
            this.setLoading(true);
            const { data } = await http
                .get(`protocol?page=${page}&size=${size}${term}`)
                .stagger(STAGGER_ID);

            const pagedProtocols = data.data;
            if (pagedProtocols) {
                const protocols = pagedProtocols.content?.map(entry => {
                    return new StudyProtocol(entry);
                });
                const page = {
                    page: pagedProtocols.page.number,
                    size: pagedProtocols.page.size,
                    totalElements: pagedProtocols.page.totalElements,
                    totalPages: pagedProtocols.page.totalPages,
                };

                this.setStudyProtocols(protocols, page);
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async update(payload, isV2 = false) {
        if (!payload?.id) {
            return ShowError("Id is missing in the payload");
        }

        try {
            this.setLoading(true);
            const url = `protocol/${payload?.id}`;
            const { data } = await http.put(url, payload).stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === payload?.id);
                this.appendStudyProtocol(target, new StudyProtocol(data.data));
            }
            ShowSuccess("Details updated");
            return !isV2 ? true : data?.data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async delete(id, isV2 = false) {
        try {
            this.setLoading(true);
            const { data } = await http.delete(`protocol/${id}`).stagger(STAGGER_ID);
            if (data?.data) {
                if (!isV2) {
                    const target = this.list?.findIndex(s => s?.id === id);
                    this.appendStudyProtocol(target, new StudyProtocol(data.data));
                } else {
                    // locally Mark current protocol as deleted for Admin users
                    if (session.isAdmin) {
                        this.list = filter(this.list, s => {
                            if (s?.id === id) {
                                s.deleted = true;
                                s.deletedAt = new Date().toISOString();
                            }
                            return s;
                        });
                    } else {
                        this.list = filter(this.list, s => {
                            return s?.id !== id;
                        });
                    }
                }
                ShowSuccess("Protocol archived");
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async download(id) {
        try {
            this.setLoading(true);
            const { data } = await http
                .post(`protocol/${id}/download`, {}, { responseType: "blob" })
                .stagger(STAGGER_ID);
            if (data) {
                return data;
            }
            ShowError("Download failed, please try again later");
            return false;
        } catch (ex) {
            if (ex.response) {
                // Since the responseType is BLOB we need to create a FileReader to read the blob response
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorResponse = JSON.parse(reader.result);
                        const errorDetails = errorResponse.errorDetails;
                        if (errorDetails?.errorCode !== 200) {
                            ShowError(errorDetails?.errorDesc || CONTACT_ADMIN_MESSAGE);
                        }
                    } catch {
                        ShowError(CONTACT_ADMIN_MESSAGE);
                    }
                };

                reader.onerror = () => {
                    ShowError(CONTACT_ADMIN_MESSAGE);
                };
                reader.readAsText(ex.response.data);
            } else {
                ShowError(CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async downloadProtocolForJobId(jobId) {
        let url = `admin/protocol/job/${jobId}/download`;

        try {
            let { data } = await http.post(url, {}, { responseType: "blob" }).stagger(STAGGER_ID);

            if (data) {
                // data is already a Blob when responseType is set to "blob"
                // Create a URL for the blob
                return URL.createObjectURL(data);
            }
        } catch {
            ShowError("No protocol found for this study.");
        }
    }

    async fetchAuditLogs(projectId, jobId) {
        let url = `/audit-logs/protocol/${projectId}/${jobId}`;

        try {
            let response = await http.get(url);

            if (response.data && response.data.data) {
                const transformedData = response.data.data.map(entry => ({
                    ...entry,
                    newState: JSON.parse(entry.newState),
                }));
                // Sort logs by timestamp in descending order (newest first)
                const sortedLogs = transformedData.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                return sortedLogs;
            } else {
                return [];
            }
        } catch (err) {
            console.error("Error fetching audit logs:", err);
            ShowError("Failed to load audit logs. Please try again later.");
        }
    }

    //For future - if user needs to restore a deleted protocol
    async restore(id) {
        try {
            this.setLoading(true);
            const { data } = await http.put("protocol/" + id + "/restore").stagger(STAGGER_ID);
            if (data?.data) {
                const target = this.list?.findIndex(s => s?.id === id);
                this.appendStudyProtocol(target, new StudyProtocol(data.data));
                return true;
            }
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async upload(payload, isV2 = false) {
        try {
            this.setLoading(true);
            const { data } = await http.post("protocol", payload).stagger(STAGGER_ID);
            if (data?.data) {
                ShowSuccess("Protocol Uploaded");
            }
            if (isV2) {
                this.addNewStudyProtocol(new StudyProtocol(data.data));
            }
            return !!data?.data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error?.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }
}

export default new StudyProtocolStore();
