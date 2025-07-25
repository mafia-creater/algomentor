import { PrismaClient, Difficulty } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create sample problems
    const problems = [
        {
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            difficulty: Difficulty.EASY,
            tags: ["Array", "Hash Table"],
            functionName: "twoSum",
            constraints: [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9",
                "Only one valid answer exists."
            ],
            hints: [
                "Try using a hash map to store the complement of each number.",
                "For each number, check if its complement exists in the hash map."
            ],
            defaultTestCases: [
                {
                    input: "[2,7,11,15]\n9",
                    output: "[0,1]",
                    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
                },
                {
                    input: "[3,2,4]\n6",
                    output: "[1,2]",
                    explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
                }
            ],
            codeScaffold: {
                python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
                javascript: `function twoSum(nums, target) {
    // Write your solution here
}`,
                java: `public int[] twoSum(int[] nums, int target) {
    // Write your solution here
    return new int[0];
}`,
                cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}`
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