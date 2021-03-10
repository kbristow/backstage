/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InputError } from '@backstage/backend-common';
import { EntityName, parseEntityName } from '@backstage/catalog-model';
import express from 'express';
import Router from 'express-promise-router';
import { TodoService } from './types';

export interface RouterOptions {
  todoService: TodoService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { todoService } = options;

  const router = Router();
  router.use(express.json());

  router.get('/v1/todos', async (req, res) => {
    const offset = parseIntegerParam(req.query.offset, 'offset query');
    const limit = parseIntegerParam(req.query.limit, 'limit query');

    const entityRef = req.query.entity;
    if (entityRef && typeof entityRef !== 'string') {
      throw new InputError(`entity query must be a string`);
    }
    let entity: EntityName | undefined = undefined;
    if (entityRef) {
      try {
        entity = parseEntityName(entityRef);
      } catch (error) {
        throw new InputError(`Invalid entity ref, ${error}`);
      }
    }

    const todos = await todoService.listTodos({ entity, offset, limit });
    res.json(todos);
  });

  return router;
}

function parseIntegerParam(str: unknown, ctx: string): number | undefined {
  if (str === undefined) {
    return undefined;
  }
  if (typeof str !== 'string') {
    throw new InputError(`invalid ${ctx}, must be a string`);
  }
  const parsed = parseInt(str, 10);
  if (!Number.isInteger(parsed)) {
    throw new InputError(`invalid ${ctx}, not an integer`);
  }
  return parsed;
}
