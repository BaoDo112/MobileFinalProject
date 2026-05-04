import type {
  Gallery,
  OrganizerExhibition,
  RegistrationField,
  Review,
  Stamp,
  Submission,
  UserProfile,
  VisitSlot
} from "../types/models";

export const galleries: Gallery[] = [
  {
    id: "g-01",
    title: "Lightwave: Kinetic Gallery",
    type: "Technology",
    district: "District 1",
    dateLabel: "Apr 03 - Apr 16, 2026",
    timeLabel: "09:00 - 21:00",
    organizer: "Arthera Studio",
    bio: "An immersive showcase where responsive projections react to live sound and body movement.",
    address: "25 Nguyen Hue, District 1, Ho Chi Minh City",
    artists: ["Linh Truong", "Minh Dao", "Aya Nguyen"],
    images: ["hero-lightwave.jpg", "hall-a.jpg", "hall-b.jpg"],
    status: "present",
    entryMode: "Immersive sound walk",
    capacityNote: "32 spots per session",
    curatorNote: "Arrive 10 minutes early for the intro loop and motion calibration.",
    highlights: ["Reactive projection hall", "Late-night audio slot", "Accessible pathway"],
    registrationStatus: "open",
    accent: "#d66b55"
  },
  {
    id: "g-02",
    title: "Roots in Motion",
    type: "Art",
    district: "District 3",
    dateLabel: "May 12 - May 28, 2026",
    timeLabel: "10:00 - 19:00",
    organizer: "Cedar House",
    bio: "A visual dialogue between traditional materials and contemporary installation techniques.",
    address: "88 Vo Van Tan, District 3, Ho Chi Minh City",
    artists: ["Trang Le", "Hoang Vu"],
    images: ["roots-main.jpg", "roots-wall.jpg"],
    status: "future",
    entryMode: "Timed gallery route",
    capacityNote: "Waitlist opens after 120 reservations",
    curatorNote: "Preview week keeps the route intimate, so registration closes quickly.",
    highlights: ["Ceramic installation line", "Hands-on material table", "Curator Q&A"],
    registrationStatus: "waitlist",
    accent: "#ba6f3d"
  },
  {
    id: "g-03",
    title: "Memory of Neon Streets",
    type: "Mixed",
    district: "Binh Thanh",
    dateLabel: "Mar 01 - Mar 20, 2026",
    timeLabel: "11:00 - 20:00",
    organizer: "Lane 6 Collective",
    bio: "Photography and mapped projection collection capturing shifts of urban light over time.",
    address: "12 Phan Dang Luu, Binh Thanh, Ho Chi Minh City",
    artists: ["Nhi Mai", "Phuoc Tran", "Anh Khoa"],
    images: ["neon-main.jpg"],
    status: "past",
    entryMode: "Open archive walkthrough",
    capacityNote: "Archive visit completed",
    curatorNote: "The team kept a full walk-through recording for returning visitors and review prompts.",
    highlights: ["Photo essay wall", "Projection archive", "Post-visit critique notes"],
    registrationStatus: "closed",
    accent: "#6f4d67"
  }
];

export const passportStamps: Stamp[] = [
  {
    id: "s-01",
    title: "Lightwave",
    unlocked: true,
    milestone: "Visited",
    galleryId: "g-01",
    accent: "#d66b55",
    note: "Unlocked after your sound-walk reservation was confirmed."
  },
  {
    id: "s-02",
    title: "Roots in Motion",
    unlocked: false,
    milestone: "Register to unlock",
    galleryId: "g-02",
    accent: "#ba6f3d",
    note: "Join the waitlist to reserve the next quiet session slot."
  },
  {
    id: "s-03",
    title: "Neon Streets",
    unlocked: true,
    milestone: "Commented",
    galleryId: "g-03",
    accent: "#6f4d67",
    note: "Unlocked because you left a post-visit review and comment."
  },
  {
    id: "s-04",
    title: "Curator's Choice",
    unlocked: false,
    milestone: "Collect 3 active stamps",
    galleryId: "g-01",
    accent: "#c38d3a",
    note: "Hidden reward for visitors who finish three active experience loops."
  }
];

export const visitorProfile: UserProfile = {
  name: "Mai An",
  role: "visitor",
  tagline: "Weekend gallery hunter collecting immersive city moments.",
  city: "Ho Chi Minh City",
  membershipLabel: "Passport tier: Studio Circle",
  stats: [
    { label: "Visits", value: "12" },
    { label: "Live tickets", value: "2" },
    { label: "Stamps", value: "7" }
  ],
  highlights: [
    "Saved quiet-session exhibitions for rainy weekends.",
    "Post-visit comments unlock stamp boosters.",
    "Upcoming reservation: Lightwave Friday 18:30."
  ]
};

