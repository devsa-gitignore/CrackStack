const API_BASE = 'http://localhost:5000/api';

export const wardrobeApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/wardrobe`);
    if (!res.ok) throw new Error('Unable to fetch wardrobe');
    return res.json();
  },
  
  create: async (itemData) => {
    const res = await fetch(`${API_BASE}/wardrobe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Unable to save item');
    return res.json();
  },
  
  delete: async (id) => {
    const res = await fetch(`${API_BASE}/wardrobe/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Unable to delete item');
    return res.json();
  },
  
  getCompleteOutfit: async (id) => {
    const res = await fetch(`${API_BASE}/wardrobe/complete/${id}`);
    if (!res.ok) throw new Error('Unable to fetch outfit suggestions');
    return res.json();
  }
};

export const vendorApi = {
    getAllProducts: async () => {
        const res = await fetch(`${API_BASE}/vendor/products`);
        if (!res.ok) throw new Error('Unable to fetch products');
        return res.json();
    }
};
