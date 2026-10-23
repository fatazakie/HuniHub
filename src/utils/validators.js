// Utilitas validasi formulir untuk HuniHub

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Format nomor HP Indonesia (minimal 10 digit, diawali 08 atau +62 atau 62)
  const cleaned = phone.replace(/[\s-]/g, '');
  const re = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return re.test(cleaned);
};

export const validateRegisterForm = ({ name, email, phone, password, confirmPassword }) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Nama lengkap wajib diisi';
  } else if (name.trim().length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email wajib diisi';
  } else if (!isValidEmail(email)) {
    errors.email = 'Format email tidak valid';
  }

  if (!phone || !phone.trim()) {
    errors.phone = 'Nomor HP wajib diisi';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Format nomor HP tidak valid (contoh: 08123456789)';
  }

  if (!password) {
    errors.password = 'Kata sandi wajib diisi';
  } else if (!isValidPassword(password)) {
    errors.password = 'Kata sandi minimal 6 karakter';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email wajib diisi';
  } else if (!isValidEmail(email)) {
    errors.email = 'Format email tidak valid';
  }

  if (!password) {
    errors.password = 'Kata sandi wajib diisi';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePropertyForm = ({ name, type, description, pricePerNight, address, city, images }) => {
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Nama hunian wajib diisi';
  if (!type) errors.type = 'Pilih tipe hunian';
  if (!description || description.trim().length < 10) errors.description = 'Deskripsi minimal 10 karakter';
  if (!pricePerNight || isNaN(Number(pricePerNight)) || Number(pricePerNight) <= 0) {
    errors.pricePerNight = 'Harga per malam harus angka positif';
  }
  if (!address || !address.trim()) errors.address = 'Alamat wajib diisi';
  if (!city || !city.trim()) errors.city = 'Kota wajib diisi';
  if (!images || images.length === 0) errors.images = 'Minimal sediakan 1 foto hunian';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  validateRegisterForm,
  validateLoginForm,
  validatePropertyForm,
};
