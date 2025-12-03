import { action, makeObservable } from "mobx";
import BaseStore from "../base";
import Project from "./../../model/project";

import { v4 as uuid } from "uuid";
import http from "../../../lib/http";
import events from "../../../lib/events";
import { CONTACT_ADMIN_MESSAGE, PROJECT_STATUS_ACTIVE } from "../../../constants";
import { ShowError } from "../../../components/Common";

const STAGGER_ID = uuid();
const PAGE_SIZE = 10;

export class ProjectListStore extends BaseStore {
    constructor() {
        super();
        makeObservable(this, {
            // load: action,
            search: action,
            getActiveProjectListForUser: action,
            setLoading: action,
            setList: action,
            setPage: action,
            setTerm: action,
            setStatus: action,
            setPageCount: action,
            reset: action,
        });
        events.on("reset.projects", this.reset.bind(this));
    }

    observable() {
        return {
            list: [],
            loading: false,
            page: 1,
            term: "",
            status: PROJECT_STATUS_ACTIVE,
            pageCount: 1,
        };
    }

    reset() {
        this.setTerm("");
        this.setStatus(PROJECT_STATUS_ACTIVE);
        this.setPage(1);
        this.setPageCount(1);
    }

    setLoading(status) {
        this.loading = status;
    }

    setList(list) {
        this.list = list;
    }

    setTerm(term) {
        this.term = term;
    }

    setStatus(status) {
        this.status = status;
    }

    setPage(page) {
        this.page = page;
    }

    setPageCount(count) {
        this.pageCount = count;
    }

    async search() {
        try {
            this.setLoading(true);

            const from = this.page * PAGE_SIZE - PAGE_SIZE;
            let url = `/projects?from=${from}&rows=${PAGE_SIZE}`;
            if (this.term.trim() !== "") {
                url = `${url}&term=${this.term.trim()}`;
            }

            if (this.status) {
                url = `${url}&status=${this.status}`;
            }

            const { data } = await http.get(url).stagger(STAGGER_ID);

            const result = data.data?.projectDetails ?? [];
            const list = result.map(data => new Project(data));
            this.setList(list);

            const count = data.data?.count || 1;
            this.setPageCount(Math.ceil(count / PAGE_SIZE));
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async create(request) {
        // Creates a new project
        if (!request) {
            return;
        }

        try {
            this.setLoading(true);

            const { data } = await http.post("/projects", request).stagger(STAGGER_ID);

            this.reset();
            const result = data.data?.projectDetails ?? [];
            const list = result.map(data => new Project(data));
            this.setList(list);

            const count = data.data?.count || 1;
            this.setPageCount(Math.ceil(count / PAGE_SIZE));

            return result;
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(
                    error.errorDesc ||
                        "Something went wrong. Please Connect with the Administrator."
                );
            }
        } finally {
            this.setLoading(false);
        }
    }

    async getActiveProjectListForUser(searchTerm = "", from = 0) {
        try {
            let url = `/projects?status=${1}&from=${from}&rows=${PAGE_SIZE}`;
            if (searchTerm.trim() !== "") {
                url = `${url}&term=${searchTerm.trim()}`;
            }
            const { data } = await http.get(url).stagger(STAGGER_ID);
            const result = data.data?.projectDetails ?? [];
            const list = result.map(data => new Project(data));
            const count = data.data?.count ?? result.length;
            return { list, count };
        } catch (ex) {
            const error = ex.response?.data?.errorDetails;
            if (error?.errorCode > 0) {
                ShowError(error.errorDesc || CONTACT_ADMIN_MESSAGE);
            }
        }
    }
}

export default new ProjectListStore();
