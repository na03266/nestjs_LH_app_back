import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator();
export const Private = Reflector.createDecorator();