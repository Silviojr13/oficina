'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanBarcode, Flashlight, FlashlightOff, Keyboard, CameraOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// O que a tela que usa o leitor responde depois de cada leitura. No modo
// continuo isso aparece por cima da camera ("Filtro de oleo - 2 un.") sem
// fechar o leitor, pra dar pra bipar uma peca atras da outra.
export type ResultadoLeitura = { tipo: 'sucesso' | 'erro'; mensagem: string };

type OnLeitura = (codigo: string) => ResultadoLeitura | void | Promise<ResultadoLeitura | void>;

// Formatos de etiqueta que aparecem em autopeca: EAN/UPC do fabricante,
// Code 128/39 de etiqueta interna e QR code.
const FORMATOS_NATIVOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf', 'codabar', 'qr_code', 'data_matrix'];

// Mesmo codigo lido de novo dentro desse intervalo e ignorado - a camera
// le a mesma etiqueta varias vezes por segundo enquanto ela esta na frente.
const INTERVALO_MESMO_CODIGO_MS = 2000;

type BarcodeDetectorLike = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options: { formats: string[] }): BarcodeDetectorLike;
      getSupportedFormats: () => Promise<string[]>;
    };
  }
}

interface LeitorCodigoBarrasProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onLeitura: OnLeitura;
  titulo?: string;
  // true: continua lendo depois de cada codigo (entrada de nota, venda, pecas
  // da OS). false: fecha na primeira leitura (cadastro, busca).
  continuo?: boolean;
}

