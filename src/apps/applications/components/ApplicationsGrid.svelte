<script>
  import "./grid.css";
  import { setContext } from "svelte";
  import { GridState, transportMethods } from "$apps/applications/gridStore.svelte.js";
  import GridHeader from "./GridHeader.svelte";
  import GridRow from "./GridRow.svelte";

  let {
    participants,
    activeFilters = $bindable({}),
    intersectionCount = $bindable(0),
    filterMode = false,
  } = $props();

  const gridState = new GridState(activeFilters);
  setContext("gridState", gridState);

  // Sync external props with internal store
  $effect(() => {
    activeFilters = gridState.activeFilters;
  });

  // Calculate intersection count for parent
  $effect(() => {
    let count = 0;
    if (Object.keys(gridState.activeFilters).length > 0) {
      for (const p of participants) {
        if (gridState.isRowHighlightedAll(p)) count++;
      }
    }
    intersectionCount = count;
  });

  // Group helpers
  let groupSizes = $derived(
    participants.reduce((acc, p) => {
      if (!p.groupId) return acc;
      acc[p.groupId] = (acc[p.groupId] || 0) + 1;
      return acc;
    }, {}),
  );

  let groupLeaders = $derived(
    participants.reduce((acc, p, i) => {
      if (!p.groupId) return acc;
      if (!(p.groupId in acc)) acc[p.groupId] = i;
      return acc;
    }, {}),
  );

  let headerHeight = $state(0);
  let isScrolledX = $state(false);
  let isScrolledY = $state(false);
</script>

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
      <colgroup>
        <!-- Закрепленные колонки -->
        <col class="sticky-num" />
        <col class="col-name" />
        <col class="col-real-name" />
        <!-- ТУДА -->
        {#each transportMethods as _}
          <col class="icon-th" />
        {/each}
        <col class="rotate-th" />
        <col class="city-th" />
        <col class="icon-th" />
        <col class="icon-th" />
        <col class="icon-th" />
        <col class="time-th" />
        <!-- ОБРАТНО -->
        {#each transportMethods as _}
          <col class="icon-th" />
        {/each}
        <col class="icon-th" />
        <col class="icon-th" />
        <col class="icon-th" />
        <col class="time-th" />
      </colgroup>

      <GridHeader bind:headerHeight />

      <tbody>
        {#each participants as p, i}
          {@const isGroup = groupSizes[p.groupId] > 1}
          {@const isLeader = isGroup && groupLeaders[p.groupId] === i}
          {@const isMember = isGroup && groupLeaders[p.groupId] !== i}
          <GridRow
            participant={p}
            index={i}
            {isLeader}
            {isMember}
            {filterMode}
          />
        {/each}
      </tbody>
    </table>
  </div>
</div>
