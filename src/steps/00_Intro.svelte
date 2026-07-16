<script>
  import Block from "../components/layout/Block.svelte";
  import SubBlock from "../components/layout/SubBlock.svelte";
  import HintBox from "../components/ui/HintBox.svelte";
  import RichText from "../components/ui/RichText.svelte";
  import "@material/web/icon/icon.js";
  import { dict } from "../locales/ru.js";
  import { CONTACTS } from "../constants.js";
</script>

<Block title={dict.steps.intro.title}>
  <div class="intro-content">
    <HintBox>
      <RichText content={dict.steps.intro.hint1} />
    </HintBox>

    <SubBlock title={dict.steps.intro.datesTitle} stickyLevel={2}>
      <p><RichText content={dict.steps.intro.datesSubtitle} /></p>
      <ul class="intro-list">
        {#each dict.steps.intro.datesList as item}
          <li><RichText content={item} /></li>
        {/each}
      </ul>
    </SubBlock>

    <SubBlock title={dict.steps.intro.contactsTitle} stickyLevel={2}>
      <p><RichText content={dict.steps.intro.contactsSubtitle} /></p>
      <ul class="intro-list">
        {#each CONTACTS as contact}
          <li>
            <a href={contact.phoneLink} class="contact-link">{contact.phone}</a>
            —
            <strong>{contact.name}</strong>
            (<strong class="text-primary">{contact.nick}</strong>)
          </li>
        {/each}
      </ul>
    </SubBlock>

    <HintBox>
      {dict.steps.intro.hint2Prefix}<md-icon class="inline-icon"
        >settings</md-icon
      >{dict.steps.intro.hint2Suffix}
    </HintBox>
  </div>
</Block>

<style>
  .intro-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .block-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .intro-list {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  p {
    margin: 0;
  }

  .contact-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }

  .contact-link:hover {
    text-decoration: underline;
  }

  .inline-icon {
    vertical-align: text-bottom;
    color: var(--primary);
    font-size: 1.5em;
    margin: 0 2px;
    transform: translateY(4px);
  }
</style>
