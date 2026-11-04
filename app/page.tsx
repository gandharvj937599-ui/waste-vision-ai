"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileImage,
  Filter,
  Leaf,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Recycle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Scan = {
  id: number;
  name: string;
  category: string;
  confidence: number;
  date: string;
  status: string;
};

type ScanResult = {
  item: string;
  category: string;
  confidence: number;
  recyclable: boolean;
  disposalInstructions: string;
  safetyNote: string;
};

const weeklyData = [
  { day: "Mon", scans: 42, recycled: 28 },
  { day: "Tue", scans: 58, recycled: 41 },
  { day: "Wed", scans: 49, recycled: 35 },
  { day: "Thu", scans: 76, recycled: 57 },
  { day: "Fri", scans: 63, recycled: 45 },
  { day: "Sat", scans: 91, recycled: 69 },
  { day: "Sun", scans: 72, recycled: 55 },
];

const initialScans: Scan[] = [
  {
    id: 1,
    name: "Plastic bottle",
    category: "Plastic",
    confidence: 98,
    date: "Just now",
    status: "Recyclable",
  },
  {
    id: 2,
    name: "Cardboard box",
    category: "Paper",
    confidence: 96,
    date: "12 min ago",
    status: "Recyclable",
  },
  {
    id: 3,
    name: "Food scraps",
    category: "Organic",
    confidence: 94,
    date: "28 min ago",
    status: "Compost",
  },
  {
    id: 4,
    name: "Aluminium can",
    category: "Metal",
    confidence: 99,
    date: "41 min ago",
    status: "Recyclable",
  },
  {
    id: 5,
    name: "Used battery",
    category: "E-waste",
    confidence: 97,
    date: "1 hr ago",
    status: "Special disposal",
  },
];

const wasteTypes = [
  { name: "Plastic", value: 35, color: "#34d399" },
  { name: "Paper", value: 25, color: "#60a5fa" },
  { name: "Organic", value: 20, color: "#fbbf24" },
  { name: "Metal", value: 12, color: "#c084fc" },
  { name: "Other", value: 8, color: "#71717a" },
];

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "AI Waste Scanner", icon: Sparkles },
  { label: "Recycling Guide", icon: Recycle },
  { label: "Analytics", icon: BarChart3 },
];

