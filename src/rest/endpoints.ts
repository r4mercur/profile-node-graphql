import {Express, NextFunction, Request, Response, Router} from "express";
import multer from "multer";
import {getCategories} from "../db/dataset";
import {uploadImage} from "../cloud/cloud-resolver";
import {listProductProfiles, listRegistrationProfiles} from "../services/featured-profile-service";
import {getDashboard} from "../services/dashboard-service";

const upload = multer({storage: multer.memoryStorage()});

export function createApiRouter(): Router {
    const router = Router();

    // Express 5 forwards rejected promises from async handlers to the error handler below.
    router.get('/dashboard', async (_, res) => {
        res.json(await getDashboard());
    });

    router.get('/categories', async (_, res) => {
        res.json({categories: await getCategories()});
    });

    router.get('/productFeaturedProfiles', async (_, res) => {
        res.json({productFeaturedProfiles: await listProductProfiles()});
    });

    router.get('/registrationFeaturedProfiles', async (_, res) => {
        res.json({registrationFeaturedProfiles: await listRegistrationProfiles()});
    });

    router.post('/avatar/upload', upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        try {
            const fileUrl = await uploadImage(req.file);
            res.status(200).send({fileUrl});
        } catch (err) {
            console.error('Avatar upload failed:', err);
            res.status(500).send({message: 'Upload failed'});
        }
    });

    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        console.error('Unhandled error in REST API:', err);
        res.status(500).json({message: 'Internal server error'});
    });

    return router;
}

export function setupEndpoints(app: Express) {
    app.use('/api/v1', createApiRouter());
}
