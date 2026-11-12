/**
 * Every photo on the site outside projects that can be replaced from the admin panel.
 * `size` is the recommended upload size for how the slot is displayed (2× for sharp screens;
 * uploads are resized to at most 2400 px). `alt` is used once a slot's photo is replaced.
 */
export const sitePhotoSlots = [
  { key: "hero", group: "home", label: "მთავარი ბანერი", where: "მთავარი გვერდის ზედა ნაწილი, სათაურის გვერდით.", size: "2000 × 1334", shape: "ჰორიზონტალური, 3:2", alt: "GNG-ის მიერ დამზადებული ავეჯი ინტერიერში", altEn: "Furniture made by GNG in an interior" },
  { key: "aboutPrimary", group: "home", label: "„ჩვენს შესახებ“ - ვიწრო ფოტო", where: "მთავარი გვერდი, „ჩვენს შესახებ“ ბლოკის მარცხენა (ვერტიკალური) ფოტო.", size: "800 × 1200", shape: "ვერტიკალური, 2:3", alt: "GNG-ის ავეჯი ინტერიერში", altEn: "GNG furniture in an interior" },
  { key: "aboutSecondary", group: "home", label: "„ჩვენს შესახებ“ - ფართო ფოტო", where: "მთავარი გვერდი, „ჩვენს შესახებ“ ბლოკის მარჯვენა ფოტო.", size: "1200 × 800", shape: "ჰორიზონტალური, 3:2", alt: "GNG-ის ავეჯი ინტერიერში", altEn: "GNG furniture in an interior" },
  { key: "serviceBanner", group: "home", label: "„საქმიანობის სფერო“ ბანერი", where: "მთავარი გვერდი, სერვისების სათაურის უკან. მარცხენა მხარე დაბნელებულია ტექსტისთვის - მთავარი საგანი მარჯვნივ განათავსეთ.", size: "2400 × 1000", shape: "ფართო ჰორიზონტალური, 12:5", alt: "GNG-ის მიერ მოწყობილი ინტერიერი", altEn: "An interior furnished by GNG" },
  { key: "serviceDesign", group: "services", label: "სერვისი 01 - პროექტირება და დიზაინი", where: "სერვისების სია მთავარ გვერდზე და სერვისების გვერდზე.", size: "1200 × 900", shape: "ჰორიზონტალური, 4:3", alt: "ავეჯის პროექტირება და დიზაინი", altEn: "Furniture design and planning" },
  { key: "serviceProduction", group: "services", label: "სერვისი 02 - დამზადება", where: "სერვისების სია მთავარ გვერდზე და სერვისების გვერდზე.", size: "1200 × 900", shape: "ჰორიზონტალური, 4:3", alt: "ავეჯის დამზადება", altEn: "Furniture manufacturing" },
  { key: "serviceImport", group: "services", label: "სერვისი 03 - იმპორტი", where: "სერვისების სია მთავარ გვერდზე და სერვისების გვერდზე.", size: "1200 × 900", shape: "ჰორიზონტალური, 4:3", alt: "ავეჯის იმპორტი", altEn: "Furniture import" },
  { key: "serviceInstallation", group: "services", label: "სერვისი 04 - მენეჯმენტი და მონტაჟი", where: "სერვისების სია მთავარ გვერდზე და სერვისების გვერდზე.", size: "1200 × 900", shape: "ჰორიზონტალური, 4:3", alt: "დამზადებისა და მონტაჟის მენეჯმენტი", altEn: "Production and installation management" },
  { key: "aboutIntro", group: "about", label: "შესავალი ფოტო", where: "„ჩვენს შესახებ“ გვერდის ზედა ნაწილი, სათაურის გვერდით.", size: "1400 × 1300", shape: "თითქმის კვადრატი", alt: "GNG-ის ავეჯი ინტერიერში", altEn: "GNG furniture in an interior" },
  { key: "aboutQuality", group: "about", label: "ხარისხის ბლოკის ფოტო", where: "„ჩვენს შესახებ“ გვერდი, ხარისხის შესახებ ტექსტის გვერდით.", size: "1200 × 1400", shape: "ოდნავ ვერტიკალური; მთავარი საგანი ცენტრში", alt: "GNG-ის ავეჯის დეტალი", altEn: "A detail of GNG furniture" },
  { key: "consultation", group: "shared", label: "კონსულტაციის ბლოკის ფონი", where: "„დაგვიკავშირდით“ ბლოკი მთავარ და სერვისების გვერდებზე. ფოტოს ზემოდან ტექსტი და მუქი ფენა დევს.", size: "2400 × 1350", shape: "ჰორიზონტალური, 16:9", alt: "", altEn: "" },
  { key: "footer", group: "shared", label: "ქვედა ნაწილის ფოტო", where: "ყველა გვერდის ბოლოს, ლოგოს ქვეშ.", size: "2400 × 1350", shape: "ჰორიზონტალური, 16:9", alt: "GNG-ის ავეჯიანი ინტერიერი", altEn: "An interior with GNG furniture" },
] as const;

export type SitePhotoKey = (typeof sitePhotoSlots)[number]["key"];
export const sitePhotoGroups = [
  { key: "home", title: "მთავარი გვერდი" },
  { key: "services", title: "სერვისები" },
  { key: "about", title: "„ჩვენს შესახებ“ გვერდი" },
  { key: "shared", title: "რამდენიმე გვერდზე" },
] as const;
