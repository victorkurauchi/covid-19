import React, { useState, useEffect, useRef, useMemo, Suspense } from "react"
import serializeForm from "form-serialize"
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link
} from "react-router-dom"

import './i18n';
import { useTranslation } from 'react-i18next';
import logo from './logo.svg';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  let [persons, setPersons] = useState(4)
  let doFocusRef = useRef(false)
  let focusRef = useRef()
  let formRef = useRef()
  let navigate = useNavigate()

  useEffect(() => {
    if (doFocusRef.current === false) {
      doFocusRef.current = true
    } else {
      focusRef.current.focus()
    }
  }, [persons])

  function handleSubmit(event) {
    event.preventDefault()
    let values = serializeForm(event.target, { hash: true }).ages.filter(
      v => v !== "UNSET"
    )
    navigate(`infected/?ages=${values.map(v => v)}`)
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t('Social Distancing')}</h1>
        <p>
          {t('Covid Disclaimer')}
        </p>
      </div>
      <hr />
      <form id="HouseHoldForm" ref={formRef} onSubmit={handleSubmit}>
        {Array.from({ length: persons }).map((_, index, arr) => (
          <label
            key={index}
            ref={arr.length - 1 === index ? focusRef : undefined}
          >
            <span>
              {index === 0 ? t('Your age') : `${t('Household Member')} ${index}`}:
            </span>{" "}
            <AgeSelect defaultValue={index < 2 ? 40 : undefined} />
          </label>
        ))}
        <button type="button" onClick={() => setPersons(persons + 1)}>
          {t('Add another')}
        </button>
        <button type="submit">{t('Next')}</button>
      </form>
    </div>
  );
}

function AgeSelect(props) {
  const { t, i18n } = useTranslation();
  return (
    <select name="ages" {...props}>
      <option value="UNSET">- {t('set an age')}</option>
      {Array.from({ length: 100 }).map((_, index) => (
        <option key={index}>{index}</option>
      ))}
    </select>
  )
}

////////////////////////////////////////////////////////////////////////////////
function Infection() {
  const { t, i18n } = useTranslation();
  let location = useLocation()
  let navigate = useNavigate()
  let ages = parseAges(location.search)
  if (ages === null) {
    setTimeout(() => navigate("/"), [])
    return null
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t(`You're Infected`)}</h1>
        <p>{t(`Let's roll the dice and see if it kills any of your family It probably won't`)}.
          
        </p>
      </div>
      <div id="DiceRolls" className="center">
        {ages.map((age, index) => (
          <DiceRoll key={index} age={age} />
        ))}
      </div>
      <p>
        {t('DisclaimerNotAboutYou')}
      </p>
      <Link className="big-link" to={`/killers${location.search}`}>
        {t('Your Kill Count')} ▸
      </Link>

      <hr />
      <h2>{t('More information')}</h2>
      <p>
        Unless you're over 60, or are immuno-comprimised{" "}
        <i>(lots of your friends and family are!)</i> you're going to have to
        click the button a lot before you die.
      </p>
      <p>So this is just like the flu, right?</p>
      <p>
        Not quite. People have been quoting how many deaths per year there are
        for the flu (
        <a href="https://www.cdc.gov/flu/about/burden/index.html#:~:text=">
          12,000 to 61,000
        </a>
        ) to the deaths so far with coronavirus (
        <a href="https://www.cnn.com/interactive/2020/health/coronavirus-maps-and-cases/">
          ~50
        </a>
        ) in the US.
      </p>
      <p>
        To get the full story you usually have to look at more than static
        numbers. In this case, we need to look at:
      </p>
      <ul>
        <li>{t('Fatality Rate')}</li>
        <li>{t('Infection Growth Rate')}</li>
      </ul>
      <p>
        {t('The flu has a general fatality rate of')} 0.1%
        <br />
        {t(`COVID-19's fatality rate right now is`)} 3.4%
      </p>
      <p>
        <b>
          <a href="https://www.sciencealert.com/covid-19-s-death-rate-is-higher-than-thought-but-it-should-drop">
            {t(`That's 34x`)}
          </a>
        </b>
        . {t('The red bar here is 34 times bigger')}.
      </p>

      <div className="bars">
        <div className="bar covid">
          <span className="padding-adjust">COVID-19</span>
        </div>
        <div className="bar flu">
          <span className="padding-adjust">Influenza</span>
        </div>
      </div>
      <p>
        It's easy to tell this virus is worse even without all the data,{" "}
        <b>the flu doesn't completely overwhelm the health care system</b> in
        Italy each year, but{" "}
        <a href="https://www.theatlantic.com/ideas/archive/2020/03/who-gets-hospital-bed/607807/">
          that's exactly what coronavirus has done
        </a>
        .
      </p>
      <p>But still, only ~50 deaths in the US right? What's the big deal?</p>
      <p>
        The big deal is mixing a fatality rate that's 34x of the flu with
        exponential growth.
      </p>
    </div>
  )
}

// https://www.worldometers.info/coronavirus/coronavirus-age-sex-demographics/
let rates = [
  [9, 0],
  [19, 0.002],
  [29, 0.002],
  [39, 0.002],
  [49, 0.004],
  [59, 0.013],
  [69, 0.036],
  [79, 0.08],
  [79, 0.148]
]

