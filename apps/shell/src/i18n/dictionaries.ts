export type Locale = 'en' | 'vi';

export const LOCALES: readonly Locale[] = ['en', 'vi'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  vi: 'VI',
};

/** BCP-47 tag used for number/date formatting. */
export const NUMBER_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

/** Normalise the persisted `locale` preference to a supported locale. */
export function resolveLocale(raw: string | undefined | null): Locale {
  if (typeof raw === 'string' && raw.toLowerCase().startsWith('vi')) return 'vi';
  return 'en';
}

export interface Dictionary {
  skipToContent: string;
  nav: {
    dashboard: string;
    meta: string;
    wiki: string;
    builder: string;
    menu: string;
    openMenu: string;
    closeMenu: string;
    currentPatch: string;
    patch: string;
  };
  theme: { toLight: string; toDark: string };
  locale: { label: string };
  common: { retry: string; viewAll: string; noData: string; all: string; traits: string; cost: string; tier: string; sortBy: string; clear: string; close: string };
  home: {
    trending: string;
    explore: string;
    topChampions: string;
    builderCtaTitle: string;
    builderCtaDesc: string;
    builderCtaButton: string;
    heroSubtitle: string;
    rankedMatches: (games: string) => string;
    exploreMeta: string;
    openBuilder: string;
    hotBadge: string;
    prevSlide: string;
    nextSlide: string;
    goToSlide: (index: number) => string;
    quickLinks: { title: string; description: string; href: string }[];
  };
  stats: {
    currentPatch: string;
    gamesAnalysed: string;
    topComp: string;
    bestChampion: string;
    setUnavailable: string;
    compsTracked: (count: number) => string;
    winRate: (rate: string) => string;
    loadError: string;
  };
  comps: {
    winRate: string;
    avgPlace: string;
    top4: string;
    loadError: string;
    empty: string;
  };
  filter: {
    rank: string;
    brackets: { value: string; label: string }[];
    setPatch: (setNumber: number, patchId: string) => string;
  };
  meta: {
    title: string;
    subtitle: (patch: string) => string;
    setLine: (setNumber: number, setName: string, games: string) => string;
    loadError: string;
    champions: (count: number) => string;
    topChampions: string;
    fullTierList: string;
    empty: string;
    topComps: string;
    tryInBuilder: string;
    avgWinRate: string;
    units: string;
    details: string;
    tierListTitle: string;
    tierListSubtitle: (patch: string) => string;
    tierListCaption: string;
    table: {
      champion: string;
      cost: string;
      tier: string;
      winRate: string;
      avgPlace: string;
      pickRate: string;
      traits: string;
    };
  };
  wiki: {
    searchPlaceholder: string;
    searchLabel: string;
    searchNoResults: string;
    inMeta: string;
    currentSet: string;
    hubTitle: string;
    hubSubtitle: (setName: string) => string;
    entries: (count: number) => string;
    categories: { title: string; description: string; href: string }[];
    championsTitle: string;
    championsSubtitle: (count: number, setName: string) => string;    championsSearch: string;
    championsSearchLabel: string;
    championsError: string;
    championsEmpty: string;
    traitsTitle: string;
    traitsSubtitle: (count: number, setName: string) => string;
    traitsSearch: string;
    traitsSearchLabel: string;
    traitsError: string;
    traitsEmpty: string;
    bonusAt: string;
    noDescription: string;
    itemsTitle: string;
    itemsSubtitle: (count: number, setName: string) => string;
    itemsSearch: string;
    itemsSearchLabel: string;
    itemsError: string;
    itemsEmpty: string;
    augmentsTitle: string;
    augmentsSubtitle: (count: number, setName: string) => string;    augmentsSearch: string;
    augmentsSearchLabel: string;
    augmentsError: string;
    augmentsEmpty: string;
    tiers: { silver: string; gold: string; prismatic: string };
    detailAbility: string;
    detailMana: string;
    detailBaseStats: string;
    detailFeaturing: (name: string) => string;
    detailSimilar: string;
    detailAddToBuilder: string;
    detailAdded: (name: string) => string;
    detailBack: string;
    statHp: string;
    statArmor: string;
    statMr: string;
    statAd: string;
    statAs: string;
    statRange: string;
  };
  builder: {
    title: string;    subtitle: string;
    level: string;
    decreaseLevel: string;
    increaseLevel: string;
    gold: string;
    decreaseGold: string;
    increaseGold: string;
    reset: string;
    confirmReset: string;
    board: (count: number, max: number) => string;
    slot: (index: number) => string;
    bench: string;
    activeTraits: string;
    traitsEmpty: string;
    removeFromBoard: (name: string) => string;
    removeFromBench: (name: string) => string;
    poolTitle: string;
    poolSearch: string;
    poolSearchLabel: string;
    poolFull: string;
    poolError: string;
    poolEmpty: string;
    addToBoard: (name: string) => string;
    dndHint: string;
  };
  saved: {
    title: (count: number) => string;    shareCurrent: string;
    namePlaceholder: string;
    nameLabel: string;
    save: string;
    saved: string;
    loaded: (name: string) => string;
    needChampion: string;
    shareCopied: string;
    shareSavedCopied: (name: string) => string;
    clipboardFail: string;
    invalidLink: string;
    sharedLoaded: string;
    load: string;
    copyLink: string;
    delete: (name: string) => string;
    summary: (count: number, level: number, gold: number) => string;
    empty: string;
  };
  roll: {
    title: string;
    desc: string;
    target: string;
    level: string;
    gold: string;
    perRoll: string;
    withGold: (gold: number) => string;
    expected: string;
  };
}