export default function Home() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  const [scans, setScans] = useState(initialScans);
  const [filter, setFilter] = useState("All");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const filteredScans = useMemo(
    () =>
      scans.filter((scan) => {
        const matchesSearch =
          scan.name.toLowerCase().includes(search.toLowerCase()) ||
          scan.category.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
          filter === "All" || scan.category === filter;

        return matchesSearch && matchesFilter;
      }),
    [scans, search, filter]
  );

  function chooseFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file, such as JPG, PNG or WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotice(
        "That image is larger than 10 MB. Please choose a smaller image."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setScanResult(null);
    setNotice("");
  }

  function removeFile() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedFile(null);
    setPreview("");
    setScanResult(null);
    setNotice("");
  }

  async function simulateScan() {
    if (!selectedFile) {
      setNotice("Upload an image first to continue.");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Image classification failed."
        );
      }

      const result = data.result as ScanResult;

      if (
        !result ||
        typeof result.item !== "string" ||
        typeof result.category !== "string" ||
        typeof result.confidence !== "number"
      ) {
        throw new Error("The AI returned an invalid classification.");
      }

      setScanResult(result);

      setScans((previous) => [
        {
          id: Date.now(),
          name: result.item,
          category: result.category,
          confidence: result.confidence,
          date: "Just now",
          status: result.recyclable
            ? "Recyclable"
            : "Special disposal",
        },
        ...previous,
      ]);

      setNotice("Image analysed successfully.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Something went wrong while analysing the image."
      );
    } finally {
      setIsScanning(false);
    }
  }

  const stats = [
    {
      label: "Total scans",
      value: "2,847",
      change: "+12.8%",
      icon: FileImage,
      tone: "emerald",
    },
    {
      label: "Recycling rate",
      value: "78.4%",
      change: "+5.2%",
      icon: Recycle,
      tone: "blue",
    },
    {
      label: "Waste diverted",
      value: "1,284 kg",
      change: "+8.6%",
      icon: Leaf,
      tone: "purple",
    },
    {
      label: "AI accuracy",
      value: "96.8%",
      change: "+2.4%",
      icon: Activity,
      tone: "amber",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b0a] text-zinc-100">
      <div className="flex min-h-screen">
        {mobileMenu && (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileMenu(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-white/[0.07] bg-[#0d100f] transition-transform lg:static lg:translate-x-0 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-[82px] items-center gap-3 border-b border-white/[0.07] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07120b]">
              <Recycle size={23} strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">
                Waste Vision{" "}
                <span className="text-emerald-400">AI</span>
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                For a cleaner future
              </p>
            </div>

            <button
              onClick={() => setMobileMenu(false)}
              className="ml-auto text-zinc-500 lg:hidden"
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>

          <div className="px-4 pt-7">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActivePage(item.label);
                      setMobileMenu(false);
                      setNotice("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] transition ${
                      active
                        ? "bg-emerald-400/[0.12] font-semibold text-emerald-300 ring-1 ring-emerald-400/[0.12]"
                        : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}

                    {item.label === "AI Waste Scanner" && (
                      <span className="ml-auto rounded-md bg-emerald-400/10 px-1.5 py-1 text-[9px] text-emerald-300">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mx-4 mt-8 rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.09] to-transparent p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <Waves size={19} />
            </div>

            <p className="text-sm font-semibold">
              A cleaner planet starts here.
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Smarter sorting. Less landfill. A better tomorrow.
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full w-[78%] rounded-full bg-emerald-400" />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
              <span>Demo recycling goal</span>
              <span>78%</span>
            </div>
          </div>

          <div className="mt-auto border-t border-white/[0.07] p-4">
            <button
              onClick={() =>
                setNotice(
                  "Settings will be available when account and storage features are connected."
                )
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
            >
              <Settings size={17} />
              Settings
            </button>

            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.025] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-teal-700 text-sm font-bold text-black">
                WV
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-200">
                  Waste Vision Admin
                </p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  Demo workspace
                </p>
              </div>

              <ChevronDown size={15} className="text-zinc-600" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#090b0a]/90 px-5 backdrop-blur-xl sm:px-8 xl:px-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenu(true)}
                className="text-zinc-400 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-[11px] text-zinc-600">
                  Workspace <span className="mx-1.5">/</span>{" "}
                  <span className="text-zinc-300">{activePage}</span>
                </p>
                <h1 className="mt-1 text-sm font-semibold tracking-tight sm:text-base">
                  {activePage}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-zinc-500 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                System online
              </div>

              <button
                onClick={() =>
                  setNotice(
                    "You are all caught up. Notifications will be connected in a future version."
                  )
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-400 hover:bg-white/[0.05]"
                aria-label="Notifications"
              >
                <Bell size={17} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>

              <div className="hidden h-8 w-px bg-white/[0.08] sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium">Good to see you</p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  Your sustainability hub
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 sm:p-8 xl:p-10">
            {notice && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-sm text-emerald-200">
                <Lightbulb size={18} className="mt-0.5 shrink-0" />

                <p className="flex-1 leading-6">{notice}</p>

                <button
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {activePage === "Overview" && (
              <>
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      <Sparkles size={13} />
                      Intelligent waste management
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Your impact,{" "}
                      <span className="text-zinc-500">at a glance.</span>
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                      Monitor waste identification, recycling performance and
                      your journey towards a cleaner environment.
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePage("AI Waste Scanner")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-xs font-bold text-[#07120b] transition hover:bg-emerald-300"
                  >
                    <Sparkles size={15} />
                    Scan new waste
                    <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="group rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 transition hover:border-white/[0.13]"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              stat.tone === "emerald"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : stat.tone === "blue"
                                  ? "bg-blue-400/10 text-blue-300"
                                  : stat.tone === "purple"
                                    ? "bg-purple-400/10 text-purple-300"
                                    : "bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            <Icon size={19} />
                          </div>

                          <span className="flex items-center gap-1 rounded-md bg-emerald-400/[0.08] px-2 py-1 text-[10px] font-semibold text-emerald-300">
                            <TrendingUp size={11} />
                            {stat.change}
                          </span>
                        </div>

                        <p className="mt-5 text-[11px] text-zinc-500">
                          {stat.label}
                        </p>

                        <div className="mt-1 flex items-end justify-between">
                          <p className="text-2xl font-semibold tracking-tight">
                            {stat.value}
                          </p>
                          <span className="pb-1 text-[10px] text-zinc-600">
                            Demo data
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-7 grid grid-cols-1 gap-5 2xl:grid-cols-[1.65fr_1fr]">
                  <section className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 sm:p-6">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Waste processing activity
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-600">
                          Illustrative scans and recycled items this week
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Scans
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          Recycled
                        </span>
                      </div>
                    </div>

                    <div className="h-[245px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={weeklyData}
                          margin={{ top: 8, right: 4, left: -22, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="scanFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#34d399"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="95%"
                                stopColor="#34d399"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            <linearGradient
                              id="recycleFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#60a5fa"
                                stopOpacity={0.15}
                              />
                              <stop
                                offset="95%"
                                stopColor="#60a5fa"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="rgba(255,255,255,0.05)"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            tick={{ fill: "#71717a", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />

                          <YAxis
                            tick={{ fill: "#71717a", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            contentStyle={{
                              background: "#171b19",
                              border: "1px solid #303632",
                              borderRadius: 12,
                              fontSize: 12,
                            }}
                            labelStyle={{ color: "#a1a1aa" }}
                          />

                          <Area
                            type="monotone"
                            dataKey="scans"
                            stroke="#34d399"
                            strokeWidth={2}
                            fill="url(#scanFill)"
                          />

                          <Area
                            type="monotone"
                            dataKey="recycled"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            fill="url(#recycleFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Waste composition
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-600">
                          Illustrative category breakdown
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePage("Analytics")}
                        className="text-zinc-500 hover:text-emerald-300"
                        aria-label="Open analytics"
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    </div>

                    <div className="relative mx-auto mt-2 h-[190px] max-w-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={wasteTypes}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={62}
                            outerRadius={83}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {wasteTypes.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            contentStyle={{
                              background: "#171b19",
                              border: "1px solid #303632",
                              borderRadius: 10,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold">100%</span>
                        <span className="mt-1 text-[10px] text-zinc-500">
                          Total waste
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-3">
                      {wasteTypes.map((type) => (
                        <div
                          key={type.name}
                          className="flex items-center gap-2.5"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="flex-1 text-xs text-zinc-400">
                            {type.name}
                          </span>
                          <span className="text-xs font-medium text-zinc-300">
                            {type.value}%
                          </span>
                          <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${type.value}%`,
                                backgroundColor: type.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0e1110]">
                  <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <h3 className="text-sm font-semibold">
                        Recent waste scans
                      </h3>
                      <p className="mt-1.5 text-xs text-zinc-600">
                        Example records and your recent AI scans
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                        />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search scans..."
                          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.025] py-2 pl-9 pr-3 text-xs outline-none placeholder:text-zinc-600 focus:border-emerald-400/40 sm:w-44"
                        />
                      </div>

                      <div className="relative flex items-center rounded-lg border border-white/[0.08] bg-white/[0.025] pl-2.5">
                        <Filter size={13} className="text-zinc-500" />

                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="max-w-[130px] bg-transparent px-2 py-2 text-xs text-zinc-300 outline-none"
                        >
                          {[
                            "All",
                            "Plastic",
                            "Paper",
                            "Organic",
                            "Metal",
                            "E-waste",
                            "Recyclable",
                            "Hazardous",
                            "General Waste",
                          ].map((option) => (
                            <option
                              key={option}
                              value={option}
                              className="bg-[#111513]"
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead>
                        <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-zinc-600">
                          <th className="px-6 py-3 font-medium">Waste item</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Confidence</th>
                          <th className="px-4 py-3 font-medium">Recommendation</th>
                          <th className="px-6 py-3 text-right font-medium">
                            Scanned
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredScans.map((scan) => (
                          <tr
                            key={scan.id}
                            className="border-b border-white/[0.035] last:border-0 hover:bg-white/[0.015]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400">
                                  <FileImage size={16} />
                                </div>
                                <span className="text-xs font-medium text-zinc-200">
                                  {scan.name}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-zinc-400">
                                {scan.category}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.08]">
                                  <div
                                    className="h-full rounded-full bg-emerald-400"
                                    style={{
                                      width: `${scan.confidence}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[11px] text-zinc-400">
                                  {scan.confidence}%
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                                <CheckCircle2 size={13} />
                                {scan.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right text-[11px] text-zinc-600">
                              {scan.date}
                            </td>
                          </tr>
                        ))}

                        {filteredScans.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-10 text-center text-sm text-zinc-500"
                            >
                              No matching scans found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.05] px-6 py-3 text-[10px] text-zinc-600">
                    <span>Showing {filteredScans.length} records</span>
                    <span>Demo metrics · Recent scans stored in this session</span>
                  </div>
                </section>
              </>
            )}

            {activePage === "AI Waste Scanner" && (
              <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    <Sparkles size={13} />
                    Image intelligence
                  </div>

                  <h2 className="text-2xl font-semibold sm:text-3xl">
                    Identify. Sort.{" "}
                    <span className="text-zinc-500">Make an impact.</span>
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Upload a picture of an item to identify its likely waste
                    category and receive practical disposal guidance.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
                  <section className="rounded-2xl border border-white/[0.08] bg-[#0e1110] p-5 sm:p-7">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Upload waste image
                      </h3>
                      <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[10px] text-zinc-500">
                        Max 10 MB
                      </span>
                    </div>

                    <label className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-emerald-400/25 bg-emerald-400/[0.025] p-5 text-center transition hover:border-emerald-400/50">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Selected waste preview"
                          className="max-h-[300px] max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <>
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                            <CloudUpload size={26} />
                          </div>

                          <p className="text-sm font-semibold">
                            Drop your image here
                          </p>
                          <p className="mt-2 text-xs text-zinc-500">
                            or click to browse files
                          </p>

                          <div className="mt-5 flex gap-2 text-[10px] text-zinc-600">
                            <span className="rounded-md border border-white/[0.07] px-2 py-1">
                              JPG
                            </span>
                            <span className="rounded-md border border-white/[0.07] px-2 py-1">
                              PNG
                            </span>
                            <span className="rounded-md border border-white/[0.07] px-2 py-1">
                              WEBP
                            </span>
                          </div>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isScanning}
                        onChange={(e) =>
                          chooseFile(e.target.files?.[0])
                        }
                      />
                    </label>

                    {selectedFile && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.07] p-3">
                        <FileImage
                          size={18}
                          className="text-emerald-300"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          onClick={removeFile}
                          disabled={isScanning}
                          className="text-zinc-500 hover:text-red-300 disabled:opacity-50"
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={simulateScan}
                      disabled={isScanning}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-xs font-bold text-[#07120b] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Sparkles size={15} />
                      {isScanning
                        ? "Analysing image..."
                        : "Analyse image"}
                      {!isScanning && <ArrowUpRight size={15} />}
                    </button>

                    <p className="mt-3 text-center text-[10px] leading-5 text-zinc-600">
                      Your selected image is sent to the configured AI
                      service for classification when you click Analyse.
                    </p>
                  </section>

                  <div className="space-y-5">
                    <section className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                        <ShieldCheck size={20} />
                      </div>

                      <h3 className="text-sm font-semibold">
                        Responsible sorting
                      </h3>
                      <p className="mt-2 text-xs leading-6 text-zinc-500">
                        Follow local recycling rules. Items contaminated with
                        food or chemicals may require different handling than
                        clean materials.
                      </p>
                    </section>

                    <section className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5">
                      <h3 className="text-sm font-semibold">
                        How it works
                      </h3>

                      <div className="mt-5 space-y-4">
                        {[
                          {
                            n: "01",
                            t: "Upload an image",
                            d: "Choose a clear photo of one item.",
                          },
                          {
                            n: "02",
                            t: "AI classification",
                            d: "The vision model predicts a waste category.",
                          },
                          {
                            n: "03",
                            t: "Get guidance",
                            d: "Review the disposal and recycling advice.",
                          },
                        ].map((step) => (
                          <div key={step.n} className="flex gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-semibold text-emerald-300">
                              {step.n}
                            </span>

                            <div>
                              <p className="text-xs font-medium">
                                {step.t}
                              </p>
                              <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                {step.d}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="flex gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] p-4 text-xs leading-5 text-zinc-500">
                      <Lightbulb
                        size={16}
                        className="shrink-0 text-amber-300"
                      />
                      <p>
                        Batteries, electronics and hazardous waste should be
                        taken to an appropriate collection point. Never put
                        these in ordinary recycling bins.
                      </p>
                    </div>
                  </div>
                </div>

                {scanResult && (
                  <section className="mt-5 rounded-2xl border border-emerald-400/20 bg-[#0e1110] p-5 sm:p-7">
                    <div className="mb-5 flex items-center gap-2">
                      <CheckCircle2
                        size={19}
                        className="text-emerald-300"
                      />
                      <h3 className="text-sm font-semibold">
                        AI Classification Result
                      </h3>
                    </div>

                    <p className="text-xl font-semibold">
                      {scanResult.item}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white/[0.03] p-3">
                        <p className="text-[10px] text-zinc-500">
                          Category
                        </p>
                        <p className="mt-1 text-sm text-emerald-300">
                          {scanResult.category}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] p-3">
                        <p className="text-[10px] text-zinc-500">
                          Estimated confidence
                        </p>
                        <p className="mt-1 text-sm">
                          {scanResult.confidence}%
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] p-3">
                        <p className="text-[10px] text-zinc-500">
                          Recyclability
                        </p>
                        <p className="mt-1 text-sm">
                          {scanResult.recyclable
                            ? "Potentially recyclable"
                            : "Not identified as recyclable"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold">
                        Disposal instructions
                      </p>
                      <p className="mt-2 text-xs leading-6 text-zinc-400">
                        {scanResult.disposalInstructions}
                      </p>
                    </div>

                    {scanResult.safetyNote &&
                      scanResult.safetyNote.toLowerCase() !== "none" && (
                        <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3">
                          <p className="text-xs font-semibold text-amber-300">
                            Safety note
                          </p>
                          <p className="mt-2 text-xs leading-5 text-zinc-400">
                            {scanResult.safetyNote}
                          </p>
                        </div>
                      )}
                  </section>
                )}
              </div>
            )}

            {activePage === "Recycling Guide" && (
              <div>
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    <Leaf size={13} />
                    Sustainable choices
                  </div>

                  <h2 className="text-2xl font-semibold sm:text-3xl">
                    Recycle with{" "}
                    <span className="text-zinc-500">confidence.</span>
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    A quick guide to common waste categories. Local collection
                    rules vary, so verify requirements with your municipality
                    or waste collector.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      name: "Plastic",
                      icon: "♻",
                      color: "emerald",
                      items: [
                        "Empty bottles and containers",
                        "Check resin and local acceptance",
                        "Rinse off food residue",
                      ],
                      avoid:
                        "Plastic bags and multilayer wrappers may need special collection.",
                    },
                    {
                      name: "Paper & cardboard",
                      icon: "▤",
                      color: "blue",
                      items: [
                        "Clean cardboard boxes",
                        "Newspapers and office paper",
                        "Flatten boxes to save space",
                      ],
                      avoid:
                        "Keep paper dry; greasy or food-soiled paper may not be recyclable.",
                    },
                    {
                      name: "Organic waste",
                      icon: "✳",
                      color: "amber",
                      items: [
                        "Fruit and vegetable scraps",
                        "Coffee grounds and tea leaves",
                        "Suitable garden trimmings",
                      ],
                      avoid:
                        "Meat, dairy and oils depend on the composting system.",
                    },
                    {
                      name: "Metal",
                      icon: "◈",
                      color: "purple",
                      items: [
                        "Empty aluminium drink cans",
                        "Steel food cans",
                        "Rinse containers where practical",
                      ],
                      avoid:
                        "Sharp or contaminated metal needs careful handling.",
                    },
                    {
                      name: "Electronic waste",
                      icon: "⌁",
                      color: "rose",
                      items: [
                        "Phones and small electronics",
                        "Chargers and cables",
                        "Use authorised e-waste collection",
                      ],
                      avoid:
                        "Never put electronics or batteries in general waste or burn them.",
                    },
                    {
                      name: "Glass",
                      icon: "◇",
                      color: "cyan",
                      items: [
                        "Accepted glass bottles and jars",
                        "Separate by local collection rules",
                        "Rinse containers if required",
                      ],
                      avoid:
                        "Broken glass, mirrors, bulbs and ceramics may require separate handling.",
                    },
                  ].map((item) => (
                    <section
                      key={item.name}
                      className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 transition hover:border-white/[0.13]"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                            item.color === "emerald"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : item.color === "blue"
                                ? "bg-blue-400/10 text-blue-300"
                                : item.color === "amber"
                                  ? "bg-amber-400/10 text-amber-300"
                                  : item.color === "purple"
                                    ? "bg-purple-400/10 text-purple-300"
                                    : item.color === "rose"
                                      ? "bg-rose-400/10 text-rose-300"
                                      : "bg-cyan-400/10 text-cyan-300"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <span className="rounded-md border border-white/[0.07] px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-600">
                          Quick guide
                        </span>
                      </div>

                      <h3 className="mt-5 text-base font-semibold">
                        {item.name}
                      </h3>

                      <ul className="mt-4 space-y-3">
                        {item.items.map((line) => (
                          <li
                            key={line}
                            className="flex gap-2 text-xs leading-5 text-zinc-400"
                          >
                            <CheckCircle2
                              size={14}
                              className="mt-0.5 shrink-0 text-emerald-400"
                            />
                            {line}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 rounded-xl bg-white/[0.025] p-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Important
                        </p>
                        <p className="text-[11px] leading-5 text-zinc-500">
                          {item.avoid}
                        </p>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {activePage === "Analytics" && (
              <>
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                    <BarChart3 size={13} />
                    Performance insights
                  </div>

                  <h2 className="text-2xl font-semibold sm:text-3xl">
                    Data for a{" "}
                    <span className="text-zinc-500">greener tomorrow.</span>
                  </h2>

                  <p className="mt-3 text-sm text-zinc-500">
                    Explore sample trends and waste-category distribution.
                  </p>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Items scanned",
                      value: "2,847",
                      sub: "Illustrative total",
                    },
                    {
                      label: "Items recycled",
                      value: "2,231",
                      sub: "Illustrative total",
                    },
                    {
                      label: "Diversion rate",
                      value: "78.4%",
                      sub: "Illustrative estimate",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5"
                    >
                      <p className="text-xs text-zinc-500">{s.label}</p>
                      <p className="mt-3 text-3xl font-semibold">
                        {s.value}
                      </p>
                      <p className="mt-2 text-[10px] text-zinc-600">
                        {s.sub}
                      </p>
                    </div>
                  ))}
                </div>

                <section className="mb-6 rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 sm:p-7">
                  <h3 className="text-sm font-semibold">Weekly activity</h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    Sample scans and recycling activity
                  </p>

                  <div className="mt-6 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={weeklyData}
                        margin={{
                          top: 8,
                          right: 8,
                          left: -18,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="day"
                          tick={{ fill: "#71717a", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fill: "#71717a", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#171b19",
                            border: "1px solid #303632",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="scans"
                          stroke="#34d399"
                          strokeWidth={2}
                          fill="#34d399"
                          fillOpacity={0.08}
                        />

                        <Area
                          type="monotone"
                          dataKey="recycled"
                          stroke="#60a5fa"
                          strokeWidth={2}
                          fill="#60a5fa"
                          fillOpacity={0.06}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/[0.07] bg-[#0e1110] p-5 sm:p-7">
                  <h3 className="text-sm font-semibold">
                    Category distribution
                  </h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    Example share by waste type
                  </p>

                  <div className="mt-6 space-y-5">
                    {wasteTypes.map((type) => (
                      <div key={type.name}>
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-zinc-400">
                            {type.name}
                          </span>
                          <span className="text-zinc-300">
                            {type.value}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${type.value}%`,
                              backgroundColor: type.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-[10px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Waste Vision AI. Built for a cleaner future.</p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Frontend prototype
                <span className="mx-1">·</span>
                Demo metrics, not live data
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}