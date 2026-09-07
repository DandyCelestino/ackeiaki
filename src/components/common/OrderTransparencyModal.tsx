import React from 'react';
import { X, Calendar, Clock, FileText, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { AuditLog, Order, PaymentReceiptAudit } from '../../types';

interface OrderTransparencyModalProps {
  order: Order | null;
  receipts: PaymentReceiptAudit[];
  auditLogs: AuditLog[];
  onClose: () => void;
}

export const OrderTransparencyModal: React.FC<OrderTransparencyModalProps> = ({
  order,
  receipts,
  auditLogs,
  onClose
}) => {
  if (!order) return null;

  const orderReceipts = receipts.filter((receipt) => receipt.orderId === order.id || receipt.subpedidoId === order.id);
  const orderLogs = auditLogs.filter((log) => log.entityId === order.id || log.metadata?.subpedidoId === order.id);
  const service = order.serviceDetails;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-200 flex flex-col">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">Histórico transparente</p>
            <h2 className="text-base sm:text-lg font-black">Pedido {order.code}</h2>
            <p className="text-xs text-slate-400">{order.merchantName} • {order.status}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Fechar detalhes">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-500">Cliente</span>
              <p className="font-bold text-slate-900 mt-1">{order.customerName}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-500">Prestador / Vendedor</span>
              <p className="font-bold text-slate-900 mt-1">{order.merchantName}</p>
              <p>{order.merchantId}</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Valor total</span>
              <p className="font-black text-emerald-900 text-lg mt-1">R$ {(order.totalAmount || 0).toFixed(2).replace('.', ',')}</p>
              <p>Modalidade: {order.modality}</p>
            </div>
          </div>

          {service && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-black text-blue-950"><Calendar className="w-4 h-4" /> Agenda do atendimento</div>
              <p><strong>Serviço:</strong> {service.serviceTitle}</p>
              <p><strong>Profissional:</strong> {service.professional}</p>
              <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><strong>Horário:</strong> {service.scheduledDate} às {service.scheduledTime}</p>
              <p><strong>Local:</strong> {service.serviceLocation || 'A confirmar'}</p>
              {service.customerNotes && <p><strong>Observações:</strong> {service.customerNotes}</p>}
              {service.merchantResponse && <p><strong>Resposta do prestador:</strong> {service.merchantResponse.responseMessage}</p>}
            </div>
          )}

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Pagamento e comprovantes</div>
            <p><strong>Método:</strong> {order.paymentMethod || 'PIX / acordo direto com o prestador'}</p>
            <p><strong>Status:</strong> {order.status}</p>
            {orderReceipts.length === 0 ? (
              <p className="text-amber-700">Nenhum comprovante anexado ainda.</p>
            ) : (
              orderReceipts.map((receipt) => (
                <div key={receipt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{receipt.transactionType} • {receipt.status}</p>
                    <p className="text-[11px]">Enviado por {receipt.senderName} ({receipt.senderRole}) em {new Date(receipt.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <a href={receipt.attachmentUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-1">
                    {receipt.attachmentUrl.startsWith('data:image') ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{receipt.fileName || 'Abrir comprovante'}</span>
                  </a>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 font-black text-slate-900 mb-3"><Clock className="w-4 h-4 text-slate-600" /> Linha do tempo de logs e auditoria</div>
            {orderLogs.length === 0 ? <p className="text-slate-500">Nenhum evento adicional registrado.</p> : (
              <div className="space-y-2">
                {orderLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-emerald-400 pl-3">
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p>{log.details}</p>
                    <p className="text-[10px] text-slate-500">{log.timestamp} • {log.userName || log.userId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
