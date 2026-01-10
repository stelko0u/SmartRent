import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma"

// GET: Read all offices (optionally filter by companyId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  try {
    const offices = await prisma.office.findMany({
      where: companyId ? { companyId: Number(companyId) } : undefined,
    });
    return NextResponse.json(offices, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch offices' },
      { status: 500 }
    );
  }
}

// POST: Add a new office
export async function POST(req: NextRequest) {
  try {
    const { companyId, name, address, latitude, longitude } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    const office = await prisma.office.create({
      data: {
        companyId: Number(companyId),
        name,
        address,
        latitude,
        longitude,
      },
    });

    return NextResponse.json(office, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create office' },
      { status: 500 }
    );
  }
}
