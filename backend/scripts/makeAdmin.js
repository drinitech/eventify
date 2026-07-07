require('dotenv').config();
const prisma = require('../config/db');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Perdorim: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`${user.email} eshte tani ADMIN`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
