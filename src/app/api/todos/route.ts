import { NextResponse } from 'next/server';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const allTodos = db.select().from(todos).all();
  return NextResponse.json(allTodos);
}

export async function POST(request: Request) {
  const { content } = await request.json();
  db.insert(todos).values({ content }).run();
  // Fetch and return the newly created todo
  const newTodo = db.select().from(todos).where(sql`id = last_insert_rowid()`).get();
  return NextResponse.json(newTodo);
}

export async function PUT(request: Request) {
  const { id, completed } = await request.json();
  const updatedTodo = db.update(todos)
    .set({ completed })
    .where(sql`id = ${id}`)
    .run();
  return NextResponse.json(updatedTodo);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  db.delete(todos).where(sql`id = ${id}`).run();
  return NextResponse.json({ success: true });
}