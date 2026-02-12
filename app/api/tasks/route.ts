import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 🟢 GET all tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET TASK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 CREATE task
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body?.text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? "",
        },
      });
    }

    const task = await prisma.task.create({
  data: {
    text: body.text,
    completed: false,
    category: body.category ?? null,  // 👈 NEW
    userId: user.id,
  },
});

    return NextResponse.json(task);
  } catch (err) {
    console.error("POST TASK ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 🟢 UPDATE task
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.task.update({
      where: { id: body.id },
      data: { completed: body.completed },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH TASK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 DELETE task
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await prisma.task.delete({
      where: { id: body.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE TASK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