function DiceRoll({ age }) {
  const { t, i18n } = useTranslation();
  let [state, setState] = useState("alive") // alive, dead, rolling
  let [rolls, setRolls] = useState(0)

  let rate = useMemo(() => {
    let rate
    for (let [maxAge, ageRate] of rates) {
      rate = ageRate
      if (age < maxAge) break
    }
    return rate
  }, [age])

  function rollDice() {
    setRolls(rolls + 1)
    setState("rolling")
  }

  useEffect(() => {
    if (state === "rolling") {
      let timer = setTimeout(() => {
        let rando = Math.random()
        if (rando <= rate) {
          setState("dead")
        } else {
          setState("alive")
        }
      }, 200)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [state, rate])

  return (
    <div className="DiceRoll" data-state={state}>
      <div>
        <span aria-label={state} role="img">
          {state === "dead"
            ? "💀"
            : state === "alive"
            ? "😅"
            : state === "rolling"
            ? "🤮"
            : null}
        </span>{" "}
        <span>
          <b>{age} {t('year old')}</b>
          <br />
          {t('Fatality Rate')}: {(rate * 100).toFixed(1)}%
        </span>
      </div>
      <div>
        <button disabled={state === "dead"} onClick={rollDice}>
          {t('Roll the dice')}
        </button>{" "}
        <span>{t('Rolls')}: {rolls}</span>
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////////////////////////
function KillCount({ ages }) {
  const { t, i18n } = useTranslation();
  let [infected, setInfected] = useState(2)
  let [weeks, setWeeks] = useState(1)
  let rate = 0.034
  let Ro = 2

  let killed = Math.round(infected * rate)

  function nextWeek() {
    setInfected(infected * Ro)
    setWeeks(weeks + 1)
  }

  return (
    <div id="KillCount">
      <div aria-hidden="true">
        {Array.from({ length: killed }).map((_, index) => (
          // eslint-disable-next-line
          <span key={index}>💀</span>
        ))}
      </div>
      <p>{t('Week')}: {weeks}</p>
      <p>{t('People You Infected')}: {infected}</p>
      <p>{t('People You Killed')}: {killed}</p>
      <button onClick={nextWeek}>{t('Live another week')}</button>
    </div>
  )
}

function Killers() {
  const { t, i18n } = useTranslation();
  let location = useLocation()
  let navigate = useNavigate()
  let ages = parseAges(location.search)
  if (ages === null) {
    setTimeout(() => navigate("/"), [])
    return null
  }

  return (
    <div id="App">
      <div className="prelude">
        <h1>{t('Your Kill Count')}</h1>
        <p>
          {t('Social Distancing Description')}.
        </p>
      </div>
      <KillCount ages={ages} />
      <p>{t('killcountdescription.part1')}
        {/* So you infect two people, and next week they infect two people each, and
        then they infect two more, etc. etc. */}
      </p>
      <p>
      {t('killcountdescription.part2')}
        {/* So let's say you just came home with the virus. Go ahead and click the
        button once. Now you and two people in your family are infected. Now
        keep clicking it to see how many people's deaths you could have avoided
        by staying home. */}
      </p>
      <p>
        {t(`So please, stay home And while you're there`)}{" "}
        <a href="https://www.washingtonpost.com/graphics/2020/world/corona-simulator/">
          {t(`I think this article is worth your time`)}
        </a>
        . {t('Extreme social distancing, the kind that feels like overreacting seems to be our only option right now')}.
      </p>
      <hr />
      <h2>{t('More information')}</h2>
      <p>
        <Link to={`/infected${location.search}`}>
          {t('On the previous page we looked at the fatality rate')}
        </Link>{" "}
        {t(`of COVID-19 and saw that statistically, you and your family will probably be fine, but social distancing isn't about you`)}.
      </p>
      <p>
        {t('statistics.part1')}
      </p>
      <p>
      {t('statistics.part2')}
      </p>
      <a
        style={{ display: "block", border: "solid 1px" }}
        href="https://www.worldometers.info/coronavirus/country/us/"
      >
        <img
          style={{ width: "100%" }}
          alt="graph showing a nearly perfect algorithmic growth rate"
          src="/graph.png"
        />
      </a>
      <p>
        The <i>Attack Rate</i> of COVID-19 is estimated by the World Health
        Organization to be{" "}
        <a href="https://www.worldometers.info/coronavirus/#repro">
          {t('between')} 1.4 {t('and')} 2.5
        </a>
        . {t('statistics.part3')}
      </p>
      <p>{t('statistics.part4')}
        {" "}
        <i>{t('now')}</i>– {t('even before the government tells you to')}.
      </p>
      <img
        style={{ width: "100%" }}
        alt="chart showing US's nearly identical numbers to Italy, just 10 days behind"
        src="/chart.jpg"
      />
      <h2 className="center">{t('STAY HOME PLZ')} 😇</h2>
    </div>
  )
}

function parseAges(search) {
  let params = new URLSearchParams(search)
  try {
    return params
      .get("ages")
      .split(",")
      .map(str => Number(str))
  } catch (e) {
    return null
  }
}

function AppRoot() {
  let location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/infected" element={<Infection />} />
      <Route path="/killers" element={<Killers />} />
    </Routes>
  )
}

const Loader = () => (
  <div className="App">
    <img src={logo} className="App-logo" alt="logo" />
    <div>loading...</div>
  </div>
);

function AvailableLanguages() {
  const { t, i18n } = useTranslation();

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ float: 'right' }}>
      <button className="button-flag" onClick={(e) => { e.preventDefault(); changeLanguage('pt-br') }}>🇧🇷</button>
      <button className="button-flag" onClick={(e) => { e.preventDefault(); changeLanguage('en')}}>🇺🇸</button>
    </div>
  )
}
export default () => (
  <Suspense fallback={<Loader />}>
    <BrowserRouter>
      <AppRoot />
      <p className="center">
        <small>
          Made by Ryan Florence
          <br />
          Anybody can use anything from this for whatever they want.
          <br />
          It's on <a href="https://github.com/ryanflorence/covid-19">GitHub</a>
        </small>
      </p>

      <AvailableLanguages/>
      
    </BrowserRouter>
  </Suspense>
)
