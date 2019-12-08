import { test1, test2, input } from "./6.in";
import { Tree, printTree } from "./tree";
import { assertEqual } from "./assert";

function parseObjects(input: string[]) {
  const objects: Record<string, Tree> = {};
  const getByName = (name: string) => {
    if (!objects[name])
      objects[name] = { key: name, children: [], parent: null };
    return objects[name];
  };

  for (let line of input) {
    const [orbitedName, satelliteName] = line.split(")");
    const orbited = getByName(orbitedName);
    const satellite = getByName(satelliteName);
    orbited.children.push(satellite);
    satellite.parent = orbited;
  }

  return objects;
}

function getTotalOrbits(input: string[]) {
  const objects = parseObjects(input);

  function _totalOrbits(object: Tree, depth = 0) {
    return (
      depth +
      object.children.reduce(
        (orbits, child) => orbits + _totalOrbits(child, depth + 1),
        0
      )
    );
  }

  return _totalOrbits(objects["COM"]);
}

function getDepth(root: Tree, node: Tree) {
  if (root.key === node.key) return 0;
  if (!node.parent) return Infinity;
  return getDepth(root, node.parent) + 1;
}

function getOrbitalTransfer(root: Tree, object1: Tree, object2: Tree) {
  return getDepth(root, object1) + getDepth(root, object2) - 2;
}

function getMinOrbitalTransfer(input: string[]) {
  const objects = parseObjects(input);

  function _minOrbitalTransfer(root: Tree, object1: Tree, object2: Tree) {
    const distance = getOrbitalTransfer(root, object1, object2);
    return root.children.reduce(
      (minDepth, object) =>
        Math.min(minDepth, _minOrbitalTransfer(object, object1, object2)),
      distance
    );
  }

  return _minOrbitalTransfer(objects["COM"], objects["YOU"], objects["SAN"]);
}

assertEqual(getTotalOrbits(test1), 42);
assertEqual(getTotalOrbits(input), 158090);

assertEqual(getMinOrbitalTransfer(test2), 4);
assertEqual(getMinOrbitalTransfer(input), 241);
