import React from 'react';
import { Check, FileText, Sparkles, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Delivery, DeliveryStatus } from '@/services/deliveryService';

type StepId = 'dados' | 'analise' | 'pdf';

const steps: Array<{ id: StepId; label: string; icon: React.ElementType }> = [
  { id: 'dados', label: 'Dados', icon: UserRound },
  { id: 'analise', label: 'Análise', icon: Sparkles },
  { id: 'pdf', label: 'PDF', icon: FileText },
];

const completedStatuses = new Set<DeliveryStatus>(['PDF_GERADO', 'PDF_ENVIADO']);
const analysisStatuses = new Set<DeliveryStatus>(['DADOS_RECEBIDOS', 'PRONTO_PARA_GERAR_PDF', 'AGUARDANDO_ANALISE']);

const getActiveStep = (delivery?: Delivery | null): StepId => {
  if (!delivery || delivery.status === 'AGUARDANDO_DADOS') return 'dados';
  if (completedStatuses.has(delivery.status)) return 'pdf';
  if (analysisStatuses.has(delivery.status)) return 'analise';
  return 'dados';
};

const getStepState = (step: StepId, activeStep: StepId) => {
  const activeIndex = steps.findIndex((item) => item.id === activeStep);
  const stepIndex = steps.findIndex((item) => item.id === step);
  if (stepIndex < activeIndex) return 'complete';
  if (stepIndex === activeIndex) return 'active';
  return 'pending';
};

interface ClientProgressStepperProps {
  delivery?: Delivery | null;
  compact?: boolean;
}

export const ClientProgressStepper: React.FC<ClientProgressStepperProps> = ({ delivery, compact = false }) => {
  const activeStep = getActiveStep(delivery);

  return (
    <div className={cn('rounded-lg border border-[#C9A96E]/25 bg-[#070D1D]/80 p-3', !compact && 'sm:p-4')}>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const state = getStepState(step.id, activeStep);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative flex flex-col items-center gap-2 text-center">
              {index > 0 && (
                <span
                  className={cn(
                    'absolute right-1/2 top-5 h-px w-full -translate-y-1/2',
                    state === 'pending' ? 'bg-[#F8F5EF]/15' : 'bg-[#C9A96E]/70'
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border',
                  state === 'complete' && 'border-[#C9A96E] bg-[#C9A96E] text-[#050B1A]',
                  state === 'active' && 'border-[#C9A96E] bg-[#C9A96E]/15 text-[#F8F5EF] shadow-lg shadow-[#C9A96E]/10',
                  state === 'pending' && 'border-[#F8F5EF]/15 bg-[#0B1426] text-[#F8F5EF]/40'
                )}
              >
                {state === 'complete' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  state === 'pending' ? 'text-[#F8F5EF]/45' : 'text-[#F8F5EF]'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
