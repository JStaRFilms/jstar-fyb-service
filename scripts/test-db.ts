import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Connecting to DB...');
    try {
        await prisma.$connect();
        console.log('Connected to DB successfully.');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);
    } catch (e) {
        console.error('DB Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
