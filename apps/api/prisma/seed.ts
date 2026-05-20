export const v14WorkflowSeed = {
  smokeAccounts: {
    organizer: {
      email: "smoke.organizer@arthera.local",
      role: "ORGANIZER",
      name: "Smoke Organizer",
    },
    visitor: {
      email: "smoke.visitor@arthera.local",
      role: "VISITOR",
      name: "Smoke Visitor",
    },
  },
  publishedExhibitions: {
    lightwave: {
      exhibitionId: "g-01",
      title: "Lightwave: Kinetic Gallery",
      openSessionId: "s-01-2",
      pendingRegistrationId: "seed-reg-03",
    },
    roots: {
      exhibitionId: "g-02",
      title: "Roots in Motion",
      waitlistSessionId: "s-02-1",
    },
    neon: {
      exhibitionId: "g-03",
      title: "Memory of Neon Streets",
      archiveSessionId: "s-03-1",
    },
  },
  draftBlueprint: {
    title: "Signal Garden Draft",
    exhibitionType: "Installation",
    venueId: "v-01",
    sessionStartsAt: "2026-06-10T11:00:00.000Z",
    sessionEndsAt: "2026-06-10T12:15:00.000Z",
  },
} as const;

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(v14WorkflowSeed, null, 2)}\n`);
}