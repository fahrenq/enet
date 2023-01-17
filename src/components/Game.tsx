import {useEffect, useReducer, useRef, useState} from "preact/compat";
// import wordListUrl from '../assets/substantiver.tsv?url';
import wordListUrl from '../assets/top-3000-non-ambiguous-substantiver.tsv?url';

interface Word {
  word: string;
  koen: string;
}

const pastWordsClassFromIdx = (idx: number) => {
  switch (idx) {
    case 0:
      return 'scale-100 animate-[popup_200ms_ease-out_1]';
    case 1:
      return 'scale-[0.8] opacity-50';
    case 2:
      return 'scale-[0.65] opacity-25';
    default:
      return 'scale-100';
  }
}

const streakEmoji = (streak: number) => {
  if (streak < 5) {
    return '😐';
  }
  if (streak < 10) {
    return '🙃';
  }
  if (streak < 15) {
    return '🍆';
  }
  if (streak < 20) {
    return '🥸';
  }
  if (streak < 25) {
    return '😆';
  }
  if (streak < 30) {
    return '🌝';
  }
  if (streak < 35) {
    return '🙋‍';
  }
  if (streak < 40) {
    return '😡';
  }
  if (streak < 45) {
    return '🙀';
  }
  return '🧨🇩🇰';
}


function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomSelection<T>(arr: T[], predicate: (item: T) => boolean, count: number): T[] {
  const eligibleItems = arr.filter(predicate);
  return shuffleArray(eligibleItems).slice(0, count);
}


const InfinitySign = () => {
  return (
    <svg viewBox="0 0 2703.214 1272.608" class="h-4">
      <g>
        <g>
          <path d="M72.373,651.52C62.109,212.429,541.276-95.972,961.842,145.033c138.551,79.397,256.167,196.988,382.632,325.418
        c5.749,5.839,8.404,5.236,13.785-0.188c197.808-199.402,484.222-503.454,885.399-385.157
        c168.833,49.784,286.15,159.321,346.255,324.377c201.16,552.413-375.869,1009.769-870.693,706.588
        c-124.801-76.466-232.581-181.978-359.98-311.726c-6.801-6.927-9.868-5.946-16.086,0.324
        c-144.739,145.956-300.538,304.607-492.977,371.024C458.575,1310.846,83.17,1077.492,72.373,651.52z M317.418,643.008
        c12.485,253.639,207.59,371.88,415.468,326.918c179.653-38.857,330.36-196.86,458.721-328.811c4.325-4.446,1.9-6.251-1.072-9.025
        c-111.488-104.066-220.365-231.184-357.581-296.6C567.01,208.705,316.523,394.639,317.418,643.008z M2385.265,632.288
        c-7.903-245.124-201.289-378.703-424.132-326.433c-175.334,41.126-325.161,198.381-449.641,326.279
        c-4.318,4.437-2.66,6.509,0.879,9.811c155.637,145.245,339.3,374.567,587.443,332.772
        C2265.103,946.877,2385.634,802.91,2385.265,632.288z"/>
        </g>
      </g>
    </svg>
  )
}

