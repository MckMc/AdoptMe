import { PetModel } from '../models/pet.schema.js';

/**
 * List pets with optional filters.
 * Query params:
 *  - species: string (e.g., "dog", "cat", "other")
 *  - adopted: "true" | "false"
 *  - page: number
 *  - limit: number
 */
export async function listPetsMongo({ species, adopted, page = 1, limit = 12 }) {
  limit = Math.max(1, Number(limit) || 12);
  page  = Math.max(1, Number(page)  || 1);

  const filter = {};
  if (species) filter.species = species;
  if (adopted === 'true') filter.adopted = true;
  if (adopted === 'false') filter.adopted = false;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    PetModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    PetModel.countDocuments(filter)
  ]);

  // compute age (in years) for UI convenience
  const now = new Date();
  const payload = items.map(p => {
    const bd = new Date(p.birthDate);
    let age = now.getFullYear() - bd.getFullYear();
    const m = now.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
    return { ...p, ageYears: Math.max(0, age) };
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const makeLink = (p) => {
    const params = new URLSearchParams();
    if (species) params.set('species', species);
    if (adopted !== undefined) params.set('adopted', adopted);
    params.set('page', String(p));
    params.set('limit', String(limit));
    return `/pets?${params.toString()}`;
  };

  return {
    status: 'success',
    payload,
    total,
    page,
    limit,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevLink: hasPrevPage ? makeLink(page - 1) : null,
    nextLink: hasNextPage ? makeLink(page + 1) : null,
  };
}

export async function getPetById(id) {
  const p = await PetModel.findById(id).lean();
  if (!p) return null;
  const now = new Date();
  const bd = new Date(p.birthDate);
  let age = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
  return { ...p, ageYears: Math.max(0, age) };
}
