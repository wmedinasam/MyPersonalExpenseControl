// Formatea números a la moneda oficial de Guatemala (GTQ - Quetzales)
export const formatQuetzales = (monto) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(monto || 0);
};