// Receives property.listed webhooks from the Lovable CRM and upserts them into
// `properties`. The CRM's field names differ from our columns, so every field is
// mapped explicitly below — a key that is missing here is silently dropped, which
// is how `availability` went missing for a week. Add new CRM fields HERE.
//
// Deployed at: https://<project>.supabase.co/functions/v1/smart-endpoint
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'content-type, authorization' }
    });
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON', detail: String(e) }), { status: 400 });
  }

  if (body.event !== 'property.listed') {
    return new Response(JSON.stringify({ skipped: true, event: body.event }), { status: 200 });
  }

  const { property, agent } = body;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { error } = await supabase.from('properties').upsert({
    id:            property.reference_number,
    title:         property.title,
    description:   property.description,
    location:      property.location,
    price:         property.price,
    sqm:           property.size,
    beds:          property.bedrooms,
    baths:         property.bathrooms,
    parking:       property.parking,
    type:          property.property_type,
    purpose:       property.listing_type,
    images:        property.images   ?? [],
    amenities:     property.amenities ?? [],
    tags:          property.tags      ?? [],
    featured:      property.featured  ?? false,
    listed:        property.listed    ?? true,
    // Drives the sold/rented banners on the site. Only written when the CRM
    // actually sends the key: an explicit null still clears it (un-selling a
    // property), but a payload that omits it leaves the current status alone
    // rather than silently un-selling everything.
    ...(property.availability !== undefined && { availability: property.availability }),
    agent_name:    agent?.full_name    ?? '',
    agent_company: agent?.company_name ?? '',
    agent_phone:   agent?.phone        ?? '',
    agent_logo:    agent?.logo_url     ?? '',
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) {
    console.error('Upsert error:', JSON.stringify(error));
    return new Response(JSON.stringify({ error: error.message, detail: error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, id: property.reference_number }), { status: 200 });
});
