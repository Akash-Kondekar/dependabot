import { action, computed, makeObservable } from "mobx";
import BaseStore from "../base";
import Team from "./../../model/team";
import Job from "./../../model/study/job";
import session from "../session";
import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import { CONTACT_ADMIN_MESSAGE, JOB_STATUS } from "../../../constants";
import events from "../../../lib/events";
import ProjectDatabaseDetails from "./../../model/projectDatabaseDetails";
import { ShowError, ShowSuccess } from "../../../components/Common";
import { PROJECT_ROLE } from "./../../../constants/index";

const STAGGER_ID = uuid();

export class ProjectStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            load: action,
            loadJobs: action,
            loadTeam: action,
            setSubscribedProject: action,
            setData: action,
            setJobs: action,
            setTeam: action,
            setNonUsers: action,
            setJobUpdated: action,
            removeTeamMember: action,
            modifyTeamMember: action,
            loadNonProjectUsers: action,
            delete: action,
            reactivate: action,
            saveTeam: action,
            setLoading: action,
            setLoadingJobs: action,
            removeJob: action,
            removeAddOn: action,
            downloadHTML: action,
            viewResults: action,
            requestFullDB: action,
            cancelJob: action,
            cancelAddOn: action,
            currentUserProjectRole: computed,
            isProjectOwner: computed,
            isProjectCoOwner: computed,
            isProjectOwnerOrCoOwner: computed,
            isProjectUser: computed,
            status: computed,
            activeProject: computed,
            setDatabases: action,
            getDatabase: action,
            isDatabaseMapped: computed,
            setSelectedDbName: action,
            setProject: action,
            resetProject: action,
            saveMenuStatus: action,
            clearMenuStatus: action,
            busy: computed,
            busyLoadingJobs: computed,
            promptUpdateProject: action,
        });
        events.on(
            "update.project",
            this.promptUpdateProject.bind(this)
            // on click load()
        );
        events.on("reset.jobs", this.setJobs.bind(this));
        events.on("clear.drawerStatus", this.clearMenuStatus.bind(this));
    }

    observable() {
        return {
            data: {},
            jobs: [], // list of Jobs & AddOns
            team: [], // list of active team members
            nonusers: [], // list of non team members
            loading: false,
            loadingJobs: false, // tracks loading state specifically for jobs table skeletons
            listOfUserDatabases: [],
            selectedDbName: "",
            project: {},
            drawerStatus: false,
            jobUpdated: false,
            addonList: [],
        };
    }

    setLoading(status) {
        this.loading = status;
    }

    setLoadingJobs(status) {
        this.loadingJobs = status;
    }

    get busyLoadingJobs() {
        return this.loadingJobs;
    }

    get busy() {
        return this.loading;
    }

    setSubscribedProject(projectId) {
        this.subscribedProject = projectId;
    }

    setData(data) {
        this.data = data;
    }

    setJobs(jobs) {
        this.jobs = jobs;
    }

    setTeam(team) {
        this.team = team;
    }

    setNonUsers(nonUsers) {
        this.nonusers = nonUsers;
    }

    setDatabases(databases) {
        this.listOfUserDatabases = databases;
    }

    setSelectedDbName(dbName) {
        // dbName here points to Database ID
        this.selectedDbName = dbName;
    }

    setProject(project) {
        this.project = project;
    }

    resetProject() {
        this.project = "";
    }

    setJobUpdated(jobUpdated) {
        this.jobUpdated = jobUpdated;
    }

    saveMenuStatus(status) {
        this.drawerStatus = status;
    }

    clearMenuStatus() {
        this.drawerStatus = false;
    }

    promptUpdateProject() {
        ShowSuccess("You have new updates!");
        this.setJobUpdated(true);
    }

    isFullDbExtractionAllowed(database) {
        return (
            this.listOfUserDatabases?.length !== 0 &&
            this.listOfUserDatabases.find(db => db.name === database) !== undefined
        );
    }

    setAddons(data) {
        this.addonList = data;
    }

    async delete(projectID) {
        try {
            this.setLoading(true);

            const { data } = await http.delete(`projects/${projectID}`);
            const result = data.data;

            this.setData(result);

            return this.data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async reactivate(projectID) {
        try {
            this.setLoading(true);

            const { data } = await http.put(`projects/${projectID}/reactivate`);
            const result = data.data;
            this.setData(result);

            return this.data;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async load(projectID) {
        if (!projectID || projectID.length < 1) {
            return;
        }
        try {
            this.setLoading(true);
            let response = await http.get(`projects/${projectID}`).stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;

            this.setData(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }
    async loadJobs(projectID) {
        if (!projectID || projectID.length < 1) {
            return;
        }
        await this.load(projectID);

        try {
            this.setLoading(true);
            this.setLoadingJobs(true);

            let response = await http.get(`projects/${projectID}/jobs`).stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;
            const jobs = result.map(data => new Job(data));
            this.setJobs(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
            this.setLoadingJobs(false);
        }
    }

    async removeAddOn(projectID, addonID) {
        try {
            this.setLoading(true);

            let response = await http
                .delete(`/projects/${projectID}/addons/${addonID}`)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;

            const jobs = result.map(data => new Job(data));
            this.setJobs(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async removeJob(projectID, jobID) {
        try {
            this.setLoading(true);

            let response = await http
                .delete(`/projects/${projectID}/jobs/${jobID}`)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;
            const jobs = result.map(data => new Job(data));
            this.setJobs(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async viewResults(projectID, jobID, type) {
        try {
            let url;
            this.setLoading(true);

            if (type === "addons") {
                url = `/projects/${projectID}/addons/${jobID}/results`;
            } else {
                url = `/projects/${projectID}/jobs/${jobID}/results`;
            }

            let { data } = await http.get(url).stagger(STAGGER_ID);
            const results = type === "addons" ? data.data.addonJobDetails : data.data.jobDetails;
            return results;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async downloadHTML(projectID, jobID, type) {
        let results = await http.post(
            `/projects/${projectID}/${type}/${jobID}/analytics/download`,
            {},
            { responseType: "blob" }
        );
        return results;
    }

    async downloadStudyCodeLists(projectID, jobID) {
        try {
            this.setLoading(true);
            const { data } = await http.post(
                `/projects/${projectID}/jobs/${jobID}/downloadcodelist`,
                {},
                { responseType: "blob" }
            );
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

    async removeTeamMember(projectID, userId) {
        try {
            this.setLoading(true);

            let response = await http
                .delete(`projects/${projectID}/users/${userId}`)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.userRoleDetails;

            const team = result.map(data => new Team(data));
            this.setTeam(team);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async modifyTeamMember(projectID, payload) {
        try {
            this.setLoading(true);

            let response = await http
                .put(`projects/${projectID}/users`, payload)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.userRoleDetails;

            const team = result.map(data => new Team(data));
            this.setTeam(team);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async transferOwnership(projectID, payload) {
        try {
            this.setLoading(true);

            const { data } = await http
                .put(`projects/${projectID}/changeowner`, payload)
                .stagger(STAGGER_ID);

            const result = data.data.userRoleDetails;

            const team = result.map(data => new Team(data));
            this.setTeam(team);
            await this.load(projectID);

            return true;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async cancelJob(projectID, jobID) {
        try {
            this.setLoading(true);

            let response = await http
                .put(`/projects/${projectID}/jobs/${jobID}/${JOB_STATUS.CANCELLED}`)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;

            const jobs = result.map(data => new Job(data));
            this.setJobs(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async cancelAddOn(projectID, jobID) {
        try {
            this.setLoading(true);

            let response = await http
                .put(`/projects/${projectID}/addons/${jobID}/${JOB_STATUS.CANCELLED}`)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data;
            const jobs = result.map(data => new Job(data));
            this.setJobs(jobs);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadTeam(projectID = "4") {
        // Fetch the data here by making the API Call.
        // Assign the data to this.list by returning a new instance of the Model

        try {
            this.setLoading(true);

            let response = await http.get(`projects/${projectID}/users`).stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.userRoleDetails;

            const team = result.map(data => new Team(data));
            this.setTeam(team);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async saveTeam(projectID, payload) {
        try {
            this.setLoading(true);
            let response = await http
                .post(`projects/${projectID}/users`, payload)
                .stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.userRoleDetails;

            const team = result.map(data => new Team(data));
            this.setTeam(team);

            const remainingNonUsers = this.nonusers.filter(
                nonUser => nonUser.userId !== payload.userId
            );
            this.setNonUsers(remainingNonUsers);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async loadNonProjectUsers(projectID) {
        try {
            this.setNonUsers([]);
            this.setLoading(true);
            let response = await http.get(`projects/${projectID}/nonusers`).stagger(STAGGER_ID);

            const { data } = response;
            const result = data.data.userRoleDetails;

            const nonUsers = result.map(data => new Team(data));
            this.setNonUsers(nonUsers);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async requestFullDB(projectID, jobID, protocolId, modifiedStudyObject = null) {
        let url = `/projects/${projectID}/jobs/${jobID}`;

        try {
            this.setLoading(true);

            // Use modified studyObject if provided, otherwise use the original
            let finalStudyObject = modifiedStudyObject;

            if (modifiedStudyObject === null) {
                let response = await http.get(url).stagger(STAGGER_ID);

                const { data } = response;

                const result = data.data.jobDetails;
                const { studyObject } = result;
                finalStudyObject = studyObject;
            }

            const newStudyName = finalStudyObject?.studyPeriod?.opFilename;
            finalStudyObject.studyPeriod.practiceOption = 0;

            const request = {
                userID: session.loggedInUser,
                studyName: newStudyName,
                status: 7,
                studyObject: finalStudyObject,
                priority: "1",
                projectID,
                protocolId,
            };
            await http.post(`projects/${projectID}/jobs`, request).stagger(STAGGER_ID);

            ShowSuccess("Full database extraction requested successfully");
            return this.loadJobs(projectID);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        }
        this.setLoading(false);
    }

    async getDatabase(projectID) {
        if (!projectID) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http.get(`project/${projectID}/databases`);

            const databases = data?.data?.map(entry => {
                return new ProjectDatabaseDetails(entry);
            });

            this.setDatabases(databases);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;

            this.setDatabases([]);

            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async getAddons(parentJobID, projectID) {
        if (!parentJobID || !projectID) {
            return;
        }

        try {
            this.setLoading(true);

            const response = await http
                .get(`/addons/${projectID}/${parentJobID}`)
                .stagger(STAGGER_ID);
            const { data } = response;
            const result = data?.data;
            this.setAddons(result);
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        } finally {
            this.setLoading(false);
        }
    }

    get currentUserProjectRole() {
        return this.data?.roleInProject;
    }

    get isProjectOwner() {
        return this.data?.roleInProject === PROJECT_ROLE.OWNER;
    }

    get isProjectCoOwner() {
        return this.data?.roleInProject === PROJECT_ROLE.CO_OWNER;
    }

    get isProjectUser() {
        return this.data?.roleInProject === PROJECT_ROLE.VIEW_ONLY;
    }

    get isProjectOwnerOrCoOwner() {
        return this.isProjectOwner || this.isProjectCoOwner;
    }

    get status() {
        return this.data.projectStatus;
    }

    get activeProject() {
        return this.data.projectStatus === 1;
    }

    get isDatabaseMapped() {
        return this.listOfUserDatabases?.length !== 0;
    }
}

export default new ProjectStore();
