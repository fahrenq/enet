import {Stats} from "./Game";

export default function Result(
  {
    stats,
    timeLimit,
    onMainMenu
  }: {
    stats: Stats, timeLimit: number, onMainMenu: () => void
  }) {
  return (
    <div>
      <div class="bg-white/[.7] mt-10">
        <div class="text-center text-3xl">Resultat</div>
      </div>

      <div class="mt-20 bg-white/[.7] text-xl text-center">
        I {timeLimit} sekunder, fik du {stats.currentScore} ud af {stats.totalWords} rigtige.
        <br/>
        Din bedste streak var {stats.bestStreak}.
      </div>

      <div class="mt-28 flex flex-col items-center gap-2">
        <div
          class="p-2 bg-white/[.9] rounded w-48 text-center border border-amber-300 border-4 cursor-pointer hover:border-amber-500 transition select-none"
          onClick={onMainMenu}>
          Hovedmenu
        </div>
      </div>
    </div>
  )
}
