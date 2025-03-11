import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Solar Savings Calculator
        </h1>
        <p className="text-center mb-12 text-gray-600 dark:text-gray-300">
          Calculate your potential savings by switching from diesel to solar power
        </p>
        <Calculator />
      </main>
    </div>
  );
}
