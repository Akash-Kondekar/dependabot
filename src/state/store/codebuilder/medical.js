import { action, computed, makeObservable } from "mobx";
import BaseStore from "../base";
import MasterMedical from "../../model/codebuilder/medical/master-medical";
import MedicalBank from "../../model/codebuilder/medical/medical-bank";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import {
    CANNOT_DELETE,
    CB_LOCAL_STORAGE_KEYS as KEYS,
    CODE_BUILDER_TYPE,
    CONTACT_ADMIN_MESSAGE,
    PHENOTYPE_STATE,
    REMOVE_FROM_BANK_RESULT,
} from "../../../constants";

import session from "../session";
import events from "../../../lib/events";
import { localStore } from "../../../lib/storage";
import { Confirm, ShowError, ShowSuccess } from "../../../components/Common";
import { ShowWarning } from "../../../componentsV2/Common/Toast";

const STAGGER_ID = uuid();

export class MedicalStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            // loadUserData: action,
            search: action,
            searchMedicalBank: action,
            upload: action,
            favoriteCode: action,
            delete: action,
            setLoading: action,
            setList: action,
            setMasterCodeList: action,
            setMasterCodeListForView: action,
            setLibraryCodeList: action,
            setUserCodeList: action,
            save: action,
            saveNewUserTag: action,
            searchUserTagLookup: action,
            update: action,
            setShortlistedCodes: action,
            setShortlistedIndexes: action,
            removeMasterCodes: action,
            removeShortlisted: action,
            resetResults: action,
            addToShortlistedIndexes: action,
            addToShortlistedCodes: action,
            reset: action,
            setCodeDetailsToEdit: action,
            setCodeDetailsToView: action,
            setFileName: action,
            setQuery: action,
            resetQuery: action,
            setCodeForAction: action, // Action can be Compare or Download
            setCodeListsToCompare: action,
            removeCodeListsToCompare: action,
            codeNameToAction: computed,
            codeIdToAction: computed,
            codeListsIdToCompare: computed,
            pushCodeListsToCompare: action,
            fetchCodesToCompare: action,
            setFirstCodeBeingCompared: action,
            setSecondCodeBeingCompared: action,
            compareCodesAndGetResults: computed,
            setSelectedUserTags: action,
            setRichTextContent: action,
            setRichTextContentInLibrary: action,
            updateStatus: action,
            setStatus: action,
            setReviewer: action,
        });

        events.on("auth.logout", this.reset.bind(this));
    }

    observable() {
        return {
            data: {}, // This holds a particular medical record
            list: [],
            userCodeList: [],
            libraryCodeList: [],
            masterCodeListForView: [],
            masterCodeList: [],
            loading: false,
            shortlistedCodes: [],
            shortlistedIndexes: [],
            codeToEdit: "", // undefined will throw error in useEffect.
            fileName: "",
            codeToView: {},
            query: undefined,
            codeForAction: [],
            codeListsToCompare: [],
            firstCodeBeingCompared: [],
            secondCodeBeingCompared: [],
            showCompareResults: false,
            selectedUserTags: [],
            richTextContent: "",
            richTextContentInLibrary: "",
            status: "",
            reviewer: "",
        };
    }

    setSelectedUserTags(value) {
        this.selectedUserTags = value;
    }
    setRichTextContent(value) {
        this.richTextContent = value;
    }

    setRichTextContentInLibrary(value) {
        this.richTextContentInLibrary = value;
    }

    setPreviousResults() {
        const MEDICAL = CODE_BUILDER_TYPE.MEDICAL;

        this.setMasterCodeList(
            localStore.get(session.loggedInUser + KEYS.CODES_TO_FILTER + MEDICAL) ?? []
        );

        this.setShortlistedCodes(
            localStore.get(session.loggedInUser + KEYS.SHORTLISTED_CODES + MEDICAL) ?? []
        );

        this.setShortlistedIndexes(
            localStore.get(session.loggedInUser + KEYS.SHORTLISTED_INDEXES + MEDICAL) || []
        );
    }

    pushCodeListsToCompare(codeList) {
        this.codeListsToCompare.push(codeList);
    }

    async fetchCodesToCompare() {
        const [code1, code2] = this.codeListsIdToCompare;

        if (!code1 || !code2) {
            return;
        }

        try {
            this.setLoading(true);

            let url = `/medicalbank?id=${code1}`;
            const { data } = await http.get(url);

            if (data.data === undefined) {
                ShowError("Request failed. Please try again later.");
                return;
            }
            let result = data.data?.listOfCodes?.map(entry => {
                return new MasterMedical(entry);
            });

            this.setFirstCodeBeingCompared(result);

            url = `/medicalbank?id=${code2}`;
            const response = await http.get(url);

            result = response?.data?.data?.listOfCodes?.map(entry => {
                return new MasterMedical(entry);
            });

            this.setSecondCodeBeingCompared(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    setMasterCodeListForView(value) {
        this.masterCodeListForView = value;
    }

    get compareCodesAndGetResults() {
        if (!this.firstCodeBeingCompared?.length > 0 || !this.secondCodeBeingCompared?.length > 0) {
            return null;
        }

        const common = this.firstCodeBeingCompared?.filter(v =>
            this.secondCodeBeingCompared?.find(v2 => v2.rowid === v.rowid)
        );

        const uniqueInCode1 = this.firstCodeBeingCompared?.filter(
            v => !this.secondCodeBeingCompared?.find(v2 => v2.rowid === v.rowid)
        );

        const uniqueInCode2 = this.secondCodeBeingCompared?.filter(
            v => !this.firstCodeBeingCompared?.find(v2 => v2.rowid === v.rowid)
        );

        return { common, uniqueInCode1, uniqueInCode2 };
    }

    setFirstCodeBeingCompared(results) {
        this.firstCodeBeingCompared = results;
    }

    setSecondCodeBeingCompared(results) {
        this.secondCodeBeingCompared = results;
    }

    get codeNameToAction() {
        return this.codeForAction.map(code => code.name);
    }

    get codeIdToAction() {
        return this.codeForAction.map(code => code.id);
    }

    get codeListsIdToCompare() {
        return this.codeListsToCompare.map(code => code.id);
    }

    setCodeForAction(codes) {
        // For comparing codes or downloading codes
        this.codeForAction = codes;
    }

    setCodeListsToCompare(codeLists) {
        this.codeListsToCompare = codeLists;
    }

    addToCodeListsToCompare(codeList) {
        if (this.codeListsToCompare.length < 2) {
            this.pushCodeListsToCompare(codeList);
        }
    }

    removeCodeListsToCompare() {
        this.codeListsToCompare = [];
    }

    setCodeDetailsToEdit(fileName, code) {
        this.fileName = fileName;
        this.codeToEdit = code;
    }

    setCodeDetailsToView(codeDetails) {
        if (!codeDetails?.id) {
            return;
        }

        this.codeToView = codeDetails;
    }

    setFileName(value) {
        this.fileName = value;
    }

    setQuery(keyword, codeName, userId, favoriteOnly) {
        this.query = {
            keyword,
            codeName,
            userId,
            favoriteOnly,
        };
    }

    resetQuery() {
        this.query = undefined;
        this.loadUsersRecords();
    }

    resetFilename() {
        this.fileName = "";
        this.richTextContent = "";
    }

    reset() {
        this.list = [];
        this.userCodeList = [];
        this.libraryCodeList = [];
        this.masterCodeList = [];
        this.shortlistedCodes = [];
        this.shortlistedIndexes = [];
        this.codeListsToCompare = [];
        this.selectedUserTags = [];
        this.richTextContent = "";
        this.richTextContentInLibrary = "";
        this.fileName = "";
        this.codeToEdit = "";
        this.codeToView = undefined;
        this.query = undefined;
        this.status = "";
        this.reviewer = "";
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    setLibraryCodeList(list) {
        this.libraryCodeList = list;
    }

    setUserCodeList(list) {
        this.userCodeList = list;
    }

    setMasterCodeList(results) {
        this.masterCodeList = results;
        localStore.set(
            session.loggedInUser + KEYS.CODES_TO_FILTER + CODE_BUILDER_TYPE.MEDICAL,
            this.masterCodeList
        );
    }

    setShortlistedCodes(selectedCode) {
        this.shortlistedCodes = selectedCode;
        localStore.set(
            session.loggedInUser + KEYS.SHORTLISTED_CODES + CODE_BUILDER_TYPE.MEDICAL,
            this.shortlistedCodes
        );
    }

    setShortlistedIndexes(value) {
        this.shortlistedIndexes = value;

        localStore.set(
            session.loggedInUser + KEYS.SHORTLISTED_INDEXES + CODE_BUILDER_TYPE.MEDICAL,
            this.shortlistedIndexes
        );
    }

    addToShortlistedCodes(selectedCodes) {
        this.shortlistedCodes.push(...selectedCodes);

        localStore.set(
            session.loggedInUser + KEYS.SHORTLISTED_CODES + CODE_BUILDER_TYPE.MEDICAL,
            this.shortlistedCodes
        );
    }

    addToShortlistedIndexes(indexes) {
        this.shortlistedIndexes.push(...indexes);

        localStore.set(
            session.loggedInUser + KEYS.SHORTLISTED_INDEXES + CODE_BUILDER_TYPE.MEDICAL,
            this.shortlistedIndexes
        );
    }

    removeMasterCodes(selectedRows) {
        if (!selectedRows || !selectedRows.data) {
            return;
        }

        const indexesToRemove = selectedRows.data.map(row => row.dataIndex);
        let tempCodes = [];
        for (let i = 0; i < this.masterCodeList.length; i++) {
            if (!indexesToRemove.includes(i)) {
                tempCodes.push(this.masterCodeList[i]);
            }
        }
        this.setMasterCodeList(tempCodes);
    }

    removeShortlisted(selectedRows) {
        if (!selectedRows || !selectedRows.data) {
            return;
        }

        const indexesToRemove = selectedRows.data.map(row => row.dataIndex);

        let tempCodes = [];
        let tempIndexes = [];
        for (let i = 0; i < this.shortlistedCodes.length; i++) {
            if (!indexesToRemove.includes(i)) {
                tempCodes.push(this.shortlistedCodes[i]);
                tempIndexes.push(this.shortlistedCodes[i]?.dataid);
            }
        }
        this.setShortlistedCodes(tempCodes);
        this.setShortlistedIndexes(tempIndexes);
    }

    resetResults() {
        this.shortlistedIndexes = [];
        this.shortlistedCodes = [];
        this.masterCodeList = [];
        this.selectedUserTags = [];
        this.richTextContent = "";
    }

    setStatus(status) {
        this.status = status;
    }

    setReviewer(reviewer) {
        this.reviewer = reviewer;
    }

    async load(id, forView = false) {
        // loadMedicalBankEndpoint
        try {
            const url = `/medicalbank?id=${id}`;

            this.setLoading(true);
            const { data } = await http.get(url).stagger(STAGGER_ID);

            // TODO: Need to change this from array to single obj.
            const result = data.data?.listOfCodes?.map(entry => {
                return new MasterMedical(entry);
            });
            const richTextValueFromDocumentation =
                data.data?.documentation?.richText === undefined
                    ? ""
                    : data.data?.documentation?.richText;
            const tags = data.data?.tags === undefined ? [] : data.data?.tags;
            const status = data.data?.status === undefined ? "" : data.data?.status;
            const reviewer = data.data?.reviewer === undefined ? "" : data.data?.reviewer;

            if (forView) {
                // API Call is same but containers are different.
                this.setMasterCodeListForView(result);
                this.setRichTextContentInLibrary(richTextValueFromDocumentation);
            } else {
                this.setShortlistedCodes(result);
                this.setRichTextContent(richTextValueFromDocumentation);
                this.setSelectedUserTags(tags);
                this.setStatus(status);
                this.setReviewer(reviewer);
            }
            this.setCodeDetailsToEdit(this.fileName, null);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadUsersRecords() {
        // getInitDataFromMedicalBankEndpoint
        try {
            const url = `/medicalbankonly/init?ownerid=${session.loggedInUser}`;

            this.setLoading(true);
            const { data } = await http.get(url).stagger(STAGGER_ID);

            const result = data.data?.map(entry => {
                return new MedicalBank(entry);
            });
            this.setLibraryCodeList(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async search(query) {
        if (!query) {
            return;
        }

        if (query.trim()?.length === 0) {
            ShowError("Please provide a search string and retry");
        }

        try {
            const url = `/medical?search=${query}`;

            this.setLoading(true);
            const { data } = await http.get(url).stagger(STAGGER_ID);

            const result = data.data?.map(entry => {
                return new MasterMedical(entry);
            });

            this.setMasterCodeList(result); //masterCodeList.
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async searchUserTagLookup(query) {
        if (!query) {
            return;
        }

        if (query.trim()?.length === 0) {
            ShowError("Please provide a search string and retry");
            return;
        }

        try {
            const url = `/usertag/${query}`;

            this.setLoading(true);
            const { data } = await http.get(url).stagger(STAGGER_ID);

            return data.data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async searchMedicalBank(query) {
        // Wont return codes as they are huge.

        if (!query) {
            return;
        }

        if (query.trim()?.length === 0) {
            ShowError("Please provide a search string and retry");
        }

        try {
            const url = `/medicalbankonly${query}`;

            this.setLoading(true);
            const { data } = await http.get(url).stagger(STAGGER_ID);

            const result = data.data?.map(entry => {
                return new MedicalBank(entry);
            });

            this.setLibraryCodeList(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async upload(codes, database) {
        try {
            this.setLoading(true);

            const payload = {
                codes,
                database,
            };

            const { data } = await http.post("/medical/handleUpload", payload).stagger(STAGGER_ID);

            if (data.data === undefined) {
                ShowError();
                return;
            }

            const result = data.data?.map(entry => {
                return new MasterMedical(entry);
            });

            this.setMasterCodeList(result);
            if (result.length === 0) {
                ShowWarning("Nothing got imported");
            } else {
                ShowSuccess("Codes Imported", result.length + " codes found");
            }
            const excludedCodes = new Set([
                ...result.map(row => row.dataId),
                ...result.map(row => row.clinicalcode1),
                ...result.map(row => row.clinicalcode2),
            ]);

            return codes.filter(item => !excludedCodes.has(item));
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async favoriteCode(id) {
        if (!id) {
            return;
        }
        this.setLoading(true);
        try {
            const url = `/medicalbank/${id}/favorite`;
            const { data } = await http.post(url, {}).stagger(STAGGER_ID);

            const result = data?.data;
            if (!result) {
                ShowError("Request failed. Please try again later.");
                this.setLoading(false);
                return;
            }

            // Map API response to model fields
            const favoritedByUser = result.favorited;
            const favoriteCount = result.count;

            // Update the corresponding entry in libraryCodeList
            const libraryCodeList = [...this.libraryCodeList];
            const target = libraryCodeList.findIndex(code => code.id === id);
            if (target !== -1) {
                const entry = {
                    ...libraryCodeList[target],
                    favoritedByUser,
                    favoriteCount,
                };
                libraryCodeList[target] = new MedicalBank(entry);
                this.setLibraryCodeList(libraryCodeList);
            }

            // If a code is currently being viewed, update it too
            if (this.codeToView && this.codeToView.id === id) {
                const codeToView = {
                    ...this.codeToView,
                    favoritedByUser,
                    favoriteCount,
                };
                this.setCodeDetailsToView(codeToView);
            }

            // Notify user if message present
            if (result.message) {
                ShowSuccess(result.message);
            }
            this.setLoading(false);
            return result;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        }
        this.setLoading(false);
    }

    async delete(code) {
        // deleteFromMedicalBank
        if (!code) {
            return;
        }

        try {
            this.setLoading(true);

            let { data } = await http
                .delete(`/medicalbank/delete?bankid=${code}`)
                .stagger(STAGGER_ID);
            // TODO: This should be http.delete. Backend needs to change the HTTP verb.

            if (data === REMOVE_FROM_BANK_RESULT.NOT_AUTHORIZED) {
                ShowError(CANNOT_DELETE);
                return;
            }

            if (REMOVE_FROM_BANK_RESULT.DELETED) {
                // The slice here removes the observability of the array.
                // Then we can apply filter this "Non Observable" array
                // This way, we do not get "[mobx] Out of bounds read" warning
                const updatedList = this.libraryCodeList.slice().filter(item => {
                    if (item.id !== code) {
                        return item;
                    }
                });

                this.setLibraryCodeList(updatedList);
                ShowSuccess("Delete successful");
            }
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }

    async save(payload) {
        payload.userId = session.loggedInUser;
        try {
            this.setLoading(true);

            const { data } = await http
                .post("/medicalbank/save", {
                    ...payload,
                })
                .stagger(STAGGER_ID);

            const result = data?.data;

            result === "success"
                ? ShowSuccess("Save successful")
                : ShowError("Details Already exists");
            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            const alreadyExists =
                error?.errorCode === 3 && error?.errorDesc === "Data already exists.";

            let confirmationMsg = "Do you want to overwrite it?";
            if (
                this.status === PHENOTYPE_STATE.APPROVED ||
                this.status === PHENOTYPE_STATE.PUBLIC_RELEASE
            ) {
                confirmationMsg =
                    "Overwriting the code will reset the status to draft. Do you want to overwrite it?";
            }

            if (alreadyExists) {
                const { isConfirmed } = await Confirm(
                    `Code list ${payload.filename} exists`,
                    confirmationMsg
                );
                if (!isConfirmed) {
                    return;
                }

                return await this.update(payload);
            }

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async saveNewUserTag(payload) {
        try {
            this.setLoading(true);

            const { data } = await http.post(`/usertag/${payload}`, {}).stagger(STAGGER_ID);

            const result = data?.data;

            result ? ShowSuccess("New tag created") : ShowError("Data already exists");
            return result;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async update(payload, requestType = PHENOTYPE_STATE.DRAFT) {
        try {
            this.setLoading(true);

            // TODO: Updates should be put/patch. The URI path should include id of the item being updated.
            // Currently its post.
            const { data } = await http
                .post("/medicalbank/update", {
                    ...payload,
                })
                .stagger(STAGGER_ID);

            const result = data.data;
            if (result) {
                let message = "Save successful";

                if (requestType === PHENOTYPE_STATE.UNDER_REVIEW) {
                    message = "Code is submitted for review";
                }
                const libraryCodeList = [...this.libraryCodeList];

                const target = libraryCodeList.findIndex(code => code.id === payload.id);
                const entry = { ...libraryCodeList[target], ...result };

                libraryCodeList[target] = new MedicalBank(entry);

                this.setLibraryCodeList(libraryCodeList);

                const codeToView = { ...this.codeToView, ...result };

                this.setCodeDetailsToView(codeToView);

                ShowSuccess(message);
                return true;
            }
            ShowError("Data not updated");
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async updateStatus(bankid, status) {
        try {
            this.setLoading(true);

            const { data } = await http
                .put(`medicalbank/${bankid}/updateStatus/${status}`)
                .stagger(STAGGER_ID);

            const libraryCodeList = [...this.libraryCodeList];

            const target = libraryCodeList.findIndex(code => code.id === bankid);

            if (data.data) {
                const medicalBankData = data.data;
                let message = `Phenotype has been ${status?.toLowerCase()}`;

                if (status === PHENOTYPE_STATE.PUBLIC_RELEASE) {
                    message = "Phenotype has been released to public";
                }

                ShowSuccess(message);

                const entry = { ...libraryCodeList[target], ...medicalBankData };

                libraryCodeList[target] = new MedicalBank(entry);

                this.setLibraryCodeList(libraryCodeList);

                const codeToView = { ...this.codeToView, ...medicalBankData };
                this.setCodeDetailsToView(codeToView);
                return true;
            }

            ShowError("Data not updated");
            return false;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
                return false;
            }
        } finally {
            this.setLoading(false);
        }
    }
}

export default new MedicalStore();
