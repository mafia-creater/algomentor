// seed.ts

import { PrismaClient, Difficulty } from '@prisma/client';

// Initialize the Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up the database...');
  await prisma.problem.deleteMany({});
  console.log('✅ Database cleaned.');

  console.log('🚀 Start seeding...');

  // An array of problem data that conforms to the new schema
  const problemsToSeed = [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: Difficulty.EASY,
      tags: ['Array', 'Hash Table'],
      functionName: 'twoSum',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ],
      hints: [
        'Try using a hash map to store each number and its index.',
        'For each number, check if its complement (target - number) exists in the hash map.',
      ],
      defaultTestCases: [
        {
          input: '[2,7,11,15]\n9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: '[3,2,4]\n6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        },
      ],
      hiddenTestCases: [
        {
          input: '[3,3]\n6',
          output: '[0,1]',
        },
        {
          input: '[-1,-2,-3,-4,-5]\n-8',
          output: '[2,4]',
        },
      ],
      codeScaffold: {
        python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
        javascript: `function twoSum(nums, target) {
    // Write your solution here
};`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
      },
    },
    {
      title: 'Valid Parentheses',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.',
      difficulty: Difficulty.EASY,
      tags: ['String', 'Stack'],
      functionName: 'isValid',
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only \'()[]{}\'.',
      ],
      hints: [
        'A stack is a perfect data structure for this problem.',
        'When you see an opening bracket, push it onto the stack.',
        'When you see a closing bracket, check if the top of the stack is the corresponding opening bracket. If it is, pop from the stack. If not, the string is invalid.',
      ],
      defaultTestCases: [
        {
          input: '"()[]{}"',
          output: 'true',
        },
        {
          input: '"([)]"',
          output: 'false',
        },
      ],
      hiddenTestCases: [
        {
          input: '"{[]}"',
          output: 'true',
        },
        {
          input: '"["',
          output: 'false',
        },
      ],
      codeScaffold: {
        python: `def isValid(s):
    # Write your solution here
    pass`,
        javascript: `function isValid(s) {
    // Write your solution here
};`,
        java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`,
      },
    },
    {
      title: 'Merge k Sorted Lists',
      description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
      difficulty: Difficulty.HARD,
      tags: ['Linked List', 'Heap', 'Divide and Conquer'],
      functionName: 'mergeKLists',
      constraints: [
        'k == lists.length',
        '0 <= k <= 10^4',
        '0 <= lists[i].length <= 500',
        'lists[i] is sorted in ascending order.',
      ],
      hints: [
        'A min-heap (or priority queue) can be used to efficiently find the smallest element among all list heads.',
        'Another approach is to merge lists two by two, which resembles the logic of merge sort.',
      ],
      defaultTestCases: [
        {
          // The runner environment would parse these strings into linked lists
          input: '[[1,4,5],[1,3,4],[2,6]]',
          output: '[1,1,2,3,4,4,5,6]',
        },
      ],
      hiddenTestCases: [
        {
          input: '[]',
          output: '[]',
        },
        {
          input: '[[]]',
          output: '[]',
        },
      ],
      codeScaffold: {
        python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
def mergeKLists(lists):
    # Write your solution here
    pass`,
        javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 * this.val = (val===undefined ? 0 : val)
 * this.next = (next===undefined ? null : next)
 * }
 */
function mergeKLists(lists) {
    // Write your solution here
};`,
      },
    },
  ];

  // Insert problems into the database
  for (const p of problemsToSeed) {
    // Combine default and hidden test cases for the allTestCases field
    const allTestCases = [
      ...(p.defaultTestCases || []),
      ...(p.hiddenTestCases || []),
    ];

    await prisma.problem.create({
      data: {
        ...p,
        allTestCases: allTestCases, // Add the combined list
      },
    });
  }

  console.log(`✅ Seeding finished. Added ${problemsToSeed.length} problems.`);
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the database connection
    console.log('👋 Disconnecting Prisma Client...');
    await prisma.$disconnect();
  });