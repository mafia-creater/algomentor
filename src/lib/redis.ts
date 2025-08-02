import Redis from "ioredis";

const client = new Redis("rediss://default:ARO-AAIjcDExZGUzODY2M2FkNDY0M2VlYTY4YzMxNmE1ZTFhZjVlN3AxMA@sterling-cub-5054.upstash.io:6379");

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