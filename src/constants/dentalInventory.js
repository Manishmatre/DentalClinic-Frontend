// Dental inventory categories
export const DENTAL_INVENTORY_CATEGORIES = [
  {
    name: "Restorative Materials",
    subcategories: ["Composites", "Amalgams", "Cements", "Liners and Bases", "Temporary Materials"]
  },
  {
    name: "Endodontic Supplies",
    subcategories: ["Files and Reamers", "Obturation Materials", "Irrigation Solutions", "Medicaments"]
  },
  {
    name: "Prosthodontic Materials",
    subcategories: ["Impression Materials", "Waxes", "Acrylics", "Porcelains", "Alloys"]
  },
  {
    name: "Orthodontic Supplies",
    subcategories: ["Brackets", "Wires", "Bands", "Elastics", "Adhesives"]
  },
  {
    name: "Periodontal Supplies",
    subcategories: ["Curettes", "Scalers", "Periodontal Dressings", "Local Delivery Agents"]
  },
  {
    name: "Preventive Products",
    subcategories: ["Fluorides", "Sealants", "Prophylaxis Materials", "Whitening Products"]
  },
  {
    name: "Infection Control",
    subcategories: ["Gloves", "Masks", "Surface Disinfectants", "Sterilization Supplies"]
  },
  {
    name: "Anesthetics",
    subcategories: ["Local Anesthetics", "Topical Anesthetics", "Needles and Syringes"]
  },
  {
    name: "Instruments",
    subcategories: ["Hand Instruments", "Rotary Instruments", "Surgical Instruments", "Diagnostic Instruments"]
  },
  {
    name: "Equipment",
    subcategories: ["Handpieces", "Curing Lights", "X-ray Equipment", "Sterilizers"]
  },
  {
    name: "Disposables",
    subcategories: ["Cotton Products", "Bibs and Barriers", "Suction Tips", "Saliva Ejectors"]
  },
  {
    name: "Medications",
    subcategories: ["Antibiotics", "Analgesics", "Anti-inflammatories", "Sedatives"]
  }
];

// Common dental suppliers
export const DENTAL_SUPPLIERS = [
  "Henry Schein Dental",
  "Patterson Dental",
  "Benco Dental",
  "Darby Dental Supply",
  "Dental Health Products, Inc.",
  "Net32",
  "DentSupply Sirona",
  "3M Oral Care",
  "Kerr Dental",
  "GC America",
  "Ultradent Products",
  "Premier Dental Products",
  "Hu-Friedy",
  "Ivoclar Vivadent",
  "Septodont",
  "Coltene/Whaledent"
];

// Units of measure for dental inventory
export const DENTAL_UNITS_OF_MEASURE = [
  "Each",
  "Pack",
  "Box",
  "Case",
  "Set",
  "Kit",
  "Bottle",
  "Tube",
  "Syringe",
  "Cartridge",
  "Sheet",
  "Roll",
  "Pair",
  "Gram",
  "Milliliter",
  "Liter"
];

// Default reorder thresholds by category
export const DEFAULT_REORDER_THRESHOLDS = {
  "Restorative Materials": 5,
  "Endodontic Supplies": 10,
  "Prosthodontic Materials": 5,
  "Orthodontic Supplies": 15,
  "Periodontal Supplies": 8,
  "Preventive Products": 10,
  "Infection Control": 20,
  "Anesthetics": 15,
  "Instruments": 3,
  "Equipment": 1,
  "Disposables": 25,
  "Medications": 10
};
