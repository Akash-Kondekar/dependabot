import http from "../lib/http";

export const getFetcher = async url => {
    try {
        const { data } = await http.get(url);
        return {
            data: data.data,
            error: undefined,
        };
    } catch (error) {
        return {
            data: undefined,
            error,
        };
    }
};
