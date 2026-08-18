<script>
  import { getContext } from "svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import { isDayMatch } from "../gridStore.svelte.js";

  let {
    participants = [],
  } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");

  let activeParticipants = $derived(
    participants.filter((p) => gridState.isRowMatching(p)),
  );

  // ТУДА
  let toDrivers = $derived(
    activeParticipants.filter((p) => p.transportTo?.method === "Водитель").length,
  );
  let toPassengers = $derived(
    activeParticipants.filter((p) => p.transportTo?.method === "Пассажир").length,
  );
  let toBuses = $derived(
    activeParticipants.filter(
      (p) =>
        p.transportTo?.method === "Маршрутка" ||
        p.transportTo?.method === "Трансфер",
    ).length,
  );
  let toSelf = $derived(
    activeParticipants.filter((p) => p.transportTo?.method === "Свой ход").length,
  );
  let toFri = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportTo?.day, "Пятница")).length,
  );
  let toSat = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportTo?.day, "Суббота")).length,
  );
  let toSun = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportTo?.day, "Воскресенье")).length,
  );

  // ОБРАТНО
  let fromDrivers = $derived(
    activeParticipants.filter((p) => p.transportFrom?.method === "Водитель").length,
  );
  let fromPassengers = $derived(
    activeParticipants.filter((p) => p.transportFrom?.method === "Пассажир").length,
  );
  let fromBuses = $derived(
    activeParticipants.filter(
      (p) =>
        p.transportFrom?.method === "Маршрутка" ||
        p.transportFrom?.method === "Трансфер",
    ).length,
  );
  let fromSelf = $derived(
    activeParticipants.filter((p) => p.transportFrom?.method === "Свой ход").length,
  );
  let fromFri = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportFrom?.day, "Пятница")).length,
  );
  let fromSat = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportFrom?.day, "Суббота")).length,
  );
  let fromSun = $derived(
    activeParticipants.filter((p) => isDayMatch(p.transportFrom?.day, "Воскресенье")).length,
  );
</script>

{#snippet summaryCell(
  /** @type {string} */ groupKey,
  /** @type {string} */ valKey,
  /** @type {number} */ count,
)}
  {@const isActive = gridState.isGroupValueActive(groupKey, valKey)}
  {@const details = gridState.getFilterDetails(`${groupKey}_${valKey}`)}
  {@const tipText = details?.tooltip || details?.valText || valKey}
  <td
    class="icon-th summary-cell text-center is-clickable"
    class:is-active={isActive}
    onclick={() => gridState.toggleFilter(groupKey, valKey)}
  >
    <Tooltip pos="top" text={tipText} wrapperClass="summary-tooltip-wrapper">
      <div class="summary-btn" class:is-active={isActive}>
        {count}
      </div>
    </Tooltip>
  </td>
{/snippet}

<tfoot>
  <tr class="summary-row">
    <!-- № (пустая ячейка) -->
    <td
      class="sticky-num summary-cell text-center"
      class:sticky-col={gridState.isNumPinned}
      class:last-pinned={gridState.lastPinnedCol === "num"}
    ></td>

    <!-- Поиск по никнейму -->
    <td
      class="col-name summary-cell summary-search-cell"
      class:is-col-active={!!gridState.searchNick}
      class:sticky-col={gridState.isNicknamePinned}
      class:last-pinned={gridState.lastPinnedCol === "nickname"}
      style:left={gridState.isNicknamePinned
        ? (gridState.isNumPinned ? gridState.widthNum : 0) + "px"
        : ""}
    >
      <div class="summary-search-box">
        <md-icon class="summary-search-icon">search</md-icon>
        <input
          type="text"
          class="summary-search-input"
          placeholder="Поиск..."
          bind:value={gridState.searchNick}
        />
        {#if gridState.searchNick}
          <Tooltip text="Очистить поиск" pos="top">
            <button
              class="summary-clear-btn"
              onclick={() => (gridState.searchNick = "")}
              aria-label="Очистить поиск по никнейму"
            >
              <md-icon>close</md-icon>
            </button>
          </Tooltip>
        {/if}
      </div>
    </td>

    <!-- Поиск по имени -->
    <td
      class="col-real-name summary-cell summary-search-cell"
      class:is-col-active={!!gridState.searchName}
      class:sticky-col={gridState.isNamePinned}
      class:last-pinned={gridState.lastPinnedCol === "name"}
      style:left={gridState.isNamePinned
        ? (gridState.isNumPinned ? gridState.widthNum : 0) +
          (gridState.isNicknamePinned ? gridState.widthNickname : 0) +
          "px"
        : ""}
    >
      <div class="summary-search-box">
        <md-icon class="summary-search-icon">search</md-icon>
        <input
          type="text"
          class="summary-search-input"
          placeholder="Поиск..."
          bind:value={gridState.searchName}
        />
        {#if gridState.searchName}
          <Tooltip text="Очистить поиск" pos="top">
            <button
              class="summary-clear-btn"
              onclick={() => (gridState.searchName = "")}
              aria-label="Очистить поиск по имени"
            >
              <md-icon>close</md-icon>
            </button>
          </Tooltip>
        {/if}
      </div>
    </td>

    <!-- ТУДА: Способ -->
    {@render summaryCell("to", "Водитель", toDrivers)}
    {@render summaryCell("to", "Пассажир", toPassengers)}
    {@render summaryCell("to", "Маршрутка", toBuses)}
    {@render summaryCell("to", "Свой ход", toSelf)}

    <!-- ТУДА: Места (пустая ячейка) -->
    <td
      class="rotate-th summary-cell text-center"
      class:is-col-active={gridState.isFilterActive("toSeats_true")}
    ></td>

    <!-- ТУДА: Город (пустая ячейка) -->
    <td
      class="city-th summary-cell text-center"
      class:is-col-active={!!gridState.activeFilters["toCity"] || !!gridState.searchCity}
    ></td>

    <!-- ТУДА: Дни -->
    {@render summaryCell("toDay", "Пятница", toFri)}
    {@render summaryCell("toDay", "Суббота", toSat)}
    {@render summaryCell("toDay", "Воскресенье", toSun)}

    <!-- ТУДА: Время (пустая ячейка) -->
    <td
      class="time-th summary-cell text-center"
      class:is-col-active={!!gridState.activeFilters["toTime"]}
    ></td>

    <!-- ОБРАТНО: Способ -->
    {@render summaryCell("from", "Водитель", fromDrivers)}
    {@render summaryCell("from", "Пассажир", fromPassengers)}
    {@render summaryCell("from", "Маршрутка", fromBuses)}
    {@render summaryCell("from", "Свой ход", fromSelf)}

    <!-- ОБРАТНО: Дни -->
    {@render summaryCell("fromDay", "Пятница", fromFri)}
    {@render summaryCell("fromDay", "Суббота", fromSat)}
    {@render summaryCell("fromDay", "Воскресенье", fromSun)}

    <!-- ОБРАТНО: Время (пустая ячейка) -->
    <td
      class="time-th summary-cell text-center"
      class:is-col-active={!!gridState.activeFilters["fromTime"]}
    ></td>
  </tr>
</tfoot>

<style>
  :global(.summary-tooltip-wrapper) {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }
</style>
