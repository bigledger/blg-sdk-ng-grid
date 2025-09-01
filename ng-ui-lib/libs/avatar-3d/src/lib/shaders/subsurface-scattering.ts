/**
 * Subsurface Scattering shader for realistic skin rendering
 * Based on the technique described in "Real-Time Realistic Skin Rendering"
 */

import * as THREE from 'three';

export const subsurfaceScatteringVertexShader = `
  #include <common>
  #include <uv_pars_vertex>
  #include <uv2_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  #include <clipping_planes_pars_vertex>

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec4 vScreenPosition;

  void main() {
    #include <uv_vertex>
    #include <uv2_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    vNormal = normalize(transformedNormal);

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>

    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    vViewPosition = -mvPosition.xyz;
    vScreenPosition = gl_Position;

    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
  }
`;

export const subsurfaceScatteringFragmentShader = `
  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <alphatest_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <roughnessmap_pars_fragment>
  #include <metalnessmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>

  // Subsurface scattering uniforms
  uniform float thickness;
  uniform float power;
  uniform float scale;
  uniform float distortion;
  uniform float ambient;
  uniform vec3 scatteringColor;
  uniform sampler2D thicknessMap;
  uniform sampler2D transmittanceMap;
  
  // Depth texture for thickness calculation
  uniform sampler2D depthTexture;
  uniform float cameraNear;
  uniform float cameraFar;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec4 vScreenPosition;

  // Convert linear depth to logarithmic depth
  float readDepth(sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture2D(depthSampler, coord).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
  }

  // Subsurface scattering calculation
  vec3 subsurfaceScattering(vec3 lightDirection, vec3 viewDirection, vec3 normal, vec3 lightColor, float thickness) {
    vec3 scatteredLight = vec3(0.0);
    
    // Transmittance calculation
    vec3 H = normalize(lightDirection + normal * distortion);
    float VdotH = pow(clamp(dot(viewDirection, -H), 0.0, 1.0), power) * scale;
    
    // Apply thickness attenuation
    float thicknessAttenuation = exp(-thickness / scatteringColor.r) * scatteringColor.r +
                                exp(-thickness / scatteringColor.g) * scatteringColor.g +
                                exp(-thickness / scatteringColor.b) * scatteringColor.b;
    
    scatteredLight = lightColor * VdotH * thicknessAttenuation;
    
    return scatteredLight;
  }

  void main() {
    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4(diffuse, opacity);

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>

    // Get material properties
    #include <roughnessmap_fragment>
    #include <metalnessmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>

    // Get thickness from map or uniform
    float currentThickness = thickness;
    #ifdef USE_THICKNESS_MAP
      currentThickness *= texture2D(thicknessMap, vUv).r;
    #endif

    vec3 viewDirection = normalize(vViewPosition);
    
    // Calculate subsurface scattering for each light
    vec3 totalSSS = vec3(0.0);
    
    #if NUM_DIR_LIGHTS > 0
      for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
        vec3 lightDirection = normalize(directionalLights[i].direction);
        vec3 lightColor = directionalLights[i].color;
        
        totalSSS += subsurfaceScattering(lightDirection, viewDirection, normal, lightColor, currentThickness);
      }
    #endif
    
    #if NUM_POINT_LIGHTS > 0
      for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
        vec3 lightVector = pointLights[i].position - vWorldPosition;
        vec3 lightDirection = normalize(lightVector);
        vec3 lightColor = pointLights[i].color;
        float lightDistance = length(lightVector);
        float lightAttenuation = 1.0 / (lightDistance * lightDistance);
        
        totalSSS += subsurfaceScattering(lightDirection, viewDirection, normal, lightColor * lightAttenuation, currentThickness);
      }
    #endif

    // Standard lighting calculation
    #include <aomap_fragment>
    #include <lightmap_fragment>
    #include <emissivemap_fragment>

    // Combine standard lighting with subsurface scattering
    vec3 outgoingLight = diffuseColor.rgb * totalSSS + emissive;
    
    // Add ambient subsurface scattering
    outgoingLight += diffuseColor.rgb * scatteringColor * ambient;

    #include <output_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
  }
`;

/**
 * Create subsurface scattering material
 */
export function createSubsurfaceScatteringMaterial(parameters: {
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metalnessMap?: THREE.Texture;
  thicknessMap?: THREE.Texture;
  transmittanceMap?: THREE.Texture;
  thickness?: number;
  power?: number;
  scale?: number;
  distortion?: number;
  ambient?: number;
  scatteringColor?: THREE.Color;
} = {}): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.aomap,
    THREE.UniformsLib.lightmap,
    THREE.UniformsLib.emissivemap,
    THREE.UniformsLib.bumpmap,
    THREE.UniformsLib.normalmap,
    THREE.UniformsLib.displacementmap,
    THREE.UniformsLib.roughnessmap,
    THREE.UniformsLib.metalnessmap,
    THREE.UniformsLib.fog,
    THREE.UniformsLib.lights,
    {
      thickness: { value: parameters.thickness || 1.0 },
      power: { value: parameters.power || 2.0 },
      scale: { value: parameters.scale || 1.0 },
      distortion: { value: parameters.distortion || 0.1 },
      ambient: { value: parameters.ambient || 0.05 },
      scatteringColor: { value: parameters.scatteringColor || new THREE.Color(0xff6633) },
      thicknessMap: { value: parameters.thicknessMap || null },
      transmittanceMap: { value: parameters.transmittanceMap || null },
      depthTexture: { value: null },
      cameraNear: { value: 0.1 },
      cameraFar: { value: 1000 }
    }
  ]);

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: subsurfaceScatteringVertexShader,
    fragmentShader: subsurfaceScatteringFragmentShader,
    lights: true,
    fog: true,
    transparent: false,
    defines: {
      USE_MAP: parameters.map ? '' : undefined,
      USE_NORMALMAP: parameters.normalMap ? '' : undefined,
      USE_ROUGHNESSMAP: parameters.roughnessMap ? '' : undefined,
      USE_METALNESSMAP: parameters.metalnessMap ? '' : undefined,
      USE_THICKNESS_MAP: parameters.thicknessMap ? '' : undefined,
      USE_TRANSMITTANCE_MAP: parameters.transmittanceMap ? '' : undefined
    }
  });

  // Set textures
  if (parameters.map) material.uniforms.map.value = parameters.map;
  if (parameters.normalMap) material.uniforms.normalMap.value = parameters.normalMap;
  if (parameters.roughnessMap) material.uniforms.roughnessMap.value = parameters.roughnessMap;
  if (parameters.metalnessMap) material.uniforms.metalnessMap.value = parameters.metalnessMap;

  return material;
}