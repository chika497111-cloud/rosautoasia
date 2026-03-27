export interface CarBrand {
  id: string;
  name: string;
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  years: string;
}

export const carBrands: CarBrand[] = [
  { id: "toyota", name: "Toyota" },
  { id: "hyundai", name: "Hyundai" },
  { id: "kia", name: "Kia" },
  { id: "honda", name: "Honda" },
  { id: "nissan", name: "Nissan" },
  { id: "mitsubishi", name: "Mitsubishi" },
  { id: "mazda", name: "Mazda" },
  { id: "subaru", name: "Subaru" },
  { id: "lexus", name: "Lexus" },
  { id: "chevrolet", name: "Chevrolet" },
  { id: "daewoo", name: "Daewoo" },
  { id: "chery", name: "Chery" },
  { id: "geely", name: "Geely" },
  { id: "haval", name: "Haval" },
];

export const carModels: CarModel[] = [
  // Toyota
  { id: "camry", brandId: "toyota", name: "Camry", years: "2001-2024" },
  { id: "corolla", brandId: "toyota", name: "Corolla", years: "1995-2024" },
  { id: "rav4", brandId: "toyota", name: "RAV4", years: "2000-2024" },
  { id: "land-cruiser", brandId: "toyota", name: "Land Cruiser", years: "1998-2024" },
  { id: "prado", brandId: "toyota", name: "Land Cruiser Prado", years: "2002-2024" },
  { id: "highlander", brandId: "toyota", name: "Highlander", years: "2001-2024" },
  // Hyundai
  { id: "solaris", brandId: "hyundai", name: "Solaris", years: "2010-2024" },
  { id: "sonata", brandId: "hyundai", name: "Sonata", years: "2004-2024" },
  { id: "tucson", brandId: "hyundai", name: "Tucson", years: "2004-2024" },
  { id: "elantra", brandId: "hyundai", name: "Elantra", years: "2006-2024" },
  { id: "creta", brandId: "hyundai", name: "Creta", years: "2016-2024" },
  // Kia
  { id: "rio", brandId: "kia", name: "Rio", years: "2005-2024" },
  { id: "optima", brandId: "kia", name: "Optima/K5", years: "2010-2024" },
  { id: "sportage", brandId: "kia", name: "Sportage", years: "2004-2024" },
  { id: "cerato", brandId: "kia", name: "Cerato", years: "2004-2024" },
  // Honda
  { id: "civic", brandId: "honda", name: "Civic", years: "1996-2024" },
  { id: "accord", brandId: "honda", name: "Accord", years: "1998-2024" },
  { id: "crv", brandId: "honda", name: "CR-V", years: "1997-2024" },
  { id: "fit", brandId: "honda", name: "Fit/Jazz", years: "2001-2024" },
  // Nissan
  { id: "almera", brandId: "nissan", name: "Almera", years: "2000-2018" },
  { id: "xtrail", brandId: "nissan", name: "X-Trail", years: "2001-2024" },
  { id: "qashqai", brandId: "nissan", name: "Qashqai", years: "2006-2024" },
  // Mitsubishi
  { id: "outlander", brandId: "mitsubishi", name: "Outlander", years: "2003-2024" },
  { id: "lancer", brandId: "mitsubishi", name: "Lancer", years: "2000-2017" },
  { id: "pajero", brandId: "mitsubishi", name: "Pajero", years: "1999-2021" },
  // Others with 1-2 popular models
  { id: "mazda3", brandId: "mazda", name: "Mazda 3", years: "2003-2024" },
  { id: "mazda6", brandId: "mazda", name: "Mazda 6", years: "2002-2024" },
  { id: "forester", brandId: "subaru", name: "Forester", years: "1997-2024" },
  { id: "rx350", brandId: "lexus", name: "RX 350", years: "2003-2024" },
  { id: "cruze", brandId: "chevrolet", name: "Cruze", years: "2009-2020" },
  { id: "nexia", brandId: "daewoo", name: "Nexia", years: "1994-2016" },
  { id: "tiggo", brandId: "chery", name: "Tiggo", years: "2005-2024" },
  { id: "coolray", brandId: "geely", name: "Coolray", years: "2019-2024" },
  { id: "jolion", brandId: "haval", name: "Jolion", years: "2021-2024" },
];

export function getModelsByBrand(brandId: string): CarModel[] {
  return carModels.filter((m) => m.brandId === brandId);
}
