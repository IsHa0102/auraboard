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
    return <div className="p-10">No data found.</div>;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-200 flex items-center justify-center p-6">
      
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 space-y-10">

        {/* Title */}
        <h1 className="text-4xl font-semibold text-orange-900">
          Your Garden Stats 🌿
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

          <div className="bg-orange-50 rounded-2xl p-6 shadow-md">
            <p className="text-sm text-orange-600">Total Tasks</p>
            <p className="text-3xl font-bold text-orange-800">
              {totalTasks}
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6 shadow-md">
            <p className="text-sm text-orange-600">Completed</p>
            <p className="text-3xl font-bold text-orange-800">
              {completedTasks}
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6 shadow-md">
            <p className="text-sm text-orange-600">Completion Rate</p>
            <p className="text-3xl font-bold text-orange-800">
              {completionRate}%
            </p>
          </div>

        </div>

        {/* Category Section */}
        <div>
          <h2 className="text-lg font-semibold text-orange-900 mb-4">
            By Category
          </h2>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, count]) => (
              <div
                key={cat}
                className="bg-orange-50 rounded-xl px-6 py-4 flex justify-between items-center shadow-sm"
              >
                <span className="text-orange-800 font-medium">
                  {cat}
                </span>
                <span className="text-orange-700/70">
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
