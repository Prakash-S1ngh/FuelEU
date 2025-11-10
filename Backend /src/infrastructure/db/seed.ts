import { prisma } from "./prisma";

async function seed() {
    // Clear existing data (respecting relations)
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
    await prisma.route.deleteMany();

    // Create 10 routes
    const routes = [
        { route_id: "R001", year: 2024, ghg_intensity: 91.0, vessel_type: "Container", fuel_type: "HFO", fuel_consumption: 5000, distance: 12000, total_emissions: 4500, is_baseline: false },
        { route_id: "R002", year: 2024, ghg_intensity: 88.0, vessel_type: "BulkCarrier", fuel_type: "LNG", fuel_consumption: 4800, distance: 11500, total_emissions: 4200, is_baseline: false },
        { route_id: "R003", year: 2024, ghg_intensity: 93.5, vessel_type: "Tanker", fuel_type: "MGO", fuel_consumption: 5100, distance: 12500, total_emissions: 4700, is_baseline: false },
        { route_id: "R004", year: 2025, ghg_intensity: 89.2, vessel_type: "RoRo", fuel_type: "HFO", fuel_consumption: 4900, distance: 11800, total_emissions: 4300, is_baseline: false },
        { route_id: "R005", year: 2025, ghg_intensity: 90.5, vessel_type: "Container", fuel_type: "LNG", fuel_consumption: 4950, distance: 11900, total_emissions: 4400, is_baseline: false },
        { route_id: "R006", year: 2024, ghg_intensity: 87.4, vessel_type: "Container", fuel_type: "MGO", fuel_consumption: 4700, distance: 11000, total_emissions: 4100, is_baseline: false },
        { route_id: "R007", year: 2025, ghg_intensity: 92.1, vessel_type: "BulkCarrier", fuel_type: "HFO", fuel_consumption: 5200, distance: 12600, total_emissions: 4800, is_baseline: false },
        { route_id: "R008", year: 2024, ghg_intensity: 86.9, vessel_type: "Tanker", fuel_type: "LNG", fuel_consumption: 4600, distance: 10900, total_emissions: 4000, is_baseline: false },
        { route_id: "R009", year: 2025, ghg_intensity: 94.3, vessel_type: "RoRo", fuel_type: "MGO", fuel_consumption: 5300, distance: 12700, total_emissions: 4900, is_baseline: false },
        { route_id: "R010", year: 2025, ghg_intensity: 89.9, vessel_type: "Container", fuel_type: "HFO", fuel_consumption: 4980, distance: 12100, total_emissions: 4450, is_baseline: false },
    ];

    for (const r of routes) {
        await prisma.route.create({ data: r });
    }

    // Create 10 ship compliance records (one per route)
    const shipCompliance = routes.map((r, i) => ({ ship_id: r.route_id, year: r.year, cb_gco2eq: (i % 3 === 0 ? -500 : 1000) / (i + 1) * 1.0 }));
    for (const sc of shipCompliance) {
        await prisma.shipCompliance.create({ data: sc });
    }

    // Create 10 bank entries (some positive amounts)
    const bankEntries = routes.map((r, i) => ({ ship_id: r.route_id, year: r.year, amount_gco2eq: i % 2 === 0 ? 200 * (i + 1) : 0 }));
    for (const be of bankEntries) {
        if (be.amount_gco2eq > 0) await prisma.bankEntry.create({ data: be });
    }

    // Create 10 pools and one member each (so pool_members = 10)
    for (let i = 0; i < 10; i++) {
        const pool = await prisma.pool.create({ data: { year: 2024 + (i % 2) } });
        await prisma.poolMember.create({ data: { pool_id: pool.id, ship_id: routes[i].route_id, cb_before: shipCompliance[i].cb_gco2eq, cb_after: shipCompliance[i].cb_gco2eq } });
    }

    console.log("Seeding completed.");
}

seed()
    .catch((e) => {
        console.error("Seeding failed:", e);
    })
    .finally(async () => {
        console.log("Closing database connection.");
        await prisma.$disconnect();
    });
