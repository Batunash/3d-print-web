// lib/constants.ts

export const SITE_CONFIG = {
  name: "PrintCraft 3D",
  shortName: "PC3D",
  description: "Hayal gücünüzü gerçeğe dönüştürün. Profesyonel 3D baskı hizmeti.",
  company: {
    name: "PrintCraft Teknolojileri A.Ş.",
    address: "Teknokent, Ankara, Türkiye",
    phone: "+90 555 123 45 67",
    email: "iletisim@printcraft3d.com"
  },
  socials: {
    instagram: "https://instagram.com/printcraft",
    twitter: "https://twitter.com/printcraft"
  },
  // Yasal Metinler (Kayıt ol sayfasındaki modallarda gösterilecek)
  legal: {
    termsOfService: [
      "1. Kabul Edilme: PrintCraft 3D hizmetlerini kullanarak bu şartları kabul etmiş sayılırsınız.",
      "2. Hizmet Tanımı: Sistemimiz kullanıcıların 3D modellerini yükleyip fiyat teklifi almasını ve üretim siparişi vermesini sağlar.",
      "3. Fiyatlandırma ve Ödeme: Verilen teklifler anlıktır. Ödemeler sipariş onayında tahsil edilir.",
      "4. İptal ve İade: Üretime başlanmış siparişlerde iptal ve iade yapılamamaktadır.",
      "5. Fikri Mülkiyet: Yüklediğiniz modellerin tüm fikri mülkiyet hakları size aittir. Sistemimiz sadece üretim amacıyla bu dosyaları işler.",
      "6. İçerik Kısıtlamaları: Yasadışı, ateşli silah parçaları veya telif hakkı ihlali içeren modellerin basımı reddedilir."
    ],
    privacyPolicy: [
      "1. Veri Toplama: Ad, soyad, e-posta, telefon ve adres gibi temel iletişim bilgilerinizi hizmet verebilmek için topluyoruz.",
      "2. 3D Model Güvenliği: Yüklediğiniz 3D tasarım dosyaları yüksek güvenlikli sunucularda şifrelenerek saklanır ve asla üçüncü şahıslarla paylaşılmaz.",
      "3. Veri Kullanımı: Bilgileriniz sadece sipariş süreçlerini yönetmek, kargo gönderimi yapmak ve size destek sağlamak amacıyla kullanılır.",
      "4. Çerezler (Cookies): Oturum yönetimi ve kullanıcı deneyimini iyileştirmek için temel çerezler kullanılmaktadır.",
      "5. Veri Silme Hakları: Hesabınızı ve yüklediğiniz tüm verileri dilediğiniz zaman sistemden tamamen sildirme hakkına sahipsiniz."
    ]
  }
};

// Sisteme yüklenmesine izin verilen 3D ve ek dosya formatları
export const ALLOWED_FILE_TYPES = [
  "stl", "obj", "3mf", "step", "stp", "iges", "igs", "blend", "f3d", 
  "zip", "rar", "7z", "pdf", "png", "jpg", "jpeg"
];