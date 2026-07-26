<script>
  import Tooltip from "../ui/Tooltip.svelte";
  import HintBox from "../ui/HintBox.svelte";
  import { dict } from "../../locales/ru.js";

  let { 
    participants,
    activeFilters = $bindable({}),
    intersectionCount = $bindable(0),
    filterMode = false
  } = $props();

  let headerHeight = $state(0);
  /** @type {Set<number>} */
  let selectedRowIndices = $state(new Set());
  let lastSelectedIndex = $state(-1);

  /** @type {string | null} */
  let hoveredFilter = $state(null);

  // Group helpers
  let groupSizes = $derived(
    participants.reduce(
      /**
       * @param {Record<string, number>} acc
       * @param {any} p
       */
      (acc, p) => {
        if (!p.groupId) return acc;
        acc[p.groupId] = (acc[p.groupId] || 0) + 1;
        return acc;
      },
      /** @type {Record<string, number>} */ ({}),
    ),
  );

  let groupLeaders = $derived(
    participants.reduce(
      /**
       * @param {Record<string, number>} acc
       * @param {any} p
       * @param {number} i
       */
      (acc, p, i) => {
        if (!p.groupId) return acc;
        if (!(p.groupId in acc)) acc[p.groupId] = i;
        return acc;
      },
      /** @type {Record<string, number>} */ ({}),
    ),
  );

  // Helper to render checkmark or empty circle for day
  /**
   * @param {string} actualDay
   * @param {string} targetDay
   */
  function getDayStatus(actualDay, targetDay) {
    return {
      active: actualDay === targetDay,
      icon: actualDay === targetDay ? "check_circle" : "radio_button_unchecked",
    };
  }

  // Helper to render checkmark or empty circle for transport method
  /**
   * @param {string} actualMethod
   * @param {string} targetMethod
   */
  function getMethodStatus(actualMethod, targetMethod) {
    if (
      actualMethod === targetMethod ||
      (targetMethod === "Маршрутка" && actualMethod === "Трансфер")
    ) {
      return { active: true, icon: "check_circle" };
    }
    return { active: false, icon: "radio_button_unchecked" };
  }

  // Interactivity for Headers
  /** @type {Array<{key: string, icon: string, id: 'driver' | 'passenger' | 'bus' | 'self'}>} */
  const transportMethods = [
    { key: "Водитель", icon: "directions_car", id: "driver" },
    { key: "Пассажир", icon: "hail", id: "passenger" },
    { key: "Маршрутка", icon: "directions_bus", id: "bus" },
    { key: "Свой ход", icon: "directions_walk", id: "self" },
  ];

  // activeFilter is derived above

  /**
   * @param {MouseEvent} event
   * @param {number} i
   */
  function handleRowClick(event, i) {
    if (event.shiftKey && lastSelectedIndex !== -1) {
      const newSet = new Set(selectedRowIndices);
      const start = Math.min(lastSelectedIndex, i);
      const end = Math.max(lastSelectedIndex, i);
      for (let j = start; j <= end; j++) {
        newSet.add(j);
      }
      selectedRowIndices = newSet;
    } else if (event.ctrlKey || event.metaKey) {
      const newSet = new Set(selectedRowIndices);
      if (newSet.has(i)) {
        newSet.delete(i);
      } else {
        newSet.add(i);
      }
      selectedRowIndices = newSet;
      lastSelectedIndex = i;
    } else {
      if (selectedRowIndices.has(i) && selectedRowIndices.size === 1) {
        selectedRowIndices = new Set();
        lastSelectedIndex = -1;
      } else {
        selectedRowIndices = new Set([i]);
        lastSelectedIndex = i;
      }
    }
  }

  /** @param {string} key */
  function handleHeaderClick(key) {
    selectedRowIndices = new Set();
    lastSelectedIndex = -1;
    const [group, value] = key.split("_");
    if (activeFilters[group]?.value === value) {
      const newFilters = { ...activeFilters };
      delete newFilters[group];
      activeFilters = newFilters;
    } else {
      activeFilters = {
        ...activeFilters,
        [group]: { value, details: getFilterDetails(key) }
      };
    }
  }



  // Compute counts for methods
  let methodCounts = $derived.by(() => {
    /** @type {{ to: Record<string, number>, from: Record<string, number>, toDay: Record<string, number>, fromDay: Record<string, number>, toSeats: number, toCity: Record<string, number> }} */
    let counts = {
      to: { Водитель: 0, Пассажир: 0, Маршрутка: 0, "Свой ход": 0 },
      from: { Водитель: 0, Пассажир: 0, Маршрутка: 0, "Свой ход": 0 },
      toDay: {},
      fromDay: {},
      toSeats: 0,
      toCity: {},
    };
    for (const p of participants) {
      if (p.transportTo?.method) {
        counts.to[p.transportTo.method] =
          (counts.to[p.transportTo.method] || 0) + 1;
      }
      if (p.transportFrom?.method) {
        counts.from[p.transportFrom.method] =
          (counts.from[p.transportFrom.method] || 0) + 1;
      }
      if (p.transportTo?.day) {
        counts.toDay[p.transportTo.day] =
          (counts.toDay[p.transportTo.day] || 0) + 1;
      }
      if (p.transportFrom?.day) {
        counts.fromDay[p.transportFrom.day] =
          (counts.fromDay[p.transportFrom.day] || 0) + 1;
      }
      if (p.transportTo?.method === "Водитель" && p.transportTo?.seats) {
        counts.toSeats++;
      }
      if (p.transportTo?.city) {
        const cityKey = p.transportTo.city.trim().toLowerCase();
        counts.toCity[cityKey] = (counts.toCity[cityKey] || 0) + 1;
      }
    }
    return counts;
  });

  /**
   * @param {any} p
   */
    function isRowActiveOrHovered(p) {
    if (Object.keys(activeFilters).length === 0 && !hoveredFilter) return false;
    
    if (Object.keys(activeFilters).length > 0) {
      for (const [group, filter] of Object.entries(activeFilters)) {
        if (!isRowHighlighted(p, `${group}_${filter.value}`)) return false;
      }
    }
    
    if (hoveredFilter) {
      if (!isRowHighlighted(p, hoveredFilter)) return false;
    } else if (filterMode) {
      return false;
    }
    
    return true;
  }

  /**
   * @param {any} p
   */
  function isRowHighlightedAll(p) {
    if (Object.keys(activeFilters).length === 0) return false;
    for (const [group, filter] of Object.entries(activeFilters)) {
      if (!isRowHighlighted(p, `${group}_${filter.value}`)) return false;
    }
    return true;
  }

  $effect(() => {
    let count = 0;
    if (Object.keys(activeFilters).length > 0) {
      for (const p of participants) {
        if (isRowHighlightedAll(p)) count++;
      }
    }
    intersectionCount = count;
  });

  /**
   * @param {string | null} filterKey
   * @returns {{ catText: string, catIcon?: string, hideCatText?: boolean, valText: string, valIcon?: string, hideValText?: boolean, sortOrder?: number } | null}
   */
  function getFilterDetails(filterKey) {
    if (!filterKey) return null;
    const [direction, value] = filterKey.split("_");
    
    if (direction === "toCity") return { catText: "ТУДА", hideCatText: true, valText: value.charAt(0).toUpperCase() + value.slice(1), sortOrder: 2 };
    if (direction === "firstName") return { catText: "Имя", hideCatText: true, valText: value.charAt(0).toUpperCase() + value.slice(1), sortOrder: 99 };

    const dirStr = direction.startsWith("to") ? "ТУДА" : "ОБРАТНО";
    
    let typeStr = "Способ";
    let sortOrder = 1;
    if (direction.includes("Day")) { typeStr = "День"; sortOrder = 3; }
    if (direction.includes("Time")) { typeStr = "Время"; sortOrder = 4; }
    
    let displayValue = value;
    /** @type {string | undefined} */
    let valIcon = undefined;
    if (typeStr === "Способ") {
      const match = transportMethods.find(tm => tm.key === value);
      if (match) {
        displayValue = dict.options.transportMethodsTo[match.id];
        valIcon = match.icon;
      }
    } else if (typeStr === "День") {
      /** @type {Record<string, string>} */
      const dayMap = { "Пятница": "ПТ", "Суббота": "СБ", "Воскресенье": "ВС" };
      displayValue = dayMap[value] || value;
    }
    
    return {
      catText: dirStr,
      hideCatText: true,
      valText: displayValue,
      valIcon: valIcon,
      hideValText: typeStr === "Способ",
      sortOrder
    };
  }

  /**
   * @param {any} p
   * @param {string | null} filterKey
   */
  function isRowHighlighted(p, filterKey) {
    if (!filterKey) return false;
    const [dir, val] = filterKey.split("_");

    if (dir === "toCity") return p.transportTo?.city?.trim().toLowerCase() === val;
    if (dir === "firstName") return p.firstName?.trim().toLowerCase() === val;
    if (dir === "toDay") return p.transportTo?.day === val;
    if (dir === "fromDay") return p.transportFrom?.day === val;
    if (dir === "toTime") return p.transportTo?.time === val;
    if (dir === "fromTime") return p.transportFrom?.time === val;
    if (dir === "toSeats")
      return p.transportTo?.method === "Водитель" && !!p.transportTo?.seats;

    const actualMethod =
      dir === "to" ? p.transportTo?.method : p.transportFrom?.method;
    if (val === "Маршрутка" && actualMethod === "Трансфер") return true;
    return actualMethod === val;
  }

  // --- Pinning & Highlighting State ---
  let isNumPinned = $state(true);
  let isNicknamePinned = $state(false);
  let isNamePinned = $state(false);
  
  let widthNum = $state(0);
  let widthNickname = $state(0);
  let widthName = $state(0);

  /** @param {string} filterKey */
  function isFilterActive(filterKey) {
    if (!filterKey) return false;
    const [group, value] = filterKey.split("_");
    return activeFilters[group]?.value === value;
  }

  /** @param {string} filterKey */
  function isFilterHoveredOrActive(filterKey) {
    if (hoveredFilter === filterKey) return true;
    return isFilterActive(filterKey);
  }

  // --- Scroll State for Dynamic Shadows ---
  let isScrolledX = $state(false);
  let isScrolledY = $state(false);

  const lastPinnedCol = $derived(
    isNamePinned ? 'name' : (isNicknamePinned ? 'nickname' : (isNumPinned ? 'num' : null))
  );
