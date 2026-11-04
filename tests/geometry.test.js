import test from 'node:test';import assert from 'node:assert/strict';import {polygonArea,pointInPolygon,canOccupy,validateMap,makeSector} from '../src/geometry.js';import {demoProject} from '../src/demo.js';
const square=[{x:0,y:0},{x:4,y:0},{x:4,y:4},{x:0,y:4}];
test('area and containment',()=>{assert.equal(polygonArea(square),16);assert.equal(pointInPolygon(2,2,square),true);assert.equal(pointInPolygon(8,8,square),false)});
test('collision rejects boundaries and accepts interior',()=>{const m={sectors:[makeSector(square)]};assert.equal(canOccupy(m,2,2),true);assert.equal(canOccupy(m,.1,2),false);assert.equal(canOccupy(m,8,8),false)});
test('demo validates',()=>assert.deepEqual(validateMap(demoProject().maps[0]),[]));
test('invalid height is rejected',()=>{const s=makeSector(square);s.ceiling=-1;assert.ok(validateMap({sectors:[s]}).length)});