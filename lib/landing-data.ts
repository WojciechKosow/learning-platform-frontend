// Static content for the marketing site (ported from the clickable prototype).

export type CompState = "done" | "progress" | "next" | "todo";

export type Module = {
  id: string;
  title: string;
  diff: string;
  effort: string;
  progress: number;
  deps: string[];
  summary: string;
  comps: [string, CompState][];
  projects: string[];
};

/** Demo roadmap shown on the landing page. */
export const MODULES: Module[] = [
  { id: "html-css", title: "HTML & CSS", diff: "Beginner", effort: "12 h", progress: 100, deps: [],
    summary: "Semantic markup, layout and responsive design.",
    comps: [["Semantic HTML", "done"], ["Flexbox & Grid", "done"], ["Responsive layouts", "done"], ["Forms & validation", "done"]],
    projects: ["Responsive Landing Page", "Interactive To-Do App"] },
  { id: "javascript", title: "JavaScript", diff: "Beginner to intermediate", effort: "28 h", progress: 55, deps: ["HTML & CSS"],
    summary: "The language itself: data, functions, the DOM and async code.",
    comps: [["Variables & types", "done"], ["DOM manipulation", "done"], ["Functions", "progress"], ["Array methods", "progress"], ["Objects & destructuring", "progress"], ["Asynchronous JavaScript", "todo"], ["Error handling", "todo"]],
    projects: ["Expense Tracker", "Weather Dashboard"] },
  { id: "typescript", title: "TypeScript", diff: "Intermediate", effort: "14 h", progress: 0, deps: ["JavaScript"],
    summary: "Types that catch bugs before you run the code.",
    comps: [["Basic types", "todo"], ["Interfaces & type aliases", "todo"], ["Generics", "todo"], ["Narrowing", "todo"]],
    projects: ["Personal Finance Dashboard"] },
  { id: "react", title: "React", diff: "Intermediate", effort: "30 h", progress: 20, deps: ["JavaScript"],
    summary: "Components, state and the patterns behind real UIs.",
    comps: [["Components & props", "done"], ["State with useState", "progress"], ["Lists & keys", "progress"], ["Effects", "todo"], ["Custom hooks", "todo"], ["Context", "todo"]],
    projects: ["Expense Tracker", "Personal Finance Dashboard"] },
  { id: "nextjs", title: "Next.js", diff: "Intermediate", effort: "22 h", progress: 0, deps: ["React", "TypeScript"],
    summary: "Routing, server components and data fetching.",
    comps: [["App Router", "todo"], ["Server & client components", "todo"], ["Data fetching", "todo"], ["Route handlers", "todo"]],
    projects: ["Project Management Application"] },
  { id: "node", title: "Node.js", diff: "Intermediate", effort: "20 h", progress: 0, deps: ["JavaScript"],
    summary: "Servers, APIs and working with the file system.",
    comps: [["Modules & npm", "todo"], ["HTTP & Express", "todo"], ["REST API design", "todo"], ["Authentication", "todo"]],
    projects: ["URL Shortener API", "Authentication System"] },
  { id: "sql", title: "SQL", diff: "Intermediate", effort: "12 h", progress: 0, deps: ["JavaScript"],
    summary: "Model data, query it and keep it consistent.",
    comps: [["SELECT & filtering", "todo"], ["Joins", "todo"], ["Schema design", "todo"], ["Indexes & transactions", "todo"]],
    projects: ["Authentication System"] },
  { id: "fullstack", title: "Full-stack applications", diff: "Advanced", effort: "40 h", progress: 0, deps: ["Next.js", "Node.js", "SQL"],
    summary: "Ship complete products: auth, payments, deployment.",
    comps: [["Architecture", "todo"], ["Auth & sessions", "todo"], ["Payments", "todo"], ["Deployment", "todo"]],
    projects: ["SaaS Subscription Platform"] },
];

export type Project = { id: string; name: string; tech: string[]; skills: string[]; effort: string; desc: string };

/** Library projects featured on the landing page. */
export const FEATURED_PROJECTS: Project[] = [
  { id: "expense-tracker", name: "Expense Tracker",
    tech: ["JavaScript", "React", "CSS", "Vite"], skills: ["Array methods", "reduce()", "Controlled forms", "Data persistence"], effort: "10–14 h",
    desc: "Track income and expenses, calculate a live balance and keep data across reloads." },
  { id: "weather", name: "Weather Dashboard",
    tech: ["JavaScript", "Fetch API", "CSS"], skills: ["async / await", "Error handling", "Working with APIs"], effort: "8–12 h",
    desc: "Search a city, fetch a forecast from a public API and handle loading and error states." },
  { id: "auth", name: "Authentication System",
    tech: ["Node.js", "Express", "PostgreSQL", "JWT"], skills: ["Password hashing", "Sessions & tokens", "Protected routes"], effort: "14–18 h",
    desc: "Sign up, log in, reset passwords and protect routes the way production apps do." },
  { id: "saas", name: "SaaS Subscription Platform",
    tech: ["Next.js", "Stripe (test mode)", "PostgreSQL", "Auth.js"], skills: ["Billing flows", "Webhooks", "Multi-tenant data"], effort: "40–60 h",
    desc: "Plans, checkout, webhooks and an account area. The full shape of a product you could charge for." },
];

export const SOLUTION = `export function calculateTotals(transactions = []) {
  const totals = transactions.reduce(
    (acc, { type, amount }) => {
      if (type === 'income') acc.income += amount;
      else acc.expenses += amount;
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return { ...totals, balance: totals.income - totals.expenses };
}
`;

