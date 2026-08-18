<script>
  import { getContext } from "svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import Popover from "$shared/components/ui/Popover.svelte";
  import { dict } from "$shared/locales/ru.js";
  import { transportMethods } from "$apps/applications/gridStore.svelte.js";

  let {
    participants = [],
    headerHeight = $bindable(0),
  } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");

  // Popover open states
  let isCityOpen = $state(false);
  let isToTimeOpen = $state(false);
  let isFromTimeOpen = $state(false);

  // References for Popovers
  /** @type {HTMLElement | null} */
  let cityThRef = $state(null);
  /** @type {HTMLElement | null} */
  let toTimeThRef = $state(null);
  /** @type {HTMLElement | null} */
  let fromTimeThRef = $state(null);

  // Search inside City popover
  let citySearchText = $state("");

  // Unique cities & times
  let uniqueCities = $derived.by(() => gridState.getUniqueCities(participants));
  let filteredCities = $derived.by(() => {
    if (!citySearchText.trim()) return uniqueCities;
    const q = citySearchText.trim().toLowerCase();
    return uniqueCities.filter((c) => c.city.toLowerCase().includes(q));
  });

  let uniqueTimes = $derived.by(() => gridState.getUniqueTimes(participants));

  let isCityActive = $derived.by(() => !!gridState.activeFilters["toCity"]);
  let isToTimeActive = $derived.by(() => !!gridState.activeFilters["toTime"]);
  let isFromTimeActive = $derived.by(
    () => !!gridState.activeFilters["fromTime"],
  );
</script>

