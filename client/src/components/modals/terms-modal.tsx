import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border border-border max-w-2xl max-h-[80vh] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Termos de Uso</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-terms"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="prose prose-sm text-muted-foreground">
            <p className="mb-4">
              Estes Termos de Uso regulam a utilização da plataforma ROTA CERTA, desenvolvida para preparação de concursos e progressão de carreira na PMESP.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">1. Aceitação dos Termos</h4>
            <p className="mb-4">
              Ao acessar e utilizar esta plataforma, você concorda integralmente com estes termos de uso e políticas associadas.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">2. Uso da Plataforma</h4>
            <p className="mb-4">
              A plataforma destina-se exclusivamente ao estudo e preparação para concursos públicos da PMESP. É proibido o uso para fins comerciais não autorizados.
            </p>
            
            <h4 className="font-semibold text-foreground mb-2">3. Responsabilidades do Usuário</h4>
            <p className="mb-4">
              O usuário é responsável pela veracidade das informações fornecidas e pelo uso adequado da plataforma.
            </p>

            <h4 className="font-semibold text-foreground mb-2">4. Propriedade Intelectual</h4>
            <p className="mb-4">
              Todo o conteúdo disponibilizado na plataforma é protegido por direitos autorais e não pode ser reproduzido sem autorização expressa.
            </p>

            <h4 className="font-semibold text-foreground mb-2">5. Limitação de Responsabilidade</h4>
            <p className="mb-4">
              A ROTA CERTA não se responsabiliza por danos diretos ou indiretos decorrentes do uso da plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
