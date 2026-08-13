declare const router: import("express-serve-static-core").Router;
import { JwtPayload } from 'jsonwebtoken';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export default router;
//# sourceMappingURL=chat.d.ts.map