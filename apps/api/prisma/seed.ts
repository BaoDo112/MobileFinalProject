import { Prisma, PrismaClient } from "@prisma/client";

import { buildRuntimeSeed, v14WorkflowSeed } from "../src/persistence/runtime-seed";

async function main() {
  const prisma = new PrismaClient();

  try {
    const state = buildRuntimeSeed(new Date());
    const serializedState = structuredClone(state) as unknown as Prisma.InputJsonValue;
    await prisma.runtimeState.upsert({
      where: { key: "app-state" },
      update: { value: serializedState },
      create: {
        key: "app-state",
        value: serializedState,
      },
    });

    process.stdout.write(`${JSON.stringify({ seeded: true, version: state.version, workflow: v14WorkflowSeed }, null, 2)}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main();
}

export { v14WorkflowSeed };