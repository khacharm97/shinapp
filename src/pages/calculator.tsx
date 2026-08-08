import { Calculator } from '@/components/pages/calculator'

export default function CalculatorPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-14rem)] w-full py-4 px-0 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-4xl mx-auto">
        <Calculator />
      </div>
    </div>
  )
}
