import { FilesetResolver, FaceLandmarker, ObjectDetector } from '@mediapipe/tasks-vision';

export async function loadModels() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
  );

  const face = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { 
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU' 
    },
    runningMode: 'VIDEO',
    numFaces: 2,                          
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });

  const objects = await ObjectDetector.createFromOptions(vision, {
    baseOptions: { 
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite',
      delegate: 'CPU' 
    },
    runningMode: 'VIDEO',
    scoreThreshold: 0.4,
    maxResults: 8,
  });

  return { face, objects };
}