const en: Dictionary = {
  skipToContent: 'Skip to content',
  nav: {
    dashboard: 'Dashboard',
    meta: 'Meta',
    wiki: 'Wiki',
    builder: 'Builder',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    currentPatch: 'Current Patch',
    patch: 'Patch',
  },
  theme: { toLight: 'Switch to light mode', toDark: 'Switch to dark mode' },
  locale: { label: 'Language' },
  common: { retry: 'Retry', viewAll: 'View All \u2192', noData: 'No data', all: 'All', traits: 'Traits', cost: 'Cost', tier: 'Tier', sortBy: 'Sort by', clear: 'Clear', close: 'Close' },
  home: {
    trending: 'Trending Compositions',
    explore: 'Explore',
    topChampions: 'Top Champions',
    builderCtaTitle: 'Ready to cook your own comp?',
    builderCtaDesc: 'Open the interactive board, place your carries, and share the final comp with a link.',
    builderCtaButton: 'Start Building',
    heroSubtitle:
      'Your all-in-one Teamfight Tactics companion. Track the meta, explore champions and traits, and build winning compositions.',
    rankedMatches: (games) => ` Based on ${games} ranked matches.`,
    exploreMeta: 'Explore the Meta',
    openBuilder: 'Open Team Builder',
    hotBadge: 'Hot meta',
    prevSlide: 'Previous spotlight',
    nextSlide: 'Next spotlight',
    goToSlide: (index) => `Go to spotlight ${index}`,
    quickLinks: [
      {
        title: 'Meta Tracker',
        description: 'Tier lists, win rates, and comp rankings for the current patch.',
        href: '/meta',
      },
      {
        title: 'Champion Wiki',
        description: 'Browse champions, traits, items, and augments with full details.',
        href: '/wiki',
      },
      {
        title: 'Team Builder',
        description: 'Plan your team composition with an interactive board builder.',
        href: '/builder',
      },
    ],
  },
  stats: {
    currentPatch: 'Current Patch',
    gamesAnalysed: 'Games Analysed',
    topComp: 'Top Comp',
    bestChampion: 'Best Champion',
    setUnavailable: 'Set data unavailable',
    compsTracked: (count) => `${count} comps tracked`,
    winRate: (rate) => `${rate}% win rate`,
    loadError: 'Could not load stats.',
  },
  comps: {
    winRate: 'Win Rate',
    avgPlace: 'Avg Place',
    top4: 'Top 4',
    loadError: 'Could not load trending comps.',
    empty: 'No comps available right now.',
  },
  filter: {
    rank: 'Rank:',
    brackets: [
      { value: 'all', label: 'All' },
      { value: 'diamond_plus', label: 'Diamond+' },
      { value: 'master_plus', label: 'Master+' },
      { value: 'challenger', label: 'Challenger' },
    ],
    setPatch: (setNumber, patchId) => `Set ${setNumber} \u00B7 Patch ${patchId}`,
  },
  meta: {
    title: 'Meta Overview',
    subtitle: (patch) => `Champion tier list and win rates for Patch ${patch}`,
    setLine: (setNumber, setName, games) =>
      `Set ${setNumber} \u2014 ${setName} \u00B7 ${games} matches analysed`,
    loadError: 'Couldn\u2019t load meta stats.',
    champions: (count) => `${count} champion${count !== 1 ? 's' : ''}`,
    topChampions: 'Top Champions',
    fullTierList: 'Full Tier List \u2192',
    empty: 'No champion data available yet.',
    topComps: 'Top Comps',
    tryInBuilder: 'Try in builder',
    avgWinRate: 'Avg WR',
    units: 'Units',
    details: 'Details',
    tierListTitle: 'Champion Tier List',
    tierListSubtitle: (patch) => `All champions sorted by average placement for Patch ${patch}`,
    tierListCaption: 'Champion tier list sorted by average placement',
    table: {
      champion: 'Champion',
      cost: 'Cost',
      tier: 'Tier',
      winRate: 'Win Rate',
      avgPlace: 'Avg Place',
      pickRate: 'Pick Rate',
      traits: 'Traits',
    },
  },
  wiki: {
    searchPlaceholder: 'Search champions, traits, items...',
    searchLabel: 'Search the wiki',
    searchNoResults: 'No matches \u2014 press Enter to browse champions.',
    inMeta: 'Hot in meta',
    currentSet: 'the current set',
    hubTitle: 'TFT Wiki',
    hubSubtitle: (setName) =>
      `${setName} \u2014 Complete reference for champions, traits, items, and augments.`,
    entries: (count) => `${count} entries`,
    categories: [
      {
        title: 'Champions',
        description: 'Browse all champions with stats, abilities, and recommended items.',
        href: '/wiki/champions',
      },
      {
        title: 'Traits',
        description: 'Explore all traits, their thresholds, and synergy effects.',
        href: '/wiki/traits',
      },
      {
        title: 'Items',
        description: 'Item combinations, component stats, and best-in-slot recommendations.',
        href: '/wiki/items',
      },
      {
        title: 'Augments',
        description: 'All augments categorized by tier with detailed effect descriptions.',
        href: '/wiki/augments',
      },
    ],
    championsTitle: 'Champions',
    championsSubtitle: (count, setName) => `Browse all ${count} champions in ${setName}`,
    championsSearch: 'Search by name or trait...',
    championsSearchLabel: 'Search champions by name or trait',
    championsError: 'Failed to load champions.',
    championsEmpty: 'No champions match your filters.',
    traitsTitle: 'Traits',
    traitsSubtitle: (count, setName) => `Browse all ${count} traits in ${setName}`,
    traitsSearch: 'Search traits...',
    traitsSearchLabel: 'Search traits',
    traitsError: 'Failed to load traits.',
    traitsEmpty: 'No traits match your search.',
    bonusAt: 'Bonus at',
    noDescription: 'No description available.',
    itemsTitle: 'Items',
    itemsSubtitle: (count, setName) => `Browse all ${count} items in ${setName}`,
    itemsSearch: 'Search items...',
    itemsSearchLabel: 'Search items',
    itemsError: 'Failed to load items.',
    itemsEmpty: 'No items match your search.',
    augmentsTitle: 'Augments',
    augmentsSubtitle: (count, setName) => `Browse all ${count} augments in ${setName}`,
    augmentsSearch: 'Search augments...',
    augmentsSearchLabel: 'Search augments',
    augmentsError: 'Failed to load augments.',
    augmentsEmpty: 'No augments match your filters.',
    tiers: { silver: 'Silver', gold: 'Gold', prismatic: 'Prismatic' },
    detailAbility: 'Ability',
    detailMana: 'Mana',
    detailBaseStats: 'Base stats',
    detailFeaturing: (name) => `Comps featuring ${name}`,
    detailSimilar: 'Similar champions',
    detailAddToBuilder: 'Add to builder',
    detailAdded: (name) => `${name} added \u2014 open the builder to place it.`,
    detailBack: 'All champions',
    statHp: 'HP',
    statArmor: 'Armor',
    statMr: 'Magic Resist',
    statAd: 'Attack Damage',
    statAs: 'Attack Speed',
    statRange: 'Range',
  },
  builder: {
    title: 'Team Builder',
    subtitle: 'Plan your team composition and explore synergies.',
    level: 'Level',
    decreaseLevel: 'Decrease level',
    increaseLevel: 'Increase level',
    gold: 'Gold',
    decreaseGold: 'Decrease gold by 10',
    increaseGold: 'Increase gold by 10',
    reset: 'Reset Board',
    confirmReset: 'Click again to confirm',
    board: (count, max) => `Board (${count}/${max} max)`,
    slot: (index) => `Slot ${index}`,
    bench: 'Bench',
    activeTraits: 'Active Traits',
    traitsEmpty: 'Add champions from the pool to see active traits.',
    removeFromBoard: (name) => `Remove ${name} from board`,
    removeFromBench: (name) => `Remove ${name} from bench`,
    poolTitle: 'Champion Pool',
    poolSearch: 'Search pool...',
    poolSearchLabel: 'Search champion pool',
    poolFull: 'Board and bench are full \u2014 remove a champion to add another.',
    poolError: 'Failed to load champions.',
    poolEmpty: 'No champions match your search.',
    addToBoard: (name) => `Add ${name} to board`,
    dndHint: 'Drag champions onto the board \u2014 drag between slots to reposition, double-click to swap board and bench.',
  },
  saved: {
    title: (count) => `Saved Comps (${count}/20)`,
    shareCurrent: 'Share current',
    namePlaceholder: 'Comp name (e.g. Fast 8 Aphelios)',
    nameLabel: 'Saved comp name',
    save: 'Save',
    saved: 'Comp saved.',
    loaded: (name) => `"${name}" loaded into the builder.`,
    needChampion: 'Add at least one champion before saving.',
    shareCopied: 'Share link copied to clipboard.',
    shareSavedCopied: (name) => `Share link for "${name}" copied.`,
    clipboardFail: 'Could not copy \u2014 clipboard unavailable.',
    invalidLink: 'This share link is invalid.',
    sharedLoaded: 'Shared comp loaded into the builder.',
    load: 'Load',
    copyLink: 'Copy link',
    delete: (name) => `Delete ${name}`,
    summary: (count, level, gold) => `${count} units \u00B7 Lv ${level} \u00B7 ${gold}g`,
    empty:
      'No saved comps yet. Build a board, name it, and hit Save \u2014 or copy a share link to send it to a friend.',
  },
  roll: {
    title: 'Roll Simulator',
    desc: 'Shop odds by level and your chance to hit the target.',
    target: 'Target',
    level: 'Level',
    gold: 'Gold to spend',
    perRoll: 'per refresh (5 slots)',
    withGold: (gold) => `with ${gold}g`,
    expected: 'expected copies per roll',
  },
};

