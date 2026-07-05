export type DemoProductRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
  stock: number;
  supplier: string;
  warehouse: string;
  updatedAt: string;
  margin: number;
  notes: string;
  weight: number;
  origin: string;
  batch: string;
};

const CATEGORIES = ['Electronics', 'Office', 'Furniture', 'Tools', 'Packaging', 'Safety'] as const;
const STATUSES = ['active', 'draft', 'archived'] as const;
const SUPPLIERS = ['Acme Co', 'Northwind', 'Globex', 'Initech', 'Umbrella', 'Stark'] as const;
const WAREHOUSES = ['HN-01', 'HCM-02', 'DN-03', 'CT-04'] as const;

const ORIGINS = ['VN', 'CN', 'JP', 'KR', 'US', 'DE'] as const;

const PRODUCT_NAMES = [
  'Wireless keyboard',
  'Ergonomic chair',
  'LED desk lamp',
  'Steel shelving',
  'Label printer',
  'Safety goggles',
  'Packaging tape',
  'USB-C hub',
  'Standing desk',
  'Barcode scanner',
  'Coffee machine',
  'Floor mat',
];

function pick<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

export function createDemoProductRows(count = 50): DemoProductRow[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `row-${index + 1}`;
    const category = pick(CATEGORIES, index);
    const status = pick(STATUSES, index + 3);
    const price = 12_000 + (index % 97) * 1_350;
    const stock = (index * 7) % 420;
    const margin = 8 + (index % 25);

    return {
      id,
      sku: `SKU-${String(10_000 + index)}`,
      name: `${pick(PRODUCT_NAMES, index)} #${index + 1}`,
      category,
      status,
      price,
      stock,
      supplier: pick(SUPPLIERS, index + 1),
      warehouse: pick(WAREHOUSES, index + 2),
      updatedAt: new Date(Date.UTC(2025, index % 12, (index % 27) + 1)).toISOString().slice(0, 10),
      margin,
      notes: index % 5 === 0 ? 'Reorder soon' : index % 7 === 0 ? 'VIP customer' : '',
      weight: 0.2 + (index % 18) * 0.35,
      origin: pick(ORIGINS, index),
      batch: `B-${String(202600 + index)}`,
    };
  });
}
