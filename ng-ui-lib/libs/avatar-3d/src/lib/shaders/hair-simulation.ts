/**
 * Simplified Hair Simulation Shaders
 * Provides realistic hair rendering with wind simulation and proper lighting
 */

import * as THREE from 'three';

export const hairVertexShader = `
  #include <common>
  #include <uv_pars_vertex>
  #include <color_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  #include <clipping_planes_pars_vertex>

  uniform float time;
  uniform vec3 windDirection;
  uniform float windStrength;
  uniform float windFrequency;
  uniform float hairStiffness;
  uniform float gravity;
  
  attribute float hairID;
  attribute float segmentID;
  attribute vec3 hairRoot;
  attribute vec3 hairTip;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vHairDirection;
  varying float vHairRatio; // 0 = root, 1 = tip
  varying vec3 vColor;

  // Perlin noise function for wind variation
  float noise(vec3 pos) {
    vec3 i = floor(pos);
    vec3 f = fract(pos);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(
        mix(dot(hash33(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
            dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
        mix(dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
            dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(
        mix(dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
            dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
        mix(dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
            dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yxz + 19.19);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
  }

  void main() {
    #include <uv_vertex>
    #include <color_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(transformedNormal);

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>

    // Calculate hair parameters
    vec3 worldRoot = (modelMatrix * vec4(hairRoot, 1.0)).xyz;
    vec3 worldTip = (modelMatrix * vec4(hairTip, 1.0)).xyz;
    vec3 hairVector = worldTip - worldRoot;
    float hairLength = length(hairVector);
    vHairDirection = normalize(hairVector);
    vHairRatio = segmentID / 10.0; // Assuming 10 segments per hair
    
    // Apply wind simulation
    vec3 windOffset = vec3(0.0);
    if (windStrength > 0.0) {
      float windTime = time * windFrequency;
      vec3 windPos = transformed + vec3(hairID * 0.1, windTime, hairID * 0.05);
      float windNoise = noise(windPos);
      
      // Wind affects hair more towards the tip
      float windInfluence = pow(vHairRatio, 2.0) * windStrength;
      windOffset = windDirection * windNoise * windInfluence;
      
      // Add turbulence
      vec3 turbulence = vec3(
        noise(windPos * 2.0 + vec3(windTime, 0.0, 0.0)),
        noise(windPos * 2.0 + vec3(0.0, windTime, 0.0)),
        noise(windPos * 2.0 + vec3(0.0, 0.0, windTime))
      ) * 0.3 * windInfluence;
      
      windOffset += turbulence;
    }
    
    // Apply gravity (subtle effect)
    vec3 gravityOffset = vec3(0.0, -gravity * pow(vHairRatio, 2.0), 0.0);
    
    // Apply stiffness (reduce deformation near root)
    float stiffnessFactor = mix(hairStiffness, 0.0, vHairRatio);
    vec3 totalOffset = (windOffset + gravityOffset) * (1.0 - stiffnessFactor);
    
    // Apply offsets
    transformed += totalOffset;
    
    #include <project_vertex>

    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    vViewPosition = -mvPosition.xyz;
    vColor = vColor;

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
  }
`;

