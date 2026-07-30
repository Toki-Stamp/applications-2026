<script>
  import { getContext } from "svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { dict } from "../../locales/ru.js";
  import {
    transportMethods,
    getDayStatus,
    getMethodStatus,
  } from "./gridStore.svelte.js";

  let {
    participant: p,
    index: i,
    isLeader = false,
    isMember = false,
    filterMode = false,
  } = $props();

  /** @type {import('./gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");
</script>

{#snippet statusCell(
  /** @type {string} */ filterKey,
  /** @type {{ active: boolean, icon: string }} */ status,
)}
  <td
    class="text-center no-pad-x"
    class:highlighted-col={gridState.isFilterHoveredOrActive(filterKey)}
  >
    <md-icon class="status-icon {status.active ? 'active' : ''}"
      >{status.icon}</md-icon
    >
  </td>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<tr
  class:hidden-row={filterMode &&
    Object.keys(gridState.activeFilters).length > 0 &&
    !gridState.isRowHighlightedAll(p)}
  class:selected={gridState.selectedRowIndices.has(i)}
  class:highlighted={gridState.isRowActiveOrHovered(p, filterMode)}
  onclick={(e) => gridState.handleRowClick(e, i)}
  onmousedown={(e) => e.shiftKey && e.preventDefault()}
>
  <!-- № -->
  <td
    class="sticky-num text-center"
    class:sticky-col={gridState.isNumPinned}
    class:last-pinned={gridState.lastPinnedCol === "num"}
  >
    <span>{i + 1}</span>
  </td>

  <!-- Никнейм -->
  <td
    class="col-name"
    class:sticky-col={gridState.isNicknamePinned}
    class:last-pinned={gridState.lastPinnedCol === "nickname"}
    style:left={gridState.isNicknamePinned
      ? (gridState.isNumPinned ? gridState.widthNum : 0) + "px"
      : ""}
  >
    <div class="user-meta">
      <div class="user-details">
        <div class="name-with-icon">
          <Tooltip text={p.nickname || ""} onlyIfTruncated={true}>
            <span class="ellipsis-text">{p.nickname || ""}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  </td>

  <!-- Имя -->
  <td
    class="col-real-name"
    class:sticky-col={gridState.isNamePinned}
    class:last-pinned={gridState.lastPinnedCol === "name"}
    style:left={gridState.isNamePinned
      ? (gridState.isNumPinned ? gridState.widthNum : 0) +
        (gridState.isNicknamePinned ? gridState.widthNickname : 0) +
        "px"
      : ""}
  >
    <div class="name-with-icon">
      {#if isMember}
        <md-icon class="group-icon member">group</md-icon>
      {/if}
      <Tooltip text={p.firstName || ""} onlyIfTruncated={true}>
        <span class="ellipsis-text">{p.firstName || ""}</span>
      </Tooltip>
    </div>
  </td>

  <!-- ТУДА: В, П, М, С -->
  {#each transportMethods as tm}
    {@render statusCell(
      `to_${tm.key}`,
      getMethodStatus(p.transportTo.method, tm.key),
    )}
  {/each}

  <!-- ТУДА: Места, Город -->
  <td class="text-center">
    {#if p.transportTo.method === "Водитель" && p.transportTo.seats}
      <span class="seats-badge">
        <md-icon class="status-icon active">radio_button_unchecked</md-icon>
        <span class="seats-number">{p.transportTo.seats}</span>
      </span>
    {:else}
      <span class="opacity-30">-</span>
    {/if}
  </td>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <td
    class="interactive-city-cell"
    class:highlighted-col={gridState.isFilterHoveredOrActive(
      "toCity_" + (p.transportTo?.city?.trim().toLowerCase() || ""),
    )}
    onclick={(e) => {
      e.stopPropagation();
      if (p.transportTo?.city) {
        const clickedCity = p.transportTo.city.trim().toLowerCase();
        gridState.handleHeaderClick("toCity_" + clickedCity);
      }
    }}
    onmouseenter={() =>
      (gridState.hoveredFilter = p.transportTo?.city
        ? `toCity_${p.transportTo.city.trim().toLowerCase()}`
        : null)}
    onmouseleave={() => (gridState.hoveredFilter = null)}
  >
    {#if p.transportTo?.city}
      {p.transportTo.city}
    {:else}
      <span class="opacity-30">-</span>
    {/if}
  </td>

  <!-- ТУДА: День -->
  {#each [0, 1, 2] as dayIndex}
    {@render statusCell(
      `toDay_${dict.options.days[dayIndex]}`,
      getDayStatus(p.transportTo.day, dict.options.days[dayIndex]),
    )}
  {/each}

  <!-- ТУДА: Время -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <td
    class="text-center time-cell interactive-time-cell"
    class:highlighted-col={gridState.isFilterHoveredOrActive(
      `toTime_${p.transportTo?.time}`,
    )}
    onclick={(e) => {
      e.stopPropagation();
      if (p.transportTo?.time) {
        const key = `toTime_${p.transportTo.time}`;
        gridState.handleHeaderClick(key);
      }
    }}
    onmouseenter={() =>
      (gridState.hoveredFilter = p.transportTo?.time
        ? `toTime_${p.transportTo.time}`
        : null)}
    onmouseleave={() => (gridState.hoveredFilter = null)}
  >
    {p.transportTo.time || "-"}
  </td>

  <!-- ОБРАТНО: В, П, М, С -->
  {#each transportMethods as tm}
    {@render statusCell(
      `from_${tm.key}`,
      getMethodStatus(p.transportFrom.method, tm.key),
    )}
  {/each}

  <!-- ОБРАТНО: День -->
  {#each [0, 1, 2] as dayIndex}
    {@render statusCell(
      `fromDay_${dict.options.days[dayIndex]}`,
      getDayStatus(p.transportFrom.day, dict.options.days[dayIndex]),
    )}
  {/each}

  <!-- ОБРАТНО: Время -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <td
    class="text-center time-cell interactive-time-cell"
    class:highlighted-col={gridState.isFilterHoveredOrActive(
      `fromTime_${p.transportFrom?.time}`,
    )}
    onclick={(e) => {
      e.stopPropagation();
      if (p.transportFrom?.time) {
        const key = `fromTime_${p.transportFrom.time}`;
        gridState.handleHeaderClick(key);
      }
    }}
    onmouseenter={() =>
      (gridState.hoveredFilter = p.transportFrom?.time
        ? `fromTime_${p.transportFrom.time}`
        : null)}
    onmouseleave={() => (gridState.hoveredFilter = null)}
  >
    {p.transportFrom.time || "-"}
  </td>
</tr>
