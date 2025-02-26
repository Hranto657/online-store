import { Request, Response } from "express";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import docClient from "../services/dbService";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const command = new ScanCommand({ TableName: "Products" });
    const response = await docClient.send(command);

    res.status(200).json(response.Items);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "ID is required" });
    return;
  }
  const params = {
    TableName: "Products",
    Key: {
      id,
    },
  };

  try {
    const command = new GetCommand(params);
    const response = await docClient.send(command);
    if (response.Item) {
      res.status(200).json(response.Item);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, name, price } = req.body;

  if (!id || !name || !price) {
    res
      .status(400)
      .json({ message: "All fields (id, name, price) are required" });
    return;
  }
  const newProduct = {
    TableName: "Products",
    Item: {
      id,
      name,
      price,
    },
  };

  try {
    const command = new PutCommand(newProduct);
    await docClient.send(command);

    res
      .status(201)
      .json({ message: "Product added", product: newProduct.Item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, price } = req.body;

  if (!id) {
    res.status(400).json({ message: "ID is required" });
    return;
  }

  if (name === undefined && price === undefined) {
    res
      .status(400)
      .json({ message: "At least one field (name or price) must be provided" });
    return;
  }

  const updateExpressions = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  if (name !== undefined) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = name;
  }

  if (price !== undefined) {
    updateExpressions.push("price = :price");
    expressionAttributeValues[":price"] = price;
  }
  const params = {
    TableName: "Products",
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ...(Object.keys(expressionAttributeNames).length > 0 && {
      ExpressionAttributeNames: expressionAttributeNames,
    }),
    ...(Object.keys(expressionAttributeValues).length > 0 && {
      ExpressionAttributeValues: expressionAttributeValues,
    }),
    ReturnValues: "ALL_NEW" as ReturnValue,
  };

  try {
    const command = new UpdateCommand(params);
    const response = await docClient.send(command);

    res
      .status(200)
      .json({ message: "Product updated", product: response.Attributes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "ID is required" });
    return;
  }

  const params = {
    TableName: "Products",
    Key: { id },
  };

  try {
    const command = new DeleteCommand(params);
    await docClient.send(command);

    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
