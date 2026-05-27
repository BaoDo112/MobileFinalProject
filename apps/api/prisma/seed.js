"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v14WorkflowSeed = void 0;
const client_1 = require("@prisma/client");
const runtime_seed_1 = require("../src/persistence/runtime-seed");
Object.defineProperty(exports, "v14WorkflowSeed", { enumerable: true, get: function () { return runtime_seed_1.v14WorkflowSeed; } });
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const state = (0, runtime_seed_1.buildRuntimeSeed)(new Date());
        const serializedState = structuredClone(state);
        await prisma.runtimeState.upsert({
            where: { key: "app-state" },
            update: { value: serializedState },
            create: {
                key: "app-state",
                value: serializedState,
            },
        });
        process.stdout.write(`${JSON.stringify({ seeded: true, version: state.version, workflow: runtime_seed_1.v14WorkflowSeed }, null, 2)}\n`);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    void main();
}
//# sourceMappingURL=seed.js.map