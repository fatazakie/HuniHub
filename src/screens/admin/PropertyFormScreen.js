import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { validatePropertyForm } from '../../utils/validators';
import propertyService from '../../services/propertyService';
import storageService from '../../services/storageService';

const PROPERTY_TYPES = [
  { id: 'kamar', label: 'Kamar' },
  { id: 'kos', label: 'Kos' },
  { id: 'villa', label: 'Villa' },
  { id: 'apartemen', label: 'Apartemen' },
];

const CITIES = [
  'Bali', 'Jakarta', 'Yogyakarta', 'Bandung', 'Bogor', 'Surabaya', 'Malang', 'Lombok', 'Semarang', 'Medan',
];

const AVAILABLE_FACILITIES = [
  { id: 'wifi', label: 'WiFi Cepat' },
  { id: 'ac', label: 'AC' },
  { id: 'kolam_renang', label: 'Kolam Renang' },
  { id: 'parkir', label: 'Parkir Gratis' },
  { id: 'dapur', label: 'Dapur Lengkap' },
  { id: 'sarapan', label: 'Sarapan' },
  { id: 'gym', label: 'Fitness Center' },
  { id: 'tv', label: 'Smart TV' },
  { id: 'lift', label: 'Lift' },
  { id: 'mesin_cuci', label: 'Mesin Cuci' },
  { id: 'bbq', label: 'Area BBQ' },
];

