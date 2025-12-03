import { formatDate } from "../../utils/index.jsx";

describe("util", () => {
    describe("add", () => {
        it("should return the sum of two numbers", () => {
            expect(formatDate(new Date("01-01-1900"))).toBe("01-Jan-1900");
        });
    });
});
