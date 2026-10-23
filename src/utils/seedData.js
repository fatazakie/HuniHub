// Data Awal (Seed Data) Minimal 8 Hunian Beragam Tipe dan Kota di Indonesia
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const INITIAL_PROPERTIES = [
  {
    id: 'prop-villa-bali-1',
    name: 'Villa Serenity Bamboo Sanctuary',
    type: 'villa',
    city: 'Bali',
    address: 'Jl. Raya Sayan, Ubud, Gianyar, Bali',
    pricePerNight: 1450000,
    rating: 4.9,
    description: 'Villa bambu tropis ramah lingkungan di jantung Ubud dengan kolam renang pribadi menghadap lembah sungai yang asri. Dilengkapi dapur terbuka, gazebo meditasi, dan layanan sarapan pagi khas Bali.',
    facilities: ['wifi', 'ac', 'kolam_renang', 'parkir', 'dapur', 'sarapan'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-apt-jakarta-2',
    name: 'Skyline Luxury Suite SCBD',
    type: 'apartemen',
    city: 'Jakarta',
    address: 'Kawasan Sudirman Central Business District, Jakarta Selatan',
    pricePerNight: 980000,
    rating: 4.8,
    description: 'Apartemen premium lantai tinggi dengan pemandangan cakrawala kota metropolitan Jakarta. Akses langsung ke pusat perbelanjaan, stasiun MRT, pusat kebugaran, dan infinity pool di rooftop.',
    facilities: ['wifi', 'ac', 'kolam_renang', 'gym', 'parkir', 'lift', 'mesin_cuci'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-kamar-jogja-3',
    name: 'Heritage Room Malioboro',
    type: 'kamar',
    city: 'Yogyakarta',
    address: 'Jl. Dagen No. 18, Sosromenduran, Gedong Tengen, Yogyakarta',
    pricePerNight: 350000,
    rating: 4.7,
    description: 'Kamar hotel butik bernuansa klasik Jawa hanya 3 menit berjalan kaki ke jalan Malioboro. Kasur king-size empuk, kamar mandi dalam dengan pemanas air, dan teh poci sore gratis.',
    facilities: ['wifi', 'ac', 'tv', 'sarapan', 'parkir'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-kos-bandung-4',
    name: 'Dago Cozy Co-Living & Kos',
    type: 'kos',
    city: 'Bandung',
    address: 'Jl. Dago Atas No. 102, Coblong, Bandung',
    pricePerNight: 180000,
    rating: 4.6,
    description: 'Kos eksklusif modern dengan fasilitas setara hotel di kawasan sejuk Dago. Cocok untuk mahasiswa, pekerja remote, dan solo traveler. Memiliki working space bersama dan kafe di lantai dasar.',
    facilities: ['wifi', 'ac', 'dapur', 'parkir', 'mesin_cuci'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-villa-bogor-5',
    name: 'Puncak Pine Hills Modern Villa',
    type: 'villa',
    city: 'Bogor',
    address: 'Jl. Raya Puncak KM 85, Cisarua, Bogor',
    pricePerNight: 1200000,
    rating: 4.9,
    description: 'Villa keluarga 3 kamar tidur dengan halaman rumput luas, area api unggun, dan fasilitas barbekyu. Udara pegunungan segar tanpa polusi dengan panorama perkebunan teh.',
    facilities: ['wifi', 'kolam_renang', 'parkir', 'dapur', 'bbq', 'tv'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-apartemen-surabaya-6',
    name: 'Pakuwon City Grand Studio',
    type: 'apartemen',
    city: 'Surabaya',
    address: 'Jl. Kejawan Putih Tambak, Mulyorejo, Surabaya',
    pricePerNight: 420000,
    rating: 4.7,
    description: 'Studio apartemen modern dengan perabotan lengkap (fully furnished), smart TV, dapur mini, dan akses langsung ke Pakuwon Mall. Sangat praktis untuk perjalanan bisnis maupun liburan singkat.',
    facilities: ['wifi', 'ac', 'kolam_renang', 'gym', 'lift', 'parkir'],
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?w=1200',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-villa-malang-7',
    name: 'Batu Highland Retreat Villa',
    type: 'villa',
    city: 'Malang',
    address: 'Jl. Oro-Oro Ombo, Batu, Malang, Jawa Timur',
    pricePerNight: 850000,
    rating: 4.8,
    description: 'Hunian villa bergaya Skandinavia di lereng Gunung Panderman. Dekat dengan objek wisata Jatim Park dan BNS. Suasana tenang dengan pemandangan lampu kota (city lights) Malang di malam hari.',
    facilities: ['wifi', 'dapur', 'parkir', 'tv', 'sarapan'],
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
    ],
    isAvailable: true,
  },
  {
    id: 'prop-kamar-lombok-8',
    name: 'Senggigi Oceanview Deluxe Room',
    type: 'kamar',
    city: 'Lombok',
    address: 'Jl. Raya Senggigi KM 8, Batu Layar, Lombok Barat',
    pricePerNight: 550000,
    rating: 4.9,
    description: 'Kamar tepi pantai dengan balkon pribadi yang menghadap langsung ke panorama matahari terbenam Selat Lombok. Termasuk fasilitas akses pantai privat dan sarapan tropis.',
    facilities: ['wifi', 'ac', 'kolam_renang', 'sarapan', 'parkir'],
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    ],
    isAvailable: true,
  },
];

/**
 * Fungsi untuk mengisi seed data jika koleksi properties masih kosong di Firestore
 */
export const seedInitialPropertiesIfEmpty = async () => {
  try {
    const colRef = collection(db, 'properties');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('Seeding initial properties to Firestore...');
      for (const item of INITIAL_PROPERTIES) {
        const { id, ...data } = item;
        const docRef = doc(db, 'properties', id);
        await setDoc(docRef, {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      console.log('Seeding completed successfully!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding initial properties:', error);
    return false;
  }
};

export default {
  INITIAL_PROPERTIES,
  seedInitialPropertiesIfEmpty,
};
