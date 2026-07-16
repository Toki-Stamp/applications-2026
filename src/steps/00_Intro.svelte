<script>
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import Block from "../components/layout/Block.svelte";
</script>

<Block title="Вводная информация">
  <div class="intro-content">
    <HintBox>
      Дорогие друзья, нас ждёт <strong class="text-primary">ЮБИЛЕЙНАЯ</strong>
      сходка! Нам исполняется <strong class="text-primary">15</strong> лет!
    </HintBox>

    <SubBlock title="Даты проведения" stickyLevel={2}>
      <p><strong>с 7 по 9 августа 2026 года</strong> (3 дня)</p>
      <ul>
        <li><strong>Пятница:</strong> шоу начинается</li>
        <li><strong>Суббота:</strong> без забот</li>
        <li><strong>Воскресенье:</strong> ну вот, опять домой</li>
      </ul>
    </SubBlock>

    <SubBlock title="Контакты организаторов" stickyLevel={2}>
      <p><strong>Для решения организационных вопросов:</strong></p>
      <ul>
        <li>
          <a href="tel:+375298587070">+375 (29) 858-7070</a> —
          <strong>Юрий Фомичёв</strong>
          (<strong class="highlight-name">Booze</strong>)
        </li>
        <li>
          <a href="tel:+375336604048">+375 (33) 660-4048</a> —
          <strong>Алексей Лужинский</strong>
          (<strong class="highlight-name">krez_by</strong>)
        </li>
      </ul>
    </SubBlock>

    <HintBox>
      Кстати, вы можете настроить внешний вид приложения под себя! Нажмите на
      <md-icon class="inline-icon">settings</md-icon>
      в левом верхнем углу, чтобы выбрать любимую цветовую тему
    </HintBox>
  </div>
</Block>

<style>
  .intro-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 1.1rem;
  }

  .intro-content ul {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .intro-content p {
    margin: 0 0 0.5rem 0;
  }

  strong {
    color: var(--text-primary);
  }

  .highlight-name {
    color: var(--primary);
  }

  .text-primary {
    color: var(--primary);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }

  .inline-icon {
    vertical-align: text-bottom;
    color: var(--primary);
    font-size: 1.5em;
    margin: 0 2px;
    transform: translateY(4px);
  }
</style>
