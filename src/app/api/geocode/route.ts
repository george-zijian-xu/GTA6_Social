import { NextRequest, NextResponse } from "next/server";

// Florida bounding box
const FL_VIEWBOX = "-87.6349,31.0028,-79.9707,25.0203";

export interface GeocodeResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("viewbox", FL_VIEWBOX);
  url.searchParams.set("bounded", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "GTA-Social/1.0 (https://gta-social.com)" },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json([], { status: 200 });
  }

  const raw: Array<{ display_name: string; lat: string; lon: string }> =
    await res.json();

  const results: GeocodeResult[] = raw.map((r) => {
    const name = r.display_name.split(",")[0].trim();
    return {
      name,
      address: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    };
  });

  return NextResponse.json(results);
}
