// front-page.jsx — Hojvang Okologi homepage prototype
// Full store front page with embedded delivery timeline.
// variant prop: 'order' | 'del' | 'fuld'
//   order -> monthly order timeline only
//   del   -> order timeline + preorder summary
//   fuld  -> order timeline + full preorder flow

import React from 'react';
import { OrderTimeline } from './order-timeline.jsx';
import { PreorderTimeline } from './preorder-timeline.jsx';
import { PreorderFullTimeline } from './preorder-full-timeline.jsx';
import { HeaderBanner } from './header-banner.jsx';

const LOGO = 'https://hojvangokologi.myshopify.com/cdn/shop/files/logo-primary.png?v=1754249989';
const HERO_IMG = 'https://hojvangokologi.myshopify.com/cdn/shop/files/DSC01602.jpg?v=1754554032&width=1920';
const FRA_BONDE_IMG = 'https://hojvangokologi.myshopify.com/cdn/shop/files/image0.png?v=1754556563&width=800';
const LUKSUS_IMG = 'https://hojvangokologi.myshopify.com/cdn/shop/files/luksuskasse-lar-og-rygkod-u-ben-ca-15-kg-4469065.jpg?height=600';
const CULOTTE_IMG = 'https://hojvangokologi.myshopify.com/cdn/shop/files/culotte-ca-2-kg-5856351.jpg?height=600';
const HAKKET_IMG = 'https://hojvangokologi.myshopify.com/cdn/shop/files/10kg-2.jpg?height=600';

const G = '#2a4e28';
const CR = '#f5f3ee';
const CH = '#3c3e3f';

// SVG paths extracted 1:1 from hojvangokologi.myshopify.com
const ICON_HEART = (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill={G}>
    <path d="M10 5.2393L8.5149 3.77392C6.79996 2.08174 4.01945 2.08174 2.30451 3.77392C0.589562 5.4661 0.589563 8.2097 2.30451 9.90188L10 17.4952L17.6955 9.90188C19.4104 8.2097 19.4104 5.4661 17.6955 3.77392C15.9805 2.08174 13.2 2.08174 11.4851 3.77392L10 5.2393ZM10.765 3.06343C12.8777 0.978857 16.3029 0.978856 18.4155 3.06343C20.5282 5.148 20.5282 8.52779 18.4155 10.6124L10.72 18.2057C10.3224 18.5981 9.67763 18.5981 9.27996 18.2057L1.58446 10.6124C-0.528154 8.52779 -0.528154 5.14801 1.58446 3.06343C3.69708 0.978859 7.12233 0.978858 9.23495 3.06343L10 3.81832L10.765 3.06343Z" fillRule="evenodd" />
  </svg>
);

const ICON_LEAF = (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill={G}>
    <path d="M15.9633 5.16568C16.1818 5.33464 16.2219 5.64867 16.0529 5.86709L11.2315 12.1C10.7573 12.7132 10.5 13.4664 10.5 14.2415L10.5 17.728C10.5 18.0041 10.2761 18.228 9.99998 18.228C9.72384 18.228 9.49998 18.0041 9.49998 17.728L9.49997 14.2415C9.49997 13.2449 9.8308 12.2765 10.4406 11.4882L15.2619 5.25525C15.4309 5.03683 15.7449 4.99673 15.9633 5.16568Z" />
    <path d="M4.13656 9.11047C3.94637 9.31067 3.95448 9.62715 4.15469 9.81735L8.41061 13.8605C9.10616 14.5213 9.49997 15.4386 9.49997 16.398V19.5C9.49997 19.7761 9.72383 20 9.99997 20C10.2761 20 10.5 19.7761 10.5 19.5V16.398C10.5 15.1645 9.99364 13.9851 9.09936 13.1355L4.84344 9.09235C4.64324 8.90216 4.32676 8.91027 4.13656 9.11047Z" />
    <path d="M18.3779 1.53927C18.4327 2.29021 18.4725 3.32703 18.4047 4.40738C18.3125 5.87411 18.0299 7.25745 17.4545 8.14562C16.7167 9.28439 15.6883 9.90008 14.7112 10.1459C13.6919 10.4023 12.8474 10.2333 12.4595 9.98203C11.6151 9.43502 10.6657 7.26257 12.1639 4.95007C12.7171 4.09609 13.9498 3.29603 15.4075 2.63437C16.4929 2.1417 17.5917 1.77412 18.3779 1.53927ZM18.7295 0.399095C19.0125 0.322287 19.2884 0.513872 19.3179 0.805582C19.4683 2.2906 19.735 6.46465 18.2937 8.68934C16.5205 11.4265 13.2903 11.7118 11.9158 10.8213C10.5413 9.93084 9.57124 7.11282 11.3246 4.40636C12.7665 2.18066 17.2 0.814295 18.7295 0.399095Z" fillRule="evenodd" />
    <path d="M1.16197 6.23639C1.24915 6.80305 1.38541 7.51404 1.5922 8.22877C1.89834 9.28691 2.31835 10.2055 2.84189 10.729C3.54804 11.4352 4.37904 11.7175 5.11404 11.7439C5.89258 11.7719 6.44282 11.5154 6.64245 11.3158C7.09947 10.8588 7.49486 9.18578 6.0474 7.73833C5.55144 7.24237 4.58274 6.85006 3.40831 6.58298C2.60103 6.3994 1.79173 6.29511 1.16197 6.23639ZM0.569611 5.18777C0.276949 5.16998 0.0467941 5.41364 0.080866 5.70486C0.226586 6.95034 0.719124 10.0205 2.13478 11.4362C3.93434 13.2357 6.44588 12.9266 7.34955 12.0229C8.25323 11.1193 8.53389 8.8106 6.75451 7.03122C5.33581 5.61253 1.90298 5.26882 0.569611 5.18777Z" fillRule="evenodd" />
  </svg>
);

