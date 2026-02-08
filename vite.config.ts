import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

function getBaseURL(): string {
    const githubRepository = process.env.GITHUB_REPOSITORY;

    if (githubRepository === undefined) {
        return "/";
    }

    const [, repo] = githubRepository.split("/");
    return `/${repo}`;
}

export default defineConfig({
    plugins: [react(), tailwindcss(), svgr()],
    base: getBaseURL(),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
