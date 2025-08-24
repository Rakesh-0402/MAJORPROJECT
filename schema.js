const Joi =require('joi');

const ListingSchema =Joi.object({
    title:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.number().required().min(0),
    location:Joi.string().required(),
    country:Joi.string().required(),
     image: Joi.string().uri().required()
     category: Joi.string()
        .valid(
            "Trending",
            "Rooms",
            "Iconic cities",
            "Mountains",
            "Castles",
            "Amazing pools",
            "Farms",
            "Camping",
            "Domes",
            "Boat"
        )
        .required()


});

const reviewSchema =Joi.object({
    rating:Joi.number().min(1).max(5).required(),
    comment:Joi.string().required(),
});
module.exports = { ListingSchema, reviewSchema };
