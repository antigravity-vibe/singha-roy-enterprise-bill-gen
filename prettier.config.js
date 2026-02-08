/**
 * @type { import("prettier").Config }
 */

const config = {
    trailingComma: "all",
    tabWidth: 4,
    printWidth: 120,
    endOfLine: "lf",
    plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
