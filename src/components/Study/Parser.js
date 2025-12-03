import jsep from "jsep";

jsep.mathematical = [">", ">=", "<", "<=", "=", "!="];
jsep.logical = ["AND", "OR"];

//Removing unused binary_ops: https://github.com/soney/jsep/blob/master/src/jsep.js#L55
jsep.removeBinaryOp("||");
jsep.removeBinaryOp("&&");
//jsep.removeBinaryOp("|");
jsep.removeBinaryOp("^");
//jsep.removeBinaryOp("&");
jsep.removeBinaryOp("==");
jsep.removeBinaryOp("!=");
jsep.removeBinaryOp("===");
jsep.removeBinaryOp("!==");
jsep.removeBinaryOp("<<");
jsep.removeBinaryOp(">>");
jsep.removeBinaryOp(">>>");
jsep.removeBinaryOp("+");
jsep.removeBinaryOp("-");
jsep.removeBinaryOp("*");
jsep.removeBinaryOp("/");
jsep.removeBinaryOp("%");

//Adding custom binary_ops
jsep.addBinaryOp("OR", 1);
jsep.addBinaryOp("AND", 2);
jsep.addBinaryOp("=", 6);
jsep.addBinaryOp("!=", 6);

//Removing unused unary_ops: https://github.com/soney/jsep/blob/master/src/jsep.js#L51
jsep.removeUnaryOp("-");
jsep.removeUnaryOp("!");
jsep.removeUnaryOp("~");
jsep.removeUnaryOp("+");

jsep.addIdentifierChar(":");
jsep.addIdentifierChar("_");
jsep.addIdentifierChar("-");

const generateID = () => crypto.randomUUID(); // Math.random().toString();
const logicalOps = ["OR", "AND", "|", "&"];

export function group(expression, type) {
    const self = {
        id: `${generateID()}`,
        rules: [],
        combinator: type === "combi" ? "&" : "AND",
    };
    if (expression) {
        if (expression?.type === "Identifier") {
            self.rules.push(condition(expression));
            return self;
        }
        if (logicalOps.includes(expression.operator)) {
            self.combinator = expression.operator;
        }
        if (expression.type === "BinaryExpression" && !logicalOps.includes(expression.operator)) {
            self.rules.push(condition(expression));
        } else {
            if (expression.left) {
                if (
                    expression.left.type === "BinaryExpression" &&
                    logicalOps.includes(expression.left.operator)
                ) {
                    self.rules.push(group(expression.left));
                } else {
                    self.rules.push(condition(expression.left));
                }
            }
            if (expression.right) {
                if (
                    expression.right.type === "BinaryExpression" &&
                    logicalOps.includes(expression.right.operator)
                ) {
                    self.rules.push(group(expression.right));
                } else {
                    self.rules.push(condition(expression.right));
                }
            }
        }
    } else {
        // give the group a single default condition
        return {
            id: `${generateID()}`,
            field: "data1",
            value: "",
            operator: "=",
        };
    }
    return self;
}

function condition(condition) {
    if (condition) {
        return {
            id: `${generateID()}`,
            field: condition.left ? condition.left.name : condition.name,
            value: condition.right ? condition.right.value : "",
            operator: condition.operator ? condition.operator : "=",
        };
    }

    return {};
}

const extractJsonObject = (query, type) => {
    const exp = jsep(query);
    return group(exp, type);
};

export default extractJsonObject;
