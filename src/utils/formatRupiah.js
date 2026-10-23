// Utilitas format Rupiah untuk HuniHub

/**
 * Format angka ke format mata uang Rupiah
 * Contoh: 750000 -> "Rp 750.000"
 * @param {number|string} amount
 * @param {boolean} withSymbol - default true
 * @returns {string}
 */
export const formatRupiah = (amount, withSymbol = true) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return withSymbol ? 'Rp 0' : '0';
  }

  const numericValue = Math.round(Number(amount));
  const formatted = numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return withSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Format ringkas untuk angka besar (misal: 1,5 Jt)
 * @param {number} amount
 * @returns {string}
 */
export const formatRupiahCompact = (amount) => {
  if (!amount || isNaN(Number(amount))) return 'Rp 0';
  const num = Number(amount);
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1).replace('.0', '')} M`;
  }
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (num >= 1000) {
    return `Rp ${(num / 1000).toFixed(0)} rb`;
  }
  return `Rp ${num}`;
};

export default formatRupiah;
