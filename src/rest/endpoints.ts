import {Express} from "express";
import {Category} from "../types";
import {getAllProductFeaturedProfiles, getCategories} from "../db/dataset";
import {ProductFeaturedProfile} from "../feature/feature";
import {stringify} from 'flatted';
import multer from "multer";
import {uploadImage} from "../cloud/cloud-resolver";

const upload = multer({storage: multer.memoryStorage()});

export function setupEndpoints(app: Express) {
    app.get('/api/v1/dashboard', async (_, res) => {
        const result = [];

        const categories: Category[] = await getCategories();
        result.push({categories: categories});

        const productFeaturedProfiles: ProductFeaturedProfile[] = await getAllProductFeaturedProfiles();
        result.push({productFeaturedProfiles: productFeaturedProfiles});

        const registrationFeaturedProfiles: ProductFeaturedProfile[] = await getAllProductFeaturedProfiles();
        result.push({registrationFeaturedProfiles: registrationFeaturedProfiles});

        return res.json(JSON.parse(stringify(result)));
    })

    app.get('/api/v1/categories', async (_, res) => {
        const result = [];

        const categories: Category[] = await getCategories();
        result.push({categories: categories});

        return res.json(JSON.parse(stringify(result)));
    })

    app.get('/api/v1/productFeaturedProfiles', async (_, res) => {
        const result = [];

        const productFeaturedProfiles: ProductFeaturedProfile[] = await getAllProductFeaturedProfiles();
        result.push({productFeaturedProfiles: productFeaturedProfiles});

        return res.json(JSON.parse(stringify(result)));
    })

    app.get('/api/v1/registrationFeaturedProfiles', async (_, res) => {
        const result = [];

        const registrationFeaturedProfiles: ProductFeaturedProfile[] = await getAllProductFeaturedProfiles();
        result.push({registrationFeaturedProfiles: registrationFeaturedProfiles});

        return res.json(JSON.parse(stringify(result)));
    })

    app.post('/api/v1/avatar/upload', upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        try {
            const fileUrl = await uploadImage(req.file);
            res.status(200).send({fileUrl});
        } catch (err) {
            res.status(500).send({message: err});
        }
    });
}