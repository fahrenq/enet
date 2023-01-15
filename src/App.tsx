import {useState} from 'preact/hooks'
import MainMenu from "./components/MainMenu";
import React from "preact/compat";
import Game, {Stats} from "./components/Game";
import Result from "./components/Result";

const TIME_LIMIT = 45

export default function App() {
  const [screen, setScreen] = useState<'main-menu' | 'infinite-game' | 'time-trial-game' | 'result'>('main-menu')

  const [resultScreenStats, setResultScreenStats] = useState<Stats | undefined>(undefined)

  return (
    <>
      <div
        class="flow-root font-sans max-w-[400px] w-full h-[400px] bg-repeat bg-[url('assets/enet-background.png')] animate-[bg-diagonal-movement_20s_linear_infinite] border border-2 border-amber-300 box-border">
        {screen === 'main-menu' && <MainMenu
            onTimeTrialStart={() => setScreen('time-trial-game')} onInfiniteStart={() => setScreen('infinite-game')}/>}
        {screen === 'infinite-game' && <Game
            onBack={() => setScreen('main-menu')} timeLimit={undefined}/>}
        {screen === 'time-trial-game' && <Game
            onBack={() => setScreen('main-menu')} timeLimit={TIME_LIMIT} onGameOver={(stats) => {
          setResultScreenStats(stats)
          setScreen('result')
        }}/>}

        {screen === 'result' && <Result
            timeLimit={TIME_LIMIT}
            stats={resultScreenStats!} onMainMenu={() => {
          setResultScreenStats(undefined)
          setScreen('main-menu')
        }}/>}
      </div>
    </>
  )
}
