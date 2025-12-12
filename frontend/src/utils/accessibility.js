/**
 * Utility funkce pro zlepšení přístupnosti (accessibility)
 */

/**
 * Vrátí ARIA label pro různé typy akcí
 */
export const getAriaLabel = (action, context = '') => {
  const labels = {
    'login': 'Přihlášení do systému',
    'register': 'Registrace nového uživatele',
    'logout': 'Odhlášení ze systému',
    'menu-toggle': 'Přepnutí navigačního menu',
    'close': 'Zavřít',
    'search': 'Vyhledávání',
    'notification': 'Notifikace',
    'profile': 'Uživatelský profil',
    'settings': 'Nastavení',
    'help': 'Nápověda',
    'back': 'Zpět',
    'next': 'Další',
    'submit': 'Odeslat',
    'cancel': 'Zrušit',
    'delete': 'Smazat',
    'edit': 'Upravit',
    'save': 'Uložit',
    'add': 'Přidat',
    'remove': 'Odebrat',
    'expand': 'Rozbalit',
    'collapse': 'Sbalit',
    'play': 'Přehrát',
    'pause': 'Pozastavit',
    'stop': 'Zastavit',
    'download': 'Stáhnout',
    'upload': 'Nahrát',
    'like': 'Líbí se mi',
    'dislike': 'Nelíbí se mi',
    'share': 'Sdílet',
    'comment': 'Komentovat',
    'follow': 'Sledovat',
    'unfollow': 'Přestat sledovat',
    'bookmark': 'Přidat do záložek',
    'unbookmark': 'Odebrat ze záložek',
    'filter': 'Filtrovat',
    'sort': 'Seřadit',
    'refresh': 'Obnovit',
    'print': 'Tisknout',
    'copy': 'Kopírovat',
    'paste': 'Vložit',
    'cut': 'Vyjmout',
    'select': 'Vybrat',
    'deselect': 'Zrušit výběr',
    'zoom-in': 'Přiblížit',
    'zoom-out': 'Oddálit',
    'fullscreen': 'Celá obrazovka',
    'exit-fullscreen': 'Opustit celou obrazovku',
    'mute': 'Ztlumit',
    'unmute': 'Zrušit ztlumení',
    'volume-up': 'Zvýšit hlasitost',
    'volume-down': 'Snížit hlasitost',
    'captions': 'Titulky',
    'subtitles': 'Podtitulky',
    'language': 'Jazyk',
    'theme': 'Téma',
    'dark-mode': 'Tmavý režim',
    'light-mode': 'Světlý režim',
    'contrast': 'Kontrast',
    'font-size': 'Velikost písma',
    'line-height': 'Výška řádku',
    'letter-spacing': 'Mezery mezi písmeny',
    'word-spacing': 'Mezery mezi slovy',
    'text-align': 'Zarovnání textu',
    'text-transform': 'Transformace textu',
    'text-decoration': 'Dekorace textu',
    'text-color': 'Barva textu',
    'background-color': 'Barva pozadí',
    'border-color': 'Barva ohraničení',
    'border-width': 'Šířka ohraničení',
    'border-style': 'Styl ohraničení',
    'border-radius': 'Zaoblení ohraničení',
    'padding': 'Odsazení',
    'margin': 'Okraj',
    'width': 'Šířka',
    'height': 'Výška',
    'min-width': 'Minimální šířka',
    'min-height': 'Minimální výška',
    'max-width': 'Maximální šířka',
    'max-height': 'Maximální výška',
    'position': 'Pozice',
    'top': 'Nahoře',
    'right': 'Vpravo',
    'bottom': 'Dole',
    'left': 'Vlevo',
    'z-index': 'Z-index',
    'opacity': 'Průhlednost',
    'visibility': 'Viditelnost',
    'display': 'Zobrazení',
    'flex': 'Flex',
    'grid': 'Grid',
    'inline': 'Inline',
    'block': 'Block',
    'inline-block': 'Inline-block',
    'none': 'Žádný',
    'hidden': 'Skrytý',
    'visible': 'Viditelný',
    'scroll': 'Posouvání',
    'auto': 'Automaticky',
    'inherit': 'Zdědit',
    'initial': 'Počáteční',
    'unset': 'Nenastaveno',
    'revert': 'Vrátit',
    'revert-layer': 'Vrátit vrstvu',
    'important': 'Důležité',
  };

  const baseLabel = labels[action] || action;
  return context ? `${baseLabel} ${context}` : baseLabel;
};

/**
 * Vytvoří ARIA atributy pro tlačítko
 */
