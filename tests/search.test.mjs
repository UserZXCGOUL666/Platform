import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedProducts} from '../lib/seed.mjs';
import {searchProducts} from '../lib/search.mjs';
import {moderateText} from '../lib/moderation.mjs';
test('Search supports relevance, synonyms and small typos',()=>{assert.equal(searchProducts(seedProducts,'кресла')[0].id,'chair');assert.equal(searchProducts(seedProducts,'наушнки')[0].id,'headphones');assert.equal(searchProducts(seedProducts,'софа')[0].id,'vase');});
test('Moderation catches normalized prohibited phrases without blocking ordinary child furniture',()=>{assert.equal(moderateText('ДЕТСКОЕ П0РНО').ok,false);assert.equal(moderateText('Продаю детское кресло').ok,true);assert.equal(moderateText('сука').ok,false);});
