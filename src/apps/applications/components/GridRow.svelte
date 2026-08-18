<script>
  import { getContext } from "svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import { dict } from "$shared/locales/ru.js";
  import {
    transportMethods,
    getDayStatus,
    getMethodStatus,
  } from "$apps/applications/gridStore.svelte.js";

  let {
    participant: p,
    index: i,
    isLeader = false,
    isMember = false,
    groupSize = 1,
    filterMode = false,
  } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");

  /**
   * Split string into matched and non-matched chunks for safe highlighting
   * @param {string} text
   * @param {string} query
   */
  function highlightMatch(text, query) {
    if (!text) return [];
    if (!query || !query.trim()) return [{ text, match: false }];
    const q = query.trim().toLowerCase();
    const lower = text.toLowerCase();
    const parts = [];
    let currentIndex = 0;
    let matchIndex = lower.indexOf(q, currentIndex);

    while (matchIndex !== -1) {
      if (matchIndex > currentIndex) {
        parts.push({ text: text.slice(currentIndex, matchIndex), match: false });
      }
      parts.push({
        text: text.slice(matchIndex, matchIndex + q.length),
        match: true,
      });
      currentIndex = matchIndex + q.length;
      matchIndex = lower.indexOf(q, currentIndex);
    }
    if (currentIndex < text.length) {
      parts.push({ text: text.slice(currentIndex), match: false });
    }
    return parts;
  }
</script>

{#snippet statusCell(
  /** @type {{ active: boolean, icon: string }} */ status,
  isColActive = false,
)}
  <td class="text-center no-pad-x" class:is-col-active={isColActive}>
    {#if status.active}
      <span class="status-check-badge">
        <md-icon>check</md-icon>
      </span>
    {:else}
      <span class="opacity-30">-</span>
    {/if}
  </td>
{/snippet}

{#snippet renderHighlighted(/** @type {string} */ text, /** @type {string} */ query)}
  {#each highlightMatch(text, query) as part}
    {#if part.match}
      <mark class="search-match">{part.text}</mark>
    {:else}
      <span>{part.text}</span>
    {/if}
  {/each}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<tr
  class:hidden-row={filterMode &&
    gridState.hasAnyFilterOrSearch &&
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
    class:is-col-active={!!gridState.searchNick}
    class:sticky-col={gridState.isNicknamePinned}
    class:last-pinned={gridState.lastPinnedCol === "nickname"}
    style:left={gridState.isNicknamePinned
      ? (gridState.isNumPinned ? gridState.widthNum : 0) + "px"
      : ""}
  >
    <div class="user-meta">
      <div class="user-details">
        <div class="name-with-icon">
          {#if p.nickname?.trim()}
            <Tooltip text={p.nickname} onlyIfTruncated={true}>
              <span class="ellipsis-text">
                {@render renderHighlighted(
                  p.nickname,
                  gridState.searchNick || gridState.searchQuery,
                )}
              </span>
            </Tooltip>
          {:else}
            <span class="opacity-30">-</span>
          {/if}
        </div>
      </div>
    </div>
  </td>

  <!-- Имя -->
  <td
    class="col-real-name"
    class:group-member={isMember}
    class:group-leader={isLeader}
    class:is-col-active={!!gridState.searchName}
    class:sticky-col={gridState.isNamePinned}
    class:last-pinned={gridState.lastPinnedCol === "name"}
    style:left={gridState.isNamePinned
      ? (gridState.isNumPinned ? gridState.widthNum : 0) +
        (gridState.isNicknamePinned ? gridState.widthNickname : 0) +
        "px"
      : ""}
  >
    <div class="name-cell-content">
      <div class="name-text-wrapper">
        {#if p.firstName?.trim()}
          <Tooltip text={p.firstName} onlyIfTruncated={true}>
            <span class="ellipsis-text">
              {@render renderHighlighted(
                p.firstName,
                gridState.searchName || gridState.searchQuery,
              )}
            </span>
          </Tooltip>
        {:else}
          <span class="opacity-30">-</span>
        {/if}
      </div>

      {#if isLeader}
        <span class="group-count-badge">+{groupSize - 1}</span>
      {:else if isMember}
        <md-icon class="group-icon member">group</md-icon>
      {/if}
    </div>
  </td>

  <!-- ТУДА: В, П, М, С -->
  {#each transportMethods as tm}
    {@render statusCell(
      getMethodStatus(p.transportTo.method, tm.key),
      gridState.isGroupValueActive("to", tm.key),
    )}
  {/each}

  <!-- ТУДА: Места -->
  <td
    class="text-center no-pad-x"
    class:is-col-active={gridState.isFilterActive("toSeats_true")}
  >
    {#if p.transportTo.method === "Водитель" && p.transportTo.seats}
      <span>{p.transportTo.seats}</span>
    {:else}
      <span class="opacity-30">-</span>
    {/if}
  </td>

  <!-- ТУДА: Город -->
  <td
    class="city-cell"
    class:is-col-active={!!gridState.activeFilters["toCity"] || !!gridState.searchCity}
  >
    {#if p.transportTo?.city}
      {@render renderHighlighted(
        p.transportTo.city,
        gridState.searchCity || gridState.searchQuery,
      )}
    {:else}
      <span class="opacity-30">-</span>
    {/if}
  </td>

  <!-- ТУДА: День -->
  {#each [0, 1, 2] as dayIndex}
    {@render statusCell(
      getDayStatus(p.transportTo.day, dict.options.days[dayIndex]),
      gridState.isGroupValueActive("toDay", dict.options.days[dayIndex]),
    )}
  {/each}

  <!-- ТУДА: Время -->
  <td
    class="text-center time-cell"
    class:is-col-active={!!gridState.activeFilters["toTime"]}
  >
    {p.transportTo?.time || "-"}
  </td>

  <!-- ОБРАТНО: В, П, М, С -->
  {#each transportMethods as tm}
    {@render statusCell(
      getMethodStatus(p.transportFrom.method, tm.key),
      gridState.isGroupValueActive("from", tm.key),
    )}
  {/each}

  <!-- ОБРАТНО: День -->
  {#each [0, 1, 2] as dayIndex}
    {@render statusCell(
      getDayStatus(p.transportFrom.day, dict.options.days[dayIndex]),
      gridState.isGroupValueActive("fromDay", dict.options.days[dayIndex]),
    )}
  {/each}

  <!-- ОБРАТНО: Время -->
  <td
    class="text-center time-cell"
    class:is-col-active={!!gridState.activeFilters["fromTime"]}
  >
    {p.transportFrom?.time || "-"}
  </td>
</tr>
