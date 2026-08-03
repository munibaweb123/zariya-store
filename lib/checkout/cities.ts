export type CityOption = {
  city: string;
  province: string;
};

// Pakistani cities map unambiguously to provinces, and courier slips (TCS,
// Leopard, PostEx) don't use province — so the checkout form only ever asks
// for city; province is derived server-side from this list, never a form
// field. See CLAUDE.md's Constraints for the full reasoning.
export const PAKISTANI_CITIES: CityOption[] = [
  { city: "Karachi", province: "Sindh" },
  { city: "Lahore", province: "Punjab" },
  { city: "Islamabad", province: "Islamabad Capital Territory" },
  { city: "Rawalpindi", province: "Punjab" },
  { city: "Faisalabad", province: "Punjab" },
  { city: "Multan", province: "Punjab" },
  { city: "Peshawar", province: "Khyber Pakhtunkhwa" },
  { city: "Quetta", province: "Balochistan" },
  { city: "Sialkot", province: "Punjab" },
  { city: "Gujranwala", province: "Punjab" },
  { city: "Hyderabad", province: "Sindh" },
  { city: "Sukkur", province: "Sindh" },
  { city: "Bahawalpur", province: "Punjab" },
  { city: "Sargodha", province: "Punjab" },
  { city: "Abbottabad", province: "Khyber Pakhtunkhwa" },
  { city: "Mardan", province: "Khyber Pakhtunkhwa" },
  { city: "Gujrat", province: "Punjab" },
  { city: "Sheikhupura", province: "Punjab" },
  { city: "Jhelum", province: "Punjab" },
  { city: "Rahim Yar Khan", province: "Punjab" },
  { city: "Dera Ghazi Khan", province: "Punjab" },
  { city: "Sahiwal", province: "Punjab" },
  { city: "Nawabshah", province: "Sindh" },
  { city: "Larkana", province: "Sindh" },
  { city: "Mirpur (AJK)", province: "Azad Jammu & Kashmir" },
  { city: "Muzaffarabad", province: "Azad Jammu & Kashmir" },
  { city: "Gilgit", province: "Gilgit-Baltistan" },
];

const CITY_TO_PROVINCE = new Map(PAKISTANI_CITIES.map((entry) => [entry.city, entry.province]));

export function isKnownCity(city: string): boolean {
  return CITY_TO_PROVINCE.has(city);
}

export function provinceForCity(city: string): string | undefined {
  return CITY_TO_PROVINCE.get(city);
}
