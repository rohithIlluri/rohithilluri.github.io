/**
 * collision.js - BVH Collision Detection Utilities
 * Helpers for efficient collision detection using three-mesh-bvh
 */

import * as THREE from 'three';

// BVH will be loaded dynamically when needed
let bvhModule = null;

/**
 * Initialize the BVH module
 * @returns {Promise<Object>} The BVH module
 */
async function getBVHModule() {
  if (!bvhModule) {
    bvhModule = await import('three-mesh-bvh');

    // Extend Three.js BufferGeometry with BVH methods
    const { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } = bvhModule;
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
  }
  return bvhModule;
}

/**
 * Build a BVH for a mesh's geometry
 * @param {THREE.Mesh} mesh The mesh to build BVH for
 * @param {Object} options BVH options
 */
export async function buildBVH(mesh, options = {}) {
  await getBVHModule();

  const defaultOptions = {
    maxLeafTris: 5,
    strategy: bvhModule.SAH,
  };

  const finalOptions = { ...defaultOptions, ...options };

  if (mesh.geometry.boundsTree) {
    mesh.geometry.disposeBoundsTree();
  }

  mesh.geometry.computeBoundsTree(finalOptions);
}

/**
 * Build BVH for multiple meshes
 * @param {THREE.Mesh[]} meshes Array of meshes
 * @param {Object} options BVH options
 */
export async function buildBVHForMeshes(meshes, options = {}) {
  await getBVHModule();

  for (const mesh of meshes) {
    if (mesh.geometry) {
      await buildBVH(mesh, options);
    }
  }
}

/**
 * Create a merged collision mesh from multiple meshes
 * @param {THREE.Mesh[]} meshes Source meshes
 * @returns {THREE.Mesh} Merged mesh with BVH
 */
export async function createMergedCollisionMesh(meshes) {
  await getBVHModule();

  const geometries = [];
  const matrix = new THREE.Matrix4();

  meshes.forEach((mesh) => {
    if (mesh.geometry) {
      const clonedGeometry = mesh.geometry.clone();
      mesh.updateMatrixWorld();
      clonedGeometry.applyMatrix4(mesh.matrixWorld);
      geometries.push(clonedGeometry);
    }
  });

  // Merge geometries
  const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js');
  const mergedGeometry = mergeGeometries(geometries, false);

  // Build BVH for merged geometry
  mergedGeometry.computeBoundsTree();

  const material = new THREE.MeshBasicMaterial({
    visible: false,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(mergedGeometry, material);
}

/**
 * Perform a capsule collision check
 * @param {THREE.Mesh} collisionMesh The mesh with BVH
 * @param {THREE.Vector3} start Capsule line start
 * @param {THREE.Vector3} end Capsule line end
 * @param {number} radius Capsule radius
 * @returns {Object|null} Collision info or null
 */
export async function capsuleCollision(collisionMesh, start, end, radius) {
  const module = await getBVHModule();
  const { MeshBVH } = module;

  if (!collisionMesh.geometry.boundsTree) {
    return null;
  }

  const tempSegment = new THREE.Line3(start.clone(), end.clone());
  const tempVector = new THREE.Vector3();

  let hit = null;

  collisionMesh.geometry.boundsTree.shapecast({
    intersectsBounds: (box) => {
      return box.distanceToPoint(tempSegment.start) < radius ||
             box.distanceToPoint(tempSegment.end) < radius;
    },
    intersectsTriangle: (tri) => {
      const triPoint = tempVector;
      const segmentPoint = new THREE.Vector3();

      const distance = tri.closestPointToSegment(tempSegment, triPoint, segmentPoint);

      if (distance < radius) {
        const normal = tri.getNormal(new THREE.Vector3());
        const depth = radius - distance;

        if (!hit || depth > hit.depth) {
          hit = {
            point: triPoint.clone(),
            normal: normal,
            depth: depth,
            distance: distance,
          };
        }
      }

      return false; // Continue checking
    },
  });

  return hit;
}

/**
 * Simple sphere-to-mesh collision
 * @param {THREE.Mesh} mesh Mesh with BVH
 * @param {THREE.Vector3} center Sphere center
 * @param {number} radius Sphere radius
 * @returns {boolean} True if collision detected
 */
export async function sphereCollision(mesh, center, radius) {
  await getBVHModule();

  if (!mesh.geometry.boundsTree) {
    await buildBVH(mesh);
  }

  const sphere = new THREE.Sphere(center, radius);
  return mesh.geometry.boundsTree.intersectsSphere(sphere);
}

/**
 * Raycast against a mesh with BVH
 * @param {THREE.Mesh} mesh Target mesh
 * @param {THREE.Ray} ray The ray to cast
 * @returns {Object|null} Intersection info or null
 */
export async function raycastBVH(mesh, ray) {
  await getBVHModule();

  if (!mesh.geometry.boundsTree) {
    await buildBVH(mesh);
  }

  const raycaster = new THREE.Raycaster();
  raycaster.ray.copy(ray);

  const intersects = [];
  mesh.geometry.boundsTree.raycast(raycaster.ray, intersects);

  if (intersects.length > 0) {
    intersects.sort((a, b) => a.distance - b.distance);
    return intersects[0];
  }

  return null;
}

/**
 * Dispose of BVH resources
 * @param {THREE.Mesh} mesh
 */
export function disposeBVH(mesh) {
  if (mesh.geometry && mesh.geometry.boundsTree) {
    mesh.geometry.disposeBoundsTree();
  }
}