</script>


{#snippet filterHeader(/** @type {string} */ filterKey, /** @type {string} */ content, isIcon = false)}
  <th
    class="icon-th interactive-th {isIcon ? '' : 'fw-bold'}"
    class:active-filter={isFilterActive(filterKey)}
    onmouseenter={() => (hoveredFilter = filterKey)}
    onmouseleave={() => (hoveredFilter = null)}
    onclick={() => handleHeaderClick(filterKey)}
  >
    {#if isIcon}
      <Tooltip 
        pos="top" 
        text={getFilterDetails(filterKey)?.valText || ""} 
        caps={false}
      >
        <div class="header-icon-wrapper">
          <md-icon>{content}</md-icon>
        </div>
      </Tooltip>
    {:else}
      {content}
    {/if}
  </th>
{/snippet}

{#snippet statusCell(/** @type {string} */ filterKey, /** @type {{ active: boolean, icon: string }} */ status)}
  <td
    class="text-center"
    class:highlighted-col={isFilterHoveredOrActive(filterKey)}
  >
    <md-icon class="status-icon {status.active ? 'active' : ''}">{status.icon}</md-icon>
  </td>
{/snippet}



<div class="table-wrapper glass-panel">

  <div 
    class="table-container" 
    style="--header-height: {headerHeight}px"
    onscroll={(e) => {
      isScrolledX = e.currentTarget.scrollLeft > 0;
      isScrolledY = e.currentTarget.scrollTop > 0;
    }}
  >
    <table 
      class="participants-table"
      class:is-scrolled-x={isScrolledX}
      class:is-scrolled-y={isScrolledY}
    >
      <thead bind:clientHeight={headerHeight}>
        <!-- ROW 1 -->
        <tr>
          <th 
            rowspan="3" 
            class="sticky-num" 
            class:sticky-col={isNumPinned} 
            class:last-pinned={lastPinnedCol === 'num'} 
            bind:clientWidth={widthNum}
          >
            <div class="th-content-pin">
              №
              <div class="pin-wrapper">
                <Tooltip pos="top" text={isNumPinned ? "Открепить колонку" : "Закрепить колонку"} caps={false}>
                  <button class="pin-btn" class:active={isNumPinned} onclick={() => isNumPinned = !isNumPinned} aria-label="Закрепить колонку №">
                    <md-icon>push_pin</md-icon>
                  </button>
                </Tooltip>
              </div>
            </div>
          </th>
          <th 
            rowspan="3" 
            class="col-name" 
            class:sticky-col={isNicknamePinned}
            class:last-pinned={lastPinnedCol === 'nickname'}
            style:left="{isNicknamePinned ? (isNumPinned ? widthNum : 0) + 'px' : ''}"
            bind:clientWidth={widthNickname}
          >
            <div class="th-content-pin">
              Никнейм
              <div class="pin-wrapper">
                <Tooltip pos="left" text={isNicknamePinned ? "Открепить колонку" : "Закрепить колонку"} caps={false}>
                  <button class="pin-btn" class:active={isNicknamePinned} onclick={() => isNicknamePinned = !isNicknamePinned} aria-label="Закрепить колонку Никнейм">
                    <md-icon>push_pin</md-icon>
                  </button>
                </Tooltip>
              </div>
            </div>
          </th>
          <th 
            rowspan="3" 
            class="col-real-name"
            class:sticky-col={isNamePinned}
            class:last-pinned={lastPinnedCol === 'name'}
            style:left="{isNamePinned ? (isNumPinned ? widthNum : 0) + (isNicknamePinned ? widthNickname : 0) + 'px' : ''}"
            bind:clientWidth={widthName}
          >
            <div class="th-content-pin">
              Имя
              <div class="pin-wrapper">
                <Tooltip pos="left" text={isNamePinned ? "Открепить колонку" : "Закрепить колонку"} caps={false}>
                  <button class="pin-btn" class:active={isNamePinned} onclick={() => isNamePinned = !isNamePinned} aria-label="Закрепить колонку Имя">
                    <md-icon>push_pin</md-icon>
                  </button>
                </Tooltip>
              </div>
            </div>
          </th>
          <th colspan="10" class="group-header">ТУДА</th>
          <th colspan="8" class="group-header">ОБРАТНО</th>
        </tr>

        <!-- ROW 2 -->
        <tr>
          <!-- Туда -->
          <th colspan="4" class="sub-header text-center">Способ</th>
          <th rowspan="2" class="sub-header rotate-th">
            <div class="rotated-text">Места</div>
          </th>
          <th rowspan="2" class="sub-header">Город</th>
          <th colspan="3" class="sub-header text-center">День</th>
          <th rowspan="2" class="sub-header mobile-rotate-th">
            <div class="rotated-text">Время</div>
          </th>

          <!-- Обратно -->
          <th colspan="4" class="sub-header text-center">Способ</th>
          <th colspan="3" class="sub-header text-center">День</th>
          <th rowspan="2" class="sub-header mobile-rotate-th">
            <div class="rotated-text">Время</div>
          </th>
        </tr>

        <!-- ROW 3 -->
        <tr>
          <!-- Туда Способ -->
          {#each transportMethods as tm}
            {@render filterHeader(`to_${tm.key}`, tm.icon, true)}
          {/each}

          <!-- Туда День -->
          {#each [0, 1, 2] as i}
            {@render filterHeader(`toDay_${dict.options.days[i]}`, ["Пт", "Сб", "Вс"][i], false)}
          {/each}

          <!-- Обратно Способ -->
          {#each transportMethods as tm}
            {@render filterHeader(`from_${tm.key}`, tm.icon, true)}
          {/each}

          <!-- Обратно День -->
          {#each [0, 1, 2] as i}
            {@render filterHeader(`fromDay_${dict.options.days[i]}`, ["Пт", "Сб", "Вс"][i], false)}
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each participants as p, i}
          {@const isGroup = groupSizes[p.groupId] > 1}
          {@const isLeader = isGroup && groupLeaders[p.groupId] === i}
          {@const isMember = isGroup && groupLeaders[p.groupId] !== i}
          {@const tToV = getMethodStatus(p.transportTo.method, "Водитель")}
          {@const tToP = getMethodStatus(p.transportTo.method, "Пассажир")}
          {@const tToM = getMethodStatus(p.transportTo.method, "Маршрутка")}
          {@const tToC = getMethodStatus(p.transportTo.method, "Свой ход")}
          {@const tFromV = getMethodStatus(p.transportFrom.method, "Водитель")}
          {@const tFromP = getMethodStatus(p.transportFrom.method, "Пассажир")}
          {@const tFromM = getMethodStatus(p.transportFrom.method, "Маршрутка")}
          {@const tFromC = getMethodStatus(p.transportFrom.method, "Свой ход")}
          {@const dToFri = getDayStatus(
            p.transportTo.day,
            dict.options.days[0],
          )}
          {@const dToSat = getDayStatus(
            p.transportTo.day,
            dict.options.days[1],
          )}
          {@const dToSun = getDayStatus(
            p.transportTo.day,
            dict.options.days[2],
          )}
          {@const dFromFri = getDayStatus(
            p.transportFrom.day,
            dict.options.days[0],
          )}
          {@const dFromSat = getDayStatus(
            p.transportFrom.day,
            dict.options.days[1],
          )}
          {@const dFromSun = getDayStatus(
            p.transportFrom.day,
            dict.options.days[2],
          )}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <tr
            class:hidden-row={filterMode && Object.keys(activeFilters).length > 0 && !isRowHighlightedAll(p)}
            class:selected={selectedRowIndices.has(i)}
            class:highlighted={isRowActiveOrHovered(p)}
            onclick={(e) => handleRowClick(e, i)}
            onmousedown={(e) => e.shiftKey && e.preventDefault()}
          >
            <!-- № -->
            <td 
              class="sticky-num text-center"
              class:sticky-col={isNumPinned}
              class:last-pinned={lastPinnedCol === 'num'}
            >
              <span>{i + 1}</span>
            </td>

            <!-- Никнейм / Команда -->
            <!-- Никнейм -->
            <td 
              class="col-name"
              class:sticky-col={isNicknamePinned}
              class:last-pinned={lastPinnedCol === 'nickname'}
              style:left="{isNicknamePinned ? (isNumPinned ? widthNum : 0) + 'px' : ''}"
            >
              <div class="user-meta">
                <div class="user-details">
                  <div class="name-with-icon">
                    <Tooltip
                      text={p.nickname || ""}
                      onlyIfTruncated={true}
                      caps={false}
                    >
                      <span class="ellipsis-text">{p.nickname || ""}</span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </td>

            <!-- Имя -->
            <td 
              class="col-real-name"
              class:sticky-col={isNamePinned}
              class:last-pinned={lastPinnedCol === 'name'}
              style:left="{isNamePinned ? (isNumPinned ? widthNum : 0) + (isNicknamePinned ? widthNickname : 0) + 'px' : ''}"
            >
              <div class="name-with-icon">
                {#if isMember}
                  <md-icon class="group-icon member">group</md-icon>
                {/if}
                <Tooltip
                  text={p.firstName || ""}
                  onlyIfTruncated={true}
                  caps={false}
                >
                  <span class="ellipsis-text">{p.firstName || ""}</span>
                </Tooltip>
              </div>
            </td>

            <!-- ТУДА: В, П, М, С -->
            {#each transportMethods as tm}
              {@render statusCell(`to_${tm.key}`, getMethodStatus(p.transportTo.method, tm.key))}
            {/each}

            <!-- ТУДА: Места, Город -->
            <td class="text-center">
              {#if p.transportTo.method === "Водитель" && p.transportTo.seats}
                <span class="seats-badge">
                  <md-icon class="status-icon active"
                    >radio_button_unchecked</md-icon
                  >
                  <span class="seats-number">{p.transportTo.seats}</span>
                </span>
              {:else}
                <span class="opacity-30">-</span>
              {/if}
            </td>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <td 
              class="interactive-city-cell" 
              class:highlighted-col={isFilterHoveredOrActive('toCity_' + (p.transportTo?.city?.trim().toLowerCase() || ''))}
              onclick={(e) => { 
                e.stopPropagation(); 
                if (p.transportTo?.city) {
                  const clickedCity = p.transportTo.city.trim().toLowerCase();
                  handleHeaderClick("toCity_" + clickedCity);
                }
              }}
              onmouseenter={() => hoveredFilter = p.transportTo?.city ? `toCity_${p.transportTo.city.trim().toLowerCase()}` : null}
              onmouseleave={() => hoveredFilter = null}
            >
              {#if p.transportTo?.city}
                {p.transportTo.city}
              {:else}
                <span class="opacity-30">-</span>
              {/if}
            </td>

            <!-- ТУДА: День -->
            {#each [0, 1, 2] as i}
              {@render statusCell(`toDay_${dict.options.days[i]}`, getDayStatus(p.transportTo.day, dict.options.days[i]))}
            {/each}

            <!-- ТУДА: Время -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <td 
              class="text-center time-cell interactive-time-cell"
              class:highlighted-col={isFilterHoveredOrActive(`toTime_${p.transportTo?.time}`)}
              onclick={(e) => {
                e.stopPropagation();
                if (p.transportTo?.time) {
                  const key = `toTime_${p.transportTo.time}`;
                  handleHeaderClick(key);
                }
              }}
              onmouseenter={() => hoveredFilter = p.transportTo?.time ? `toTime_${p.transportTo.time}` : null}
              onmouseleave={() => hoveredFilter = null}
            >
              {p.transportTo.time || "-"}
            </td>

            <!-- ОБРАТНО: В, П, М, С -->
            {#each transportMethods as tm}
              {@render statusCell(`from_${tm.key}`, getMethodStatus(p.transportFrom.method, tm.key))}
            {/each}

            <!-- ОБРАТНО: День -->
            {#each [0, 1, 2] as i}
              {@render statusCell(`fromDay_${dict.options.days[i]}`, getDayStatus(p.transportFrom.day, dict.options.days[i]))}
            {/each}

            <!-- ОБРАТНО: Время -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <td 
              class="text-center time-cell interactive-time-cell"
              class:highlighted-col={isFilterHoveredOrActive(`fromTime_${p.transportFrom?.time}`)}
              onclick={(e) => {
                e.stopPropagation();
                if (p.transportFrom?.time) {
                  const key = `fromTime_${p.transportFrom.time}`;
                  handleHeaderClick(key);
                }
              }}
              onmouseenter={() => hoveredFilter = p.transportFrom?.time ? `fromTime_${p.transportFrom.time}` : null}
              onmouseleave={() => hoveredFilter = null}
            >
              {p.transportFrom.time || "-"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-wrapper {
    position: relative;
    flex: 0 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: var(--transition);
  }



  .table-wrapper:hover {
    border-color: var(--glass-border-hover);
    box-shadow:
      0 10px 40px -10px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(139, 92, 246, 0.1);
  }

  .table-container {
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: auto;
  }

  .table-container::-webkit-scrollbar {
    width: var(--scrollbar-width);
    height: var(--scrollbar-width);
    background-color: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 4%,
        var(--bg-color-accent)
      );
  }

  .table-container::-webkit-scrollbar:vertical {
    border-left: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    border-top-right-radius: 12px;
    border-bottom-right-radius: 0;
  }

  .table-container::-webkit-scrollbar:horizontal {
    border-top: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 0;
  }

  .table-container::-webkit-scrollbar-corner {
    background-color: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 4%,
        var(--bg-color-accent)
      );
    border-top: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    border-left: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    border-bottom-right-radius: 12px;
  }

  .table-container::-webkit-scrollbar-track {
    background: transparent;
    margin-top: var(
      --header-height,
      105px
    ); /* Dynamically matches sticky header height */
    margin-left: 40px; /* Width of pinned left column (40) */
  }

  .table-container::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--text-primary) 15%,
      var(--primary-color, var(--primary)) 10%
    );
    border-radius: 4px;
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: color-mix(
      in srgb,
      var(--text-primary) 25%,
      var(--primary-color, var(--primary)) 15%
    );
  }

  thead {
    position: sticky;
    top: -1px;
    z-index: 10;
  }

  /* Drop shadow for the sticky header */
  thead::after {
    content: "";
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 100%;
    height: 12px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, transparent 100%);
    pointer-events: none;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  table.is-scrolled-y thead::after {
    opacity: 1;
  }

  .participants-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* Table Headers */
  th,
  td {
    padding: 0.35rem 0.4rem;
    border-right: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    border-bottom: 1px solid
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    vertical-align: middle;
  }

  /* Fix subpixel gap bleeding in sticky tables */
  thead th {
    font-size: 0.9rem;
    position: relative; /* Prevent absolute positioned children (like pins) from escaping when not sticky */
    background: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      linear-gradient(
        color-mix(in srgb, var(--primary-color, var(--primary)) 4%, var(--bg-color-accent)),
        color-mix(in srgb, var(--primary-color, var(--primary)) 4%, var(--bg-color-accent))
      ),
      var(--bg-color);
    box-shadow: 0 1px 0 0
      color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
    cursor: default;
    user-select: none;
  }

  /* Remove right border from last column to prevent double border with container.
     Note: Row 3's last child is NOT the last column of the table, so we exclude it. */
  tbody td:last-child,
  thead tr:not(:nth-child(3)) th:last-child {
    border-right: none;
  }

  /* Remove bottom border from last row to prevent double border with container */
  tbody tr:last-child td {
    border-bottom: none;
  }

  /* Zebra striping for rows */
  tbody tr:nth-child(even) td:not(.sticky-col) {
    background-image: linear-gradient(
      color-mix(in srgb, var(--text-primary) 3%, transparent),
      color-mix(in srgb, var(--text-primary) 3%, transparent)
    );
  }

  tbody tr:nth-child(even) td.sticky-col {
    background-color: color-mix(in srgb, var(--primary-color, var(--primary)) 4%, var(--bg-color-accent));
    background-image: linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06));
  }

  /* Sticky Left Columns */
  .sticky-col {
    position: sticky;
    transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, background-color 0.2s;
  }
  
  /* Decreasing z-index from left to right prevents subpixel border overlap bugs in Chromium */
  .sticky-num.sticky-col { z-index: 7; }
  .col-name.sticky-col { z-index: 6; }
  .col-real-name.sticky-col { z-index: 5; }

  td.sticky-col {
    background-color: color-mix(in srgb, var(--primary-color, var(--primary)) 4%, var(--bg-color-accent));
    background-image: linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04));
  }

  /* Elevate hovered sticky columns so their tooltips don't get clipped by adjacent sticky columns with higher z-index */
  thead th.sticky-num.sticky-col:hover,
  thead th.col-name.sticky-col:hover,
  thead th.col-real-name.sticky-col:hover,
  tbody td.sticky-num.sticky-col:hover,
  tbody td.col-name.sticky-col:hover,
  tbody td.col-real-name.sticky-col:hover {
    z-index: 30 !important;
  }

  .sticky-num {
    left: 0;
    width: 40px;
    min-width: 40px;
    max-width: 40px;
    box-sizing: border-box;
    z-index: 5;
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.9rem;
  }

  .col-name {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    box-sizing: border-box;
  }

  .col-real-name {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    box-sizing: border-box;
  }

  /* Header sticky corner intersections */
  thead th.sticky-num.sticky-col { z-index: 22; }
  thead th.col-name.sticky-col { z-index: 21; }
  thead th.col-real-name.sticky-col { z-index: 20; }

  /* Drop shadow for the last pinned column */
  .last-pinned::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;
    width: 10px;
    height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.15) 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  table.is-scrolled-x .last-pinned::after {
    opacity: 1;
  }

  /* Pin Toggle UI */
  .th-content-pin {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .pin-wrapper {
    position: absolute;
    bottom: 0.35rem; /* Match the th padding to sit on the bottom axis */
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .pin-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    opacity: 0.3;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .pin-btn:hover {
    opacity: 0.8;
    background: color-mix(in srgb, var(--text-primary) 10%, transparent);
  }
  .pin-btn.active {
    opacity: 1;
    color: var(--primary-color, var(--primary));
  }
  .pin-btn md-icon {
    font-size: 1.1rem;
    --md-icon-size: 1.1rem;
  }

  /* Interactive City Cell */
  .interactive-city-cell {
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
  }

  /* Mobile: Specific layout overrides */
  @media (max-width: 600px) {
    .table-wrapper {
      border-color: var(--glass-border-hover);
      box-shadow:
        0 10px 40px -10px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(139, 92, 246, 0.1);
    }

    .table-container::-webkit-scrollbar-track {
      margin-left: 40px; /* Only first column is pinned on mobile */
    }

    th,
    td {
      padding: 0.25rem 0.2rem;
    }

    .interactive-th :global(.tooltip-wrapper) {
      padding: 0.25rem 0.2rem;
    }

    .mobile-rotate-th .rotated-text {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      margin: 0 auto;
      white-space: nowrap;
    }

    .mobile-rotate-th {
      text-align: center;
      padding: 0.15rem 0.2rem;
    }

    .col-name,
    .col-real-name {
      width: 100px;
      min-width: 100px;
      max-width: 100px;
    }
  }

  /* Table Body */
  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  th {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.02em;
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 8%,
      var(--bg-color)
    );
    color: var(--text-primary);
  }

  .group-header {
    text-align: center;
    padding: 0.35rem;
  }

  .sub-header {
    color: color-mix(in srgb, var(--text-primary) 90%, transparent);
  }

  .icon-th {
    text-align: center;
    padding: 0.15rem 0.2rem;
    width: 32px;
    min-width: 32px;
    max-width: 32px;
    box-sizing: border-box;
  }

  .icon-th md-icon {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  /* Rotate header for compact places */
  .rotate-th {
    text-align: center;
    padding: 0.15rem 0.2rem;
    width: 32px;
    min-width: 32px;
    max-width: 32px;
    box-sizing: border-box;
  }

  .interactive-th {
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
    /* Preserve standard bottom border */
    box-shadow: 0 1px 0 0 color-mix(in srgb, var(--text-primary) 15%, var(--bg-color));
  }

  .header-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0.15rem 0.2rem;
    box-sizing: border-box;
  }

  .interactive-th.active-filter {
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      linear-gradient(
        color-mix(in srgb, var(--primary-color, var(--primary)) 45%, var(--bg-color)),
        color-mix(in srgb, var(--primary-color, var(--primary)) 45%, var(--bg-color))
      ),
      var(--bg-color);
    box-shadow: 
      0 1px 0 0 color-mix(in srgb, var(--text-primary) 15%, var(--bg-color)),
      inset 0 -2px 0 0 var(--primary-color, var(--primary));
  }

  @media (hover: hover) {
    .interactive-th:hover {
      background:
        linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
        linear-gradient(
          color-mix(in srgb, var(--primary-color, var(--primary)) 20%, var(--bg-color)),
          color-mix(in srgb, var(--primary-color, var(--primary)) 20%, var(--bg-color))
        ),
        var(--bg-color);
      box-shadow: 
        0 1px 0 0 color-mix(in srgb, var(--text-primary) 15%, var(--bg-color)),
        inset 0 -2px 0 0 var(--primary-color, var(--primary));
    }

    tbody tr:hover {
      background: color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 12%,
        transparent
      );
    }

    /* Fix row hover effect hiding under sticky columns */
    tbody tr:hover td.sticky-col {
      background-color: color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 12%,
        var(--bg-color-accent)
      );
    }
    tbody tr:nth-child(even):hover td.sticky-col {
      background-color: color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 12%,
        var(--bg-color-accent)
      );
    }
  }

  .interactive-th :global(.tooltip-wrapper) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.4rem;
  }

  .rotate-th .rotated-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    margin: 0 auto;
    white-space: nowrap;
  }

  :global(.table-container) {
    -webkit-tap-highlight-color: transparent;
  }

  /* Highlighted Row (All devices) */
  tbody tr.highlighted {
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      transparent
    ) !important;
  }

  tbody tr.highlighted td.sticky-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color-accent)
    ) !important;
  }
  tbody tr:nth-child(even).highlighted td.sticky-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color-accent)
    ) !important;
  }

  /* Highlighted Column */
  td.highlighted-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 12%,
      transparent
    ) !important;
  }


  /* Crosshair Intersection */
  tbody tr.highlighted td.highlighted-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 25%,
      transparent
    ) !important;
  }


  /* Selected Row (All devices) */
  tbody tr.selected {
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      transparent
    ) !important;
  }

  tbody tr.selected td.sticky-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color-accent)
    ) !important;
  }
  tbody tr:nth-child(even).selected td.sticky-col {
    background-color: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color-accent)
    ) !important;
  }

  .text-center {
    text-align: center;
  }

  /* Icons */
  .status-icon {
    font-size: 1.35rem;
    color: var(--text-secondary);
    opacity: 0.3;
    transition: all 0.2s;
    vertical-align: middle;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .status-icon.active {
    color: var(--primary-color, var(--primary));
    opacity: 1;
  }

  /* Typography */
  .opacity-30 {
    opacity: 0.3;
  }
  .fw-bold {
    font-weight: 700;
  }

  /* User Info */
  .user-meta {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    min-width: 0;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .name-with-icon {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  :global(.name-with-icon > .tooltip-wrapper) {
    min-width: 0;
    flex: 1;
  }

  .ellipsis-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .group-icon {
    font-size: 1rem;
  }

  .group-icon.member {
    color: var(--primary-color, var(--primary));
    opacity: 0.8;
  }

  /* Badges */
  .seats-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: middle;
  }

  .seats-number {
    position: absolute;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--primary-color, var(--primary));
  }

  .time-cell {
    font-family: var(--font-family);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .interactive-city-cell,
  .interactive-time-cell {
    cursor: pointer;
    transition: all 0.2s;
  }

  .header-icon-wrapper {
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
  }
  .header-icon-wrapper md-icon {
    font-size: 1.1rem;
    --md-icon-size: 1.1rem;
    color: inherit;
  }
  
  .hidden-row {
    display: none !important;
  }
</style>
