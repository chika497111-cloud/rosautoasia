// Моковые данные — заглушки, пока не подключим 1С

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  article: string;
  category_id: string;
  price: number;
  quantity: number;
  unit: string;
  description: string;
  image: string;
  brand: string;
  car_brand: string;
  car_model: string;
}

export const categories: Category[] = [
  { id: "1", name: "Тормозная система", slug: "tormoznaya-sistema", parent_id: null, image: "/categories/brakes.jpg" },
  { id: "2", name: "Двигатель", slug: "dvigatel", parent_id: null, image: "/categories/engine.jpg" },
  { id: "3", name: "Подвеска", slug: "podveska", parent_id: null, image: "/categories/suspension.jpg" },
  { id: "4", name: "Фильтры", slug: "filtry", parent_id: null, image: "/categories/filters.jpg" },
  { id: "5", name: "Электрика", slug: "elektrika", parent_id: null, image: "/categories/electric.jpg" },
  { id: "6", name: "Кузов", slug: "kuzov", parent_id: null, image: "/categories/body.jpg" },
  { id: "7", name: "Масла и жидкости", slug: "masla-i-zhidkosti", parent_id: null, image: "/categories/oils.jpg" },
  { id: "8", name: "Охлаждение", slug: "ohlazhdenie", parent_id: null, image: "/categories/cooling.jpg" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Колодки тормозные передние",
    article: "04465-33471",
    category_id: "1",
    price: 2800,
    quantity: 15,
    unit: "компл.",
    description: "Тормозные колодки передние для Toyota Camry V50/V70. Оригинальное качество.",
    image: "/products/brake-pads.jpg",
    brand: "SAT",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p2",
    name: "Диски тормозные передние",
    article: "43512-33130",
    category_id: "1",
    price: 4500,
    quantity: 8,
    unit: "шт.",
    description: "Тормозной диск передний для Toyota Camry V50. Вентилируемый.",
    image: "/products/brake-disc.jpg",
    brand: "SAT",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p3",
    name: "Фильтр масляный",
    article: "04152-31090",
    category_id: "4",
    price: 450,
    quantity: 50,
    unit: "шт.",
    description: "Масляный фильтр для Toyota 1AR-FE, 2AR-FE, 2GR-FE.",
    image: "/products/oil-filter.jpg",
    brand: "Sakura",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p4",
    name: "Фильтр воздушный",
    article: "17801-38011",
    category_id: "4",
    price: 650,
    quantity: 30,
    unit: "шт.",
    description: "Воздушный фильтр двигателя для Toyota Camry V70.",
    image: "/products/air-filter.jpg",
    brand: "Sakura",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p5",
    name: "Амортизатор передний правый",
    article: "48510-80456",
    category_id: "3",
    price: 7200,
    quantity: 4,
    unit: "шт.",
    description: "Амортизатор передний правый газомасляный для Toyota Camry V70.",
    image: "/products/shock-absorber.jpg",
    brand: "KYB",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p6",
    name: "Свеча зажигания иридиевая",
    article: "90919-01253",
    category_id: "5",
    price: 1200,
    quantity: 100,
    unit: "шт.",
    description: "Свеча зажигания иридиевая для двигателей Toyota 2AR-FE.",
    image: "/products/spark-plug.jpg",
    brand: "Denso",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p7",
    name: "Ремень ГРМ комплект",
    article: "13568-09131",
    category_id: "2",
    price: 8500,
    quantity: 3,
    unit: "компл.",
    description: "Комплект ГРМ (ремень + ролики) для Hyundai Accent/Solaris 1.4-1.6.",
    image: "/products/timing-belt.jpg",
    brand: "Gates",
    car_brand: "Hyundai",
    car_model: "Solaris",
  },
  {
    id: "p8",
    name: "Масло моторное 5W-30 4л",
    article: "08880-10705",
    category_id: "7",
    price: 3200,
    quantity: 25,
    unit: "шт.",
    description: "Масло моторное Toyota 5W-30 SN/GF-5 синтетическое, 4 литра.",
    image: "/products/engine-oil.jpg",
    brand: "Toyota",
    car_brand: "Toyota",
    car_model: "",
  },
  {
    id: "p9",
    name: "Радиатор охлаждения",
    article: "16400-28680",
    category_id: "8",
    price: 12000,
    quantity: 2,
    unit: "шт.",
    description: "Радиатор охлаждения двигателя для Toyota Camry V50 2.5.",
    image: "/products/radiator.jpg",
    brand: "SAT",
    car_brand: "Toyota",
    car_model: "Camry",
  },
  {
    id: "p10",
    name: "Колодки тормозные задние",
    article: "58302-3QA10",
    category_id: "1",
    price: 1800,
    quantity: 12,
    unit: "компл.",
    description: "Тормозные колодки задние для Hyundai Sonata / Kia Optima.",
    image: "/products/rear-brake-pads.jpg",
    brand: "Sangsin",
    car_brand: "Hyundai",
    car_model: "Sonata",
  },
  {
    id: "p11",
    name: "Стойка стабилизатора передняя",
    article: "54830-3S100",
    category_id: "3",
    price: 900,
    quantity: 20,
    unit: "шт.",
    description: "Стойка стабилизатора передняя для Hyundai Sonata YF/LF.",
    image: "/products/stabilizer-link.jpg",
    brand: "CTR",
    car_brand: "Hyundai",
    car_model: "Sonata",
  },
  {
    id: "p12",
    name: "Фара передняя левая",
    article: "92101-F2000",
    category_id: "6",
    price: 15000,
    quantity: 1,
    unit: "шт.",
    description: "Фара передняя левая для Hyundai Elantra AD 2016-2018.",
    image: "/products/headlight.jpg",
    brand: "Depo",
    car_brand: "Hyundai",
    car_model: "Elantra",
  },
];

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category_id === categoryId);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** Simple Russian stemming — strip common endings to match word forms */
function stem(word: string): string {
  return word
    .replace(/(ами|ями|ого|ому|ыми|ими|ах|ях|ов|ев|ей|ой|ий|ый|ая|яя|ое|ее|ие|ые|ую|юю|их|ых|ём|ом|ем|ам|ям|ой|ей|ию|ью|ья|ье|ов|ек|ок|ки|ка|ку|ке|ко|ны|на|ну|не|но|ть|ся|ся)$/, "");
}

export function searchProducts(query: string): Product[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  return products.filter((p) => {
    const fields = [
      p.name,
      p.article,
      p.brand,
      p.car_brand,
      p.car_model,
    ].map((f) => f.toLowerCase());

    // Every query word must match at least one field
    // Try both direct partial match and stemmed match
    return words.every((word) => {
      const stemmed = stem(word);
      return fields.some((field) => {
        if (field.includes(word)) return true;
        if (stemmed.length >= 3 && field.includes(stemmed)) return true;
        // Also stem each word in the field and compare
        const fieldWords = field.split(/[\s\-\/,]+/);
        return fieldWords.some((fw) => {
          const fwStemmed = stem(fw);
          return fwStemmed === stemmed || fw.startsWith(stemmed) || (stemmed.length >= 3 && fwStemmed.startsWith(stemmed));
        });
      });
    });
  });
}
