import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.problem.findMany();
  for (const problem of problems) {
    if (problem.totalSubmissions && problem.totalSubmissions > 0) {
      const newRate = problem.acceptedSubmissions / problem.totalSubmissions;
      await prisma.problem.update({
        where: { id: problem.id },
        data: { acceptanceRate: parseFloat(newRate.toFixed(2)) },
      });
      console.log(`Updated problem: ${problem.title}`);
    }
  }
  console.log('All problems updated!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });