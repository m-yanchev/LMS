import {DB_ACCESS} from "./server/MongoDBDataSource/accessConsts";

try {
    const fs = require('fs');
    const path = require('path');
    const {MongoClient} = require('mongodb');

    const DOMEN = 'http://tetradkavkletochku.ru';

    const client = new MongoClient(DB_ACCESS, {useUnifiedTopology: true});
    let sections = [];
    client.connect().then(() => {
        const db = client.db("LMSData");
        const headings = db.collection("headings");
        headings.find({parentId: '0'}).toArray((err, docs) => {
            if (err) throw err;
            sections = docs.map(section => section.alias);
            let sectionsXML = '';
            sections.forEach(section => sectionsXML = sectionsXML + `
    <url>
        <loc>${DOMEN}/${section}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`);
            const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${DOMEN}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>${sectionsXML}    
</urlset>`;
            const data = new Uint8Array(Buffer.from(body));
            const file = path.resolve(__dirname, './public/sitemap.xml');
            fs.writeFile(file, data, (err) => {
                if (err) throw err;
                console.log('sitemap.xml был удачно создан!');
            });
        });
        client.close().catch(err => {
            console.error(err)
        });
    }).catch(err => {
        throw err
    });
} catch (e) {
    console.error(e);
}