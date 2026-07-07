// ==========================================
// AVANS.JS - v64.28 - 2026 Sabit Liste
// ==========================================

// 2026 Avans günleri - kesin liste
const AVANS_2026 = {
  0: { gun: 20, tarih: '20.01.26', gunAdi: 'Salı' },
  1: { gun: 20, tarih: '20.02.26', gunAdi: 'Cuma' },
  2: { gun: 18, tarih: '18.03.26', gunAdi: 'Çarşamba' },
  3: { gun: 17, tarih: '17.04.26', gunAdi: 'Cuma' },
  4: { gun: 19, tarih: '19.05.26', gunAdi: 'Salı' },
  5: { gun: 19, tarih: '19.06.26', gunAdi: 'Cuma' },
  6: { gun: 17, tarih: '17.07.26', gunAdi: 'Cuma' },
  7: { gun: 20, tarih: '20.08.26', gunAdi: 'Perşembe' },
  8: { gun: 18, tarih: '18.09.26', gunAdi: 'Cumartesi' },
  9: { gun: 20, tarih: '20.10.26', gunAdi: 'Salı' },
  10: { gun: 20, tarih: '20.11.26', gunAdi: 'Cuma' },
  11: { gun: 18, tarih: '18.12.26', gunAdi: 'Cuma' }
};

// Diğer yıllar için otomatik hesap
function avansGunuHesapla(yil, ay) {
  // 2026 için sabit liste
  if (yil === 2026) {
    return AVANS_2026[ay];
  }
  
  // Diğer yıllar: 20'si, hafta sonu ise önceki Cuma
  let hedefGun = 20;
  while (hedefGun > 0) {
    const date = new Date(yil, ay, hedefGun);
    const gun = date.getDay();
    if (gun !== 0 && gun !== 6) {
      return {
        gun: hedefGun,
        tarih: `${hedefGun.toString().padStart(2,'0')}.${(ay+1).toString().padStart(2,'0')}.${yil.toString().slice(-2)}`,
        gunAdi: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][gun]
      };
    }
    hedefGun--;
  }
  return { gun: 20, tarih: `20.${(ay+1).toString().padStart(2,'0')}.${yil.toString().slice(-2)}`, gunAdi: 'Pazartesi' };
}

function avansGunuMu(yil, ay, gun) {
  const avans = avansGunuHesapla(yil, ay);
  return avans.gun === gun;
}

function avansBilgisiAl(yil, ay) {
  return avansGunuHesapla(yil, ay);
}

window.avansGunuMu = avansGunuMu;
window.avansBilgisiAl = avansBilgisiAl;
window.avansGunuHesapla = avansGunuHesapla;