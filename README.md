# 3D Home Scan

Open-source 3D home walkthrough capture and viewing for realtors, buyers, and anyone scanning houses for sale.

The first milestone is a web viewer and scan workflow shell. Native iOS capture should use ARKit, RoomPlan, RealityKit, and LiDAR on supported iPhone Pro Max and iPad Pro devices. The web runtime uses [`<model-viewer>`](https://modelviewer.dev/) for glTF/USDZ viewing and AR handoff.

## Product Direction

- Interior mode: guided passes for walls, ceilings, floors, openings, and final coverage.
- Exterior mode: sunlight compensation, facade/lot capture, and Google Maps Street View context.
- Output: shareable glTF/GLB and USDZ walkthrough packages.
- Hosting: Google Cloud Run for the web app, Cloud Storage for model assets, Artifact Registry for images, and Cloud Build for CI/CD.
- Performance: static frontend, cached model assets, chunked viewer runtime, and Cloud Run scale-to-zero.

## Local Development

```bash
npm install
npm run generate:demo-model
npm run dev
```

Create `.env.local` when Street View is needed:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_embed_api_key
```

## Production Build

```bash
npm run generate:demo-model
npm run build
```

## GCP Deployment

This repo is configured for GCP project `deeplearn1`.

```bash
gcloud config set project deeplearn1
```

Create an Artifact Registry Docker repository once:

```bash
gcloud artifacts repositories create web \
  --repository-format=docker \
  --location=us-central1
```

Then submit the build:

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _REGION=us-central1,_SERVICE=3d-home-scan,_REPOSITORY=web
```

Recommended GCP layout:

- Cloud Run: serves the web app container.
- Cloud Storage: stores exported `.glb`, `.gltf`, `.usdz`, textures, and manifests.
- Cloud CDN: fronts public model assets when traffic grows.
- Firestore: stores listing metadata, permissions, and share slugs.
- Cloud Tasks: queues server-side conversion and optimization jobs.
- Secret Manager: stores Google Maps API keys and signing credentials.

## iOS Capture Track

The browser cannot replace ARKit LiDAR capture. The native iOS app should own capture and export, then upload optimized assets to GCS for sharing.

Recommended stack:

- ARKit world tracking for walkthrough alignment.
- RoomPlan for interior room structure capture.
- RealityKit/Model I/O for USDZ export and preview.
- SceneReconstruction mesh capture on supported LiDAR devices.
- Background upload to a signed Cloud Storage URL.
- Universal links back into this web viewer after upload.

See [docs/ios-arkit.md](docs/ios-arkit.md) for the first implementation slice.

## Repository Identity

Commits should use:

```bash
git config user.name "Adisak Sukul"
git config user.email "adisak.sukul@gmail.com"
```
