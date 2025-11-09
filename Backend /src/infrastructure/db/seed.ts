import { PrismaClient } from "@prisma/client/extension";
import { prisma } from "./prisma";

async function seed(){
    const routes =[
        { route_id: "R1", year: 2025, ghg_intensity: 100.0, is_baseline: true },
        { route_id: "R2", year: 2025, ghg_intensity: 95.5, is_baseline: false },
        { route_id: "R3", year: 2025, ghg_intensity: 89.2, is_baseline: false },
        { route_id: "R4", year: 2025, ghg_intensity: 92.0, is_baseline: false },
        { route_id: "R5", year: 2025, ghg_intensity: 90.3, is_baseline: false }
    ]
    for(const route of routes){
        await prisma.route.create({
            data: route
        })
    }
    console.log("Seeding completed.");
}
seed().catch((e) => {
    console.error("Seeding failed:", e);
}).finally(async () => {
    console.log("Closing database connection.");
    await prisma.$disconnect();
})
