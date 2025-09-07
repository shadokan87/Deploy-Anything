"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectId = exports.url = void 0;
const vercel = require("@pulumiverse/vercel");
const project = new vercel.Project("my-web-app", {
    name: "my-web-app",
    framework: "nextjs", // or "react", "vue", "static", etc.
    buildCommand: "npm run build",
    outputDirectory: "dist", // or ".next", "build", etc.
    installCommand: "npm install",
    gitRepository: {
        type: "github", // or "gitlab", "bitbucket"
        repo: "shadokan87/Deploy-Anything.git",
        productionBranch: "main",
    }
}, {
    "provider": new vercel.Provider("vercel", {
        "apiToken": "8BswdY4GSIDPHv5983GJ5M8O",
    }),
});
// const json = require("./package.json");
// console.log(json["scripts"]["build"]);
// Deploy from Git repository
const deployment = new vercel.Deployment("my-deployment", {
    projectId: project.id,
    projectSettings: {
        framework: "nextjs",
        buildCommand: "npm run build",
        outputDirectory: ".next",
        installCommand: "npm install",
    },
});
// console.log(JSON.stringify(deployment, null, 2));
// Export the deployment URL
exports.url = deployment.url;
exports.projectId = project.id;
console.log(exports.url, exports.projectId);
//# sourceMappingURL=index.js.map