const ICON_STAR = (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill={G}>
    <path d="M10 2.62639L8.54072 7.33639C8.34848 7.95687 7.79714 8.37696 7.17504 8.37696H2.45272L6.27316 11.2879C6.77645 11.6714 6.98704 12.3511 6.7948 12.9716L5.33552 17.6816L9.15596 14.7706C9.65925 14.3872 10.3408 14.3872 10.844 14.7706L14.6645 17.6816L13.2052 12.9716C13.013 12.3511 13.2236 11.6714 13.7268 11.2879L17.5473 8.37696H12.825C12.2029 8.37696 11.6515 7.95687 11.4593 7.33639L10 2.62639ZM10.4552 0.846855C10.3119 0.384382 9.68806 0.384382 9.54477 0.846855L7.63027 7.02616C7.56619 7.23298 7.38241 7.37301 7.17504 7.37301H0.979572C0.515888 7.37301 0.323098 7.99527 0.698226 8.28109L5.71047 12.1001C5.87823 12.2279 5.94843 12.4545 5.88435 12.6613L3.96984 18.8406C3.82656 19.3031 4.33129 19.6877 4.70642 19.4019L9.71865 15.5828C9.88642 15.455 10.1136 15.455 10.2813 15.5828L15.2936 19.4019C15.6687 19.6877 16.1734 19.3031 16.0302 18.8406L14.1157 12.6613C14.0516 12.4545 14.1218 12.2279 14.2895 12.1001L19.3018 8.28109C19.6769 7.99527 19.4841 7.37301 19.0204 7.37301H12.825C12.6176 7.37301 12.4338 7.23298 12.3697 7.02616L10.4552 0.846855Z" fillRule="evenodd" />
  </svg>
);

const ICON_COW = (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill={G}>
    <path d="M10 7.22864C5.83597 7.22864 2.44179 10.6819 2.44179 14.9649C2.44179 15.241 2.21794 15.4649 1.94179 15.4649C1.66565 15.4649 1.44179 15.241 1.44179 14.9649C1.44179 10.1503 5.2632 6.22864 10 6.22864C14.7369 6.22864 18.5583 10.1503 18.5583 14.9649C18.5583 15.241 18.3344 15.4649 18.0583 15.4649C17.7821 15.4649 17.5583 15.241 17.5583 14.9649C17.5583 10.6819 14.1641 7.22864 10 7.22864Z" />
    <path d="M0.473022 14.9867C0.473022 14.7106 0.69688 14.4867 0.973022 14.4867H19.027C19.3032 14.4867 19.527 14.7106 19.527 14.9867C19.527 15.2628 19.3032 15.4867 19.027 15.4867H0.973022C0.69688 15.4867 0.473022 15.2628 0.473022 14.9867Z" />
    <path d="M6.09332 9.9023C6.15244 10.0271 6.09921 10.1761 5.97443 10.2353C5.51339 10.4537 4.52514 11.2638 4.43389 12.6935C4.4251 12.8313 4.30627 12.9358 4.16847 12.927C4.03068 12.9183 3.92611 12.7994 3.93491 12.6616C4.04068 11.0045 5.18149 10.0577 5.76036 9.78341C5.88513 9.72429 6.03421 9.77752 6.09332 9.9023Z" />
    <path d="M10.4906 5.04834H9.5095C8.95722 5.04834 8.5095 5.49605 8.5095 6.04834V6.1947H11.4906V6.04834C11.4906 5.49606 11.0429 5.04834 10.4906 5.04834ZM9.5095 4.04834C8.40493 4.04834 7.5095 4.94377 7.5095 6.04834V7.1947H12.4906V6.04834C12.4906 4.94377 11.5952 4.04834 10.4906 4.04834H9.5095Z" fillRule="evenodd" />
  </svg>
);

