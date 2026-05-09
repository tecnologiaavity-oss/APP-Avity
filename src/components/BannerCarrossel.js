import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');
const bannerWidth = width - 32;

const banners = [
  {
    id: 1,
    titulo: 'SAÚDE PREMIUM',
    descricao: 'Consultas e exames com até 70% OFF',
    cor: '#6C63FF',
    imagem: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500',
  },
  {
    id: 2,
    titulo: 'BEM-ESTAR TOTAL',
    descricao: 'Pilates, academia e nutrição',
    cor: '#FF6584',
    imagem: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
  },
  {
    id: 3,
    titulo: 'ECONOMIZE AGORA',
    descricao: 'Planos a partir de R$ 30/mês',
    cor: '#FFA500',
    imagem: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
  },
];

export default function BannerCarrossel() {
  const scrollRef = useRef(null);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const proximo = ativo === banners.length - 1 ? 0 : ativo + 1;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: proximo * bannerWidth,
          animated: true,
        });
      }
      setAtivo(proximo);
    }, 4000);
    return () => clearInterval(interval);
  }, [ativo]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
      >
        {banners.map((banner, index) => (
          <TouchableOpacity key={banner.id} activeOpacity={0.9} style={styles.bannerCard}>
            <Image source={{ uri: banner.imagem }} style={styles.bannerImage} />
            <View style={[styles.overlay, { backgroundColor: banner.cor + 'CC' }]}>
              <Text style={styles.bannerTitulo}>{banner.titulo}</Text>
              <Text style={styles.bannerDescricao}>{banner.descricao}</Text>
              <View style={styles.saibaMais}>
                <Text style={styles.saibaMaisText}>SAIBA MAIS →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.dot, ativo === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  bannerCard: {
    width: bannerWidth,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerTitulo: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerDescricao: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
  },
  saibaMais: {
    marginTop: 10,
  },
  saibaMaisText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#6C63FF',
  },
});