export const PropertyFormScreen = ({ route, navigation }) => {
  const existingProperty = route.params?.property;
  const isEditMode = Boolean(existingProperty);

  const [name, setName] = useState(existingProperty?.name || '');
  const [type, setType] = useState(existingProperty?.type || 'villa');
  const [city, setCity] = useState(existingProperty?.city || 'Bali');
  const [address, setAddress] = useState(existingProperty?.address || '');
  const [pricePerNight, setPricePerNight] = useState(
    existingProperty?.pricePerNight ? String(existingProperty.pricePerNight) : ''
  );
  const [description, setDescription] = useState(existingProperty?.description || '');
  const [isAvailable, setIsAvailable] = useState(
    existingProperty?.isAvailable !== false
  );
  const [facilities, setFacilities] = useState(existingProperty?.facilities || ['wifi', 'ac']);
  const [images, setImages] = useState(existingProperty?.images || []);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const toggleFacility = (id) => {
    setFacilities((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Pilih foto dari galeri HP menggunakan expo-image-picker
  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Izin Diperlukan',
            'Izin akses galeri dibutuhkan untuk memilih foto hunian.'
          );
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...newUris]);
        if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
      }
    } catch (err) {
      console.error('Error picking images:', err);
    }
  };

  const handleAddImageUrl = () => {
    if (customImageUrl && customImageUrl.trim().startsWith('http')) {
      setImages((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
      if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    const validation = validatePropertyForm({
      name,
      type,
      description,
      pricePerNight,
      address,
      city,
      images,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    setUploadStatus('Mengunggah data hunian...');

    try {
      // 1. Unggah foto lokal (jika ada yang berupa file/URI lokal)
      const uploadedImages = [];
      for (const img of images) {
        if (img.startsWith('http://') || img.startsWith('https://')) {
          uploadedImages.push(img);
        } else {
          setUploadStatus('Mengunggah foto ke Cloud Storage...');
          const url = await storageService.uploadImageAsync(img, 'properties');
          uploadedImages.push(url);
        }
      }

      const payload = {
        name: name.trim(),
        type,
        city,
        address: address.trim(),
        pricePerNight: Number(pricePerNight),
        description: description.trim(),
        isAvailable,
        facilities,
        images: uploadedImages,
        rating: existingProperty?.rating || 4.8,
      };

      if (isEditMode) {
        await propertyService.updateProperty(existingProperty.id, payload);
      } else {
        await propertyService.createProperty(payload);
      }

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Sukses',
          `Hunian berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`
        );
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving property:', err);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat menyimpan data.');
      }
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {isEditMode ? 'Ubah Data Hunian' : 'Tambah Hunian Baru'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tipe Hunian */}
        <Text style={styles.sectionLabel}>Tipe Hunian</Text>
        <View style={styles.typeRow}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setType(t.id)}
              style={[styles.typeBtn, type === t.id && styles.typeBtnActive]}
            >
              <Text style={[styles.typeBtnText, type === t.id && styles.typeBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Nama Hunian */}
        <Input
          label="Nama Hunian"
          placeholder="Contoh: Villa Bali Paradise"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        {/* Pilihan Kota */}
        <Text style={styles.sectionLabel}>Kota / Destinasi</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.citiesScroll}
        >
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCity(c)}
              style={[styles.cityChip, city === c && styles.cityChipActive]}
            >
              <Text style={[styles.cityChipText, city === c && styles.cityChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Alamat Lengkap */}
        <Input
          label="Alamat Lengkap"
          placeholder="Jalan, kelurahan, kecamatan"
          value={address}
          onChangeText={setAddress}
          error={errors.address}
        />

        {/* Harga per Malam */}
        <Input
          label="Harga Sewa per Malam (Rp)"
          placeholder="Contoh: 750000"
          value={pricePerNight}
          onChangeText={setPricePerNight}
          keyboardType="numeric"
          error={errors.pricePerNight}
        />

        {/* Deskripsi */}
        <Input
          label="Deskripsi Hunian"
          placeholder="Tuliskan suasana, keunggulan, dan peraturan hunian..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        {/* Toggle Ketersediaan */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Status Ketersediaan</Text>
            <Text style={styles.switchSub}>
              {isAvailable
                ? 'Hunian dibuka dan dapat dipesan oleh tamu'
                : 'Hunian ditutup/penuh (tidak dapat dipesan)'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isAvailable ? colors.primary : '#CBD5E1'}
          />
        </View>

        {/* Fasilitas Hunian (Checklist Chips) */}
        <Text style={styles.sectionLabel}>Fasilitas Hunian</Text>
        <View style={styles.facilitiesWrap}>
          {AVAILABLE_FACILITIES.map((fac) => {
            const isChecked = facilities.includes(fac.id);
            return (
              <TouchableOpacity
                key={fac.id}
                onPress={() => toggleFacility(fac.id)}
                style={[
                  styles.facilityChip,
                  isChecked && styles.facilityChipActive,
                ]}
              >
                <Ionicons
                  name={isChecked ? 'checkmark-circle' : 'add-outline'}
                  size={16}
                  color={isChecked ? colors.surface : colors.textPrimary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.facilityChipText,
                    isChecked && styles.facilityChipTextActive,
                  ]}
                >
                  {fac.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Foto Hunian */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
          Foto Hunian ({images.length} Foto)
        </Text>
        {!!errors.images && (
          <Text style={styles.errorText}>{errors.images}</Text>
        )}

        {/* Tombol Pilih dari Galeri */}
        <View style={styles.photoActions}>
          <Button
            title="Pilih dari Galeri Foto"
            variant="outline"
            size="md"
            leftIcon={<Ionicons name="images-outline" size={18} color={colors.primary} />}
            onPress={handlePickImages}
            style={{ flex: 1 }}
          />
        </View>

        {/* Opsi Input URL Gambar Alternatif */}
        <View style={styles.urlInputRow}>
          <Input
            placeholder="Atau tempel URL gambar (https://...)"
            value={customImageUrl}
            onChangeText={setCustomImageUrl}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <Button
            title="Tambah"
            variant="secondary"
            size="md"
            fullWidth={false}
            onPress={handleAddImageUrl}
            style={{ height: 48, marginTop: 0 }}
          />
        </View>

        {/* Preview Daftar Foto */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagePreviewScroll}
          >
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumbnailWrap}>
                <Image
                  source={{ uri }}
                  style={styles.imageThumbnail}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close" size={14} color={colors.surface} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Status Upload Indicator */}
        {!!uploadStatus && (
          <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
        )}

        {/* Tombol Simpan */}
        <Button
          title={isEditMode ? 'Simpan Perubahan' : 'Terbitkan Hunian'}
          variant="accent"
          size="lg"
          loading={loading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  typeBtnTextActive: {
    color: colors.surface,
  },
  citiesScroll: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  cityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cityChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  cityChipTextActive: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  switchTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  switchSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: '90%',
  },
  facilitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  facilityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  facilityChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  facilityChipTextActive: {
    color: colors.surface,
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  imagePreviewScroll: {
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  imageThumbnailWrap: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  uploadStatusText: {
    ...typography.captionBold,
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});

export default PropertyFormScreen;
