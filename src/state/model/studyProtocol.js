import { makeObservable, observable } from "mobx";
import Model from "./base";

export default class StudyProtocol extends Model {
    constructor(data) {
        super(data);
        this.id = this.id ?? undefined;
        this.title = this.title ?? undefined;
        this.description = this.description ?? undefined;
        this.fileName = this.fileName ?? undefined;
        this.fileStoragePath = this.fileStoragePath ?? undefined;
        this.fileSize = this.fileSize ?? undefined;
        this.contentType = this.contentType ?? undefined;
        this.userId = this.userId ?? undefined;
        this.createdAt = this.createdAt ?? undefined;
        this.updatedAt = this.updatedAt ?? undefined;
        this.deletedAt = this.deletedAt ?? undefined;
        this.deleted = this.deleted ?? undefined;

        makeObservable(this, {
            id: observable,
            title: observable,
            description: observable,
            fileName: observable,
            fileStoragePath: observable,
            fileSize: observable,
            contentType: observable,
            userId: observable,
            createdAt: observable,
            updatedAt: observable,
            deletedAt: observable,
            deleted: observable,
        });
    }
}
