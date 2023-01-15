export default function MainMenu({
                                   onTimeTrialStart,
                                   onInfiniteStart
                                 }: { onTimeTrialStart: () => void, onInfiniteStart: () => void }) {
  return (
    <div>
      <div class="bg-white/[.7] mt-10">
        <div class="text-center text-3xl">ENET</div>
        <div class="text-center">Hvilket køn er dette navneord?</div>
      </div>

      <div class="mt-28 flex flex-col items-center gap-2">
        <div
          class="p-2 bg-white/[.9] rounded w-48 text-center border border-amber-300 border-4 cursor-pointer hover:border-amber-500 transition select-none"
          onClick={onTimeTrialStart}>
          Time Trial
        </div>
        <div
          class="p-2 bg-white/[.9] rounded w-48 text-center border border-amber-300 border-4 cursor-pointer hover:border-amber-500 transition select-none"
          onClick={onInfiniteStart}>
          Uendelig Øvelse
        </div>
      </div>
    </div>
  )
}
