export const profile = {
  "name": "Matt Garden",
  "summary": "Software, research, retail, and a long-running interest in helping people learn.",
  "linkedIn": "https://www.linkedin.com/in/matthewgarden/",
  "mentoring": "Over a decade mentoring students in a high-school computer science class.",
  "draft": "This is the first draft. Dates and further contact details are still to come."
} as const;

type Chapter = Readonly<{ title: string; place: string; summary: string; note: string }> &
  ({ playable: true; route: '#adventure' | '#nortel' | '#smart' | '#lightspeed'; linkLabel: string } | { playable: false });

export const chapters: readonly Chapter[] = [
  { title: 'Timney Lab', place: 'Western University · London, ON', summary: 'A high-school co-op placement, followed by a first programming job while at university. Vision tests and Gabor patches.', note: 'Optional prologue', playable: false },
  { title: 'McGill University, 2006', place: 'McGill / CIM · Montréal', summary: 'Movie recommendations, Recommendz, an MSc, and a decision to move into industry.', note: 'Chapter 01 · Playable', playable: true, route: '#adventure', linkLabel: 'Enter the lab' },
  { title: 'Making connections.', place: 'Nortel · Ottawa', summary: 'PDH configuration on OME metro equipment. Somewhere, a cable needs a home.', note: 'Chapter 02 · Playable', playable: true, route: '#nortel', linkLabel: 'Enter Nortel' },
  { title: 'A blank canvas.', place: 'SMART Technologies · Ottawa', summary: 'SMART Notebook for Mac. A whiteboard with a few ideas of its own.', note: 'Chapter 03 · Playable', playable: true, route: '#smart', linkLabel: 'Enter SMART' },
  { title: 'Open for business.', place: 'Lightspeed · Ottawa', summary: 'iOS point of sale. Building the software on the other side of the counter.', note: 'Chapter 04 · Playable', playable: true, route: '#lightspeed', linkLabel: 'Enter Lightspeed' },
  { title: 'A little more agency.', place: 'Shopify · Ottawa', summary: 'Retail point of sale, learning agentic engineering, and figuring out how to direct the next generation of tools.', note: 'Chapter 05 · Planned', playable: false },
];

export const career = [
  {
    "place": "Shopify",
    "paragraphs": [
      "Retail point of sale. Learning agentic engineering is a significant part of the work today."
    ]
  },
  {
    "place": "Lightspeed",
    "paragraphs": [
      "iOS development for point-of-sale software."
    ]
  },
  {
    "place": "SMART Technologies",
    "paragraphs": [
      "Developing SMART Notebook for Mac, the software for SMART’s interactive whiteboards."
    ]
  },
  {
    "place": "Nortel",
    "paragraphs": [
      "PDH configuration on OME metro equipment."
    ]
  },
  {
    "place": "McGill / CIM",
    "paragraphs": [
      "Movie-recommendation research with Greg Dudek, including the Recommendz system and several publications. Earned an MSc, then left the PhD after two years to work in industry."
    ]
  },
  {
    "place": "Timney Lab / Western University",
    "paragraphs": [
      "A few months as a high-school co-op student at Western University in London, Ontario, then my first programming job there while at university, programming vision tests including Gabor patches.",
      "Dr. Timney offered me the job when he came into Shoppers Drug Mart for cold medicine. I was working there as a stockboy and cashier supervisor."
    ]
  }
] as const;
