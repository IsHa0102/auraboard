import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tasks: true },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No data found.
      </div>
    );
  }

  const totalTasks = user.tasks.length;
  const completedTasks = user.tasks.filter((t) => t.completed).length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const categoryStats = user.tasks.reduce((acc: any, task) => {
    const cat = task.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Profile
          </h1>

          <a
            href="/"
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Total Tasks</p>
            <p className="text-3xl font-semibold">{totalTasks}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Completed</p>
            <p className="text-3xl font-semibold">{completedTasks}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">Completion Rate</p>
            <p className="text-3xl font-semibold">{completionRate}%</p>
          </div>

        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-6">
            Tasks by Category
          </h2>

          <div className="space-y-4">
            {Object.entries(categoryStats).map(([cat, count]) => (
              <div
                key={cat}
                className="flex justify-between items-center border-b border-gray-100 pb-2"
              >
                <span className="text-sm text-gray-700">
                  {cat}
                </span>

                <span className="text-sm text-gray-500">
                  {count as number}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
