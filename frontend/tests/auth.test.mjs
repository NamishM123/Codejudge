import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

async function testHash() {
  const pw = 's3cret!';
  const h = await hash(pw, 8);
  const ok = await compare(pw, h);
  if (!ok) throw new Error('bcrypt comparison failed');
}

function testJwt() {
  const token = jwt.sign({ a: 1 }, 'test-secret');
  const p = jwt.verify(token, 'test-secret');
  if (p.a !== 1) throw new Error('JWT verify failed');
}

try {
  await testHash();
  testJwt();
  console.log('auth tests passed');
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
