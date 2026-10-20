import { z } from 'zod';

// Configure before any schema is created: even Zod's caught JIT capability probe
// triggers a CSP violation when production forbids eval/new Function.
z.config({ jitless: true });

export { z };
