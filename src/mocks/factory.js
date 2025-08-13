import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

export function mockPet() {
  return {
    name: faker.person.firstName(),
    species: faker.helpers.arrayElement(['dog','cat','bird','rabbit','hamster']),
    birthDate: faker.date.birthdate({ min: 1, max: 10, mode: 'age' }),
    adopted: false,
    owner: null
  };
}

export function mockUser() {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    age: faker.number.int({ min: 18, max: 80 }),
    password: bcrypt.hashSync('coder123', 10),
    cart: null,
    role: faker.helpers.arrayElement(['user','admin']),
    pets: []
  };
}
