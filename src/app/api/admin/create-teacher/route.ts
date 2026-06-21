import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Check if the service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.' },
        { status: 500 }
      );
    }

    // Create a Supabase admin client to bypass RLS and create users directly
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

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Note: The database trigger 'handle_new_user' will automatically create the profile 
    // in the `teachers` table with the default role (currently 'admin' or 'teacher').
    // So we just need to quickly update the role to ensure it matches what the Admin selected.
    
    if (authData.user) {
      await supabaseAdmin
        .from('teachers')
        .update({ role: role || 'teacher' })
        .eq('auth_id', authData.user.id);
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
