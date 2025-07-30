const stats = [
  { value: "10,000+", label: "Problems Solved" },
  { value: "95%", label: "Success Rate" },
  { value: "500+", label: "Active Users" },
  { value: "24/7", label: "AI Support" }
];

export default function StatsSection() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="text-white">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-blue-100 text-lg font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}