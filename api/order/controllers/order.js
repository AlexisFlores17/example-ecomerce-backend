"use strict";

const stripe = require("stripe")(
  "sk_test_51L8vFwLsCXaWwDgycFmYU1HOAxyJ4M08x5mvCnSTeSXb04hTKSjnQcYdokXBqKG7CLMxabvmPvgNQX5Q2GByTLGR00JA4DEAEd"
);
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { token, products, idUser, addressShipping } = ctx.request.body;
    let totalPayment = 0;

    products.forEach((product) => {
      totalPayment = totalPayment + product.price;
    });

    const charge = await stripe.charges.create({
      amount: totalPayment * 100,
      currency: "eur",
      source: token.id,
      description: `ID usuario: ${idUser}`,
    });

    const createOrder = [];

    for await (const product of products) {
      const data = {
        game: product.id,
        users_permissions_user: idUser,
        totalPayment,
        idPayment: charge.id,
        addressShipping,
      };

      const validData = await strapi.entityValidator.validateEntityCreation(
        strapi.models.order,
        data
      );

      const entry = await strapi.query("order").create(validData);
      createOrder.push(entry);
    }

    return createOrder;
  },
};
