import Redis from "ioredis";

const client = new Redis("redis://default:ATVtAAIncDI0ZDRkNzdiNzY1M2Q0NTM5YmNjMWE1YTYzOTRlMmEzM3AyMTM2Nzc@advanced-calf-13677.upstash.io:6379");

// Optionally, you can add a test connection function for debugging:
// export async function testRedisConnection() {
//   try {
//     await client.set('foo', 'bar');
//     const value = await client.get('foo');
//     console.log('Redis test value:', value);
//   } catch (err) {
//     console.error('Redis connection error:', err);
//   }
// }

export default client;
