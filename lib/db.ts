import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as authSchema from './schemas/auth-schema';
import * as schema from './schemas/schema';
import * as relations from './schemas/relations';
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, 
    schema: {
        ...authSchema,
        ...schema,
        ...relations
    }
});
