-- Create bookings table
create table if not exists public.bookings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    flight_id uuid references public.flights(id) on delete cascade not null,
    booking_date timestamp with time zone default timezone('utc'::text, now()) not null,
    passenger_count jsonb not null,
    status text check (status in ('confirmed', 'cancelled', 'pending')) default 'pending' not null,
    total_price numeric(10,2) not null,
    passengers jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.bookings enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own bookings" on public.bookings;
drop policy if exists "Users can create their own bookings" on public.bookings;
drop policy if exists "Users can update their own bookings" on public.bookings;

-- Create policies
create policy "Users can view their own bookings"
    on public.bookings for select
    using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can create their own bookings"
    on public.bookings for insert
    with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can update their own bookings"
    on public.bookings for update
    using (auth.role() = 'authenticated' and auth.uid() = user_id);
