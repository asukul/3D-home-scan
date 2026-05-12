import {
  Box,
  Building2,
  Camera,
  Check,
  Cloud,
  Download,
  FileBox,
  Home,
  MapPinned,
  Rotate3D,
  ScanLine,
  Share2,
  Smartphone,
  SunMedium,
  Upload,
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type ScanMode = 'interior' | 'exterior';
type ExportFormat = 'glTF' | 'USDZ';

const defaultModelUrl = '/models/demo-home.gltf';

function getInitialMode(): ScanMode {
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'exterior' ? 'exterior' : 'interior';
}

function getInitialFormat(): ExportFormat {
  const format = new URLSearchParams(window.location.search).get('format');
  return format === 'USDZ' ? 'USDZ' : 'glTF';
}

function getInitialModelUrl() {
  return new URLSearchParams(window.location.search).get('model') ?? defaultModelUrl;
}

const roomSteps = [
  'Entry alignment',
  'Walls',
  'Ceilings',
  'Floors',
  'Openings',
  'Final pass',
];

const exteriorSteps = [
  'Curb alignment',
  'Sun reading',
  'Facade sweep',
  'Lot edges',
  'Street View match',
  'Final pass',
];

const captureMetrics = {
  coverage: 88,
  tracking: 96,
  surfaces: 42,
  triangles: '184k',
};

function getIosSrc(modelUrl: string, format: ExportFormat) {
  return format === 'USDZ' ? modelUrl : undefined;
}

function buildMapsEmbed(address: string, apiKey: string) {
  const encodedAddress = encodeURIComponent(address.trim());
  const encodedKey = encodeURIComponent(apiKey.trim());
  return `https://www.google.com/maps/embed/v1/streetview?key=${encodedKey}&location=${encodedAddress}&fov=80&heading=210&pitch=5`;
}

function App() {
  const [mode, setMode] = useState<ScanMode>(getInitialMode);
  const [scanStep, setScanStep] = useState(1);
  const [sunlight, setSunlight] = useState(64);
  const [modelUrl, setModelUrl] = useState(getInitialModelUrl);
  const [modelName, setModelName] = useState('Demo home scan');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<ExportFormat>(getInitialFormat);
  const [address, setAddress] = useState('1600 Amphitheatre Parkway, Mountain View, CA');
  const [mapsKey, setMapsKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '');
  const [shareUrl, setShareUrl] = useState('');

  const steps = mode === 'interior' ? roomSteps : exteriorSteps;
  const currentStep = Math.min(scanStep, steps.length);
  const progress = Math.round((currentStep / steps.length) * 100);
  const streetViewUrl = useMemo(() => {
    if (!mapsKey.trim() || !address.trim()) {
      return '';
    }
    return buildMapsEmbed(address, mapsKey);
  }, [address, mapsKey]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  function setScanMode(nextMode: ScanMode) {
    setMode(nextMode);
    setScanStep(1);
  }

  function handleModelUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setObjectUrl(nextObjectUrl);
    setModelUrl(nextObjectUrl);
    setModelName(file.name);
    setFormat(file.name.toLowerCase().endsWith('.usdz') ? 'USDZ' : 'glTF');
    setShareUrl('');
  }

  async function handleShare() {
    const url = new URL(window.location.href);
    if (modelUrl.startsWith('http')) {
      url.searchParams.set('model', modelUrl);
    }
    url.searchParams.set('mode', mode);
    url.searchParams.set('format', format);

    const nextShareUrl = url.toString();
    setShareUrl(nextShareUrl);

    if (navigator.share) {
      await navigator.share({
        title: '3D Home Scan',
        text: `${modelName} walkthrough`,
        url: nextShareUrl,
      });
      return;
    }

    await navigator.clipboard?.writeText(nextShareUrl);
  }

  function downloadManifest() {
    const manifest = {
      app: '3D Home Scan',
      modelName,
      modelUrl: modelUrl.startsWith('blob:') ? 'local-browser-object-url' : modelUrl,
      format,
      scanMode: mode,
      scanProgress: progress,
      captureMetrics,
      gcp: {
        preferredStorage: 'Cloud Storage',
        preferredRuntime: 'Cloud Run',
        cdnReady: true,
      },
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${modelName.replace(/\W+/g, '-').toLowerCase()}-manifest.json`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="3D Home Scan home">
          <span className="brand-mark">
            <Home size={20} />
          </span>
          <span>
            <strong>3D Home Scan</strong>
            <small>Open real estate walkthroughs</small>
          </span>
        </a>

        <nav className="mode-switcher" aria-label="Scan mode">
          <button
            className={mode === 'interior' ? 'active' : ''}
            type="button"
            onClick={() => setScanMode('interior')}
          >
            <ScanLine size={17} />
            Interior
          </button>
          <button
            className={mode === 'exterior' ? 'active' : ''}
            type="button"
            onClick={() => setScanMode('exterior')}
          >
            <SunMedium size={17} />
            Exterior
          </button>
        </nav>

        <div className="runtime-pills" aria-label="Runtime targets">
          <span>
            <Smartphone size={15} />
            ARKit
          </span>
          <span>
            <Cloud size={15} />
            GCP
          </span>
        </div>
      </header>

      <section className="workspace">
        <aside className="capture-panel" aria-label="Capture workflow">
          <div className="panel-heading">
            <span className="icon-tile">
              {mode === 'interior' ? <Camera size={20} /> : <Building2 size={20} />}
            </span>
            <div>
              <h1>{mode === 'interior' ? 'Interior scan' : 'Exterior scan'}</h1>
              <p>{mode === 'interior' ? 'Room geometry pass' : 'Facade and lot pass'}</p>
            </div>
          </div>

          <div className="progress-block">
            <div className="progress-label">
              <span>{steps[currentStep - 1]}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="step-list">
            {steps.map((step, index) => {
              const isDone = index + 1 < currentStep;
              const isCurrent = index + 1 === currentStep;
              return (
                <button
                  key={step}
                  className={isCurrent ? 'current' : ''}
                  type="button"
                  onClick={() => setScanStep(index + 1)}
                >
                  <span className={isDone ? 'done step-index' : 'step-index'}>
                    {isDone ? <Check size={14} /> : index + 1}
                  </span>
                  {step}
                </button>
              );
            })}
          </div>

          {mode === 'exterior' ? (
            <label className="field">
              <span>Sunlight compensation</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sunlight}
                onChange={(event) => setSunlight(Number(event.target.value))}
              />
              <output>{sunlight}%</output>
            </label>
          ) : (
            <div className="metric-grid" aria-label="Capture quality">
              <span>
                <strong>{captureMetrics.coverage}%</strong>
                Coverage
              </span>
              <span>
                <strong>{captureMetrics.tracking}%</strong>
                Tracking
              </span>
              <span>
                <strong>{captureMetrics.surfaces}</strong>
                Surfaces
              </span>
              <span>
                <strong>{captureMetrics.triangles}</strong>
                Mesh
              </span>
            </div>
          )}
        </aside>

        <section className="viewer-stage" aria-label="3D walkthrough viewer">
          <model-viewer
            src={modelUrl}
            ios-src={getIosSrc(modelUrl, format)}
            ar
            ar-modes="scene-viewer quick-look webxr"
            camera-controls
            auto-rotate
            shadow-intensity="0.72"
            exposure={mode === 'exterior' ? '1.14' : '0.94'}
            environment-image="neutral"
            interaction-prompt="none"
            camera-orbit="-35deg 68deg 8m"
            field-of-view="32deg"
            alt={`${modelName} 3D walkthrough`}
          />

          <div className="viewer-toolbar" aria-label="Viewer actions">
            <label className="upload-action">
              <Upload size={17} />
              <span>Upload</span>
              <input
                type="file"
                accept=".gltf,.glb,.usdz,model/gltf+json,model/gltf-binary"
                onChange={handleModelUpload}
              />
            </label>
            <button type="button" onClick={downloadManifest}>
              <Download size={17} />
              Manifest
            </button>
            <button type="button" onClick={handleShare}>
              <Share2 size={17} />
              Share
            </button>
          </div>
        </section>

        <aside className="details-panel" aria-label="Model and map details">
          <section className="model-summary">
            <div className="panel-heading compact">
              <span className="icon-tile">
                <FileBox size={19} />
              </span>
              <div>
                <h2>{modelName}</h2>
                <p>{format} walkthrough package</p>
              </div>
            </div>

            <div className="format-toggle" aria-label="Export format">
              <button
                className={format === 'glTF' ? 'active' : ''}
                type="button"
                onClick={() => setFormat('glTF')}
              >
                <Box size={16} />
                glTF
              </button>
              <button
                className={format === 'USDZ' ? 'active' : ''}
                type="button"
                onClick={() => setFormat('USDZ')}
              >
                <Rotate3D size={16} />
                USDZ
              </button>
            </div>

            <dl className="summary-list">
              <div>
                <dt>Target</dt>
                <dd>iPhone 16/17 Pro Max, iPad Pro, web</dd>
              </div>
              <div>
                <dt>Runtime</dt>
                <dd>{format === 'USDZ' ? 'AR Quick Look' : 'model-viewer'}</dd>
              </div>
              <div>
                <dt>Hosting</dt>
                <dd>Cloud Run + Cloud Storage</dd>
              </div>
            </dl>
          </section>

          <section className="street-view">
            <div className="section-title">
              <MapPinned size={18} />
              <h2>Street View</h2>
            </div>
            <label className="text-field">
              <span>Address</span>
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>
            <label className="text-field">
              <span>Google Maps key</span>
              <input
                type="password"
                value={mapsKey}
                placeholder="VITE_GOOGLE_MAPS_API_KEY"
                onChange={(event) => setMapsKey(event.target.value)}
              />
            </label>
            <div className="map-frame">
              {streetViewUrl ? (
                <iframe
                  title="Google Maps Street View"
                  loading="lazy"
                  allowFullScreen
                  src={streetViewUrl}
                />
              ) : (
                <div className="map-placeholder">
                  <MapPinned size={24} />
                  <span>Set a Maps key</span>
                </div>
              )}
            </div>
          </section>

          {shareUrl ? (
            <output className="share-output" aria-label="Share URL">
              {shareUrl}
            </output>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

export default App;
