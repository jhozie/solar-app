import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 ring-1 ring-black/5">
      <Calculator />
    </div>
  );
}
