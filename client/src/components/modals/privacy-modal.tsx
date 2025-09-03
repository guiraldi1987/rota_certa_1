import { X } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border border-border max-w-2xl max-h-[80vh] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Política de Privacidade</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-privacy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="prose prose-sm text-muted-foreground">
            <p className="mb-4">
              A ROTA CERTA respeita sua privacidade e está comprometida em proteger suas informações pessoais.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">1. Coleta de Informações</h4>
            <p className="mb-4">
              Coletamos apenas as informações necessárias para fornecer nossos serviços, incluindo dados de cadastro, progresso de estudos e preferências.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">2. Uso das Informações</h4>
            <p className="mb-4">
              Suas informações são utilizadas exclusivamente para personalizar sua experiência de aprendizado e fornecer relatórios de progresso.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">3. Segurança</h4>
            <p className="mb-4">
              Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">4. Compartilhamento</h4>
            <p className="mb-4">
              Não compartilhamos suas informações pessoais com terceiros, exceto quando exigido por lei.
            </p>

            <h4 className="font-semibold text-foreground mb-2">5. Cookies</h4>
            <p className="mb-4">
              Utilizamos cookies para melhorar sua experiência na plataforma e manter suas preferências de sessão.
            </p>

            <h4 className="font-semibold text-foreground mb-2">6. Seus Direitos</h4>
            <p className="mb-4">
              Você tem o direito de acessar, corrigir ou solicitar a exclusão de suas informações pessoais a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