function PainelLeitor({
  onLeitura,
  onAbertoChange,
  continuo,
}: {
  onLeitura: OnLeitura;
  onAbertoChange: (aberto: boolean) => void;
  continuo: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pararLeituraRef = useRef<(() => void) | null>(null);
  const ultimoCodigoRef = useRef<{ codigo: string; em: number } | null>(null);
  const processandoRef = useRef(false);
  // Callbacks em ref: a tela que usa o leitor costuma passar funcoes novas a
  // cada render (cada leitura muda a lista de itens dela). Se elas entrassem
  // nas dependencias do efeito da camera, a camera reiniciaria a cada codigo.
  const callbacksRef = useRef({ onLeitura, onAbertoChange, continuo });
  useEffect(() => {
    callbacksRef.current = { onLeitura, onAbertoChange, continuo };
  });

  const [status, setStatus] = useState<'iniciando' | 'lendo' | 'erro'>('iniciando');
  const [erro, setErro] = useState('');
  const [temLanterna, setTemLanterna] = useState(false);
  const [lanternaLigada, setLanternaLigada] = useState(false);
  const [digitando, setDigitando] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [retorno, setRetorno] = useState<ResultadoLeitura | null>(null);
  const [lidos, setLidos] = useState(0);

  const pararCamera = useCallback(() => {
    pararLeituraRef.current?.();
    pararLeituraRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const processarCodigo = useCallback(
    async (codigoBruto: string) => {
      const codigo = codigoBruto.trim();
      if (!codigo || processandoRef.current) return;

      const agora = Date.now();
      const ultimo = ultimoCodigoRef.current;
      if (ultimo && ultimo.codigo === codigo && agora - ultimo.em < INTERVALO_MESMO_CODIGO_MS) return;
      ultimoCodigoRef.current = { codigo, em: agora };

      processandoRef.current = true;
      sinalizarLeitura();
      try {
        const { onLeitura, onAbertoChange, continuo } = callbacksRef.current;
        const resultado = await onLeitura(codigo);
        if (continuo) {
          setLidos((n) => n + 1);
          setRetorno(resultado ?? { tipo: 'sucesso', mensagem: codigo });
        } else {
          onAbertoChange(false);
        }
      } finally {
        processandoRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('A câmera só funciona com o site aberto em HTTPS (ou no app instalado).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (cancelado) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const track = stream.getVideoTracks()[0];
      const capacidades = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
      setTemLanterna(!!capacidades.torch);

      // Caminho 1: leitor nativo do navegador (Chrome no Android) - rapido e
      // preciso, sem baixar nada.
      const formatosNativos = window.BarcodeDetector
        ? (await window.BarcodeDetector.getSupportedFormats().catch(() => [] as string[])).filter((f) => FORMATOS_NATIVOS.includes(f))
        : [];

      if (window.BarcodeDetector && formatosNativos.includes('ean_13')) {
        const detector = new window.BarcodeDetector({ formats: formatosNativos });
        let ativo = true;
        const loop = async () => {
          if (!ativo || cancelado) return;
          try {
            if (video.readyState >= 2) {
              const codigos = await detector.detect(video);
              if (codigos[0]?.rawValue) await processarCodigo(codigos[0].rawValue);
            }
          } catch {
            // frame ruim (camera trocando de foco etc.) - segue pro proximo
          }
          if (ativo && !cancelado) setTimeout(loop, 150);
        };
        pararLeituraRef.current = () => {
          ativo = false;
        };
        loop();
      } else {
        // Caminho 2: iPhone/Safari e navegadores sem leitor nativo - zxing em
        // JavaScript, carregado so quando precisa.
        const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all([
          import('@zxing/browser'),
          import('@zxing/library'),
        ]);
        if (cancelado) return;
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.CODE_93, BarcodeFormat.ITF,
          BarcodeFormat.CODABAR, BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX,
        ]);
        const leitor = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 150 });
        const controles = await leitor.decodeFromVideoElement(video, (resultado) => {
          if (resultado) processarCodigo(resultado.getText());
        });
        pararLeituraRef.current = () => controles.stop();
      }

      if (!cancelado) setStatus('lendo');
    }

    iniciar().catch((e: unknown) => {
      if (cancelado) return;
      const nome = e instanceof DOMException ? e.name : '';
      setErro(
        nome === 'NotAllowedError'
          ? 'O acesso à câmera foi negado. Libere a câmera para este site nas configurações do navegador e tente de novo.'
          : nome === 'NotFoundError' || nome === 'OverconstrainedError'
            ? 'Nenhuma câmera encontrada neste aparelho.'
            : nome === 'NotReadableError'
              ? 'A câmera está sendo usada por outro aplicativo. Feche-o e tente de novo.'
              : e instanceof Error
                ? e.message
                : 'Não foi possível abrir a câmera.'
      );
      setStatus('erro');
      setDigitando(true);
    });

    return () => {
      cancelado = true;
      pararCamera();
    };
  }, [pararCamera, processarCodigo]);

  const alternarLanterna = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const ligar = !lanternaLigada;
    try {
      await track.applyConstraints({ advanced: [{ torch: ligar } as MediaTrackConstraintSet] });
      setLanternaLigada(ligar);
    } catch {
      setTemLanterna(false);
    }
  };

  const confirmarDigitado = async (e: React.FormEvent) => {
    // Este form pode estar dentro do formulario da OS/compra - sem isso o
    // submit subiria e salvaria o formulario de fora.
    e.preventDefault();
    e.stopPropagation();
    const codigo = codigoDigitado;
    setCodigoDigitado('');
    ultimoCodigoRef.current = null;
    await processarCodigo(codigo);
  };

  return (
    <>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />

        {status === 'lendo' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[42%] w-[78%] rounded-md border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              <span className="leitor-linha absolute inset-x-2 top-1/2 h-0.5 bg-primary" />
            </div>
          </div>
        )}

        {status === 'iniciando' && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Abrindo a câmera...</div>
        )}

        {status === 'erro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white">
            <CameraOff className="h-8 w-8 text-white/70" />
            <p>{erro}</p>
          </div>
        )}

        {temLanterna && status === 'lendo' && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={alternarLanterna}
            className="absolute right-2 top-2 h-9 w-9 rounded-full"
            aria-label={lanternaLigada ? 'Desligar lanterna' : 'Ligar lanterna'}
          >
            {lanternaLigada ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {retorno && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
            retorno.tipo === 'sucesso'
              ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          )}
          role="status"
        >
          {retorno.tipo === 'sucesso' ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
          <span className="min-w-0 break-words">{retorno.mensagem}</span>
        </div>
      )}

      {digitando ? (
        <form onSubmit={confirmarDigitado} className="flex gap-2">
          <Input
            id="codigoDigitado"
            value={codigoDigitado}
            onChange={(e) => setCodigoDigitado(e.target.value)}
            placeholder="Digite o código"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            className="font-mono"
          />
          <Button type="submit" disabled={!codigoDigitado.trim()}>OK</Button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDigitando(true)}>
            <Keyboard className="mr-1.5 h-4 w-4" /> Digitar código
          </Button>
          {continuo && lidos > 0 && (
            <span className="text-xs text-muted-foreground">{lidos} lido{lidos > 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {continuo && (
        <Button type="button" onClick={() => onAbertoChange(false)} className="w-full">
          Concluir
        </Button>
      )}
    </>
  );
}

// Dialogo do leitor. O PainelLeitor so existe enquanto o dialogo esta aberto
// (o Radix desmonta o conteudo ao fechar): cada abertura comeca com o estado
// zerado e fechar desmonta o painel, o que desliga a camera.
export function LeitorCodigoBarras({ aberto, onAbertoChange, onLeitura, titulo = 'Ler código de barras', continuo = false }: LeitorCodigoBarrasProps) {
  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] gap-3 p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" /> {titulo}
          </DialogTitle>
          <DialogDescription>
            {continuo
              ? 'Aponte para uma etiqueta de cada vez. O leitor continua aberto até você fechar.'
              : 'Aponte a câmera para o código de barras ou QR code da peça.'}
          </DialogDescription>
        </DialogHeader>
        <PainelLeitor onLeitura={onLeitura} onAbertoChange={onAbertoChange} continuo={continuo} />
      </DialogContent>
    </Dialog>
  );
}

// Botao pronto: abre o leitor e repassa a leitura. E o que as telas usam.
export function BotaoLeitor({
  onLeitura,
  continuo,
  titulo,
  rotulo = 'Escanear',
  somenteIcone = false,
  className,
}: {
  onLeitura: OnLeitura;
  continuo?: boolean;
  titulo?: string;
  rotulo?: string;
  somenteIcone?: boolean;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={somenteIcone ? 'icon' : 'default'}
        onClick={() => setAberto(true)}
        className={className}
        aria-label={somenteIcone ? rotulo : undefined}
        title={rotulo}
      >
        <ScanBarcode className={cn('h-4 w-4', !somenteIcone && 'mr-1.5')} />
        {!somenteIcone && rotulo}
      </Button>
      <LeitorCodigoBarras aberto={aberto} onAbertoChange={setAberto} onLeitura={onLeitura} continuo={continuo} titulo={titulo} />
    </>
  );
}

// Bipe curto + vibracao: a mesma confirmacao de um leitor de balcao, pra
// saber que leu sem precisar olhar pra tela.
function sinalizarLeitura() {
  try {
    navigator.vibrate?.(60);
  } catch {
    // vibracao indisponivel (iPhone) - segue so com o bipe
  }
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1760;
    ganho.gain.value = 0.06;
    osc.connect(ganho).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
    osc.onended = () => ctx.close();
  } catch {
    // sem audio - a vibracao e o aviso na tela bastam
  }
}
