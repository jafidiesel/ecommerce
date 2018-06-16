"use strict";

import * as express from "express";
import { NextFunction } from "express-serve-static-core";
import * as uuid from "uuid/v1";
import * as error from "../utils/error";
import * as redis from "../utils/redis";
import { IImage } from "./types";


/**
 * @api {post} /v1/image Crear Imagen
 * @apiName Crear Imagen
 * @apiGroup Imagen
 *
 * @apiDescription Agrega una nueva imagen al servidor.
 *
 * @apiExample {json} Body
 *    {
 *      "image" : "{Imagen en formato Base 64}"
 *    }
 *
 * @apiSuccessExample {json} Respuesta
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "{Id de imagen}"
 *     }
 *
 * @apiUse AuthHeader
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
export async function validateCreate(req: express.Request, res: express.Response, next: NextFunction) {
  req.check("image", "Debe especificar la imagen.").isLength({ min: 1 });
  req.check("image", "Imagen invalida").contains("data:image/");

  const result = await req.getValidationResult();
  if (!result.isEmpty()) {
    return error.handleExpressValidationError(res, result);
  }
  next();
}

export async function create(req: express.Request, res: express.Response) {
  const image: IImage = {
    id: uuid(),
    image: req.body.image
  };

  try {
    const id = await redis.setRedisDocument(image.id, image.image);
    res.json({ id: id });
  } catch (err) {
    return error.handleError(res, err);
  }
}
