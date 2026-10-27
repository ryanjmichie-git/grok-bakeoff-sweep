export default {
  // Navigation
  nav: {
    overview: '概要',
    inventory: '在庫',
    orders: '注文',
    finance: '財務',
    demandForecast: '需要予測',
    restocking: '補充発注',
    reports: 'レポート',
    backlog: 'バックログ',
    companyName: '触媒コンポーネンツ',
    subtitle: '在庫管理システム',
    main: 'メイン'
  },

  // Dashboard
  dashboard: {
    title: '概要',
    kpi: {
      title: '主要業績評価指標',
      inventoryTurnover: '在庫回転率',
      ordersFulfilled: '注文履行数',
      orderFillRate: '注文充足率',
      revenue: '収益（注文）',
      revenueYTD: '収益（注文）年初来',
      revenueMTD: '収益（注文）月初来',
      avgProcessingTime: '平均処理時間（日）',
      goal: '目標'
    },
    summary: {
      title: '概要'
    },
    orderHealth: {
      title: '注文状況',
      totalOrders: '総注文数',
      revenue: '収益',
      avgOrderValue: '平均注文額',
      onTimeRate: '定時配達率',
      avgFulfillmentDays: '平均履行日数',
      total: '合計'
    },
    ordersByMonth: {
      title: '月別注文数'
    },
    inventoryValue: {
      title: 'カテゴリ別在庫価値'
    },
    inventoryShortages: {
      title: '在庫不足',
      noShortages: '在庫不足なし - すべての注文を履行できます！',
      noData: '選択したフィルターのデータがありません',
      orderId: '注文ID',
      sku: 'SKU',
      itemName: '品目名',
      quantityNeeded: '必要数量',
      quantityAvailable: '在庫数量',
      shortage: '不足',
      daysDelayed: '遅延日数',
      priority: '優先度',
      unitsShort: '単位不足',
      days: '日',
      longDelay: '長期',
      shortDelay: '短期'
    },
    topProducts: {
      title: '収益別トップ製品',
      sku: 'SKU',
      product: '製品',
      category: 'カテゴリ',
      warehouse: '倉庫',
      stockStatus: '在庫状況',
      revenue: '収益',
      unitsOrdered: '注文数量',
      firstOrder: '初回注文',
      inStock: '在庫あり',
      lowStock: '在庫僅少'
    }
  },

  // Inventory
  inventory: {
    title: '在庫',
    description: 'すべての在庫品目の追跡と管理',
    stockLevels: '在庫レベル',
    skus: 'SKU',
    searchPlaceholder: '品目名で検索...',
    clearSearch: '検索をクリア',
    totalItems: '総品目数',
    totalValue: '総価値',
    lowStockItems: '在庫僅少品目',
    warehouses: '倉庫',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      name: '名前',
      category: 'カテゴリ',
      warehouse: '倉庫',
      quantity: '数量',
      quantityOnHand: '手持在庫数',
      reorderPoint: '再注文点',
      unitCost: '単価',
      unitPrice: '単価',
      totalValue: '総価値',
      location: '場所',
      status: 'ステータス'
    }
  },

  // Orders
  orders: {
    title: '注文',
    description: '顧客注文の表示と管理',
    allOrders: 'すべての注文',
    totalOrders: '総注文数',
    totalRevenue: '総収益',
    avgOrderValue: '平均注文額',
    onTimeDelivery: '定時配達',
    itemsCount: '{count}件',
    quantity: '数量',
    table: {
      orderNumber: '注文番号',
      orderId: '注文ID',
      orderDate: '注文日',
      date: '日付',
      customer: '顧客',
      category: 'カテゴリ',
      warehouse: '倉庫',
      items: '品目',
      value: '価格',
      totalValue: '合計金額',
      status: 'ステータス',
      expectedDelivery: '予定配達日',
      actualDelivery: '実際の配達日'
    },
    submitted: {
      title: '送信済み発注',
      orderNumber: '注文番号',
      submittedDate: '送信日',
      lines: '明細数',
      total: '合計',
      leadTime: 'リードタイム',
      leadTimeDays: '{days}日',
      expectedDelivery: '納品予定日',
      status: 'ステータス',
      statusSubmitted: '送信済み',
      empty: '送信済みの補充発注はまだありません。',
      emptyLink: '補充発注ページで発注できます。',
      caption: 'これらの発注は上のフィルターの影響を受けません。サーバーを再起動すると消去されます。',
      loadError: '送信済み発注を読み込めませんでした'
    }
  },

  // Finance/Spending
  finance: {
    title: '財務ダッシュボード',
    description: '収益、コスト、財務パフォーマンスの追跡',
    totalRevenue: '総収益',
    totalCosts: '総コスト',
    netProfit: '純利益',
    avgOrderValue: '平均注文額',
    fromOrders: '{count}件の注文から',
    costBreakdown: '調達 + 運営 + 人件費 + 間接費',
    margin: 'マージン',
    perOrderRevenue: '注文あたりの収益',
    revenueVsCosts: {
      title: '月別収益対コスト',
      revenue: '収益',
      costs: '総コスト'
    },
    monthlyCostFlow: {
      title: '月別コストフロー',
      procurement: '調達',
      operational: '運営',
      labor: '人件費',
      overhead: '間接費'
    },
    categorySpending: {
      title: 'カテゴリ別支出',
      ofTotal: '全体の'
    },
    transactions: {
      title: '最近の取引',
      id: 'ID',
      description: '説明',
      vendor: 'ベンダー',
      date: '日付',
      amount: '金額'
    }
  },

  // Demand Forecast
  demand: {
    title: '需要予測',
    description: '需要動向の分析と将来のニーズの予測',
    increasingDemand: '需要増加',
    stableDemand: '需要安定',
    decreasingDemand: '需要減少',
    itemsCount: '{count}件',
    more: 'さらに...',
    demandForecasts: '需要予測',
    table: {
      sku: 'SKU',
      itemName: '品目名',
      currentDemand: '現在の需要',
      forecastedDemand: '予測需要',
      change: '変化',
      trend: 'トレンド',
      period: '期間'
    }
  },

  // Filters
  filters: {
    timePeriod: '期間',
    location: '場所',
    category: 'カテゴリ',
    orderStatus: '注文ステータス',
    all: 'すべて',
    allMonths: 'すべての月',
    reset: 'すべてのフィルターをリセット'
  },

  // Statuses
  status: {
    delivered: '配達済み',
    shipped: '出荷済み',
    processing: '処理中',
    backordered: 'バックオーダー',
    inStock: '在庫あり',
    lowStock: '在庫僅少',
    adequate: '適量'
  },

  // Trends
  trends: {
    increasing: '増加',
    stable: '安定',
    decreasing: '減少'
  },

  // Reports
  reports: {
    title: 'パフォーマンスレポート',
    description: '四半期ごとの業績指標と月次トレンドを表示します',
    loading: 'レポートを読み込み中...',
    loadError: 'レポートの読み込みに失敗しました',
    up: '増加',
    down: '減少',
    flat: '変化なし',
    notAvailable: '該当なし',
    quarterly: {
      title: '四半期業績',
      quarter: '四半期',
      totalOrders: '総注文数',
      totalRevenue: '総収益',
      avgOrderValue: '平均注文額',
      fulfillmentRate: '出荷達成率'
    },
    fulfillment: {
      good: '目標達成',
      fair: '要注意',
      low: '目標未達'
    },
    trend: {
      title: '月次収益トレンド'
    },
    mom: {
      title: '前月比分析',
      month: '月',
      orders: '注文数',
      revenue: '収益',
      change: '増減額',
      growthRate: '成長率'
    },
    summary: {
      totalRevenue: '総収益(年初来)',
      avgMonthlyRevenue: '月平均収益',
      totalOrders: '総注文数(年初来)',
      bestQuarter: '最高業績の四半期'
    }
  },

  // Backlog
  backlog: {
    title: 'バックログ管理',
    description: '在庫不足の追跡と解消',
    loadError: 'バックログの読み込みに失敗しました',
    highPriority: '優先度:高',
    mediumPriority: '優先度:中',
    lowPriority: '優先度:低',
    totalItems: 'バックログ合計件数',
    itemsTitle: 'バックログ一覧'
  },

  // Priority
  priority: {
    high: '高',
    medium: '中',
    low: '低'
  },

  // Categories
  categories: {
    circuitBoards: '回路基板',
    sensors: 'センサー',
    actuators: 'アクチュエータ',
    controllers: 'コントローラー',
    powerSupplies: '電源'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: '原材料',
    components: '部品',
    equipment: '設備',
    consumables: '消耗品'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'サンフランシスコ',
    london: 'ロンドン',
    tokyo: '東京'
  },

  // Months
  months: {
    jan: '1月',
    feb: '2月',
    mar: '3月',
    apr: '4月',
    may: '5月',
    jun: '6月',
    jul: '7月',
    aug: '8月',
    sep: '9月',
    oct: '10月',
    nov: '11月',
    dec: '12月',
    january: '1月',
    february: '2月',
    march: '3月',
    april: '4月',
    june: '6月',
    july: '7月',
    august: '8月',
    september: '9月',
    october: '10月',
    november: '11月',
    december: '12月'
  },

  // Profile Menu
  profile: {
    profileDetails: 'プロフィール詳細',
    myTasks: 'マイタスク',
    logout: 'ログアウト'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'プロフィール詳細',
    email: 'メールアドレス',
    department: '部署',
    location: '勤務地',
    phone: '電話番号',
    joinDate: '入社日',
    employeeId: '社員ID',
    close: '閉じる'
  },

  // Tasks Modal
  tasks: {
    title: 'マイタスク',
    taskTitle: 'タスク名',
    taskTitlePlaceholder: 'タスク名を入力...',
    priority: '優先度',
    dueDate: '期限',
    addTask: 'タスクを追加',
    noTasks: 'タスクがありません。上記からタスクを追加してください！',
    deleteTask: 'タスクを削除',
    completed: '完了'
  },

  // Restocking
  restocking: {
    title: '補充発注',
    description: '予算を選ぶと、30日間の需要予測をもとに発注すべき品目を表示します',
    loading: '推奨を読み込み中...',
    loadError: '補充の推奨を読み込めませんでした',
    retry: '再試行',
    budgetTitle: '予算',
    budgetLabel: '補充発注の予算',
    stats: {
      budget: '予算',
      orderTotal: '発注合計',
      remaining: '残り予算',
      lines: '明細数'
    },
    recommendations: '推奨発注',
    table: {
      sku: 'SKU',
      item: '品目',
      trend: 'トレンド',
      forecast: '予測(30日)',
      onHand: '在庫数',
      quantity: '数量',
      unitCost: '単価',
      lineTotal: '明細合計'
    },
    unknown: '不明',
    quantityOf: '{need}のうち{quantity}',
    partial: '一部のみ',
    priceSource: {
      inventory: '在庫データの価格',
      catalog: '製品カタログの価格'
    },
    empty: 'この予算で発注できる品目はありません。予算を上げると推奨が表示されます。',
    notRecommended: '推奨しない品目',
    notRecommendedTable: {
      item: '品目',
      reason: '理由',
      need: '必要数'
    },
    reasons: {
      over_budget: '予算超過',
      stock_covers_forecast: '在庫で予測をまかなえる',
      no_price: '価格情報なし'
    },
    notRecommendedEmpty: 'すべての品目が発注に含まれています。',
    placeOrder: '発注する',
    placing: '発注中...',
    orderSubmitted: '注文{id}を送信しました',
    viewOrders: '注文ページで確認',
    orderError: '発注できませんでした',
    footnotesTitle: '注記',
    footnotes: {
      prices: '価格は、PSU-501が inventory.json、そのほか6品目が server/generate_data.py の製品カタログによります。transactions.json の購入金額で裏付けています。',
      noPrice: '2品目は価格情報がないため、推奨していません。',
      quantity: '数量は、30日間の予測から在庫数を引いた数です。在庫が不明な場合は0として扱います。',
      leadTime: 'リードタイムの{days}日は、orders.json の250件の注文について、注文日から納品予定日までの日数の中央値です(範囲は7〜14日)。',
      memory: '送信した発注はメモリに保存され、サーバーを再起動すると消えます。'
    }
  },

  // Language
  language: {
    english: 'English',
    japanese: '日本語',
    selectLanguage: '言語を選択'
  },

  // Common
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    noData: 'データがありません',
    viewDetails: '詳細を見る',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    search: '検索',
    filter: 'フィルター',
    export: 'エクスポート',
    items: '件',
    skipToContent: 'メインコンテンツへスキップ'
  },

  // Product Names
  productNames: {
    'Single Layer PCB Assembly': '単層PCB組立',
    'Dual Layer PCB Assembly': '二層PCB組立',
    'Multi Layer PCB Assembly': '多層PCB組立',
    'Temperature Sensor Module': '温度センサーモジュール',
    'Humidity Sensor Module': '湿度センサーモジュール',
    'Pressure Sensor Module': '圧力センサーモジュール',
    'Proximity Sensor': '近接センサー',
    'Ultrasonic Distance Sensor': '超音波距離センサー',
    'Micro Servo Motor': 'マイクロサーボモータ',
    'Standard Servo Motor': '標準サーボモータ',
    'Stepper Motor NEMA 17': 'ステッピングモータNEMA 17',
    '8-bit Microcontroller': '8ビットマイコン',
    '32-bit ARM Microcontroller': '32ビットARMマイコン',
    'Digital Signal Processor': 'デジタル信号処理装置',
    '3-Axis Accelerometer': '3軸加速度センサー',
    'Gyroscope Module': 'ジャイロスコープモジュール',
    'Light Dependent Resistor': '光依存抵抗器',
    'Coil Spring Heavy Duty': 'コイルばね(重量用)',
    'Compression Spring': '圧縮ばね',
    'PWM Motor Controller': 'PWMモータコントローラ',
    'H-Bridge Motor Driver': 'Hブリッジモータドライバ',
    'Stepper Motor NEMA 23': 'ステッピングモータNEMA 23',
    'Drive Pulley': 'ドライブプーリー',
    'LED Driver IC': 'LEDドライバIC',
    '5V 10A Switching Power Supply': '5V 10Aスイッチング電源',
    '12V 5A Power Supply Module': '12V 5A電源モジュール',
    '24V 3A Industrial Power Supply': '24V 3A産業用電源',
    'Dual Output ±15V Power Supply': 'デュアル出力±15V電源',
    '48V DC Power Supply Unit': '48V DC電源ユニット',
    'USB-C PD 100W Power Supply': 'USB-C PD 100W電源',
    'Battery Backup Power Supply': 'バッテリバックアップ電源',
    'Adjustable Bench Power Supply': '可変ベンチ電源',
    'Industrial Widget Type A': '工業用ウィジェット タイプA',
    'Steel Bearing Assembly': 'スチールベアリングアセンブリ',
    'High-Temperature Gasket': '耐熱ガスケット',
    'Electric Motor 5HP': '電動モーター 5HP',
    'Oil Filter Cartridge': 'オイルフィルターカートリッジ',
    'Pressure Relief Valve': '圧力逃し弁',
    'Logic Controller Board': 'ロジックコントローラーボード'
  },

  // Customer Names
  customerNames: {
    'MegaCorp Industries': 'メガコープ工業',
    'Elite Systems Corp': 'エリートシステムズ',
    'Horizon Technologies': 'ホライズン技術',
    'FastAssembly Ltd': 'ファストアセンブリー',
    'TechSolutions Group': 'テックソリューションズグループ',
    'Apex Engineering': 'アペックスエンジニアリング',
    'Superior Manufacturing': 'スーペリアマニュファクチャリング',
    'Cascade Manufacturing': 'カスケードマニュファクチャリング',
    'Acme Manufacturing Corp': 'アクメ製造',
    'TechBuild Industries': 'テックビルド工業',
    'Advanced Components Inc': 'アドバンストコンポーネンツ',
    'Premier Industries': 'プレミア工業',
    'Stellar Components Ltd': 'ステラコンポーネンツ',
    'Dynamic Systems Ltd': 'ダイナミックシステムズ'
  }
}
