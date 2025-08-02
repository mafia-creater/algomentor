(async () => {
  const redis = (await import('./src/lib/redis')).default;
  await redis.del('problems:dashboard');
  console.log('Cache cleared!');
  process.exit();
})();