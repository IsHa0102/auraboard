"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  category?: string | null;
};

export default function Home() {
  const { data: session, status } = useSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Personal");

  const [mood, setMood] = useState("calm");
  const [reflection, setReflection] = useState("Loading your atmosphere...");
  const [refreshKey, setRefreshKey] = useState(0);

  // 🌿 Load tasks
  useEffect(() => {
    if (status !== "authenticated") return;

    const loadTasks = async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data);
    };

    loadTasks();
  }, [status]);

  // 🌿 Fetch reflection
  useEffect(() => {
    const fetchReflection = async () => {
      setReflection("Composing something soft... ✨");

      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      const data = await res.json();
      setReflection(data.reflection);
    };

    fetchReflection();
  }, [mood, refreshKey]);

  // 🌿 Add task
  const addTask = async () => {
    if (!input.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input,
        category: category,
      }),
    });

    if (!res.ok) return;

    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
  };

  // 🌿 Toggle
  const toggleTask = async (task: Task) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
      }),
    });

    const updated = await res.json();

    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // 🌿 Delete
  const deleteTask = async (task: Task) => {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id }),
    });

    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress =
    totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  const themes: any = {
    calm: "bg-gradient-to-br from-green-100 to-emerald-200 text-green-900",
    focused: "bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-900",
    tired: "bg-gradient-to-br from-purple-100 to-pink-200 text-purple-900",
    motivated: "bg-gradient-to-br from-orange-100 to-yellow-200 text-orange-900",
  };

  // 🔐 Auth states
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-200 via-green-100 to-emerald-300">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center space-y-6">
          <h1 className="text-3xl font-semibold text-emerald-900">
            Welcome to AuraBoard 🌿
          </h1>
          <p className="text-sm text-emerald-700 opacity-80">
            Sign in to continue your garden.
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-8 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition font-medium"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${themes[mood]}`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl p-8 space-y-8">

          {/* Top Bar */}
          <div className="text-right text-sm flex justify-end items-center gap-4">
            <Link href="/profile" className="underline hover:opacity-70">
              Profile
            </Link>
            <span>{session?.user?.email ?? ""}</span>
            <button
              onClick={() => signOut()}
              className="underline hover:opacity-70"
            >
              Sign out
            </button>
          </div>

          <h1 className="text-5xl font-light tracking-wide text-center">
            AuraBoard 🌿
          </h1>

          {/* Mood */}
          <div className="text-center">
            <h2 className="mb-4 text-lg opacity-70">
              Today feels like...
            </h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {["calm", "focused", "tired", "motivated"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-5 py-2 rounded-full shadow-md transition ${
                    mood === m
                      ? "bg-white scale-105"
                      : "bg-white/60 hover:scale-105"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg">
            <h3 className="text-lg mb-3 font-medium">Daily Reflection</h3>
            <p className="leading-relaxed min-h-[80px]">
              {reflection}
            </p>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="mt-4 text-sm opacity-70 hover:opacity-100 transition"
            >
              refresh reflection ✨
            </button>
          </div>

          {/* Tasks */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-lg">
            <h3 className="text-lg mb-4 font-medium">Intentions</h3>

            <div className="text-sm mb-4 opacity-70">
              {totalCount === 0
                ? "No tasks yet."
                : `${completedCount} / ${totalCount} tasks completed`}
            </div>

            {totalCount > 0 && (
              <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-black/40 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Add Section */}
            <div className="flex gap-2 mb-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-5 py-2 rounded-full border border-gray-300 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Study">Study</option>
              </select>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add something meaningful..."
                className="flex-1 px-4 py-2 rounded-full border border-emerald-400 bg-white text-emerald-900 placeholder-emerald-600 focus:outline-none"
              />

              <button
                onClick={addTask}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700 transition"
              >
                Add
              </button>
            </div>

            {/* List */}
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex justify-between items-center bg-white/80 px-4 py-3 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      className="w-4 h-4"
                    />
                    <span
                      className={`text-sm ${
                        task.completed ? "line-through opacity-50" : ""
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {task.category && (
                      <span className="text-xs text-emerald-700/60 font-medium">
                        {task.category}
                      </span>
                    )}

                    <button
                      onClick={() => deleteTask(task)}
                      className="text-sm opacity-40 hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </div>
    </div>
  );
}
