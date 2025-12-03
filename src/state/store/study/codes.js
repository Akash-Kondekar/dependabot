import { action, makeObservable, runInAction } from "mobx";
import BaseStore from "../../store/base";
import Codes from "../../model/study/codes";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import studyDatabase from "../study/database";
import { ShowError, ShowSuccess } from "../../../components/Common";
import { CONTACT_ADMIN_MESSAGE } from "../../../constants/index.jsx";

const STAGGER_ID = uuid();

export class CodesStore extends BaseStore {
    constructor() {
        super();
        this.dirty = false;
        makeObservable(this, {
            load: action,
            favoriteCode: action,
            loadWithCodes: action,
            setLoading: action,
        });
    }

    observable() {
        return {
            data: [],
            loading: false,
        };
    }

    reset() {
        this.data = [];
    }

    setLoading(status) {
        this.loading = status;
    }

    async load(db) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model

        if (!db) {
            return;
        }

        try {
            this.setLoading(true);

            let response = await http.get("/addcodes/" + db).stagger(STAGGER_ID);

            const { data } = response;

            const read = data.data.clinicalCodeListMedical;
            const drug = data.data.clinicalCodeListTherapy;
            const ahd = data.data.ahdBeanList;
            this.dirty = true;
            this.data = new Codes(read, drug, ahd);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadWithCodes(payload) {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model
        try {
            this.setLoading(true);

            const selectedDb = studyDatabase.data;
            const db = selectedDb?.name;

            let response = await http.post(`/addcodes/${db}`, payload).stagger(STAGGER_ID);

            const { data } = response;
            this.setLoading(false);
            return data;
        } catch (error) {
            const errorDetails = error.response?.data?.errorDetails;
            if (errorDetails?.errorCode > 0) {
                ShowError(errorDetails.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async favoriteCode(id, codeType) {
        if (!id) {
            return;
        }
        this.setLoading(true);
        try {
            const url =
                codeType === "medical" ? `/medicalbank/${id}/favorite` : `/drugbank/${id}/favorite`;
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

            // Update the corresponding list
            this.updateCodeList(id, codeType, { favoritedByUser, favoriteCount });

            // Notify user if message present
            if (result.message) {
                ShowSuccess(result.message);
            }
            this.setLoading(false);
            return result;
        } catch (ex) {
            console.error(ex);
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        }
        this.setLoading(false);
    }

    // Helper method to update the appropriate list
    updateCodeList(id, codeType, updates) {
        runInAction(() => {
            const ismedical = codeType === "medical";
            const listKey = ismedical ? "read" : "drug";
            const currentList = Array.isArray(this.data?.[listKey]) ? [...this.data[listKey]] : [];

            const targetIndex = currentList.findIndex(code => code.id === id);
            if (targetIndex !== -1) {
                currentList[targetIndex] = {
                    ...currentList[targetIndex],
                    ...updates,
                };
                this.dirty = true;

                // Create new Codes instance with updated list
                const newData = {
                    read: this.data?.read || [],
                    drug: this.data?.drug || [],
                    ahd: this.data?.ahd || [],
                };
                newData[listKey] = currentList;

                this.data = new Codes(newData.read, newData.drug, newData.ahd);
            }
        });
    }
}

export default new CodesStore();
