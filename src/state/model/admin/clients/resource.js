import { makeObservable, observable } from "mobx";
import Model from "../../base";

export default class Resource extends Model {
    constructor(data) {
        super(data);
        this.databaseName = this.databaseName ?? "";
        this.databaseStartDate = this.databaseStartDate ?? undefined;
        this.databaseEndDate = this.databaseEndDate ?? undefined;
        this.databaseId = this.databaseId ?? undefined;

        this.clientDatabaseEndDate = this.clientDatabaseEndDate ?? undefined;
        this.clientDatabaseStartDate = this.clientDatabaseStartDate ?? undefined;
        this.clientId = this.clientId ?? undefined;
        this.databaseDeleted = this.databaseDeleted ?? undefined;
        this.databaseDescription = this.databaseDescription ?? undefined;
        this.databaseVersion = this.databaseVersion ?? undefined;
        this.analytics = this.analytics ?? undefined;
        this.databaseConfig = this.databaseConfig ?? INITIAL_STATE_OF_DATABASE_CONFIG;

        makeObservable(this, {
            databaseName: observable,
            databaseStartDate: observable,
            databaseEndDate: observable,
            databaseId: observable,
            clientDatabaseEndDate: observable,
            clientDatabaseStartDate: observable,
            clientId: observable,
            databaseDeleted: observable,
            databaseDescription: observable,
            databaseVersion: observable,
            analytics: observable,
            databaseConfig: observable,
        });
    }
}

const INITIAL_STATE_OF_DATABASE_CONFIG = {
    id: undefined, // A required field, not visible to the user. It should always be set to the database id
    databaseName: undefined, // A required field, not visible to the user. It should always be set to the database name
    databaseHostAddress: "",
    databasePort: null,
    databaseUsername: "",
    databasePassword: "",
    practiceTable: "",
    defaultPractices: "",
    ssh: false,
    sshHostAddress: "",
    sshUsername: "",
    sshKey: "",
    sshKeyPassword: "",
    knownHosts: "",
    ahdCategories: "",
    directory: "",
};
