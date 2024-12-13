import {Express} from "express";
import {Category} from "../types";
import {getAllProductFeaturedProfiles, getCategories} from "../db/dataset";
import {ProductFeaturedProfile} from "../feature/feature";
import {stringify} from 'flatted';

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
}