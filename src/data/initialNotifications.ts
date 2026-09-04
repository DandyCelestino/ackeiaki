import { InAppNotification } from '../types';

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-sys-001',
    title: '🌿 Bem-vindo ao Achei Aqui Macacu!',
    message: 'Seja muito bem-vindo ao portal oficial do comércio de Cachoeiras de Macacu - RJ. Explore produtos locais, agende serviços e faça compras com retirada rápida no balcão ou entrega.',
    category: 'SISTEMA',
    audience: 'ALL',
    senderName: 'Administração Achei Aqui',
    senderRole: 'SISTEMA',
    priority: 'NORMAL',
    actionUrl: 'home',
    actionLabel: 'Explorar Marketplace',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'notif-sys-002',
    title: '📢 Novo Sistema de Notificações em Tempo Real',
    message: 'Agora todas as notificações de pedidos, novidades e comunicados oficiais chegam diretamente no cabeçalho do seu app usando sua conexão de internet. Clique no sino para ler suas mensagens privadas instantaneamente!',
    category: 'COMUNICADO',
    audience: 'ALL',
    senderName: 'Administrador Master Supremo',
    senderRole: 'MASTER',
    priority: 'HIGH',
    actionUrl: 'account',
    actionLabel: 'Ver Minha Conta',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'notif-merch-001',
    title: '🏪 Dica para Lojistas: Confirmação Ágil de Estoque',
    message: 'Lembre-se de responder as solicitações de estoque dos clientes em até 15 minutos pelo Painel do Lojista. Lojas ágeis ganham maior visibilidade no marketplace e melhores avaliações dos clientes!',
    category: 'AVISO',
    audience: 'ALL_MERCHANTS',
    senderName: 'Administração Master Achei Aqui',
    senderRole: 'MASTER',
    priority: 'NORMAL',
    actionUrl: 'orders',
    actionLabel: 'Abrir Pedidos',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'notif-merch-002',
    title: '👑 Planos de Banners & Destaques de Categoria Ativos',
    message: 'Quer destacar sua loja no topo do Achei Aqui? Confira nosso Plano de Banners (R$ 199/mês para até 3 banners) e impulsione suas vendas em Cachoeiras de Macacu. Chave PIX oficial: CNPJ 30.810.800/0001-39.',
    category: 'COMISSAO',
    audience: 'ALL_MERCHANTS',
    senderName: 'Administração Master Achei Aqui',
    senderRole: 'MASTER',
    priority: 'HIGH',
    actionUrl: 'plans',
    actionLabel: 'Ver Tabela de Planos',
    readBy: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];