{#snippet filterHeader(
  /** @type {string} */ groupKey,
  /** @type {string} */ valKey,
  /** @type {string} */ content,
  isIcon = false,
)}
  {@const isActive = gridState.isGroupValueActive(groupKey, valKey)}
  <th
    class="icon-th is-clickable {isIcon ? '' : 'fw-bold'}"
    class:is-active={isActive}
    onclick={() => gridState.toggleFilter(groupKey, valKey)}
  >
    {#if isIcon}
      <Tooltip
        pos="top"
        text={gridState.getFilterDetails(`${groupKey}_${valKey}`)?.tooltip || gridState.getFilterDetails(`${groupKey}_${valKey}`)?.valText || ""}
      >
        <div class="header-icon-wrapper">
          <md-icon>{content}</md-icon>
        </div>
      </Tooltip>
    {:else}
      <Tooltip
        pos="top"
        text={gridState.getFilterDetails(`${groupKey}_${valKey}`)?.tooltip || valKey}
      >
        <div class="header-text-wrapper">
          <span>{content}</span>
        </div>
      </Tooltip>
    {/if}
  </th>
{/snippet}

<thead bind:clientHeight={headerHeight}>
  <!-- ROW 1: Super-Headers (Base Line 1) -->
  <tr class="header-row-1">
    <th
      rowspan="3"
      class="sticky-num"
      class:sticky-col={gridState.isNumPinned}
      class:last-pinned={gridState.lastPinnedCol === "num"}
      bind:clientWidth={gridState.widthNum}
    >
      <div class="th-pinned-container">
        <div class="th-title-row">№</div>
        <div class="pin-wrapper">
          <Tooltip
            pos="top"
            text={gridState.isNumPinned
              ? "Открепить колонку"
              : "Закрепить колонку"}
          >
            <button
              class="pin-btn"
              class:active={gridState.isNumPinned}
              onclick={() => (gridState.isNumPinned = !gridState.isNumPinned)}
              aria-label="Закрепить колонку №"
            >
              <md-icon>push_pin</md-icon>
            </button>
          </Tooltip>
        </div>
      </div>
    </th>
    <th
      rowspan="3"
      class="col-name"
      class:sticky-col={gridState.isNicknamePinned}
      class:last-pinned={gridState.lastPinnedCol === "nickname"}
      style:left={gridState.isNicknamePinned
        ? (gridState.isNumPinned ? gridState.widthNum : 0) + "px"
        : ""}
      bind:clientWidth={gridState.widthNickname}
    >
      <div class="th-pinned-container">
        <div class="th-title-row">Никнейм</div>
        <div class="pin-wrapper">
          <Tooltip
            pos="left"
            text={gridState.isNicknamePinned
              ? "Открепить колонку"
              : "Закрепить колонку"}
          >
            <button
              class="pin-btn"
              class:active={gridState.isNicknamePinned}
              onclick={() =>
                (gridState.isNicknamePinned = !gridState.isNicknamePinned)}
              aria-label="Закрепить колонку Никнейм"
            >
              <md-icon>push_pin</md-icon>
            </button>
          </Tooltip>
        </div>
      </div>
    </th>
    <th
      rowspan="3"
      class="col-real-name"
      class:sticky-col={gridState.isNamePinned}
      class:last-pinned={gridState.lastPinnedCol === "name"}
      style:left={gridState.isNamePinned
        ? (gridState.isNumPinned ? gridState.widthNum : 0) +
          (gridState.isNicknamePinned ? gridState.widthNickname : 0) +
          "px"
        : ""}
      bind:clientWidth={gridState.widthName}
    >
      <div class="th-pinned-container">
        <div class="th-title-row">Имя</div>
        <div class="pin-wrapper">
          <Tooltip
            pos="left"
            text={gridState.isNamePinned
              ? "Открепить колонку"
              : "Закрепить колонку"}
          >
            <button
              class="pin-btn"
              class:active={gridState.isNamePinned}
              onclick={() => (gridState.isNamePinned = !gridState.isNamePinned)}
              aria-label="Закрепить колонку Имя"
            >
              <md-icon>push_pin</md-icon>
            </button>
          </Tooltip>
        </div>
      </div>
    </th>
    <th colspan="10" class="group-header">
      <div class="group-header-text">ТУДА</div>
    </th>
    <th colspan="8" class="group-header">
      <div class="group-header-text">ОБРАТНО</div>
    </th>
  </tr>

  <!-- ROW 2: Sub-Headers (Base Line 2) -->
  <tr class="header-row-2">
    <!-- ТУДА -->
    <th colspan="4" class="sub-header text-center">
      <div class="sub-header-text">Способ</div>
    </th>
    
    <!-- ТУДА: Места -->
    <th
      rowspan="2"
      class="sub-header rotate-th is-clickable"
      class:is-active={gridState.isFilterActive("toSeats_true")}
      onclick={() => gridState.toggleSeatsFilter()}
    >
      <Tooltip pos="top" text="Только со свободными местами">
        <div class="rotated-text">Места</div>
      </Tooltip>
    </th>

    <!-- ТУДА: Город (Base Line 2 текст + Base Line 3 иконка) -->
    <th
      rowspan="2"
      class="sub-header city-th is-clickable"
      class:is-active={isCityActive}
      bind:this={cityThRef}
      onclick={() => {
        isCityOpen = !isCityOpen;
        isToTimeOpen = false;
        isFromTimeOpen = false;
      }}
    >
      <Tooltip pos="top" text="Выбрать город выезда (ТУДА)">
        <div class="header-2line-cell">
          <div class="header-2line-title">Город</div>
          <div class="header-2line-action">
            <md-icon class="header-2line-icon">location_city</md-icon>
          </div>
        </div>
      </Tooltip>

      <Popover
        isOpen={isCityOpen}
        referenceNode={cityThRef}
        pos="bottom-start"
        backdrop={true}
        onclose={() => {
          isCityOpen = false;
          citySearchText = "";
        }}
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="popover-panel city-panel" onclick={(e) => e.stopPropagation()}>
          <div class="popover-header">
            <span class="popover-title">Город выезда (ТУДА)</span>
          </div>

          <div class="city-search-box">
            <md-icon class="city-search-icon">search</md-icon>
            <input
              type="text"
              class="city-search-input"
              placeholder="Поиск города..."
              bind:value={citySearchText}
            />
            {#if citySearchText}
              <button
                class="clear-city-search"
                onclick={() => (citySearchText = "")}
              >
                <md-icon>close</md-icon>
              </button>
            {/if}
          </div>

          <div class="city-list">
            {#if filteredCities.length === 0}
              <div class="no-cities">Городов не найдено</div>
            {:else}
              {#each filteredCities as item}
                <button
                  class="city-item"
                  class:active={gridState.isGroupValueActive(
                    "toCity",
                    item.key,
                  )}
                  class:is-disabled={item.count === 0 && !gridState.isGroupValueActive("toCity", item.key)}
                  disabled={item.count === 0 && !gridState.isGroupValueActive("toCity", item.key)}
                  onclick={() => gridState.toggleFilter("toCity", item.key)}
                >
                  <span class="city-name">{item.city}</span>
                  <span class="city-count">{item.count}</span>
                  {#if gridState.isGroupValueActive("toCity", item.key)}
                    <md-icon class="city-check">check</md-icon>
                  {/if}
                </button>
              {/each}
            {/if}
          </div>
        </div>
      </Popover>
    </th>

    <th colspan="3" class="sub-header text-center">
      <div class="sub-header-text">День</div>
    </th>
    
    <!-- ТУДА: Время (Base Line 2 текст + Base Line 3 иконка) -->
    <th
      rowspan="2"
      class="sub-header time-th is-clickable"
      class:is-active={isToTimeActive}
      bind:this={toTimeThRef}
      onclick={() => {
        isToTimeOpen = !isToTimeOpen;
        isCityOpen = false;
        isFromTimeOpen = false;
      }}
    >
      <Tooltip pos="top" text="Выбрать время выезда (ТУДА)">
        <div class="header-2line-cell">
          <div class="header-2line-title">Время</div>
          <div class="header-2line-action">
            <md-icon class="header-2line-icon">schedule</md-icon>
          </div>
        </div>
      </Tooltip>

      <Popover
        isOpen={isToTimeOpen}
        referenceNode={toTimeThRef}
        pos="bottom-end"
        backdrop={true}
        onclose={() => (isToTimeOpen = false)}
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="popover-panel time-panel" onclick={(e) => e.stopPropagation()}>
          <div class="popover-header">
            <span class="popover-title">Время выезда (ТУДА)</span>
          </div>
          {#if uniqueTimes.toTimes.length === 0}
            <div class="no-cities">Нет данных</div>
          {:else}
            <div class="time-grid">
              {#each uniqueTimes.toTimes as item}
                <button
                  class="option-chip time-chip"
                  class:active={gridState.isGroupValueActive(
                    "toTime",
                    item.time,
                  )}
                  class:is-disabled={item.count === 0 && !gridState.isGroupValueActive("toTime", item.time)}
                  disabled={item.count === 0 && !gridState.isGroupValueActive("toTime", item.time)}
                  onclick={() => gridState.toggleFilter("toTime", item.time)}
                >
                  <span class="time-val">{item.time}</span>
                  <span class="time-count">({item.count})</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </Popover>
    </th>

    <!-- ОБРАТНО -->
    <th colspan="4" class="sub-header text-center">
      <div class="sub-header-text">Способ</div>
    </th>
    <th colspan="3" class="sub-header text-center">
      <div class="sub-header-text">День</div>
    </th>
    
    <!-- ОБРАТНО: Время (Base Line 2 текст + Base Line 3 иконка) -->
    <th
      rowspan="2"
      class="sub-header time-th is-clickable"
      class:is-active={isFromTimeActive}
      bind:this={fromTimeThRef}
      onclick={() => {
        isFromTimeOpen = !isFromTimeOpen;
        isCityOpen = false;
        isToTimeOpen = false;
      }}
    >
      <Tooltip pos="top" text="Выбрать время выезда (ОБРАТНО)">
        <div class="header-2line-cell">
          <div class="header-2line-title">Время</div>
          <div class="header-2line-action">
            <md-icon class="header-2line-icon">schedule</md-icon>
          </div>
        </div>
      </Tooltip>

      <Popover
        isOpen={isFromTimeOpen}
        referenceNode={fromTimeThRef}
        pos="bottom-end"
        backdrop={true}
        onclose={() => (isFromTimeOpen = false)}
      >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="popover-panel time-panel" onclick={(e) => e.stopPropagation()}>
          <div class="popover-header">
            <span class="popover-title">Время выезда (ОБРАТНО)</span>
          </div>
          {#if uniqueTimes.fromTimes.length === 0}
            <div class="no-cities">Нет данных</div>
          {:else}
            <div class="time-grid">
              {#each uniqueTimes.fromTimes as item}
                <button
                  class="option-chip time-chip"
                  class:active={gridState.isGroupValueActive(
                    "fromTime",
                    item.time,
                  )}
                  class:is-disabled={item.count === 0 && !gridState.isGroupValueActive("fromTime", item.time)}
                  disabled={item.count === 0 && !gridState.isGroupValueActive("fromTime", item.time)}
                  onclick={() => gridState.toggleFilter("fromTime", item.time)}
                >
                  <span class="time-val">{item.time}</span>
                  <span class="time-count">({item.count})</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </Popover>
    </th>
  </tr>

  <!-- ROW 3: Controls / Icons / Days (Base Line 3) -->
  <tr class="header-row-3">
    <!-- Туда Способ -->
    {#each transportMethods as tm}
      {@render filterHeader("to", tm.key, tm.icon, true)}
    {/each}

    <!-- Туда День -->
    {#each [0, 1, 2] as i}
      {@render filterHeader(
        "toDay",
        dict.options.days[i],
        ["Пт", "Сб", "Вс"][i],
        false,
      )}
    {/each}

    <!-- Обратно Способ -->
    {#each transportMethods as tm}
      {@render filterHeader("from", tm.key, tm.icon, true)}
    {/each}

    <!-- Обратно День -->
    {#each [0, 1, 2] as i}
      {@render filterHeader(
        "fromDay",
        dict.options.days[i],
        ["Пт", "Сб", "Вс"][i],
        false,
      )}
    {/each}
  </tr>
</thead>
