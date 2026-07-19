import type { Messages } from './en'

/**
 * Portuguese (Brazil) UI copy.
 */
export const pt: Messages = {
  app: {
    name: 'AirCanvas AI',
    description:
      'Transforme qualquer webcam em um dispositivo de entrada com visão computacional.',
    openSource: 'Código aberto',
    badgeVision: 'Entrada por visão computacional',
  },
  nav: {
    home: 'Início',
    studio: 'Estúdio',
    settings: 'Configurações',
  },
  home: {
    openStudio: 'Abrir Estúdio',
    settings: 'Configurações',
    cardTrackingTitle: 'Rastreamento de mãos',
    cardTrackingDesc: 'MediaPipe Hand Landmarker pronto para adapters.',
    cardTrackingBody:
      'Capture landmarks de qualquer webcam sem acoplar a UI às APIs do navegador.',
    cardCursorTitle: 'Cursor virtual',
    cardCursorDesc: 'Controle do ponteiro abstraído atrás de ports.',
    cardCursorBody:
      'Mova um cursor com as mãos hoje — mapeie para o SO quando o Tauri chegar.',
    cardGesturesTitle: 'Ações por gestos',
    cardGesturesDesc: 'Gestos customizados para apps, mídia e mais.',
    cardGesturesBody:
      'Modelos de domínio e casos de uso ficam independentes do host para migrar ao desktop.',
    comingSoon: 'Em breve',
    pipelineHint: 'Pipeline de rastreamento ainda não conectado',
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'A rota solicitada ainda não existe.',
    backHome: 'Voltar ao início',
  },
  settings: {
    title: 'Configurações',
    subtitle:
      'Preferências persistem no navegador via Zustand. Mudanças valem no Estúdio imediatamente quando possível; o FPS da câmera vale na próxima abertura.',
    reset: 'Restaurar padrões',
    cursorTitle: 'Cursor',
    cursorDesc: 'Como o ponteiro virtual responde ao movimento da mão.',
    sensitivity: 'Sensibilidade',
    mirroring: 'Espelhamento',
    mirroringDesc: 'Inverte o eixo X para combinar com o preview espelhado.',
    cameraTitle: 'Câmera e visão',
    cameraDesc: 'Taxa de captura e overlays no preview.',
    targetFps: 'FPS alvo',
    targetFpsDesc: 'FPS solicitado à câmera (o dispositivo pode limitar).',
    showLandmarks: 'Mostrar landmarks',
    showLandmarksDesc: 'Overlay do esqueleto no preview da câmera.',
    showFps: 'Mostrar FPS',
    showFpsDesc: 'Exibe FPS reportado e real no preview.',
    drawingTitle: 'Desenho',
    drawingDesc: 'Pincel padrão do AirCanvas e das ações de canvas.',
    thickness: 'Espessura',
    thicknessDesc: 'Largura do pincel em pixels.',
    color: 'Cor',
    colorDesc: 'Cor padrão do pincel.',
    colorAria: 'Cor {color}',
    customColorAria: 'Cor personalizada',
    appearanceTitle: 'Aparência',
    appearanceDesc: 'Preferências de tema e idioma.',
    theme: 'Tema',
    themeDesc: 'Salvo localmente com o restante.',
    language: 'Idioma',
    languageDesc: 'Idioma da interface em todo o app.',
  },
  theme: {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
  },
  locale: {
    en: 'English',
    pt: 'Português',
  },
  studio: {
    title: 'Estúdio',
    subtitle:
      'Abra a câmera e use pinça + movimento para desenhar no AirCanvas. Os comandos de pose (mão aberta, punho, vitória) estão na lista abaixo.',
    help: 'Ajuda',
    session: 'sessão',
    camera: 'câmera',
    vision: 'visão',
    state: 'estado',
    visionRunning: 'ativa',
    visionIdle: 'ociosa',
    cameraTitle: 'Câmera',
    cameraDesc:
      'Abra a webcam, troque dispositivos e confira métricas do stream.',
    openCamera: 'Abrir câmera',
    closeCamera: 'Fechar câmera',
    refreshDevices: 'Atualizar dispositivos',
    previewPlaceholder: 'O preview da câmera aparece aqui',
    cameraUnsupported: 'Câmera não é suportada neste ambiente',
    device: 'Dispositivo',
    noDevices: 'Nenhum dispositivo',
    permission: 'Permissão',
    resolution: 'Resolução',
    reportedFps: 'FPS reportado',
    actualFps: 'FPS real',
    requestPermission: 'Pedir permissão',
    requestPermissionTip: 'Solicita acesso à webcam no navegador',
    gestureEngineTitle: 'Gesture Engine',
    gestureEngineDesc:
      'Landmarks → estados de interação (não gestos de alto nível).',
    labelState: 'Estado',
    labelPinch: 'Pinça',
    labelPointer: 'Ponteiro',
    labelTrack: 'Faixa',
    labelCursor: 'Cursor',
    yes: 'sim',
    no: 'não',
    actionEngineTitle: 'Action Engine',
    actionEngineDesc:
      'Ações no padrão Command — canvas agora; Spotify, PowerPoint, VS Code e SO depois.',
    run: 'Executar',
    gestureRecognitionTitle: 'Comandos por gesto',
    gestureRecognitionDesc:
      'Segure essas poses por um instante para disparar uma ação. Desenhar não está nesta lista — veja o guia abaixo.',
    controlsGuideTitle: 'Como desenhar e apagar',
    controlsGuideDraw:
      'Desenhar: una polegar + indicador (pinça) e mova a mão. O estado deve ir para Desenhando.',
    controlsGuideStop: 'Parar de desenhar: solte a pinça (volta para Hover).',
    controlsGuideEraseStroke:
      'Apagar traços: clique em Borracha no AirCanvas e depois pinça + mova.',
    controlsGuideClearAll: 'Apagar tudo: mão aberta (ou o botão Limpar).',
    commandsListTitle: 'Comandos de pose',
    lastMatch: 'Último reconhecimento',
    noneYet: 'Nenhum ainda',
    actionLog: 'Log de ações',
    actionLogEmpty:
      'Tente mão aberta, punho, vitória ou um toque rápido de pinça (sem arrastar).',
    airCanvasTitle: 'AirCanvas',
    airCanvasDesc:
      'Pinta enquanto o estado for Desenhando (pinça + mover). Para ao soltar a pinça.',
    brush: 'Pincel',
    eraser: 'Borracha',
    clear: 'Limpar',
    savePng: 'Salvar PNG',
    thickness: 'Espessura',
    color: 'Cor',
    colorAria: 'Cor {color}',
    customColorAria: 'Cor personalizada',
    inking: 'pintando',
    idle: 'ocioso',
    handLandmarkerTitle: 'Hand Landmarker',
    handLandmarkerDesc:
      'MediaPipe Tasks Vision — até 2 mãos, 21 landmarks, lateralidade e confiança.',
    noHands:
      'Nenhuma mão detectada ainda. Mostre uma ou duas mãos para a câmera.',
    openCameraForVision: 'Abra a câmera para iniciar a visão.',
    confidence: 'confiança {value}%',
    landmarksCount: '{count}/{total} landmarks',
    cameraRefTitle: 'Referência da câmera',
    cameraRefDesc: 'Overlay do esqueleto no feed ao vivo.',
    cameraRefBody:
      'Use o preview para acompanhar o rastreamento. Desenhe no AirCanvas com pinça + movimento.',
    helpTitle: 'Como usar o Estúdio',
    helpDesc: 'Guia rápido: desenhar, apagar e comandos de pose.',
    helpDrawTitle: 'Desenhar',
    helpDrawBody:
      '1) Abra a câmera. 2) Una polegar + indicador. 3) Mova para pintar. 4) Solte para parar. O badge deve mostrar Desenhando enquanto pinta.',
    helpEraseTitle: 'Apagar',
    helpEraseBody:
      'Borracha de traço: escolha Borracha e pinça + mova. Apagar tudo: mão aberta, ou Limpar.',
    helpCommandsTitle: 'Comandos de pose',
    helpCommandsBody:
      'Mão aberta → apaga tudo. Punho ou toque rápido de pinça → troca cor. Vitória (V) → salva PNG. “Desenho iniciado” só registra no log quando o Drawing começa — não é o jeito de começar a pintar.',
    gotIt: 'Entendi',
    logRecognized: '{gesture} → {action}',
    logConfidence: '{gesture} · {confidence}%',
  },
  cameraStatus: {
    idle: 'ociosa',
    requesting: 'solicitando',
    starting: 'iniciando',
    open: 'aberta',
    stopping: 'fechando',
    error: 'erro',
  },
  cameraPermission: {
    granted: 'concedida',
    denied: 'negada',
    prompt: 'pendente',
    unsupported: 'sem suporte',
  },
  sessionStatus: {
    idle: 'ociosa',
    ready: 'pronta',
    tracking: 'rastreando',
    paused: 'pausada',
    error: 'erro',
  },
  interactionState: {
    Lost: 'Perdida',
    Tracking: 'Rastreando',
    Hover: 'Hover',
    Pinch: 'Pinça',
    Dragging: 'Arrastando',
    Drawing: 'Desenhando',
    Released: 'Solta',
  },
  handedness: {
    Left: 'Esquerda',
    Right: 'Direita',
    Unknown: 'Desconhecida',
  },
  domain: {
    canvas: 'canvas',
    media: 'mídia',
    presentation: 'apresentação',
    editor: 'editor',
    os: 'SO',
    system: 'sistema',
  },
  action: {
    'canvas.set-color': {
      name: 'Trocar cor',
      description: 'Define a cor do pincel ou cicla a paleta.',
    },
    'canvas.clear': {
      name: 'Limpar canvas',
      description: 'Apaga todos os traços da superfície de desenho.',
    },
    'canvas.save': {
      name: 'Salvar imagem',
      description: 'Exporta o canvas como arquivo PNG.',
    },
    'spotify.play-pause': {
      name: 'Play / Pause',
      description: 'Alterna reprodução do Spotify (em breve).',
    },
    'spotify.next': {
      name: 'Próxima faixa',
      description: 'Próxima faixa do Spotify (em breve).',
    },
    'powerpoint.next-slide': {
      name: 'Próximo slide',
      description: 'Avança slide no PowerPoint (em breve).',
    },
    'vscode.toggle-terminal': {
      name: 'Alternar terminal',
      description: 'Terminal do VS Code (em breve).',
    },
    'os.mute': {
      name: 'Mudo',
      description: 'Mudo do sistema (em breve via Tauri).',
    },
  },
  gesture: {
    'open-palm': {
      name: 'Mão aberta',
      effect: 'Apaga tudo',
      description:
        'Como: abra a mão com a palma para a câmera. Efeito: apaga o desenho inteiro.',
    },
    fist: {
      name: 'Punho',
      effect: 'Troca cor',
      description: 'Como: feche a mão em punho. Efeito: cicla a cor do pincel.',
    },
    victory: {
      name: 'Vitória',
      effect: 'Salva PNG',
      description:
        'Como: faça um V com indicador + médio. Efeito: baixa o canvas em PNG.',
    },
    'pinch-tap': {
      name: 'Toque de pinça',
      effect: 'Troca cor',
      description:
        'Como: pinça rápida sem arrastar. Efeito: cicla a cor (não desenha).',
    },
    'enter-drawing': {
      name: 'Desenho iniciado',
      effect: 'Só no log',
      description:
        'Não é um comando. Dispara sozinho quando pinça + mover entra em Desenhando — serve para o log, não para começar a pintar.',
    },
  },
}
