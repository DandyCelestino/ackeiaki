import { MembershipTier, PlanBenefitRule } from '../types';

export const OFFICIAL_PIX_INFO = {
  cnpj: '30.810.800/0001-39',
  cnpjClean: '30810800000139',
  beneficiary: 'David Celestino dos Santos',
  bank: 'Instituição Bancária Integrada PIX',
  city: 'Cachoeiras de Macacu - RJ',
  officialNotice: 'Pagamento oficial exclusivo para chave CNPJ 30.810.800/0001-39 (David Celestino dos Santos).'
};

export interface BannerPackageRule {
  quantity: number; // 1 to 6
  title: string;
  monthlyPrice: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export const BANNER_BASE_PRICE = 199.00; // Base: até 3 banners por R$ 199,00
export const BANNER_EXTRA_UNIT_PRICE = 49.00; // Acima de 3: R$ 49,00 por banner adicional
export const MAX_BANNER_QUANTITY = 6; // Não ultrapassando a quantidade de 6 banners

export function calculateBannerPackagePrice(quantity: number): number {
  const qty = Math.max(1, Math.min(MAX_BANNER_QUANTITY, quantity));
  if (qty <= 3) {
    return BANNER_BASE_PRICE;
  }
  const extraBanners = qty - 3;
  return BANNER_BASE_PRICE + extraBanners * BANNER_EXTRA_UNIT_PRICE;
}

export const BANNER_PACKAGES: BannerPackageRule[] = [
  {
    quantity: 1,
    title: 'Banner Destaque Individual',
    monthlyPrice: 199.00,
    description: '1 Banner rotativo com link direto para sua loja ou produto em categoria específica.',
    features: [
      '1 Banner rotativo de alta resolução',
      'Exibição na categoria da loja',
      'Link direto para WhatsApp e Loja',
      'Relatório de cliques mensais'
    ]
  },
  {
    quantity: 2,
    title: 'Duo Banners de Destaque',
    monthlyPrice: 199.00,
    description: '2 Banners para divulgar produtos diferentes ou promoções sazonais.',
    features: [
      '2 Banners com artes e links independentes',
      'Exibição no Carrossel da Categoria e Vitrines',
      'Link direto para produtos específicos',
      'Troca mensal de arte gratuita'
    ]
  },
  {
    quantity: 3,
    title: 'Trio Banners - Pacote Start Base',
    monthlyPrice: 199.00,
    recommended: true,
    description: 'Pacote padrão com o melhor custo-benefício (R$ 199,00 para até 3 banners).',
    features: [
      'Até 3 Banners de alto impacto',
      'Exibição no Carrossel Principal da Home e Categorias',
      'Máxima rotação e visibilidade',
      'Selo "Loja em Destaque"'
    ]
  },
  {
    quantity: 4,
    title: 'Pacote 4 Banners (+1 Adicional)',
    monthlyPrice: 248.00, // 199 + 49
    description: '3 Banners Base + 1 Banner adicional para expansão comercial.',
    features: [
      '4 Banners simultâneos na plataforma',
      'Destaque no topo da Home e em até 2 Categorias',
      'Prioridade na fila de exibição',
      'Suporte VIP para otimização de imagens'
    ]
  },
  {
    quantity: 5,
    title: 'Pacote 5 Banners (+2 Adicionais)',
    monthlyPrice: 297.00, // 199 + (2 * 49)
    description: '3 Banners Base + 2 Banners adicionais para forte presença de marca.',
    features: [
      '5 Banners em rotação contínua',
      'Presença massiva na Home, Categorias e Páginas de busca',
      'Badge de Parceiro Ouro nos banners',
      'Estatísticas avançadas de conversão'
    ]
  },
  {
    quantity: 6,
    title: 'Pacote Supremo VIP (6 Banners - Limite Máximo)',
    monthlyPrice: 346.00, // 199 + (3 * 49)
    recommended: true,
    description: 'Teto máximo de 6 banners permitidos por lojista na plataforma.',
    features: [
      '6 Banners simultâneos (Teto Máximo Permitido)',
      'Destaque permanente em todos os canais de tráfego',
      'Posicionamento prioritário número 1 no carrossel',
      'Consultoria de tráfego e divulgação nas redes da plataforma'
    ]
  }
];

export const MEMBERSHIP_PLANS: Record<MembershipTier, PlanBenefitRule> = {
  GRATIS: {
    tier: 'GRATIS',
    name: 'Plano Grátis (Start)',
    badgeLabel: '🌱 Grátis (Start)',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxProducts: 5,
    commissionRate: 12, // 12% por venda realizada
    buyerDataReleasePolicy: 'AFTER_COMMISSION_CONFIRMATION',
    description: 'Comece a vender sem mensalidade fixa. Pague comissão de vendas somente quando vender. Limite de 5 produtos cadastrados.',
    highlights: [
      'Até 5 produtos ou serviços cadastrados',
      'R$ 0,00 de mensalidade fixa',
      'Pague somente se vender: comissão de 12% por venda concluída',
      'Proteção e sigilo: Dados do comprador liberados após confirmação do pagamento da taxa pelo Administrador Master',
      'Vitrine básica no catálogo e busca local',
      'Atendimento e suporte via e-mail e comunidade'
    ],
    color: 'emerald',
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    badgeTextColor: 'text-emerald-700'
  },
  BRONZE: {
    tier: 'BRONZE',
    name: 'Plano Bronze',
    badgeLabel: '🥉 Bronze',
    monthlyPrice: 29.90,
    yearlyPrice: 299.00,
    maxProducts: 20,
    commissionRate: 8, // 8% por venda
    buyerDataReleasePolicy: 'AFTER_STOCK_CONFIRMATION',
    description: 'Para pequenos negócios e artesãos em expansão com catálogo de até 20 produtos e comissão reduzida.',
    highlights: [
      'Até 20 produtos ou serviços cadastrados',
      'Comissão reduzida de 8% por venda realizada',
      'Liberação rápida dos dados do comprador após confirmação de estoque',
      'Prioridade de exibição sobre planos gratuitos',
      'Selo Bronze Verificado no perfil e catálogo',
      'Suporte via WhatsApp em horário comercial'
    ],
    color: 'amber',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
    badgeTextColor: 'text-amber-700'
  },
  PRATA: {
    tier: 'PRATA',
    name: 'Plano Prata',
    badgeLabel: '🥈 Prata',
    monthlyPrice: 59.90,
    yearlyPrice: 590.00,
    maxProducts: 60,
    commissionRate: 5, // 5% por venda
    buyerDataReleasePolicy: 'IMMEDIATE',
    description: 'Para lojas estruturadas com catálogo de até 60 produtos, comissão de apenas 5% e liberação imediata de pedidos.',
    highlights: [
      'Até 60 produtos ou serviços cadastrados',
      'Comissão de apenas 5% por venda',
      'Liberação imediata dos dados de contato e endereço do comprador',
      'Destaque intermediário nas buscas e carrosséis de categorias',
      'Selo Prata Oficial no marketplace',
      'Suporte prioritário via WhatsApp com alertas instantâneos'
    ],
    color: 'slate',
    badgeBg: 'bg-slate-200 border-slate-400 text-slate-900',
    badgeTextColor: 'text-slate-700'
  },
  OURO: {
    tier: 'OURO',
    name: 'Plano Ouro',
    badgeLabel: '🥇 Ouro',
    monthlyPrice: 99.90,
    yearlyPrice: 990.00,
    maxProducts: 150,
    commissionRate: 3, // 3% por venda
    buyerDataReleasePolicy: 'REAL_TIME_VIP',
    description: 'Alta visibilidade, catálogo ampliado para 150 produtos, taxa mínima de 3% e notificações instantâneas.',
    highlights: [
      'Até 150 produtos ou serviços cadastrados',
      'Taxa mínima de 3% por venda',
      'Liberação em tempo real dos dados do comprador e WhatsApp direto',
      'Topo das buscas na categoria e participação em leilões de banners',
      'Selo Ouro de Alta Reputação',
      'Relatórios detalhados de audiência e suporte VIP 7 dias por semana'
    ],
    color: 'yellow',
    badgeBg: 'bg-yellow-100 border-yellow-400 text-yellow-950',
    badgeTextColor: 'text-yellow-700'
  },
  PREMIUM: {
    tier: 'PREMIUM',
    name: 'Plano Premium (Diamante - Tudo Liberado)',
    badgeLabel: '💎 Premium VIP (Tudo Liberado)',
    monthlyPrice: 179.90,
    yearlyPrice: 1790.00,
    maxProducts: 99999, // Ilimitado
    commissionRate: 1, // 1% (taxa simbólica de manutenção de servidores)
    buyerDataReleasePolicy: 'REAL_TIME_VIP',
    description: 'Tudo 100% liberado! Produtos ilimitados, menor comissão operacional (1%), super destaque na Home e canal direto VIP.',
    highlights: [
      'Produtos e serviços ILIMITADOS (sem teto ou restrições)',
      'Menor taxa da plataforma: apenas 1% operacional',
      'Tudo 100% liberado sem burocracia: dados de compradores em tempo real',
      'Super destaque no Carrossel Hero da Home e topo de todas as buscas',
      'Selo Exclusivo Diamante Premium VIP',
      'Gerente de conta exclusivo e canal prioritário 24/7'
    ],
    color: 'purple',
    badgeBg: 'bg-purple-100 border-purple-300 text-purple-900',
    badgeTextColor: 'text-purple-700'
  }
};

export const MEMBERSHIP_PLANS_LIST: PlanBenefitRule[] = Object.values(MEMBERSHIP_PLANS);

export function getPlanByTier(tier?: MembershipTier): PlanBenefitRule {
  if (!tier || !MEMBERSHIP_PLANS[tier]) {
    return MEMBERSHIP_PLANS.GRATIS;
  }
  return MEMBERSHIP_PLANS[tier];
}

export function getMaxProductsForTier(tier?: MembershipTier): number {
  return getPlanByTier(tier).maxProducts;
}

export function getCommissionRateForTier(tier?: MembershipTier): number {
  return getPlanByTier(tier).commissionRate;
}

export function getPlanBadgeStyle(tier?: MembershipTier): {
  badgeBg: string;
  badgeText: string;
  label: string;
  isUnlimited: boolean;
} {
  const plan = getPlanByTier(tier);
  return {
    badgeBg: plan.badgeBg,
    badgeText: plan.badgeTextColor,
    label: plan.badgeLabel,
    isUnlimited: plan.maxProducts > 1000
  };
}