export const organizerProfile: UserProfile = {
  name: "Arthera Studio",
  role: "organizer",
  tagline: "Publishing intimate exhibition formats with small-session attendance control.",
  city: "District 1",
  membershipLabel: "Organizer tier: Curator Console",
  stats: [
    { label: "Published", value: "3" },
    { label: "Pending forms", value: "28" },
    { label: "Checked-in", value: "64" }
  ],
  highlights: [
    "Next deadline: poster update for Lightwave social cutdowns.",
    "Your best-performing form asks for accessibility notes early.",
    "Waitlist conversion is strongest on evening sessions."
  ]
};

export const galleryReviews: Record<string, Review[]> = {
  "g-01": [
    {
      id: "r-01",
      author: "Bao Nguyen",
      roleLabel: "Visitor / Sound artist",
      rating: 5,
      body: "The projection hall felt alive. Staff pacing made the experience calm instead of crowded.",
      postedAt: "2h ago",
      highlight: "Atmosphere"
    },
    {
      id: "r-02",
      author: "Truc Le",
      roleLabel: "Visitor / Student",
      rating: 4,
      body: "Loved the guided intro. Would book the late-night slot again for stronger contrast.",
      postedAt: "Yesterday",
      highlight: "Night slot"
    }
  ],
  "g-02": [
    {
      id: "r-03",
      author: "Hanh Do",
      roleLabel: "Waitlist member",
      rating: 5,
      body: "Preview content already feels well-curated. The material table is worth the queue.",
      postedAt: "Today",
      highlight: "Preview week"
    }
  ],
  "g-03": [
    {
      id: "r-04",
      author: "Khoa Tran",
      roleLabel: "Visitor / Photographer",
      rating: 4,
      body: "Archive wall sequencing was strong. I stayed longer than planned just reading the notes.",
      postedAt: "3 days ago",
      highlight: "Archive"
    },
    {
      id: "r-05",
      author: "Nhi Ho",
      roleLabel: "Visitor",
      rating: 5,
      body: "Excellent pacing between still photography and projection loops. Easy to recommend.",
      postedAt: "Last week",
      highlight: "Pacing"
    }
  ]
};

export const registrationFormsByGallery: Record<string, RegistrationField[]> = {
  "g-01": [
    {
      id: "full-name",
      label: "Full name",
      type: "text",
      placeholder: "Your full name",
      required: true,
      helpText: "Used for session check-in."
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "name@example.com",
      required: true,
      helpText: "Confirmation and reminder will be sent here."
    },
    {
      id: "phone",
      label: "Phone",
      type: "phone",
      placeholder: "09xx xxx xxx",
      required: true,
      helpText: "Optional for same-day schedule changes."
    },
    {
      id: "comfort-mode",
      label: "Preferred session mood",
      type: "select",
      placeholder: "Choose a slot style",
      required: true,
      options: ["Quiet walkthrough", "Interactive / playful", "Late-night contrast"],
      helpText: "Helps the host keep each session balanced."
    },
    {
      id: "accessibility",
      label: "Accessibility notes",
      type: "textarea",
      placeholder: "Anything the team should prepare for your visit",
      required: false
    }
  ],
  "g-02": [
    {
      id: "full-name",
      label: "Full name",
      type: "text",
      placeholder: "Your full name",
      required: true
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "name@example.com",
      required: true
    },
    {
      id: "favorite-material",
      label: "What material are you most curious about?",
      type: "select",
      placeholder: "Select one",
      required: false,
      options: ["Clay", "Wood", "Fiber", "Mixed media"]
    }
  ],
  "g-03": [
    {
      id: "reflection",
      label: "Archive reflection",
      type: "textarea",
      placeholder: "What visual moment stayed with you?",
      required: false,
      helpText: "Used as a prompt before leaving a rating and comment."
    }
  ]
};

export const visitSlotsByGallery: Record<string, VisitSlot[]> = {
  "g-01": [
    { id: "slot-01", label: "Fri 18:30", remaining: "12 seats left", vibe: "Best balance of light and crowd" },
    { id: "slot-02", label: "Sat 15:00", remaining: "8 seats left", vibe: "Family-friendly walkthrough" },
    { id: "slot-03", label: "Sat 20:00", remaining: "Waitlist only", vibe: "Strongest contrast and audio" }
  ],
  "g-02": [
    { id: "slot-04", label: "Preview Sun 10:00", remaining: "Waitlist opens", vibe: "Quiet guided route" },
    { id: "slot-05", label: "Preview Sun 14:00", remaining: "Waitlist opens", vibe: "Hands-on curator Q&A" }
  ],
  "g-03": [
    { id: "slot-06", label: "Archive replay", remaining: "Replay available", vibe: "Open memory lane" }
  ]
};