const RestartIcon = () => {
  return (<svg class="h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_429_11071)">
      <path
        d="M12 2.99982C16.9706 2.99982 21 7.02925 21 11.9998C21 16.9704 16.9706 20.9998 12 20.9998C7.02944 20.9998 3 16.9704 3 11.9998C3 9.17255 4.30367 6.64977 6.34267 4.99982"
        stroke="#292929" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 4.49982H7V8.49982" stroke="#292929" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_429_11071">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>)
}

export interface Stats {
  currentScore: number;
  currentStreak: number;
  totalWords: number;
  bestStreak: number;
}

export default function Game({
                               timeLimit,
                               onGameOver,
                               onBack,
                             }: { timeLimit?: number, onGameOver?: (result: Stats) => void, onBack: () => void }) {
  const [selectedWords, setSelectedWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)

  const [currentStats, setCurrentStats] = useState<Stats>({
    currentScore: 0,
    currentStreak: 0,
    totalWords: 0,
    bestStreak: 0,
  })
  const [pastWords, setPastWords] = useState<[Word, boolean][]>([])

  const [timePassed, setTimePassed] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  useEffect((() => {
    if (timeLimit) {

      if (timePassed >= timeLimit) {
        setIsGameOver(true)
      }

      const to = setTimeout(() => {
        setTimePassed(timePassed + 1);
      }, 1000)
      return () => clearTimeout(to)
    }
  }), [timePassed])

  useEffect(() => {
    if (isGameOver && typeof (onGameOver) !== 'undefined') {
      onGameOver(currentStats)
    }
  }, [isGameOver, currentStats])

  const reloadWords = async () => {
    console.log('reload words')
    const response = await fetch(wordListUrl)
    const text = await response.text()
    const lines = text.split('\n');
    const allWords = lines.map(line => {
      const [word, koenRaw] = line.split('\t')
      // sb.fk.sg.ubest -> n-ord
      // sb.itk.sg.ubest -> t-ord
      const koen = koenRaw === 'sb.fk.sg.ubest' ? 'n' : 't'
      return {word, koen}
    })

    const enWords = randomSelection(allWords, word => word.koen === 'n', 100);
    const etWords = randomSelection(allWords, word => word.koen === 't', 100);
    const selectedWordsShuffled = shuffleArray([...enWords, ...etWords]);
    setSelectedWords(selectedWordsShuffled);
  };

  useEffect(() => {
    void reloadWords()
  }, [])

  useEffect(() => {
    if (selectedWords.length > 0) {
      setCurrentWordIndex(0)
    }
  }, [selectedWords])

  const wordBoxRef = useRef<HTMLDivElement>(null)
  const playCorrectAnimation = () => {
    const cls = "animate-[correct_200ms_ease-out_1]"
    wordBoxRef.current?.classList.add(cls)
    setTimeout(() => {
      wordBoxRef.current?.classList.remove(cls)
    }, 300)
  }

  const playWrongAnimation = () => {
    const cls = "animate-[wrong_200ms_ease-out_1]"
    wordBoxRef.current?.classList.add(cls)
    setTimeout(() => {
      wordBoxRef.current?.classList.remove(cls)
    }, 300)
  }

  const answer = (answer: string) => {
    const currentWord = selectedWords[currentWordIndex];
    if (currentWord.koen === answer) {
      setCurrentStats({
        currentScore: currentStats.currentScore + 1,
        currentStreak: currentStats.currentStreak + 1,
        totalWords: currentStats.totalWords + 1,
        bestStreak: Math.max(currentStats.currentStreak + 1, currentStats.bestStreak),
      })
      setPastWords([[currentWord, true], ...pastWords.slice(0, 2)])
      playCorrectAnimation()
    } else {
      setCurrentStats({
        currentScore: currentStats.currentScore,
        currentStreak: 0,
        totalWords: currentStats.totalWords + 1,
        bestStreak: currentStats.bestStreak,
      })
      setPastWords([[currentWord, false], ...pastWords.slice(0, 2)])
      playWrongAnimation()
    }

    if (currentWordIndex < selectedWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      void reloadWords()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Digit1') {
      answer('n')
    }
    if (event.code === 'Digit2') {
      answer('t')
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    // cleanup this component
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedWords, currentWordIndex]);

  const restart = async () => {
    await reloadWords()
    setCurrentStats({
      currentScore: 0,
      currentStreak: 0,
      totalWords: 0,
      bestStreak: 0,
    })
    setTimePassed(0)
    setPastWords([])
    setIsGameOver(false)
  }

  return (
    <div>
      <div class="mt-6 flex justify-around">
        <div
          class="p-1 border border-2 border-amber-300 rounded h-10 w-10
          bg-white/[.9] text-xs flex justify-center items-center
          hover:border-amber-500 cursor-pointer"
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor"
               className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
        </div>
        <div class="p-1 border border-2 border-amber-300 rounded h-10 w-20 bg-white/[.9] relative text-center">
          <span
            class="text-xs absolute top-0 bg-amber-300 rounded-t p-1 leading-none -top-5 left-1/2 -translate-x-1/2 text-center">Score</span>
          <div class="text-xl">{currentStats.currentScore}/{currentStats.totalWords}</div>
        </div>
        <div class="p-1 border border-2 border-amber-300 rounded h-10 w-20 bg-white/[.9] relative text-center">
          <span
            class="text-xs absolute top-0 bg-amber-300 rounded-t p-1 leading-none -top-5 left-1/2 -translate-x-1/2 text-center">Nøjagtighed</span>
          {currentStats.totalWords > 0 &&
              <div class="text-xl">{Math.round(currentStats.currentScore / currentStats.totalWords * 100)}%</div>}
        </div>
        <div class="
        p-1 border border-2 border-amber-300 rounded
        h-10 w-20 bg-white/[.9] relative text-center
        flex justify-center items-center">
          <span
            class="text-xs absolute top-0 bg-amber-300 rounded-t p-1 leading-none -top-5 left-1/2 -translate-x-1/2 text-center">Tid</span>
          <div class="text-xl">
            {timeLimit === undefined ? <InfinitySign/> : `${timeLimit - timePassed}s`}
          </div>
        </div>

        <div
          class="p-1 border border-2 border-amber-300 rounded
           h-10 w-10 bg-white/[.9] flex justify-center items-center
           hover:border-amber-500 cursor-pointer"
          onClick={restart}
        >
          <RestartIcon/>
        </div>

      </div>

      <div class=" mt-4 h-14 flex justify-center items-center">
        {currentStats.currentStreak > 3 &&
            <div
                class=" text-xl text-center">Streak: {currentStats.currentStreak} {streakEmoji(currentStats.currentStreak)}</div>}
      </div>

      <div class=" mt-4 flex justify-center bg-white/[.9] py-5 text-3xl" ref={wordBoxRef}>
        {selectedWords[currentWordIndex]?.word ?? '...'}
      </div>

      <div class="mt-4 h-14 flex justify-center flex-col items-center">
        {
          pastWords.slice(0, 3).map(([word, correct], i) => (
            <div key={word.word}
                 class={`w-64 text-center ${pastWordsClassFromIdx(i)} ${correct ? 'bg-green-300' : 'bg-rose-300'} rounded`}>
              (e{word.koen}) {word.word}
            </div>
          ))
        }
      </div>

      <div class="mt-8 flex justify-center gap-2">
        <div
          class="p-2 bg-white/[.9] rounded w-32 text-center border border-amber-300 border-4 cursor-pointer hover:border-amber-500 transition select-none text-xl relative"
          onClick={() => answer('n')}>
          <kbd
            class="[@media(hover:none)]:hidden px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg absolute left-2">1</kbd>
          n-ord
        </div>
        <div
          class="p-2 bg-white/[.9] rounded w-32 text-center border border-amber-300 border-4 cursor-pointer hover:border-amber-500 transition select-none text-xl relative"
          onClick={() => answer('t')}>
          <kbd
            class="[@media(hover:none)]:hidden px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg absolute left-2">2</kbd>
          t-ord
        </div>
      </div>
    </div>
  )
}
