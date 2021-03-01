const convertPrice = (
  value,
  locales = 'id-ID',
  options = {
    style: 'currency',
    currency: 'IDR',
  }
) => {
  return new Intl.NumberFormat(locales, options).format(value);
};

export default convertPrice;
