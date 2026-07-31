export const normalizePhoneForWhatsApp = (
  phoneNumber: string,
  phonePrefix = '549',
) => {
  let number = phoneNumber.replace(/\D/g, '');

  if (phonePrefix === '549') {
    if (number.startsWith('54')) {
      number = number.slice(2);
    }

    if (number.startsWith('9')) {
      number = number.slice(1);
    }

    if (number.startsWith('0')) {
      number = number.slice(1);
    }

    const areaCodeLength = number.startsWith('11') ? 2 : 3;
    const areaCode = number.slice(0, areaCodeLength);
    let localNumber = number.slice(areaCodeLength);

    if (localNumber.startsWith('15')) {
      localNumber = localNumber.slice(2);
    }

    return `${phonePrefix}${areaCode}${localNumber}`;
  }

  return `${phonePrefix}${number}`;
};
