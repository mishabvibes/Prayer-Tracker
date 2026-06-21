import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get('id');

    if (!authId) {
      return NextResponse.json({ error: 'Missing teacher ID.' }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not set.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Delete user from Auth (this also cascades to public.teachers because of our DB foreign keys usually,
    // wait, we didn't specify CASCADE for auth.users to public.teachers, but we can just delete from public.teachers first)
    
    await supabaseAdmin.from('teachers').delete().eq('auth_id', authId);
    
    // 2. Delete Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authId);
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
