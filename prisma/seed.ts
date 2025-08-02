import { PrismaClient, Difficulty } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NeetCode Array problems...');

  const arrayProblems = [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
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
        'Use a hash map to store each number and its index.',
        'For each number, check if its complement (target - number) exists in the hash map.',
      ],
      defaultTestCases: [
        { input: '[2,7,11,15]\n9', output: '[0,1]' },
        { input: '[3,2,4]\n6', output: '[1,2]' },
      ],
      hiddenTestCases: [
        { input: '[3,3]\n6', output: '[0,1]' },
        { input: '[1,2,3,4,5]\n9', output: '[3,4]' },
        { input: '[-1,-2,-3,-4,-5]\n-8', output: '[2,4]' },
      ],
      codeScaffold: {
        python: `def twoSum(nums, target):\n    # Write your solution here\n    pass`,
        javascript: `function twoSum(nums, target) {\n    // Write your solution here\n}`,
        java: `public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[0];\n}`,
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}`,
      },
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      difficulty: Difficulty.EASY,
      tags: ['Array', 'Dynamic Programming'],
      functionName: 'maxProfit',
      constraints: [
        '1 <= prices.length <= 10^5',
        '0 <= prices[i] <= 10^4',
      ],
      hints: [
        'Keep track of the minimum price seen so far.',
        'For each price, calculate the profit if we sell at this price.',
        'Update the maximum profit as you iterate through the array.',
      ],
      defaultTestCases: [
        { input: '[7,1,5,3,6,4]', output: '5' },
        { input: '[7,6,4,3,1]', output: '0' },
      ],
      hiddenTestCases: [
        { input: '[1]', output: '0' },
        { input: '[1,2]', output: '1' },
        { input: '[2,1,2,1,0,1,2]', output: '2' },
      ],
      codeScaffold: {
        python: `def maxProfit(prices):\n    # Write your solution here\n    pass`,
        javascript: `function maxProfit(prices) {\n    // Write your solution here\n}`,
        java: `public int maxProfit(int[] prices) {\n    // Write your solution here\n    return 0;\n}`,
        cpp: `int maxProfit(vector<int>& prices) {\n    // Write your solution here\n    return 0;\n}`,
      },
    },
    {
      title: 'Contains Duplicate',
      description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
      difficulty: Difficulty.EASY,
      tags: ['Array', 'Hash Table', 'Sorting'],
      functionName: 'containsDuplicate',
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^9 <= nums[i] <= 10^9',
      ],
      hints: [
        'Use a hash set to keep track of seen numbers.',
        'If a number is already in the set, return true.',
        'Alternative: Sort the array and check adjacent elements.',
      ],
      defaultTestCases: [
        { input: '[1,2,3,1]', output: 'true' },
        { input: '[1,2,3,4]', output: 'false' },
        { input: '[1,1,1,3,3,4,3,2,4,2]', output: 'true' },
      ],
      hiddenTestCases: [
        { input: '[1]', output: 'false' },
        { input: '[1,2]', output: 'false' },
        { input: '[1,1]', output: 'true' },
      ],
      codeScaffold: {
        python: `def containsDuplicate(nums):\n    # Write your solution here\n    pass`,
        javascript: `function containsDuplicate(nums) {\n    // Write your solution here\n}`,
        java: `public boolean containsDuplicate(int[] nums) {\n    // Write your solution here\n    return false;\n}`,
        cpp: `bool containsDuplicate(vector<int>& nums) {\n    // Write your solution here\n    return false;\n}`,
      },
    },
    {
      title: 'Product of Array Except Self',
      description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Prefix Sum'],
      functionName: 'productExceptSelf',
      constraints: [
        '2 <= nums.length <= 10^5',
        '-30 <= nums[i] <= 30',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
      ],
      hints: [
        'Think about using left and right products.',
        'First pass: calculate products of all elements to the left.',
        'Second pass: multiply by products of all elements to the right.',
        'Can you do it with O(1) extra space (not counting the output array)?',
      ],
      defaultTestCases: [
        { input: '[1,2,3,4]', output: '[24,12,8,6]' },
        { input: '[-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
      ],
      hiddenTestCases: [
        { input: '[2,3]', output: '[3,2]' },
        { input: '[1,0]', output: '[0,1]' },
        { input: '[0,0]', output: '[0,0]' },
      ],
      codeScaffold: {
        python: `def productExceptSelf(nums):\n    # Write your solution here\n    pass`,
        javascript: `function productExceptSelf(nums) {\n    // Write your solution here\n}`,
        java: `public int[] productExceptSelf(int[] nums) {\n    // Write your solution here\n    return new int[0];\n}`,
        cpp: `vector<int> productExceptSelf(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}`,
      },
    },
    {
      title: 'Maximum Subarray',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
      functionName: 'maxSubArray',
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4',
      ],
      hints: [
        'Use Kadane\'s algorithm.',
        'Keep track of the maximum sum ending at the current position.',
        'At each step, decide whether to extend the existing subarray or start a new one.',
      ],
      defaultTestCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
        { input: '[1]', output: '1' },
        { input: '[5,4,-1,7,8]', output: '23' },
      ],
      hiddenTestCases: [
        { input: '[-1]', output: '-1' },
        { input: '[-2,-1]', output: '-1' },
        { input: '[1,2,3,4,5]', output: '15' },
      ],
      codeScaffold: {
        python: `def maxSubArray(nums):\n    # Write your solution here\n    pass`,
        javascript: `function maxSubArray(nums) {\n    // Write your solution here\n}`,
        java: `public int maxSubArray(int[] nums) {\n    // Write your solution here\n    return 0;\n}`,
        cpp: `int maxSubArray(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}`,
      },
    },
    {
      title: 'Maximum Product Subarray',
      description: 'Given an integer array nums, find a subarray that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Dynamic Programming'],
      functionName: 'maxProduct',
      constraints: [
        '1 <= nums.length <= 2 * 10^4',
        '-10 <= nums[i] <= 10',
        'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
      ],
      hints: [
        'Keep track of both maximum and minimum products ending at current position.',
        'A negative number can turn the minimum into maximum.',
        'Handle the case where the current number is negative.',
      ],
      defaultTestCases: [
        { input: '[2,3,-2,4]', output: '6' },
        { input: '[-2,0,-1]', output: '0' },
      ],
      hiddenTestCases: [
        { input: '[-2]', output: '-2' },
        { input: '[-2,3,-4]', output: '24' },
        { input: '[0,2]', output: '2' },
      ],
      codeScaffold: {
        python: `def maxProduct(nums):\n    # Write your solution here\n    pass`,
        javascript: `function maxProduct(nums) {\n    // Write your solution here\n}`,
        java: `public int maxProduct(int[] nums) {\n    // Write your solution here\n    return 0;\n}`,
        cpp: `int maxProduct(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}`,
      },
    },
    {
      title: 'Find Minimum in Rotated Sorted Array',
      description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique integers, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Binary Search'],
      functionName: 'findMin',
      constraints: [
        '1 <= nums.length <= 5000',
        '-5000 <= nums[i] <= 5000',
        'All the integers of nums are unique.',
        'nums is sorted and rotated between 1 and n times.',
      ],
      hints: [
        'Use binary search to find the rotation point.',
        'Compare the middle element with the rightmost element.',
        'The minimum element is at the rotation point.',
      ],
      defaultTestCases: [
        { input: '[3,4,5,1,2]', output: '1' },
        { input: '[4,5,6,7,0,1,2]', output: '0' },
        { input: '[11,13,15,17]', output: '11' },
      ],
      hiddenTestCases: [
        { input: '[1]', output: '1' },
        { input: '[2,1]', output: '1' },
        { input: '[1,2]', output: '1' },
      ],
      codeScaffold: {
        python: `def findMin(nums):\n    # Write your solution here\n    pass`,
        javascript: `function findMin(nums) {\n    // Write your solution here\n}`,
        java: `public int findMin(int[] nums) {\n    // Write your solution here\n    return 0;\n}`,
        cpp: `int findMin(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}`,
      },
    },
    {
      title: 'Search in Rotated Sorted Array',
      description: 'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Binary Search'],
      functionName: 'search',
      constraints: [
        '1 <= nums.length <= 5000',
        '-10^4 <= nums[i] <= 10^4',
        'All values of nums are unique.',
        'nums is an ascending array that is possibly rotated.',
        '-10^4 <= target <= 10^4',
      ],
      hints: [
        'Use binary search with modifications for rotation.',
        'Determine which half of the array is sorted.',
        'Check if the target lies in the sorted half.',
      ],
      defaultTestCases: [
        { input: '[4,5,6,7,0,1,2]\n0', output: '4' },
        { input: '[4,5,6,7,0,1,2]\n3', output: '-1' },
        { input: '[1]\n0', output: '-1' },
      ],
      hiddenTestCases: [
        { input: '[1]\n1', output: '0' },
        { input: '[1,3]\n3', output: '1' },
        { input: '[3,1]\n1', output: '1' },
      ],
      codeScaffold: {
        python: `def search(nums, target):\n    # Write your solution here\n    pass`,
        javascript: `function search(nums, target) {\n    // Write your solution here\n}`,
        java: `public int search(int[] nums, int target) {\n    // Write your solution here\n    return -1;\n}`,
        cpp: `int search(vector<int>& nums, int target) {\n    // Write your solution here\n    return -1;\n}`,
      },
    },
    {
      title: '3Sum',
      description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Two Pointers', 'Sorting'],
      functionName: 'threeSum',
      constraints: [
        '3 <= nums.length <= 3000',
        '-10^5 <= nums[i] <= 10^5',
      ],
      hints: [
        'Sort the array first to make it easier to avoid duplicates.',
        'Use two pointers technique for each fixed first element.',
        'Skip duplicate values to avoid duplicate triplets.',
      ],
      defaultTestCases: [
        { input: '[-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
        { input: '[0,1,1]', output: '[]' },
        { input: '[0,0,0]', output: '[[0,0,0]]' },
      ],
      hiddenTestCases: [
        { input: '[-2,0,1,1,2]', output: '[[-2,0,2],[-2,1,1]]' },
        { input: '[-1,0,1]', output: '[[-1,0,1]]' },
        { input: '[1,2,3]', output: '[]' },
      ],
      codeScaffold: {
        python: `def threeSum(nums):\n    # Write your solution here\n    pass`,
        javascript: `function threeSum(nums) {\n    // Write your solution here\n}`,
        java: `public List<List<Integer>> threeSum(int[] nums) {\n    // Write your solution here\n    return new ArrayList<>();\n}`,
        cpp: `vector<vector<int>> threeSum(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}`,
      },
    },
    {
      title: 'Container With Most Water',
      description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that can hold the most water. Return the maximum amount of water a container can store.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Array', 'Two Pointers', 'Greedy'],
      functionName: 'maxArea',
      constraints: [
        '2 <= height.length <= 10^5',
        '0 <= height[i] <= 10^4',
      ],
      hints: [
        'Use two pointers, one at the beginning and one at the end.',
        'The area is determined by the shorter line and the distance between them.',
        'Move the pointer with the shorter height inward.',
      ],
      defaultTestCases: [
        { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
        { input: '[1,1]', output: '1' },
      ],
      hiddenTestCases: [
        { input: '[2,1]', output: '1' },
        { input: '[1,2,1]', output: '2' },
        { input: '[1,8,6,2,5,4,8,25,7]', output: '49' },
      ],
      codeScaffold: {
        python: `def maxArea(height):\n    # Write your solution here\n    pass`,
        javascript: `function maxArea(height) {\n    // Write your solution here\n}`,
        java: `public int maxArea(int[] height) {\n    // Write your solution here\n    return 0;\n}`,
        cpp: `int maxArea(vector<int>& height) {\n    // Write your solution here\n    return 0;\n}`,
      },
    },
  ];

  // Create problems with calculated acceptance rates
  for (const problemData of arrayProblems) {

    // Simulate some submission data for realistic acceptance rates
    const totalSubs = Math.floor(Math.random() * 1000) + 100;
    const acceptedSubs = Math.floor(totalSubs * (0.3 + Math.random() * 0.4)); // 30-70% acceptance
    // Store as a decimal (e.g., 0.35 instead of 35.0)
    const acceptanceRate = acceptedSubs / totalSubs;

    const problem = await prisma.problem.create({
      data: {
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        tags: problemData.tags,
        defaultTestCases: problemData.defaultTestCases,
        hiddenTestCases: problemData.hiddenTestCases,
        codeScaffold: problemData.codeScaffold,
        functionName: problemData.functionName,
        constraints: problemData.constraints,
        hints: problemData.hints,
        totalSubmissions: totalSubs,
        acceptedSubmissions: acceptedSubs,
        // Store the corrected decimal value
        acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      },
    });

    console.log(`Created problem: ${problem.title}`);
  }

  console.log('Array problems seeded successfully!');
}

// Run the main function
main()
  .catch((e) => {
    console.error('Error seeding array problems:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });