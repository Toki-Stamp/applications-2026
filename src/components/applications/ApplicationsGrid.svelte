<script>
  import Tooltip from "../ui/Tooltip.svelte";
  import HintBox from "../ui/HintBox.svelte";
  import { dict } from "../../locales/ru.js";

  let { participants } = $props();

  let headerHeight = $state(0);
  /** @type {Set<number>} */
  let selectedRowIndices = $state(new Set());
  let lastSelectedIndex = $state(-1);

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
  /** @type {string | null} */
  let hoveredFilter = $state(null);
  /** @type {string | null} */
  let fixedFilter = $state(null);

  let activeFilter = $derived(fixedFilter || hoveredFilter);

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
    selectedRowIndices = new Set(); // clear selected rows when clicking a filter
    lastSelectedIndex = -1;
    if (fixedFilter === key) {
      fixedFilter = null;
    } else {
      fixedFilter = key;
    }
  }

  /** @param {MouseEvent} event */
  function handleWindowClick(event) {
    if (fixedFilter) {
      const target = /** @type {HTMLElement} */ (event.target);
      if (
        !target.closest(".interactive-th") &&
        !target.closest(".highlighted")
      ) {
        fixedFilter = null;
      }
    }
  }

  // Compute counts for methods
  let methodCounts = $derived.by(() => {
    /** @type {{ to: Record<string, number>, from: Record<string, number>, toDay: Record<string, number>, fromDay: Record<string, number>, toSeats: number }} */
    let counts = {
      to: { Водитель: 0, Пассажир: 0, Маршрутка: 0, "Свой ход": 0 },
      from: { Водитель: 0, Пассажир: 0, Маршрутка: 0, "Свой ход": 0 },
      toDay: {},
      fromDay: {},
      toSeats: 0,
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
    }
    return counts;
  });

  /**
   * @param {any} p
   * @param {string | null} filterKey
   */
  function isRowHighlighted(p, filterKey) {
    if (!filterKey) return false;
    const [dir, val] = filterKey.split("_");

    if (dir === "toDay") return p.transportTo?.day === val;
    if (dir === "fromDay") return p.transportFrom?.day === val;
    if (dir === "toSeats")
      return p.transportTo?.method === "Водитель" && !!p.transportTo?.seats;

    const actualMethod =
      dir === "to" ? p.transportTo?.method : p.transportFrom?.method;
    if (val === "Маршрутка" && actualMethod === "Трансфер") return true;
    return actualMethod === val;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="table-wrapper glass-panel">
  <div class="table-container" style="--header-height: {headerHeight}px">
    <table class="participants-table">
      <thead bind:clientHeight={headerHeight}>
        <!-- ROW 1 -->
        <tr>
          <th rowspan="3" class="sticky-col sticky-num">№</th>
          <th rowspan="3" class="col-name">Никнейм</th>
          <th rowspan="3" class="col-real-name">Имя</th>
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
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "to_Водитель"}
            onmouseenter={() => (hoveredFilter = "to_Водитель")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("to_Водитель")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.driver}: {methodCounts.to[
                'Водитель'
              ] || 0}"
            >
              <md-icon>directions_car</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "to_Пассажир"}
            onmouseenter={() => (hoveredFilter = "to_Пассажир")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("to_Пассажир")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.passenger}: {methodCounts
                .to['Пассажир'] || 0}"
            >
              <md-icon>hail</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "to_Маршрутка"}
            onmouseenter={() => (hoveredFilter = "to_Маршрутка")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("to_Маршрутка")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.bus}: {methodCounts.to[
                'Маршрутка'
              ] || 0}"
            >
              <md-icon>directions_bus</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "to_Свой ход"}
            onmouseenter={() => (hoveredFilter = "to_Свой ход")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("to_Свой ход")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.self}: {methodCounts.to[
                'Свой ход'
              ] || 0}"
            >
              <md-icon>directions_walk</md-icon>
            </Tooltip>
          </th>

          <!-- Туда День -->
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `toDay_${dict.options.days[0]}`}
            onmouseenter={() =>
              (hoveredFilter = `toDay_${dict.options.days[0]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`toDay_${dict.options.days[0]}`)}
          >
            <Tooltip
              text="{dict.options.days[0]}: {methodCounts.toDay[
                dict.options.days[0]
              ] || 0}">Пт</Tooltip
            >
          </th>
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `toDay_${dict.options.days[1]}`}
            onmouseenter={() =>
              (hoveredFilter = `toDay_${dict.options.days[1]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`toDay_${dict.options.days[1]}`)}
          >
            <Tooltip
              text="{dict.options.days[1]}: {methodCounts.toDay[
                dict.options.days[1]
              ] || 0}">Сб</Tooltip
            >
          </th>
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `toDay_${dict.options.days[2]}`}
            onmouseenter={() =>
              (hoveredFilter = `toDay_${dict.options.days[2]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`toDay_${dict.options.days[2]}`)}
          >
            <Tooltip
              text="{dict.options.days[2]}: {methodCounts.toDay[
                dict.options.days[2]
              ] || 0}">Вс</Tooltip
            >
          </th>

          <!-- Обратно Способ -->
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "from_Водитель"}
            onmouseenter={() => (hoveredFilter = "from_Водитель")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("from_Водитель")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.driver}: {methodCounts
                .from['Водитель'] || 0}"
            >
              <md-icon>directions_car</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "from_Пассажир"}
            onmouseenter={() => (hoveredFilter = "from_Пассажир")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("from_Пассажир")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.passenger}: {methodCounts
                .from['Пассажир'] || 0}"
            >
              <md-icon>hail</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "from_Маршрутка"}
            onmouseenter={() => (hoveredFilter = "from_Маршрутка")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("from_Маршрутка")}
          >
            <Tooltip
              text="{dict.options.transportMethodsTo.bus}: {methodCounts.from[
                'Маршрутка'
              ] || 0}"
            >
              <md-icon>directions_bus</md-icon>
            </Tooltip>
          </th>
          <th
            class="icon-th interactive-th"
            class:active-filter={fixedFilter === "from_Свой ход"}
            onmouseenter={() => (hoveredFilter = "from_Свой ход")}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick("from_Свой ход")}
          >
            <Tooltip
              pos="right"
              text="{dict.options.transportMethodsTo.self}: {methodCounts.from[
                'Свой ход'
              ] || 0}"
            >
              <md-icon>directions_walk</md-icon>
            </Tooltip>
          </th>

          <!-- Обратно День -->
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `fromDay_${dict.options.days[0]}`}
            onmouseenter={() =>
              (hoveredFilter = `fromDay_${dict.options.days[0]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`fromDay_${dict.options.days[0]}`)}
          >
            <Tooltip
              pos="right"
              text="{dict.options.days[0]}: {methodCounts.fromDay[
                dict.options.days[0]
              ] || 0}">Пт</Tooltip
            >
          </th>
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `fromDay_${dict.options.days[1]}`}
            onmouseenter={() =>
              (hoveredFilter = `fromDay_${dict.options.days[1]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`fromDay_${dict.options.days[1]}`)}
          >
            <Tooltip
              pos="right"
              text="{dict.options.days[1]}: {methodCounts.fromDay[
                dict.options.days[1]
              ] || 0}">Сб</Tooltip
            >
          </th>
          <th
            class="icon-th fw-bold interactive-th"
            class:active-filter={fixedFilter ===
              `fromDay_${dict.options.days[2]}`}
            onmouseenter={() =>
              (hoveredFilter = `fromDay_${dict.options.days[2]}`)}
            onmouseleave={() => (hoveredFilter = null)}
            onclick={() => handleHeaderClick(`fromDay_${dict.options.days[2]}`)}
          >
            <Tooltip
              pos="right"
              text="{dict.options.days[2]}: {methodCounts.fromDay[
                dict.options.days[2]
              ] || 0}">Вс</Tooltip
            >
          </th>
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
          {@const activeFilter = fixedFilter || hoveredFilter}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <tr
            class:selected={selectedRowIndices.has(i)}
            class:highlighted={isRowHighlighted(p, activeFilter)}
            onclick={(e) => handleRowClick(e, i)}
            onmousedown={(e) => e.shiftKey && e.preventDefault()}
          >
            <!-- № -->
            <td class="sticky-col sticky-num text-center"
              ><span>{i + 1}</span></td
            >

            <!-- Никнейм / Команда -->
            <!-- Никнейм -->
            <td class="col-name">
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
            <td class="col-real-name">
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
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "to_Водитель"}
              ><md-icon class="status-icon {tToV.active ? 'active' : ''}"
                >{tToV.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "to_Пассажир"}
              ><md-icon class="status-icon {tToP.active ? 'active' : ''}"
                >{tToP.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "to_Маршрутка"}
              ><md-icon class="status-icon {tToM.active ? 'active' : ''}"
                >{tToM.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "to_Свой ход"}
              ><md-icon class="status-icon {tToC.active ? 'active' : ''}"
                >{tToC.icon}</md-icon
              ></td
            >

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
            <td>{p.transportTo.city || "-"}</td>

            <!-- ТУДА: День -->
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `toDay_${dict.options.days[0]}`}
              ><md-icon class="status-icon {dToFri.active ? 'active' : ''}"
                >{dToFri.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `toDay_${dict.options.days[1]}`}
              ><md-icon class="status-icon {dToSat.active ? 'active' : ''}"
                >{dToSat.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `toDay_${dict.options.days[2]}`}
              ><md-icon class="status-icon {dToSun.active ? 'active' : ''}"
                >{dToSun.icon}</md-icon
              ></td
            >

            <td class="text-center time-cell">{p.transportTo.time || "-"}</td>

            <!-- ОБРАТНО: В, П, М, С -->
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "from_Водитель"}
              ><md-icon class="status-icon {tFromV.active ? 'active' : ''}"
                >{tFromV.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "from_Пассажир"}
              ><md-icon class="status-icon {tFromP.active ? 'active' : ''}"
                >{tFromP.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "from_Маршрутка"}
              ><md-icon class="status-icon {tFromM.active ? 'active' : ''}"
                >{tFromM.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter === "from_Свой ход"}
              ><md-icon class="status-icon {tFromC.active ? 'active' : ''}"
                >{tFromC.icon}</md-icon
              ></td
            >

            <!-- ОБРАТНО: День -->
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `fromDay_${dict.options.days[0]}`}
              ><md-icon class="status-icon {dFromFri.active ? 'active' : ''}"
                >{dFromFri.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `fromDay_${dict.options.days[1]}`}
              ><md-icon class="status-icon {dFromSat.active ? 'active' : ''}"
                >{dFromSat.icon}</md-icon
              ></td
            >
            <td
              class="text-center"
              class:highlighted-col={activeFilter ===
                `fromDay_${dict.options.days[2]}`}
              ><md-icon class="status-icon {dFromSun.active ? 'active' : ''}"
                >{dFromSun.icon}</md-icon
              ></td
            >

            <!-- ОБРАТНО: Время -->
            <td class="text-center time-cell">{p.transportFrom.time || "-"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-wrapper {
    flex: 1;
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
    background: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 4%,
        var(--bg-color-accent)
      );
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
    background: color-mix(in srgb, var(--text-primary) 3%, transparent);
  }

  tbody tr:nth-child(even) td.sticky-col {
    background: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.06)),
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 4%,
        var(--bg-color-accent)
      );
  }

  /* Sticky Left Columns */
  .sticky-col {
    position: sticky;
  }

  td.sticky-col {
    background: var(--bg-color-accent);
    background:
      linear-gradient(rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.04)),
      color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 4%,
        var(--bg-color-accent)
      );
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
    width: 140px;
    min-width: 140px;
    max-width: 140px;
    box-sizing: border-box;
  }

  .col-real-name {
    width: 140px;
    min-width: 140px;
    max-width: 140px;
    box-sizing: border-box;
  }

  /* Header sticky corner intersections */
  thead th.sticky-col {
    z-index: 20;
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
    /* Preserve standard bottom border + Subtle underline to hint interactivity */
    box-shadow: 
      0 1px 0 0 color-mix(in srgb, var(--text-primary) 15%, var(--bg-color)),
      inset 0 -2px 0 0 rgba(255, 255, 255, 0.1);
  }

  .interactive-th.active-filter {
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 45%,
      var(--bg-color)
    );
    box-shadow: 
      0 1px 0 0 color-mix(in srgb, var(--text-primary) 15%, var(--bg-color)),
      inset 0 -2px 0 0 var(--primary-color, var(--primary));
  }

  @media (hover: hover) {
    .interactive-th:hover {
      background: color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 20%,
        var(--bg-color)
      );
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
      background: color-mix(
        in srgb,
        var(--primary-color, var(--primary)) 12%,
        var(--bg-color)
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
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color)
    ) !important;
  }

  /* Highlighted Column */
  td.highlighted-col {
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 12%,
      transparent
    ) !important;
  }

  /* Crosshair Intersection */
  tbody tr.highlighted td.highlighted-col {
    background: color-mix(
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
    background: color-mix(
      in srgb,
      var(--primary-color, var(--primary)) 18%,
      var(--bg-color)
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
    gap: 0.5rem;
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
</style>
