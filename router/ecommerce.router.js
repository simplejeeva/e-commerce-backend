import {
  getProducts,
  getUser,
  getProductsWithId,
  updateCart,
  searchProduct,
} from "../service/ecommerce.service.js";
import { app } from "../index.js";
import express from "express";
import { auth } from "../auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Welcome to My Ecommerce Website😍😍🎉<h1>");
});
//get all products
router.get("/products", async (req, res) => {
  try {
    const getdata = await getProducts();
    res.status(200).send(getdata);
  } catch (e) {
    res.send("internal server error");
  }
});

router.get("/cart/:user", async (req, res) => {
  const { user } = req.params;
  const User = await getUser(user);
  res.status(200).send(User);
});
// add products to the cart
router.put("/addtocart/:id/:user", async (req, res) => {
  const { id, user } = req.params;
  try {
    const checkData = await getProductsWithId(id);

    const checkUser = await getUser(user);
    const getCart = checkUser.cart;
    if (!getCart.some((item) => item._id.toString() === id)) {
      const addcart = {
        cart: [...getCart, checkData],
      };
      const addCart = await updateCart(user, addcart);
      res.status(200).send({ message: "Added to Cart" });
    } else {
      res.status(200).send({ message: "Already added to cart" });
    }
  } catch (err) {
    console.log(err);
  }
});
//update quantity
router.put("/quantity/:id/:user", async (req, res) => {
  const newKey = "quantity";
  const { id, user } = req.params;
  const { number } = req.body;
  const checkData = await getProductsWithId(id);
  const checkUser = await getUser(user);
  const getCart = checkUser.cart;
  const check = getCart.findIndex(
    (item) => item._id.toString() === checkData._id.toString()
  );
  checkData[newKey] = number;
  getCart[check] = checkData;
  const addcart = {
    cart: getCart,
  };
  const addCart = await updateCart(user, addcart);
  res.status(200).send("Updated successfully");
});
//delete cart
router.delete("/delete/:id/:user", async (req, res) => {
  const { id, user } = req.params;
  const checkData = await getProductsWithId(id);
  const checkUser = await getUser(user);
  const getCart = checkUser.cart;
  const deleteCart = getCart.filter((item) => item.name !== checkData.name);
  const updatedCart = {
    cart: deleteCart,
  };
  const addCart = await updateCart(user, updatedCart);
  res.send(deleteCart);
});
//search
router.get("/products/search/:key", async (req, res) => {
  const { key } = req.params;
  if (key) {
    const getdata = await searchProduct(key);
    res.status(200).send(getdata);
  } else {
    res.status(404).send({ message: "internal server error" });
  }
});

export default router;
