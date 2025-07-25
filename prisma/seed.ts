import { PrismaClient, Difficulty } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create sample problems
    const problems = [
        {
            title: 'Two Sum',
            description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
            difficulty: Difficulty.EASY,
            tags: ['array', 'hash-table'],
            defaultTestCases: [
                { input: "2 7 11 15\n9", output: "[0,1]" },
                { input: "3 2 4\n6", output: "[1,2]" }
            ],
            codeScaffold: {
                python: "def two_sum(nums, target):\n  # Write your code here\n  pass",
                javascript: "function twoSum(nums, target) {\n  // Write your code here\n}"
            }
        },
        {
            title: 'Valid Parentheses',
            description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.',
            difficulty: Difficulty.EASY,
            tags: ['string', 'stack'],
        },
        {
            title: 'Merge k Sorted Lists',
            description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
            difficulty: Difficulty.HARD,
            tags: ['linked-list', 'heap', 'divide-and-conquer'],
        },
    ];

    // Insert problems into the database
    for (const p of problems) {
        await prisma.problem.create({
            data: p,
        });
    }

    console.log(`Seeding finished. Added ${problems.length} problems.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Close the database connection
        await prisma.$disconnect();
    });