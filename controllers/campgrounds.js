const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground);

    if (!campground) {
        req.flash('error', 'Cannot find that campground.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.editCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully update campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Success delete campground!');
    res.redirect('/campgrounds');
}


// {
//     "type":"FeatureCollection",
//     "query":["yosemite", "ca"],
//     "features":[{
//         "id": "poi.1228360694652",
//         "type": "Feature",
//         "place_type": ["poi"],
//         "relevance": 1,
//         "properties": {
//             "foursquare": "4bcce20a1dd3eee1ca849a3d",
//             "landmark": true,
//             "address": "Curry Village",
//             "category": "hotel, motel, tourism, lodging"
//         },
//         "text": "Yosemite Cabins & Tent Cabins",
//         "place_name": "Yosemite Cabins & Tent Cabins, Curry Village, Fish Camp, California 95389, United States",
//         "center": [-119.571615, 37.737363],
//         "geometry": {"coordinates": [-119.571615, 37.737363], "type": "Point"},
//         "context": [{"id": "postcode.6102042505315930", "text": "95389"}, {
//             "id": "locality.9752181729017380",
//             "wikidata": "Q2140121",
//             "text": "Yosemite Valley"
//         }, {
//             "id": "place.14848063560684840",
//             "wikidata": "Q3458389",
//             "text": "Fish Camp"
//         }, {
//             "id": "district.10272587230229220",
//             "wikidata": "Q156191",
//             "text": "Mariposa County"
//         }, {
//             "id": "region.9803118085738010",
//             "wikidata": "Q99",
//             "short_code": "US-CA",
//             "text": "California"
//         }, {"id": "country.19678805456372290", "wikidata": "Q30", "short_code": "us", "text": "United States"}]
//     }], "attribution"
// :
//     "NOTICE: © 2021 Mapbox and its suppliers. All rights reserved. Use of this data is subject to the Mapbox Terms of Service (https://www.mapbox.com/about/maps/). This response and the information it contains may not be retained. POI(s) provided by Foursquare."
// }