const vi: Dictionary = {
  skipToContent: 'Bỏ qua tới nội dung',
  nav: {
    dashboard: 'Tổng quan',
    meta: 'Meta',
    wiki: 'Wiki',
    builder: 'Đội hình',
    menu: 'Menu',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    currentPatch: 'Phiên bản hiện tại',
    patch: 'Phiên bản',
  },
  theme: { toLight: 'Chuyển sang giao diện sáng', toDark: 'Chuyển sang giao diện tối' },
  locale: { label: 'Ngôn ngữ' },
  common: { retry: 'Thử lại', viewAll: 'Xem tất cả \u2192', noData: 'Chưa có dữ liệu', all: 'Tất cả', traits: 'Hệ tộc', cost: 'Giá', tier: 'Hạng', sortBy: 'Sắp xếp', clear: 'Xóa lọc', close: 'Đóng' },
  home: {
    trending: 'Đội hình thịnh hành',
    explore: 'Khám phá',
    topChampions: 'Tướng hàng đầu',
    builderCtaTitle: 'Sẵn sàng nấu đội hình của riêng bạn?',
    builderCtaDesc: 'Mở bàn cờ tương tác, xếp carry vào đội và chia sẻ thành quả bằng link.',
    builderCtaButton: 'Bắt đầu xây',
    heroSubtitle:
      'Trợ thủ Teamfight Tactics toàn diện. Theo dõi meta, tra cứu tướng và hệ tộc, xây dựng đội hình chiến thắng.',
    rankedMatches: (games) => ` Dựa trên ${games} trận xếp hạng.`,
    exploreMeta: 'Khám phá Meta',
    openBuilder: 'Mở xây dựng đội hình',
    hotBadge: 'Meta hot',
    prevSlide: 'Tiêu điểm trước',
    nextSlide: 'Tiêu điểm tiếp',
    goToSlide: (index) => `Tới tiêu điểm ${index}`,
    quickLinks: [
      {
        title: 'Theo dõi Meta',
        description: 'Bảng xếp hạng, tỉ lệ thắng và thứ hạng đội hình của phiên bản hiện tại.',
        href: '/meta',
      },
      {
        title: 'Wiki tướng',
        description: 'Tra cứu tướng, hệ tộc, trang bị và lõi công nghệ đầy đủ chi tiết.',
        href: '/wiki',
      },
      {
        title: 'Xây dựng đội hình',
        description: 'Lên kế hoạch đội hình với công cụ xây bàn cờ tương tác.',
        href: '/builder',
      },
    ],
  },
  stats: {
    currentPatch: 'Phiên bản hiện tại',
    gamesAnalysed: 'Trận đã phân tích',
    topComp: 'Đội hình top',
    bestChampion: 'Tướng mạnh nhất',
    setUnavailable: 'Chưa có dữ liệu mùa giải',
    compsTracked: (count) => `${count} đội hình được theo dõi`,
    winRate: (rate) => `tỉ lệ thắng ${rate}%`,
    loadError: 'Không tải được chỉ số.',
  },
  comps: {
    winRate: 'Tỉ lệ thắng',
    avgPlace: 'Hạng TB',
    top4: 'Top 4',
    loadError: 'Không tải được đội hình thịnh hành.',
    empty: 'Hiện chưa có đội hình nào.',
  },
  filter: {
    rank: 'Rank:',
    brackets: [
      { value: 'all', label: 'Tất cả' },
      { value: 'diamond_plus', label: 'Kim Cương+' },
      { value: 'master_plus', label: 'Cao Thủ+' },
      { value: 'challenger', label: 'Thách Đấu' },
    ],
    setPatch: (setNumber, patchId) => `Mùa ${setNumber} \u00B7 Bản ${patchId}`,
  },
  meta: {
    title: 'Tổng quan Meta',
    subtitle: (patch) => `Bảng xếp hạng tướng và tỉ lệ thắng của bản ${patch}`,
    setLine: (setNumber, setName, games) =>
      `Mùa ${setNumber} \u2014 ${setName} \u00B7 ${games} trận đã phân tích`,
    loadError: 'Không tải được chỉ số meta.',
    champions: (count) => `${count} tướng`,
    topChampions: 'Tướng nổi bật',
    fullTierList: 'Bảng xếp hạng đầy đủ \u2192',
    empty: 'Chưa có dữ liệu tướng.',
    topComps: 'Đội hình top',
    tryInBuilder: 'Thử trong Builder',
    avgWinRate: 'WR TB',
    units: 'Các tướng',
    details: 'Chi tiết',
    tierListTitle: 'Bảng xếp hạng tướng',
    tierListSubtitle: (patch) => `Tất cả tướng sắp xếp theo hạng trung bình của bản ${patch}`,
    tierListCaption: 'Bảng xếp hạng tướng theo hạng trung bình',
    table: {
      champion: 'Tướng',
      cost: 'Giá',
      tier: 'Hạng',
      winRate: 'Tỉ lệ thắng',
      avgPlace: 'Hạng TB',
      pickRate: 'Tỉ lệ chọn',
      traits: 'Hệ tộc',
    },
  },
  wiki: {
    searchPlaceholder: 'Tìm tướng, hệ tộc, trang bị...',
    searchLabel: 'Tìm trong wiki',
    searchNoResults: 'Không có kết quả \u2014 bấm Enter để xem tướng.',
    inMeta: 'Đang hot trong meta',
    currentSet: 'mùa hiện tại',
    hubTitle: 'TFT Wiki',
    hubSubtitle: (setName) =>
      `${setName} \u2014 Tra cứu đầy đủ tướng, hệ tộc, trang bị và lõi.`,
    entries: (count) => `${count} mục`,
    categories: [
      {
        title: 'Tướng',
        description: 'Xem tất cả tướng kèm chỉ số, kỹ năng và trang bị khuyên dùng.',
        href: '/wiki/champions',
      },
      {
        title: 'Hệ tộc',
        description: 'Khám phá các hệ tộc, mốc kích hoạt và hiệu ứng phối hợp.',
        href: '/wiki/traits',
      },
      {
        title: 'Trang bị',
        description: 'Công thức ghép, chỉ số thành phần và trang bị chuẩn tốt nhất.',
        href: '/wiki/items',
      },
      {
        title: 'Lõi công nghệ',
        description: 'Tất cả lõi theo bậc kèm mô tả hiệu ứng chi tiết.',
        href: '/wiki/augments',
      },
    ],
    championsTitle: 'Tướng',
    championsSubtitle: (count, setName) => `Xem tất cả ${count} tướng trong ${setName}`,
    championsSearch: 'Tìm theo tên hoặc hệ tộc...',
    championsSearchLabel: 'Tìm tướng theo tên hoặc hệ tộc',
    championsError: 'Không tải được danh sách tướng.',
    championsEmpty: 'Không có tướng nào khớp bộ lọc.',
    traitsTitle: 'Hệ tộc',
    traitsSubtitle: (count, setName) => `Xem tất cả ${count} hệ tộc trong ${setName}`,
    traitsSearch: 'Tìm hệ tộc...',
    traitsSearchLabel: 'Tìm hệ tộc',
    traitsError: 'Không tải được danh sách hệ tộc.',
    traitsEmpty: 'Không có hệ tộc nào khớp tìm kiếm.',
    bonusAt: 'Kích hoạt tại',
    noDescription: 'Chưa có mô tả.',
    itemsTitle: 'Trang bị',
    itemsSubtitle: (count, setName) => `Xem tất cả ${count} trang bị trong ${setName}`,
    itemsSearch: 'Tìm trang bị...',
    itemsSearchLabel: 'Tìm trang bị',
    itemsError: 'Không tải được danh sách trang bị.',
    itemsEmpty: 'Không có trang bị nào khớp tìm kiếm.',
    augmentsTitle: 'Lõi công nghệ',
    augmentsSubtitle: (count, setName) => `Xem tất cả ${count} lõi trong ${setName}`,
    augmentsSearch: 'Tìm lõi...',
    augmentsSearchLabel: 'Tìm lõi công nghệ',
    augmentsError: 'Không tải được danh sách lõi.',
    augmentsEmpty: 'Không có lõi nào khớp bộ lọc.',
    tiers: { silver: 'Bạc', gold: 'Vàng', prismatic: 'Lăng kính' },
    detailAbility: 'Kỹ năng',
    detailMana: 'Năng lượng',
    detailBaseStats: 'Chỉ số cơ bản',
    detailFeaturing: (name) => `Đội hình dùng ${name}`,
    detailSimilar: 'Tướng tương tự',
    detailAddToBuilder: 'Thêm vào Builder',
    detailAdded: (name) => `Đã thêm ${name} \u2014 mở Builder để xếp vào bàn.`,
    detailBack: 'Tất cả tướng',
    statHp: 'Máu',
    statArmor: 'Giáp',
    statMr: 'Kháng phép',
    statAd: 'Sát thương',
    statAs: 'Tốc đánh',
    statRange: 'Tầm đánh',
  },
  builder: {
    title: 'Xây dựng đội hình',
    subtitle: 'Lên kế hoạch đội hình và xem hệ tộc kích hoạt.',
    level: 'Cấp',
    decreaseLevel: 'Giảm cấp',
    increaseLevel: 'Tăng cấp',
    gold: 'Vàng',
    decreaseGold: 'Giảm 10 vàng',
    increaseGold: 'Thêm 10 vàng',
    reset: 'Đặt lại',
    confirmReset: 'Bấm lại để xác nhận',
    board: (count, max) => `Bàn (${count}/${max} tối đa)`,
    slot: (index) => `Ô ${index}`,
    bench: 'Hàng chờ',
    activeTraits: 'Hệ tộc kích hoạt',
    traitsEmpty: 'Thêm tướng từ danh sách để xem hệ tộc.',
    removeFromBoard: (name) => `Xóa ${name} khỏi bàn`,
    removeFromBench: (name) => `Xóa ${name} khỏi hàng chờ`,
    poolTitle: 'Danh sách tướng',
    poolSearch: 'Tìm tướng...',
    poolSearchLabel: 'Tìm tướng trong danh sách',
    poolFull: 'Bàn và hàng chờ đã đầy \u2014 xóa bớt tướng để thêm.',
    poolError: 'Không tải được danh sách tướng.',
    poolEmpty: 'Không có tướng nào khớp tìm kiếm.',
    addToBoard: (name) => `Thêm ${name} vào bàn`,
    dndHint: 'Kéo tướng vào bàn \u2014 kéo giữa các ô để sắp xếp, double-click để chuyển qua lại bàn và hàng chờ.',
  },
  saved: {
    title: (count) => `Đội hình đã lưu (${count}/20)`,
    shareCurrent: 'Chia sẻ hiện tại',
    namePlaceholder: 'Tên đội hình (vd: Fast 8 Aphelios)',
    nameLabel: 'Tên đội hình lưu',
    save: 'Lưu',
    saved: 'Đã lưu đội hình.',
    loaded: (name) => `Đã tải "${name}" vào bàn.`,
    needChampion: 'Thêm ít nhất một tướng trước khi lưu.',
    shareCopied: 'Đã sao chép link chia sẻ.',
    shareSavedCopied: (name) => `Đã sao chép link của "${name}".`,
    clipboardFail: 'Không sao chép được \u2014 clipboard không khả dụng.',
    invalidLink: 'Link chia sẻ không hợp lệ.',
    sharedLoaded: 'Đã tải đội hình được chia sẻ.',
    load: 'Tải',
    copyLink: 'Sao chép link',
    delete: (name) => `Xóa ${name}`,
    summary: (count, level, gold) => `${count} tướng \u00B7 Cấp ${level} \u00B7 ${gold}v`,
    empty:
      'Chưa lưu đội hình nào. Xây bàn cờ, đặt tên rồi bấm Lưu \u2014 hoặc sao chép link để gửi bạn bè.',
  },
  roll: {
    title: 'Mô phỏng roll',
    desc: 'Tỉ lệ từng ô shop theo cấp và khả năng ra tướng mục tiêu.',
    target: 'Tướng mục tiêu',
    level: 'Cấp',
    gold: 'Vàng dùng để roll',
    perRoll: 'mỗi lần roll (5 ô)',
    withGold: (gold) => `với ${gold}v`,
    expected: 'bản copy kỳ vọng mỗi roll',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, vi };
