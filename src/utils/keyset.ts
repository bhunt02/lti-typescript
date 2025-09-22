/* Handle jwk keyset generation */
import { Database } from './database';
import { PublicKeyModel } from '../entities/key.entity';
import { Debug } from './debug';
import * as Jwk from 'rasha';
import { KeyObject } from './types';

export class Keyset {
  /**
   * @description Handles the creation of jwk keyset.
   */
  static async build() {
    Debug.log(this, 'Generating JWK keyset');
    const keys = await Database.find(PublicKeyModel);
    const keyset = { keys: [] };
    for (const key of keys) {
      const jwk = await Jwk.import({
        pem: (key.data as unknown as KeyObject).key,
      });
      jwk.kid = key.kid;
      jwk.alg = 'RS256';
      jwk.use = 'sig';
      keyset.keys.push(jwk);
    }
    return keyset;
  }
}