export const organizerExhibitions: OrganizerExhibition[] = [
  {
    id: "e-01",
    title: "Lightwave: Kinetic Gallery",
    venue: "Arthera Studio Hall A",
    district: "District 1",
    dateLabel: "Apr 03 - Apr 16, 2026",
    summary: "Responsive projection and sound route with timed groups and evening special slots.",
    status: "published",
    submissions: 42,
    checkedIn: 26,
    accent: "#d66b55",
    fieldCount: 5,
    nextAction: "Issue stamps after Friday session"
  },
  {
    id: "e-02",
    title: "Roots in Motion",
    venue: "Cedar House Courtyard",
    district: "District 3",
    dateLabel: "May 12 - May 28, 2026",
    summary: "Material-focused installation with preview week waitlist and curator-led walkthroughs.",
    status: "review",
    submissions: 18,
    checkedIn: 0,
    accent: "#ba6f3d",
    fieldCount: 4,
    nextAction: "Approve preview form before launch"
  },
  {
    id: "e-03",
    title: "Signal Garden Draft",
    venue: "Lane 6 Annex",
    district: "Binh Thanh",
    dateLabel: "Jun 02 - Jun 15, 2026",
    summary: "Draft concept for a tactile light garden with quiet-access route and student ticket pool.",
    status: "draft",
    submissions: 0,
    checkedIn: 0,
    accent: "#6f4d67",
    fieldCount: 3,
    nextAction: "Finish media brief and visitor form"
  }
];

export const exhibitionFormsById: Record<string, RegistrationField[]> = {
  "e-01": registrationFormsByGallery["g-01"],
  "e-02": [
    {
      id: "full-name",
      label: "Full name",
      type: "text",
      placeholder: "Visitor full name",
      required: true
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "name@example.com",
      required: true
    },
    {
      id: "visit-slot",
      label: "Preview slot",
      type: "select",
      placeholder: "Choose preview slot",
      required: true,
      options: ["Sun 10:00", "Sun 14:00"]
    },
    {
      id: "group-size",
      label: "Companion count",
      type: "select",
      placeholder: "Choose count",
      required: false,
      options: ["Solo", "2 people", "3 people"]
    }
  ],
  "e-03": [
    {
      id: "full-name",
      label: "Full name",
      type: "text",
      placeholder: "Visitor full name",
      required: true
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "name@example.com",
      required: true
    },
    {
      id: "quiet-route",
      label: "Need quiet-access route?",
      type: "select",
      placeholder: "Choose one",
      required: false,
      options: ["Yes", "No"]
    }
  ]
};

export const exhibitionSubmissionsById: Record<string, Submission[]> = {
  "e-01": [
    {
      id: "sub-01",
      attendeeName: "Bao Nguyen",
      timeslot: "Fri 18:30",
      status: "confirmed",
      submittedAt: "Today, 09:15",
      note: "Requests an aisle seat close to the exit.",
      answers: [
        { label: "Email", value: "bao@example.com" },
        { label: "Phone", value: "0912 345 678" },
        { label: "Preferred session mood", value: "Late-night contrast" }
      ]
    },
    {
      id: "sub-02",
      attendeeName: "Truc Le",
      timeslot: "Sat 15:00",
      status: "pending",
      submittedAt: "Today, 11:20",
      note: "Can arrive early if a quieter slot opens.",
      answers: [
        { label: "Email", value: "truc@example.com" },
        { label: "Phone", value: "0933 654 111" },
        { label: "Preferred session mood", value: "Quiet walkthrough" }
      ]
    },
    {
      id: "sub-03",
      attendeeName: "Hoai Linh",
      timeslot: "Fri 18:30",
      status: "checked-in",
      submittedAt: "Yesterday, 18:02",
      note: "Already attended and ready for stamp issue.",
      answers: [
        { label: "Email", value: "linh@example.com" },
        { label: "Phone", value: "0903 888 100" },
        { label: "Preferred session mood", value: "Interactive / playful" }
      ]
    }
  ],
  "e-02": [
    {
      id: "sub-04",
      attendeeName: "Hanh Do",
      timeslot: "Sun 10:00",
      status: "pending",
      submittedAt: "Today, 08:40",
      note: "Interested in clay-focused demonstration.",
      answers: [
        { label: "Email", value: "hanh@example.com" },
        { label: "Preview slot", value: "Sun 10:00" },
        { label: "Companion count", value: "Solo" }
      ]
    }
  ],
  "e-03": []
};
