import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getTicketById, checkInTicket, getFirestoreEvent } from '../../../lib/tickets';

function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function CheckCircleIcon() {
  return (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
}
function XCircleIcon() {
  return (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>);
}

export default function ScanQR() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading, isHost } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const lastScanRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { status: 'success'|'error'|'already', ticket, message }
  const [cameraError, setCameraError] = useState('');
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!loading && !user) { router.replace('/'); return; }
    if (!loading && !isHost) { router.replace('/discover'); return; }
  }, [user, loading, isHost, router]);

  useEffect(() => {
    if (id && isHost) {
      getFirestoreEvent(id).then(setEvent).catch(() => {});
    }
  }, [id, isHost]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const scanFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' });

      if (code && code.data) {
        const now = Date.now();
        if (code.data !== lastScanRef.current || now - lastScanTimeRef.current > 3000) {
          lastScanRef.current = code.data;
          lastScanTimeRef.current = now;
          await processQR(code.data);
          animRef.current = requestAnimationFrame(scanFrame);
          return;
        }
      }
    } catch (_) {}

    animRef.current = requestAnimationFrame(scanFrame);
  };

  const processQR = async (data) => {
    // Expected: SNEAKOUT:{eventId}:{ticketId}:{timestamp}
    if (!data.startsWith('SNEAKOUT:')) {
      setResult({ status: 'error', message: 'Invalid QR code. Not a Sneakout ticket.' });
      return;
    }

    const parts = data.split(':');
    if (parts.length < 3) {
      setResult({ status: 'error', message: 'Malformed QR code.' });
      return;
    }

    const [, qrEventId, ticketId] = parts;

    if (id && qrEventId !== id) {
      setResult({ status: 'error', message: 'This ticket is for a different event.' });
      return;
    }

    stopCamera();

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      setResult({ status: 'error', message: 'Ticket not found in system.' });
      return;
    }

    if (ticket.checkedIn) {
      setResult({ status: 'already', ticket, message: 'Already checked in!' });
      return;
    }

    const ok = await checkInTicket(ticketId);
    if (ok) {
      setResult({ status: 'success', ticket, message: 'Check-in successful!' });
    } else {
      setResult({ status: 'error', message: 'Failed to check in. Try again.' });
    }
  };

  const reset = () => {
    setResult(null);
    lastScanRef.current = '';
    startCamera();
  };

  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Scan QR - Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] max-w-lg mx-auto flex flex-col anim-page">
        {/* Header */}
        <div className="px-4 pt-14 pb-4 flex items-center gap-3">
          <button onClick={() => { stopCamera(); router.push('/host' + (id ? '/event/' + id : '')); }} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-white">Scan Tickets</h1>
            {event && <p className="text-zinc-500 text-xs mt-0.5 truncate">{event.title}</p>}
          </div>
        </div>

        {/* Result overlay */}
        {result && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className={'mb-6 ' + (result.status === 'success' ? 'text-emerald-400' : result.status === 'already' ? 'text-amber-400' : 'text-rose-400')}>
              {result.status === 'success' ? <CheckCircleIcon /> : <XCircleIcon />}
            </div>

            {result.status === 'success' && (
              <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-emerald-800/30 p-6 mb-6">
                <p className="text-emerald-400 font-bold text-lg mb-4">Checked In!</p>
                {result.ticket.userPhotoURL && (
                  <img src={result.ticket.userPhotoURL} alt="" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                )}
                <p className="text-white font-bold text-[18px]">{result.ticket.userName || 'Attendee'}</p>
                <p className="text-zinc-500 text-sm mt-1">{result.ticket.userEmail}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-zinc-600 text-xs font-mono">{result.ticket.ticketId}</p>
                </div>
              </div>
            )}

            {result.status === 'already' && (
              <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-amber-800/30 p-6 mb-6">
                <p className="text-amber-400 font-bold text-lg mb-2">Already Checked In</p>
                <p className="text-white font-semibold">{result.ticket.userName || 'Attendee'}</p>
                <p className="text-zinc-500 text-sm mt-1">{result.ticket.userEmail}</p>
              </div>
            )}

            {result.status === 'error' && (
              <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-rose-800/30 p-6 mb-6">
                <p className="text-rose-400 font-bold text-lg mb-2">Invalid Ticket</p>
                <p className="text-zinc-400 text-sm">{result.message}</p>
              </div>
            )}

            <button onClick={reset} className="w-full max-w-sm py-4 rounded-2xl bg-red-600 text-white font-bold text-[15px] pressable shadow-lg shadow-red-900/30">
              Scan Next Ticket
            </button>
          </div>
        )}

        {/* Camera view */}
        {!result && (
          <div className="flex-1 flex flex-col items-center px-4">
            {/* Video */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4" style={{ aspectRatio: '1/1' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanner overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-52 h-52">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-red-500 rounded-tl-lg" style={{ borderTopWidth: 3, borderLeftWidth: 3 }} />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-red-500 rounded-tr-lg" style={{ borderTopWidth: 3, borderRightWidth: 3 }} />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-red-500 rounded-bl-lg" style={{ borderBottomWidth: 3, borderLeftWidth: 3 }} />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-red-500 rounded-br-lg" style={{ borderBottomWidth: 3, borderRightWidth: 3 }} />
                    {/* Scan line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-red-500/60" style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }} />
                  </div>
                </div>
              )}

              {!scanning && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-zinc-600 text-sm">Tap to start camera</p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="w-full bg-rose-900/20 border border-rose-700/30 rounded-2xl px-4 py-3 mb-4">
                <p className="text-rose-400 text-[13px]">{cameraError}</p>
              </div>
            )}

            <p className="text-zinc-500 text-sm text-center mb-6">
              {scanning ? 'Point camera at attendee ticket QR code' : 'Tap below to activate camera'}
            </p>

            {!scanning ? (
              <button onClick={startCamera} className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold text-[15px] pressable shadow-lg shadow-red-900/30">
                Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-zinc-400 font-semibold text-[14px] pressable">
                Stop Camera
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(-80px); opacity: 1; }
          50% { transform: translateY(80px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
