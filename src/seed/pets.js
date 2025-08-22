import { PetModel } from '../models/pet.schema.js';

function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

export async function seedPets({ replace = false } = {}) {
  if (replace) {
    await PetModel.deleteMany({});
  } else {
    const count = await PetModel.countDocuments();
    if (count >= 5) return { inserted: 0, skipped: count };
  }

  const pets = [
    {
      name: 'Luna',
      species: 'dog',
      birthDate: yearsAgo(4),
      adopted: false,
      description: 'Perra sociable, ideal con niños. Ama los paseos.',
      image: '/static/img/dog1.jpg',
    },
    {
      name: 'Max',
      species: 'dog',
      birthDate: yearsAgo(6),
      adopted: false,
      description: 'Tranquilo y cariñoso. Le encantan las pelotas.',
      image: '/static/img/dog2.jpg',
    },
    {
      name: 'Nala',
      species: 'cat',
      birthDate: yearsAgo(2),
      adopted: false,
      description: 'Gatita curiosa y juguetona. Usa arenero.',
      image: '/static/img/cat1.jpg',
    },
    {
      name: 'Simba',
      species: 'cat',
      birthDate: yearsAgo(3),
      adopted: false,
      description: 'Cariñoso, se adapta rápido a la casa.',
      image: '/static/img/cat2.jpg',
    },
    {
      name: 'Paco',
      species: 'other',
      birthDate: yearsAgo(5),
      adopted: false,
      description: 'Loro muy atento. Necesita enriquecimiento diario.',
      image: '/static/img/paco.jpg',
    },
  ];

  const res = await PetModel.insertMany(pets, { ordered: true });
  return { inserted: res.length };
}