export const getButtonAriaProps = (props = {}) => {
  const {
    label,
    pressed = false,
    expanded = false,
    hasPopup = false,
    controls = null,
    describedBy = null,
    disabled = false,
    liveRegion = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('button'),
    'role': 'button',
    'tabIndex': disabled ? -1 : 0
  };

  if (pressed !== false) {
    ariaProps['aria-pressed'] = pressed;
  }

  if (expanded !== false) {
    ariaProps['aria-expanded'] = expanded;
  }

  if (hasPopup) {
    ariaProps['aria-haspopup'] = hasPopup;
  }

  if (controls) {
    ariaProps['aria-controls'] = controls;
  }

  if (describedBy) {
    ariaProps['aria-describedby'] = describedBy;
  }

  if (disabled) {
    ariaProps['aria-disabled'] = true;
  }

  if (liveRegion) {
    ariaProps['aria-live'] = liveRegion;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro formulářové pole
 */
export const getInputAriaProps = (props = {}) => {
  const {
    label,
    required = false,
    invalid = false,
    describedBy = null,
    errorMessage = null,
    placeholder = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('input'),
    'role': 'textbox'
  };

  if (required) {
    ariaProps['aria-required'] = true;
  }

  if (invalid) {
    ariaProps['aria-invalid'] = true;
  }

  if (describedBy) {
    ariaProps['aria-describedby'] = describedBy;
  }

  if (errorMessage) {
    ariaProps['aria-errormessage'] = errorMessage;
  }

  if (placeholder) {
    ariaProps['aria-placeholder'] = placeholder;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro navigaci
 */
export const getNavAriaProps = (props = {}) => {
  const {
    label,
    current = null,
    orientation = 'horizontal'
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('navigation'),
    'role': 'navigation'
  };

  if (current) {
    ariaProps['aria-current'] = current;
  }

  if (orientation) {
    ariaProps['aria-orientation'] = orientation;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro seznam
 */
export const getListAriaProps = (props = {}) => {
  const {
    label,
    role = 'list',
    itemCount = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('list'),
    'role': role
  };

  if (itemCount !== null) {
    ariaProps['aria-setsize'] = itemCount;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro položku seznamu
 */
export const getListItemAriaProps = (props = {}) => {
  const {
    index,
    total,
    selected = false,
    checked = false,
    expanded = false,
    level = null
  } = props;

  const ariaProps = {
    'role': 'listitem'
  };

  if (index !== undefined && total !== undefined) {
    ariaProps['aria-posinset'] = index + 1;
    ariaProps['aria-setsize'] = total;
  }

  if (selected !== false) {
    ariaProps['aria-selected'] = selected;
  }

  if (checked !== false) {
    ariaProps['aria-checked'] = checked;
  }

  if (expanded !== false) {
    ariaProps['aria-expanded'] = expanded;
  }

  if (level !== null) {
    ariaProps['aria-level'] = level;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro dialog/modal
 */
export const getDialogAriaProps = (props = {}) => {
  const {
    label,
    modal = true,
    describedBy = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('dialog'),
    'role': 'dialog',
    'aria-modal': modal
  };

  if (describedBy) {
    ariaProps['aria-describedby'] = describedBy;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro tabulku
 */
export const getTableAriaProps = (props = {}) => {
  const {
    label,
    rowCount = null,
    columnCount = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('table'),
    'role': 'table'
  };

  if (rowCount !== null) {
    ariaProps['aria-rowcount'] = rowCount;
  }

  if (columnCount !== null) {
    ariaProps['aria-colcount'] = columnCount;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro řádek tabulky
 */
export const getTableRowAriaProps = (props = {}) => {
  const {
    index,
    total,
    selected = false
  } = props;

  const ariaProps = {
    'role': 'row'
  };

  if (index !== undefined && total !== undefined) {
    ariaProps['aria-rowindex'] = index + 1;
  }

  if (selected !== false) {
    ariaProps['aria-selected'] = selected;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro buňku tabulky
 */
export const getTableCellAriaProps = (props = {}) => {
  const {
    header = false,
    rowIndex = null,
    columnIndex = null,
    rowSpan = null,
    colSpan = null
  } = props;

  const ariaProps = {
    'role': header ? 'columnheader' : 'cell'
  };

  if (rowIndex !== null) {
    ariaProps['aria-rowindex'] = rowIndex;
  }

  if (columnIndex !== null) {
    ariaProps['aria-colindex'] = columnIndex;
  }

  if (rowSpan !== null) {
    ariaProps['aria-rowspan'] = rowSpan;
  }

  if (colSpan !== null) {
    ariaProps['aria-colspan'] = colSpan;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro progress bar
 */
export const getProgressAriaProps = (props = {}) => {
  const {
    label,
    value,
    min = 0,
    max = 100,
    valueText = null
  } = props;

  const ariaProps = {
    'aria-label': label || getAriaLabel('progress'),
    'role': 'progressbar',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value
  };

  if (valueText) {
    ariaProps['aria-valuetext'] = valueText;
  }

  return ariaProps;
};

/**
 * Vytvoří ARIA atributy pro status message
 */
export const getStatusAriaProps = (props = {}) => {
  const {
    live = 'polite',
    atomic = true
  } = props;

  return {
    'role': 'status',
    'aria-live': live,
    'aria-atomic': atomic
  };
};

/**
 * Vytvoří ARIA atributy pro alert message
 */
export const getAlertAriaProps = (props = {}) => {
  const {
    live = 'assertive',
    atomic = true
  } = props;

  return {
    'role': 'alert',
    'aria-live': live,
    'aria-atomic': atomic
  };
};

/**
 * Vytvoří skip link pro přeskok na hlavní obsah
 */
export const renderSkipLink = (targetId = 'main-content', label = 'Přeskočit na hlavní obsah') => {
  return `
    <a href="#${targetId}" class="skip-link">
      ${label}
    </a>
  `;
};

/**
 * Vytvoří ARIA atributy pro landmark regions
 */
export const getLandmarkAriaProps = (type, label) => {
  const roles = {
    'banner': 'banner',
    'main': 'main',
    'contentinfo': 'contentinfo',
    'navigation': 'navigation',
    'complementary': 'complementary',
    'search': 'search',
    'form': 'form',
    'region': 'region'
  };

  const role = roles[type] || 'region';
  
  return {
    'role': role,
    'aria-label': label || getAriaLabel(type)
  };
};

export default {
  getAriaLabel,
  getButtonAriaProps,
  getInputAriaProps,
  getNavAriaProps,
  getListAriaProps,
  getListItemAriaProps,
  getDialogAriaProps,
  getTableAriaProps,
  getTableRowAriaProps,
  getTableCellAriaProps,
  getProgressAriaProps,
  getStatusAriaProps,
  getAlertAriaProps,
  renderSkipLink,
  getLandmarkAriaProps
};