const FEATURES = [
  { icon: ICON_HEART, title: 'Kød med klimaværdi',       desc: 'Ved at binde CO₂ i jorden gennem naturplejen og regenerativt landbrug producerer vi økologisk oksekød med omtanke for klimaet.' },
  { icon: ICON_LEAF,  title: 'Naturpleje & biodiversitet', desc: 'Når vores dyr græsser på naturarealerne holder de bevoksningen nede, så arealerne ikke gror til, og der bliver i stedet plads til truede insekter og blomsterarter.' },
  { icon: ICON_COW,   title: 'Græsfodret & økologisk',    desc: 'Kvæget lever hovedsageligt af græs, græsensilage og urter fra naturarealerne, hvilket giver sundere kød med mere smag, højere indhold af vitaminer og umættede fedtsyrer.' },
  { icon: ICON_STAR,  title: 'Smag & mørhed i særklasse', desc: 'Takket være det græsbaserede foder kan vi krogmodne oksekødet i mindst fire uger, hvilket giver kødet en smag som skiller sig ud - og mørhed, hvis man tager en lille smule hensyn til det i tilberedningen.' },
];

const IconCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="22" height="22"
    stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconAccount = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="22" height="22"
    stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ─── Shared section content: centered title + subtitle + timeline card ──────
// Used in both standalone artboards (app.jsx) and embedded in FPDeliveries.
// timelineHeight = height of the inner timeline component (not counting header).
export function TidslinjeSectionContent({ TimelineComponent, width, timelineHeight, subtitle, title = 'Månedlige leveringer', titleColor = '#000' }) {
  return (
    <div style={{ width, background: CR, boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', padding: '32px 48px 20px' }}>
        <h2 style={{
          font: '400 40px/1.1 "DM Serif Display", serif',
          color: titleColor, margin: '0 0 10px',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ font: '400 16px/1.5 "Work Sans", sans-serif', color: '#000', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      <TimelineComponent width={width} height={timelineHeight} />
    </div>
  );
}

// ─── Front page ─────────────────────────────────────────────────────────────
export function FrontPage({ width = 1200, height = 820, variant = 'order', standalone = false }) {
  const showForudbestilling = variant === 'del' || variant === 'fuld';
  const ForudComponent = variant === 'fuld' ? PreorderFullTimeline : PreorderTimeline;
  const scrollRef = React.useRef(null);
  const heroSentinelRef = React.useRef(null);
  const [navDark, setNavDark] = React.useState(true);

  React.useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;
    const root = standalone ? null : scrollRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setNavDark(entry.isIntersecting),
      { root, rootMargin: '-116px 0px 0px 0px', threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [standalone]);

  return (
    <div ref={scrollRef} style={standalone ? {
      width: '100%',
      fontFamily: '"Work Sans", system-ui, sans-serif',
      background: CR, color: CH,
      boxSizing: 'border-box',
    } : {
      width, height,
      overflowY: 'scroll', overflowX: 'hidden',
      fontFamily: '"Work Sans", system-ui, sans-serif',
      background: CR, color: CH,
      scrollbarWidth: 'none', msOverflowStyle: 'none',
      boxSizing: 'border-box',
    }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <HeaderBanner />
        <FPNav dark={navDark} />
      </div>
      <FPHero sentinelRef={heroSentinelRef} />
      <FPFeatures />
      <FPFraBonde />
      <FPDeliveriesSection TimelineComponent={OrderTimeline} bottomPad={showForudbestilling ? 0 : 72} />
      {showForudbestilling && (
        <FPDeliveriesSection
          TimelineComponent={ForudComponent}
          title="Forudbestilling"
          titleColor="#000"
          subtitle="Forudbestil til en kommende levering."
          topPad={0}
        />
      )}
      <FPProduct img={LUKSUS_IMG} label="Vores anbefaling"         name="Luksuskasse"     desc="Få alt det bedste kød på dyret. En kasse fyldt med lækre udskæringer fra hele dyret." cta="Se indhold" dark reverse={false} />
      <FPProduct img={CULOTTE_IMG} label="En klassiker med karakter" name="Culotte"        desc="Culottestegen er en af de mest populære udskæringer. Saftig, mørt og fuld af smag."   cta="Bestil nu" dark={false} reverse />
      <FPProduct img={HAKKET_IMG}  label="Mest populært"            name="Hakket oksekød" desc="Rent, fedt og smagfuldt hakket oksekød direkte fra marken til dit bord."               cta="Bestil nu" dark reverse={false} />
      <FPNewsletter />
      <FPFooter />
    </div>
  );
}

// ─── Nav (exported for standalone header artboard) ──────────────────────────
export function FPNav({ dark = false }) {
  const bg  = dark ? 'transparent' : CR;
  const fg  = dark ? CR : G;  // rich green on light, cream on dark
  const border = dark ? 'none' : `1px solid rgba(0,0,0,0.06)`;

  return (
    <nav style={{
      background: bg, borderBottom: border,
      height: 72, display: 'flex', alignItems: 'center',
      padding: '0 48px', gap: 36, boxSizing: 'border-box',
    }}>
      <img src={LOGO} alt="Højvang Økologi" height={38} style={{ objectFit: 'contain', display: 'block' }} />
      <div style={{ flex: 1 }} />
      {['Produkter', 'Om os', 'Blog', 'Kontakt'].map(label => (
        <a key={label} href="#" style={{
          font: '700 13px/1 "Montserrat", sans-serif',
          letterSpacing: '0.06em', color: fg, textDecoration: 'none',
        }}>{label.toUpperCase()}</a>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: fg }}>
        <button aria-label="Konto" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 4 }}>
          <IconAccount />
        </button>
        <button aria-label="Indkøbskurv" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 4 }}>
          <IconCart />
        </button>
      </div>
    </nav>
  );
}

function FPHero({ sentinelRef }) {
  return (
    <div style={{ position: 'relative', height: 560, overflow: 'hidden', marginTop: -72 }}>
      <img src={HERO_IMG} alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '34% 72%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.10) 55%, transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 72, gap: 28 }}>
        <h1 style={{ font: '400 clamp(2.4rem,4.2vw,3.8rem)/1.1 "DM Serif Display", serif', color: CR, textAlign: 'center', maxWidth: 580, textShadow: '0 2px 24px rgba(0,0,0,0.28)', margin: 0 }}>
          Økologisk oksekød, der gavner naturen
        </h1>
        <a href="#" style={{ font: '400 16px/1 "Work Sans", sans-serif', background: G, color: CR, padding: '16px 36px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>Bestil nu</a>
      </div>
      <div ref={sentinelRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }} />
    </div>
  );
}

function FPFeatures() {
  return (
    <div style={{ background: CR, padding: '56px 48px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 36, boxSizing: 'border-box' }}>
      {FEATURES.map(f => (
        <div key={f.title} style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{f.icon}</div>
          <h3 style={{ font: '400 18px/1.2 "DM Serif Display", serif', color: '#000', marginBottom: 8 }}>{f.title}</h3>
          <p style={{ font: '400 14px/1.65 "Work Sans", sans-serif', color: CH, margin: 0 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function FPFraBonde() {
  return (
    <div style={{ background: G, padding: '72px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', boxSizing: 'border-box' }}>
      <img src={FRA_BONDE_IMG} alt="Ole og Andreas - Højvang Gård"
        style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12, display: 'block' }} />
      <div>
        <h2 style={{ font: '400 40px/1.1 "DM Serif Display", serif', color: CR, margin: '0 0 24px' }}>
          Fra bonde til kunde
        </h2>
        <p style={{ font: '400 16px/1.75 "Work Sans", sans-serif', color: CR, margin: 0 }}>
          Hos Højvang Økologi springer vi mellemleddene over. Du handler direkte med os, Ole og Andreas, landmændene, far og søn, der passer dyrene og naturarealerne. Dit økologiske oksekød kommer fra vores egne dyr, og vi leverer det personligt til din dør. Det betyder friskere kød, færre omkostninger og større gennemsigtighed - fra bonde til kunde.
        </p>
      </div>
    </div>
  );
}

// Embeds a TidslinjeSectionContent without shadow or separate heading.
// Uses ResizeObserver so the timeline scales correctly at any container width.
function FPDeliveriesSection({ TimelineComponent, title, titleColor, subtitle = 'Vi har som regel dyr klar, så vi kan levere en gang om måneden.', topPad = 72, bottomPad = 72 }) {
  const outerRef = React.useRef(null);
  const [tlW, setTlW] = React.useState(1104);

  React.useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTlW(Math.max(1, el.clientWidth - 96)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ background: CR, padding: `${topPad}px 48px ${bottomPad}px`, boxSizing: 'border-box' }}>
      <TidslinjeSectionContent
        TimelineComponent={TimelineComponent}
        width={tlW}
        subtitle={subtitle}
        title={title}
        titleColor={titleColor}
      />
    </div>
  );
}

function FPProduct({ img, label, name, desc, cta, dark, reverse }) {
  const bg = dark ? G : CR;
  const fg = dark ? CR : CH;
  const hdg = dark ? CR : '#000';
  const btnBg = dark ? CR : G;
  const btnFg = dark ? G : CR;
  const labelFg = dark ? 'rgba(245,243,238,0.65)' : '#5c6b5a';

  const textBlock = (
    <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
      <p style={{ font: '500 11px/1 "Montserrat", sans-serif', color: labelFg, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{label}</p>
      <h2 style={{ font: '400 46px/1.0 "DM Serif Display", serif', color: hdg, margin: 0 }}>{name}</h2>
      <p style={{ font: '400 16px/1.7 "Work Sans", sans-serif', color: fg, margin: 0 }}>{desc}</p>
      <a href="#" style={{ display: 'inline-block', alignSelf: 'flex-start', font: '400 15px/1 "Work Sans", sans-serif', background: btnBg, color: btnFg, padding: '14px 28px', borderRadius: 8, textDecoration: 'none', marginTop: 4 }}>{cta}</a>
    </div>
  );
  const imgBlock = (
    <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  );

  return (
    <div style={{ background: bg, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 460, boxSizing: 'border-box' }}>
      {reverse ? <>{textBlock}{imgBlock}</> : <>{imgBlock}{textBlock}</>}
    </div>
  );
}

function FPNewsletter() {
  return (
    <div style={{ background: CR, padding: '72px 48px', textAlign: 'center', boxSizing: 'border-box' }}>
      <h2 style={{ font: '400 36px/1.1 "DM Serif Display", serif', color: G, margin: '0 0 12px' }}>
        Modtag vores nyhedsbrev
      </h2>
      <p style={{ font: '400 16px/1.6 "Work Sans", sans-serif', color: CH, margin: '0 0 32px' }}>
        Få besked om næste levering, nye produkter og tilbud.
      </p>
      <div style={{ display: 'flex', maxWidth: 420, margin: '0 auto' }}>
        <input placeholder="Mailadresse" readOnly style={{ flex: 1, padding: '14px 18px', border: '1px solid rgba(0,0,0,0.2)', borderRight: 'none', borderRadius: '8px 0 0 8px', font: '400 15px/1 "Work Sans", sans-serif', background: 'rgba(255,255,255,0.8)', outline: 'none', color: '#888' }} />
        <button style={{ padding: '14px 22px', background: G, color: CR, border: 'none', borderRadius: '0 8px 8px 0', font: '400 15px/1 "Work Sans", sans-serif', cursor: 'pointer' }}>Tilmeld</button>
      </div>
    </div>
  );
}

function FPFooter() {
  return (
    <div style={{ background: CR, borderTop: '1px solid rgba(0,0,0,0.07)', padding: '22px 48px', display: 'flex', alignItems: 'center', gap: 24, font: '400 13px/1 "Work Sans", sans-serif', color: CH, boxSizing: 'border-box' }}>
      <span>© 2026 Højvang Økologi</span>
      <a href="#" style={{ color: CH }}>Vilkår og politikker</a>
      <div style={{ flex: 1 }} />
      <span style={{ opacity: 0.7 }}>Facebook · Instagram</span>
    </div>
  );
}

// Standalone nav prototype — cream (default) or transparent-on-green variant
export function NavPrototype({ width = 1200, height = 72, dark = false }) {
  return (
    <div style={{ width, height, overflow: 'hidden', background: dark ? G : CR, boxSizing: 'border-box' }}>
      <FPNav dark={dark} />
    </div>
  );
}
