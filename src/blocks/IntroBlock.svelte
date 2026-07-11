<script>
  import SubBlockCard from "../components/SubBlockCard.svelte";
  import HintBox from "../components/HintBox.svelte";
</script>

<div class="block-card">
  <h2 class="block-title">Вводная информация</h2>
  <div class="badge-container">
    <div class="anniversary-badge">🎉 Юбилейная сходка — 15 лет! 🎉</div>
  </div>

  <div class="intro-content">
    <SubBlockCard title="Даты проведения" stickyLevel={2}>
      <p><strong>с 7 по 9 августа 2026 года</strong> (3 дня)</p>
      <ul>
        <li><strong>Пятница:</strong> шоу начинается</li>
        <li><strong>Суббота:</strong> без забот</li>
        <li><strong>Воскресенье:</strong> ну вот, опять домой</li>
      </ul>
    </SubBlockCard>

    <SubBlockCard title="Контакты организаторов" stickyLevel={2}>
      <p>Для решения организационных вопросов:</p>
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
    </SubBlockCard>

    <HintBox>
      Нажмите кнопку
      <strong class="text-primary">НАЧАТЬ ЗАПОЛНЕНИЕ</strong>, чтобы перейти к
      форме заявки
    </HintBox>
  </div>
</div>

<style>
  .intro-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 1.1rem;
  }

  .badge-container {
    text-align: center;

    .anniversary-badge {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: var(--text-primary);
      padding: 0.5rem 1.5rem;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      font-size: 1.1rem;
      box-shadow: 0 0 15px var(--primary-glow);
      animation: pulse 2s infinite;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
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
</style>
