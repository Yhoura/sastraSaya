import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Revalidate all pages that show the stories
    revalidatePath('/');
    revalidatePath('/cerpen');
    revalidatePath('/puisi');
    
    // We also revalidate all dynamic routes for karya just to be safe
    // Note: revalidatePath('/karya/[id]', 'page') is the correct syntax for dynamic segments,
    // but revalidating the layout '/' usually covers it depending on Next.js setup.
    // For now, revalidatePath('/', 'layout') clears everything.
    revalidatePath('/', 'layout');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
