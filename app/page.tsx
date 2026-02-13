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
  const [reflection, setReflection] = useState("Loading...");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load tasks
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

  // Reflection
  useEffect(() => {
    const fetchReflection = async () => {
      setReflection("Loading...");

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

  // Add task
  const addTask = async () => {
    if (!input.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input,
        category,
      }),
    });

    if (!res.ok) return;

    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    setInput("");
  };

  // Toggle
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

  // Delete
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

  // Auth states
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

 if (status !== "authenticated") {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-10 space-y-8">

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            AuraBoard
          </h1>

          <p className="text-sm text-gray-500">
            Sign in to continue
          </p>
        </div>

        <button
          onClick={() => signIn("google")}
          className="
            w-full
            py-3
            rounded-xl
            border border-gray-300
            bg-white
            text-gray-800
            text-sm
            font-medium
            hover:bg-gray-100
            transition
          "
        >
          Continue with Google
        </button>

      </div>

    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">
            AuraBoard
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/profile" className="hover:text-black transition">
              Profile
            </Link>

            <span>{session?.user?.email}</span>

            <button
              onClick={() => signOut()}
              className="hover:text-black transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Reflection */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Reflection
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            {reflection}
          </p>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Refresh
          </button>
        </div>

        {/* Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-medium text-gray-500">
            Tasks
          </h3>

          {totalCount > 0 && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Add */}
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Study">Study</option>
            </select>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add task..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <button
              onClick={addTask}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black transition"
            >
              Add
            </button>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3"
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
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {task.category && <span>{task.category}</span>}

                  <button
                    onClick={() => deleteTask(task)}
                    className="hover:text-gray-900 transition"
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
  );
}
