import { test1, input } from "./6.in";
import { Tree, printTree } from "./tree";
import { assertEqual } from "./assert";

function parseObjects(input: string[]) {
  const objects: Record<string, Tree> = {};
  const getByName = (name: string) => {
    if (!objects[name]) objects[name] = { key: name, children: [] };
    return objects[name];
  };

  for (let line of input) {
    const [orbitedName, satelliteName] = line.split(")");
    const orbited = getByName(orbitedName);
    const satellite = getByName(satelliteName);
    orbited.children.push(satellite);
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

assertEqual(getTotalOrbits(test1), 42);
assertEqual(getTotalOrbits(input), 158090);
