import useSWR from "swr";
import { getFetcher } from "./getFetcher";

export function useDocument(id, condition = true) {
    const { data, error } = useSWR(
        condition ? import.meta.env.VITE_APP_API_VIP + "/dexter" + `/document/${id}` : null,
        getFetcher,
        {
            revalidateOnFocus: false,
            onErrorRetry: () => {},
        }
    );

    return {
        response: data,
        isLoading: !error && !data,
        isError: error,
    };
}
