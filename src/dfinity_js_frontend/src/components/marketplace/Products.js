import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddProduct from "./AddProduct";
import Product from "./Product";
import Loader from "../utils/Loader";
import { Row, Button } from "react-bootstrap";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  getProducts as getProductList,
  createProduct, buyProducts
} from "../../utils/marketplace";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // function to get the list of products
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await getProductList());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  });

  const addProduct = async (data) => {
    try {
      setLoading(true);
      const priceStr = data.price;
      data.price = parseInt(priceStr, 10) * 10**8;
      createProduct(data).then((resp) => {
        getProducts();
      });
      toast(<NotificationSuccess text="Post added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a post." />);
    } finally {
      setLoading(false);
    }
  };

  //  function to initiate transaction
  const buy = async (id) => {
    try {
      setLoading(true);
      await buyProducts({
        id
      }).then((resp) => {
        getProducts();
        toast(<NotificationSuccess text="Subscribed successfully" />);
      });
    } catch (error) {
      toast(<NotificationError text="Failed to subscribe." />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      {!loading ? (
        <>
          
            <AddProduct save={addProduct} />
            
            {products.map((_product) => (
              <Product
                product={{
                  ..._product,
                }}
                buy={buy}
              />
            ))}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Products;
