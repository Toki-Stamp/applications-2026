<script>
  import "./grid.css";
  import { getContext } from "svelte";
  import { GridState, transportMethods } from "$apps/applications/gridStore.svelte.js";
  import GridHeader from "./GridHeader.svelte";
  import GridRow from "./GridRow.svelte";
  import GridSummaryRow from "./GridSummaryRow.svelte";

  let {
    participants = [],
    filterMode = false,
  } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState") || new GridState();

  // Group helpers
  let groupMembers = $derived.by(() => {
    const groups = {};
    participants.forEach((p, i) => {
      if (!p.groupId) return;
      if (!groups[p.groupId]) groups[p.groupId] = [];
      groups[p.groupId].push(i);
    });

    const memberInfo = {};
    Object.entries(groups).forEach(([groupId, indices]) => {
      if (indices.length > 1) {
        indices.forEach((idx, pos) => {
          memberInfo[idx] = {
            isLeader: pos === 0,
            isMember: pos > 0,
            groupSize: indices.length,
          };
        });
      }
    });
    return memberInfo;
  });

  let headerHeight = $state(84);
  let isScrolledX = $state(false);
  let isScrolledY = $state(false);
  let hasMoreBelow = $state(false);
  /** @type {HTMLDivElement | null} */
  let containerRef = $state(null);

  function updateScrollState() {
    if (!containerRef) return;
    isScrolledX = containerRef.scrollLeft > 0;
    isScrolledY = containerRef.scrollTop > 0;
    const maxScroll = containerRef.scrollHeight - containerRef.clientHeight;
    hasMoreBelow = maxScroll > 2 && maxScroll - containerRef.scrollTop > 2;
  }

  $effect(() => {
    participants;
    filterMode;
    gridState.activeFilters;
    gridState.searchQuery;
    gridState.searchNick;
    gridState.searchName;
    gridState.searchCity;
    updateScrollState();
  });

  $effect(() => {
    if (!containerRef) return;
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(containerRef);
    return () => ro.disconnect();
  });
</script>

<div class="table-wrapper glass-panel">
  <div
    class="table-container"
    bind:this={containerRef}
    style="--header-height: {headerHeight}px"
    onscroll={updateScrollState}
  >
    <table
      class="participants-table"
      class:is-scrolled-x={isScrolledX}
      class:is-scrolled-y={isScrolledY}
      class:has-more-below={hasMoreBelow}
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

      <GridHeader {participants} bind:headerHeight />

      <tbody>
        {#each participants as p, i}
          {@const gInfo = groupMembers[i] || { isLeader: false, isMember: false, groupSize: 1 }}
          <GridRow
            participant={p}
            index={i}
            isLeader={gInfo.isLeader}
            isMember={gInfo.isMember}
            groupSize={gInfo.groupSize}
            {filterMode}
          />
        {/each}
      </tbody>

      <GridSummaryRow {participants} />
    </table>
  </div>
</div>
