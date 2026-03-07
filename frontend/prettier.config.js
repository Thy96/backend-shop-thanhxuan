/** @type {import("prettier").Config} */
module.exports = {
    semi: true,              // có dấu chấm phẩy ở cuối
    singleQuote: true,       // dùng nháy đơn
    trailingComma: 'all',    // thêm dấu , ở cuối object/array
    tabWidth: 2,             // 2 khoảng trắng = 1 tab
    printWidth: 80,          // wrap code khi dài hơn 80 ký tự
    bracketSpacing: true,    // { foo: bar } thay vì {foo:bar}
    arrowParens: 'always',   // (x) => {} thay vì x => {}
};