export const HOW: [string, string][] = [
  ["Take a short assessment", "Ten questions, some with real code. We find what you know and where you get stuck."],
  ["Get your roadmap", "Modules ordered for your goal and your daily time, each with a project that proves it."],
  ["Build in the browser IDE", "Write, run and preview real apps. The mentor reviews your code and hints in steps."],
  ["Verify and move on", "A practical skill check marks competencies as demonstrated and unlocks what comes next."],
];

export const CMP: [string, string, string, string][] = [
  ["Where you write code", "In another window", "Paste into your editor", "Next to the lesson, in the same window"],
  ["When you get stuck", "Rewind and rewatch", "Gets the full answer", "Hints in steps, the answer only if you ask"],
  ["Knows your project", "Same video for everyone", "Only what you paste", "Reads your files, task and roadmap"],
  ["What to learn next", "Fixed curriculum", "You have to know what to ask", "A roadmap built from your assessment"],
  ["Proof you learned it", "A completion badge", "Nothing", "An authorship report and skills verified in your own code"],
  ["After you finish", "Buy another course", "Start a new chat", "The next project unlocks"],
];

export type Pack = { id: "small" | "medium" | "large"; name: string; credits: number; price: number; best?: boolean };
export const PACKS: Pack[] = [
  { id: "small", name: "Small top-up", credits: 1000, price: 12 },
  { id: "medium", name: "Medium top-up", credits: 3000, price: 33 },
  { id: "large", name: "Large top-up", credits: 8000, price: 84, best: true },
];
export const PLAN_CREDITS = { free: 300, pro: 5000 };

export const FAQ: [string, string][] = [
  ["What is Codetta?", "A place to learn programming by building real apps. It combines a browser IDE, a personal roadmap and an AI mentor that reads your code, so you learn and code in the same window."],
  ["Do I need to install anything?", "No. The editor, terminal, npm and live preview all run in your browser. In V0.2 you will also be able to work locally in VS Code and sync through GitHub."],
  ["What is the difference between Learn mode and Build mode?", "Learn mode is the mentor: explanations, hints in steps and code reviews, while you write the code. Build mode is an AI agent that writes and edits files for you, like an AI coding tool. Build is faster but uses more credits, and the code it writes does not count toward your skills."],
  ["Will the mentor just give me the answer?", "Only if you ask for it. In Learn mode it gives a nudge, a second hint, detailed guidance and then the full explanation. If you want the AI to write the code, switch to Build mode and it is marked as AI-written."],
  ["How is code authorship measured?", "Every change is tracked as you work. Code you type counts as yours, code written after a hint counts as yours with a hint, and code inserted or pasted from the AI counts as AI, even if you retype it. Formatting and project scaffolding are not counted. At the end of a project you get a report per file."],
  ["What is a credit?", "A unit of AI work. Credits follow how much the AI actually does: a hint costs 1 to 3, a code review 5 to 10 and a Build run 20 to 200 depending on its size. Writing code, running it, tests and skill checks never cost credits."],
  ["What happens if I use up my monthly credits?", "Everything except the AI keeps working. You can add a one-time top-up in one click or wait until your credits reset. Top-up credits never expire and are used only after your monthly credits."],
  ["Can I build my own app idea?", "Yes. Describe it and the mentor scopes it to your level, lists the skills you will need and turns it into milestones. Big ideas start as a smaller MVP rather than being rejected."],
  ["Who owns the code I write?", "You do, including code written with Build mode. Your projects are yours to keep, publish and use in your portfolio. You can download any workspace as a ZIP."],
  ["Can I cancel Pro anytime?", "Yes, in two clicks from Settings. You keep Pro until the end of the billing period, and any top-up credits stay on your account."],
];

export type AuthProfileKey = "hints" | "build";
export type AuthProfile = {
  label: string;
  /** [written by you, after a hint, AI edited by you, AI-written] in % */
  total: [number, number, number, number];
  files: [string, [number, number, number, number]][];
  skills: [string, boolean][];
};
export const AUTH_PROFILES: Record<AuthProfileKey, AuthProfile> = {
  hints: { label: "Built with hints", total: [62, 26, 8, 4],
    files: [["calculateTotals.js", [70, 30, 0, 0]], ["ExpenseForm.jsx", [58, 30, 12, 0]], ["ExpenseList.jsx", [80, 20, 0, 0]], ["useLocalStorage.js", [40, 30, 14, 16]]],
    skills: [["Array methods", true], ["Functions", true], ["Controlled forms", true], ["Custom hooks", true]] },
  build: { label: "Built with Build mode", total: [18, 9, 21, 52],
    files: [["calculateTotals.js", [45, 25, 30, 0]], ["ExpenseForm.jsx", [10, 0, 20, 70]], ["ExpenseList.jsx", [12, 8, 30, 50]], ["useLocalStorage.js", [0, 0, 10, 90]]],
    skills: [["Array methods", true], ["Functions", false], ["Controlled forms", false], ["Custom hooks", false]] },
};
export const AUTH_CLS = ["c-you", "c-hint", "c-edit", "c-ai"] as const;
export const AUTH_LBL = ["Written by you", "Written after a hint", "AI-written, edited by you", "AI-written"] as const;

export const fmtInt = (n: number) => n.toLocaleString("en-US");
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number.isFinite(n) ? n : 0);
