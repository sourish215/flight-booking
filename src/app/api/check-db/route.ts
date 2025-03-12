import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check if flights table exists
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying flights table:', error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Successfully connected to flights table',
      data,
      tableExists: true
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
