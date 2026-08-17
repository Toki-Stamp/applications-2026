<script>
  import { getContext } from "svelte";
  import Tooltip from "$shared/components/ui/Tooltip.svelte";
  import { dict } from "$shared/locales/ru.js";
  import { transportMethods } from "$apps/applications/gridStore.svelte.js";

  let { headerHeight = $bindable(0) } = $props();

  /** @type {import('$apps/applications/gridStore.svelte.js').GridState} */
  const gridState = getContext("gridState");
</script>

{#snippet filterHeader(
  /** @type {string} */ filterKey,
  /** @type {string} */ content,
  isIcon = false,
)}
  <th
    class="icon-th interactive-th {isIcon ? '' : 'fw-bold'}"
    class:active-filter={gridState.isFilterActive(filterKey)}
    onmouseenter={() => (gridState.hoveredFilter = filterKey)}
    onmouseleave={() => (gridState.hoveredFilter = null)}
    onclick={() => gridState.handleHeaderClick(filterKey)}
  >
    {#if isIcon}
      <Tooltip
        pos="top"
        text={gridState.getFilterDetails(filterKey)?.valText || ""}
      >
        <div class="header-icon-wrapper">
          <md-icon>{content}</md-icon>
        </div>
      </Tooltip>
    {:else}
      <div class="header-text-wrapper">
        <span>{content}</span>
      </div>
    {/if}
  </th>
{/snippet}

<thead bind:clientHeight={headerHeight}>
  <!-- ROW 1 -->
  <tr>
    <th
      rowspan="3"
      class="sticky-num"
      class:sticky-col={gridState.isNumPinned}
      class:last-pinned={gridState.lastPinnedCol === "num"}
      bind:clientWidth={gridState.widthNum}
    >
      <div class="th-content-pin">
        №
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
      <div class="th-content-pin">
        Никнейм
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
      <div class="th-content-pin">
        Имя
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
    <th rowspan="2" class="sub-header city-th">Город</th>
    <th colspan="3" class="sub-header text-center">День</th>
    <th rowspan="2" class="sub-header mobile-rotate-th time-th">
      <div class="rotated-text">Время</div>
    </th>

    <!-- Обратно -->
    <th colspan="4" class="sub-header text-center">Способ</th>
    <th colspan="3" class="sub-header text-center">День</th>
    <th rowspan="2" class="sub-header mobile-rotate-th time-th">
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
      {@render filterHeader(
        `toDay_${dict.options.days[i]}`,
        ["Пт", "Сб", "Вс"][i],
        false,
      )}
    {/each}

    <!-- Обратно Способ -->
    {#each transportMethods as tm}
      {@render filterHeader(`from_${tm.key}`, tm.icon, true)}
    {/each}

    <!-- Обратно День -->
    {#each [0, 1, 2] as i}
      {@render filterHeader(
        `fromDay_${dict.options.days[i]}`,
        ["Пт", "Сб", "Вс"][i],
        false,
      )}
    {/each}
  </tr>
</thead>
