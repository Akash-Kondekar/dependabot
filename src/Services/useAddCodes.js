import useSWR from "swr";
import { getFetcher } from "./getFetcher";
import { ADDCODES_ENDPOINT } from "../config/index";
import studyDatabase from "../state/store/study/database";

export function useAddCodes(id, code, condition = true) {
    const selectedDb = studyDatabase.data;

    const dbName = condition ? selectedDb?.name : "";

    const { data, error } = useSWR(
        condition
            ? import.meta.env.VITE_APP_API_VIP +
                  "/dexter" +
                  ADDCODES_ENDPOINT +
                  `${dbName}/${code}/${id}`
            : null,
        getFetcher,
        {
            revalidateOnFocus: false,
            onErrorRetry: () => {},
        }
    );
    return {
        results: data,
        isLoading: !error && !data,
        isError: error,
    };
}