export const hairFragmentShader = `
  #include <common>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <alphatest_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>

  uniform vec3 hairBaseColor;
  uniform vec3 hairTipColor;
  uniform float hairRoughness;
  uniform float hairSpecularShift;
  uniform float hairSpecularWidth;
  uniform float hairOpacity;
  uniform float hairNoiseScale;
  uniform sampler2D hairNoiseTexture;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vHairDirection;
  varying float vHairRatio;
  varying vec3 vColor;

  // Kajiya-Kay hair lighting model
  vec3 kajiyaKayLighting(vec3 lightDir, vec3 viewDir, vec3 tangent, vec3 lightColor) {
    float dotLT = dot(lightDir, tangent);
    float dotVT = dot(viewDir, tangent);
    
    // Diffuse component
    float diffuse = sin(acos(dotLT));
    
    // Specular component (Kajiya-Kay)
    float specular = pow(max(0.0, sqrt(1.0 - dotLT * dotLT) * sqrt(1.0 - dotVT * dotVT) - dotLT * dotVT), hairSpecularWidth);
    
    // Apply specular shift
    float shiftedSpecular = pow(max(0.0, dotLT * dotVT + sin(acos(dotLT)) * sin(acos(dotVT))), hairSpecularWidth * 2.0);
    
    return lightColor * (diffuse * 0.8 + (specular + shiftedSpecular * 0.3) * (1.0 - hairRoughness));
  }

  // Hair noise for subtle variation
  float getHairNoise(vec2 uv) {
    return texture2D(hairNoiseTexture, uv * hairNoiseScale).r;
  }

  void main() {
    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4(diffuse, opacity);

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>

    // Hair color variation from root to tip
    vec3 hairColor = mix(hairBaseColor, hairTipColor, vHairRatio);
    
    // Add subtle noise variation
    float noiseValue = getHairNoise(vUv);
    hairColor *= (0.9 + 0.2 * noiseValue);
    
    diffuseColor.rgb *= hairColor;
    
    // Apply hair-specific alpha
    diffuseColor.a *= hairOpacity;
    
    #include <alphamap_fragment>
    #include <alphatest_fragment>

    vec3 viewDirection = normalize(vViewPosition);
    vec3 hairTangent = normalize(vHairDirection);
    
    // Calculate lighting
    vec3 totalLight = vec3(0.0);
    
    #if NUM_DIR_LIGHTS > 0
      for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
        vec3 lightDirection = normalize(directionalLights[i].direction);
        vec3 lightColor = directionalLights[i].color;
        
        totalLight += kajiyaKayLighting(lightDirection, viewDirection, hairTangent, lightColor);
      }
    #endif
    
    #if NUM_POINT_LIGHTS > 0
      for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
        vec3 lightVector = pointLights[i].position - vWorldPosition;
        vec3 lightDirection = normalize(lightVector);
        vec3 lightColor = pointLights[i].color;
        float lightDistance = length(lightVector);
        float lightAttenuation = 1.0 / (lightDistance * lightDistance);
        
        totalLight += kajiyaKayLighting(lightDirection, viewDirection, hairTangent, lightColor * lightAttenuation);
      }
    #endif

    // Add ambient lighting
    totalLight += ambientLightColor * 0.3;
    
    vec3 outgoingLight = diffuseColor.rgb * totalLight;

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);

    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;

/**
 * Create hair simulation material
 */
export function createHairMaterial(parameters: {
  map?: THREE.Texture;
  hairBaseColor?: THREE.Color;
  hairTipColor?: THREE.Color;
  hairRoughness?: number;
  hairSpecularShift?: number;
  hairSpecularWidth?: number;
  hairOpacity?: number;
  hairNoiseTexture?: THREE.Texture;
  hairNoiseScale?: number;
  windDirection?: THREE.Vector3;
  windStrength?: number;
  windFrequency?: number;
  hairStiffness?: number;
  gravity?: number;
} = {}): THREE.ShaderMaterial {
  // Create noise texture if not provided
  let noiseTexture = parameters.hairNoiseTexture;
  if (!noiseTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Generate simple noise
    const imageData = ctx.createImageData(256, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 255;
      imageData.data[i] = noise;
      imageData.data[i + 1] = noise;
      imageData.data[i + 2] = noise;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    
    noiseTexture = new THREE.CanvasTexture(canvas);
    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
  }

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.lights,
    {
      time: { value: 0 },
      hairBaseColor: { value: parameters.hairBaseColor || new THREE.Color(0x8B4513) },
      hairTipColor: { value: parameters.hairTipColor || new THREE.Color(0xDEB887) },
      hairRoughness: { value: parameters.hairRoughness || 0.8 },
      hairSpecularShift: { value: parameters.hairSpecularShift || 0.1 },
      hairSpecularWidth: { value: parameters.hairSpecularWidth || 8.0 },
      hairOpacity: { value: parameters.hairOpacity || 0.9 },
      hairNoiseTexture: { value: noiseTexture },
      hairNoiseScale: { value: parameters.hairNoiseScale || 10.0 },
      windDirection: { value: parameters.windDirection || new THREE.Vector3(1, 0, 0) },
      windStrength: { value: parameters.windStrength || 0.0 },
      windFrequency: { value: parameters.windFrequency || 1.0 },
      hairStiffness: { value: parameters.hairStiffness || 0.5 },
      gravity: { value: parameters.gravity || 0.01 }
    }
  ]);

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: hairVertexShader,
    fragmentShader: hairFragmentShader,
    lights: true,
    fog: true,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
    defines: {
      USE_MAP: parameters.map ? '' : undefined
    }
  });

  if (parameters.map) {
    material.uniforms.map.value = parameters.map;
  }

  return material;
}

/**
 * Hair System Class for managing hair simulation
 */
export class HairSystem {
  private hairMaterial: THREE.ShaderMaterial;
  private hairGeometry: THREE.BufferGeometry;
  private hairMesh: THREE.Mesh;
  private time = 0;

  constructor(
    hairGeometry: THREE.BufferGeometry,
    materialParameters: Parameters<typeof createHairMaterial>[0] = {}
  ) {
    this.hairGeometry = hairGeometry;
    this.hairMaterial = createHairMaterial(materialParameters);
    this.hairMesh = new THREE.Mesh(this.hairGeometry, this.hairMaterial);
    
    this.setupHairAttributes();
  }

  /**
   * Set up hair-specific vertex attributes
   */
  private setupHairAttributes(): void {
    const positionAttribute = this.hairGeometry.getAttribute('position');
    const vertexCount = positionAttribute.count;
    
    // Hair ID for each vertex (which hair strand it belongs to)
    const hairIDs = new Float32Array(vertexCount);
    
    // Segment ID for each vertex (position along the hair strand)
    const segmentIDs = new Float32Array(vertexCount);
    
    // Hair root positions
    const hairRoots = new Float32Array(vertexCount * 3);
    
    // Hair tip positions
    const hairTips = new Float32Array(vertexCount * 3);
    
    // Assuming each hair has 10 segments
    const segmentsPerHair = 10;
    const hairCount = vertexCount / (segmentsPerHair + 1);
    
    for (let i = 0; i < vertexCount; i++) {
      const hairIndex = Math.floor(i / (segmentsPerHair + 1));
      const segmentIndex = i % (segmentsPerHair + 1);
      
      hairIDs[i] = hairIndex;
      segmentIDs[i] = segmentIndex;
      
      // Set root position (first vertex of each hair)
      const rootIndex = hairIndex * (segmentsPerHair + 1);
      hairRoots[i * 3] = positionAttribute.getX(rootIndex);
      hairRoots[i * 3 + 1] = positionAttribute.getY(rootIndex);
      hairRoots[i * 3 + 2] = positionAttribute.getZ(rootIndex);
      
      // Set tip position (last vertex of each hair)
      const tipIndex = rootIndex + segmentsPerHair;
      hairTips[i * 3] = positionAttribute.getX(tipIndex);
      hairTips[i * 3 + 1] = positionAttribute.getY(tipIndex);
      hairTips[i * 3 + 2] = positionAttribute.getZ(tipIndex);
    }
    
    this.hairGeometry.setAttribute('hairID', new THREE.BufferAttribute(hairIDs, 1));
    this.hairGeometry.setAttribute('segmentID', new THREE.BufferAttribute(segmentIDs, 1));
    this.hairGeometry.setAttribute('hairRoot', new THREE.BufferAttribute(hairRoots, 3));
    this.hairGeometry.setAttribute('hairTip', new THREE.BufferAttribute(hairTips, 3));
  }

  /**
   * Update hair simulation
   */
  update(deltaTime: number): void {
    this.time += deltaTime;
    this.hairMaterial.uniforms.time.value = this.time;
  }

  /**
   * Set wind parameters
   */
  setWind(direction: THREE.Vector3, strength: number, frequency: number = 1.0): void {
    this.hairMaterial.uniforms.windDirection.value.copy(direction.normalize());
    this.hairMaterial.uniforms.windStrength.value = strength;
    this.hairMaterial.uniforms.windFrequency.value = frequency;
  }

  /**
   * Set hair physical properties
   */
  setHairProperties(stiffness: number, gravity: number): void {
    this.hairMaterial.uniforms.hairStiffness.value = stiffness;
    this.hairMaterial.uniforms.gravity.value = gravity;
  }

  /**
   * Get the hair mesh
   */
  getMesh(): THREE.Mesh {
    return this.hairMesh;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.hairGeometry.dispose();
    this.hairMaterial.dispose();
  }
}