import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import React from "react"

const GithubButton = () => {
  return (
    <a
      href="https://github.com/pirey/sepasang"
      target="__blank"
      rel="noopener noreferrer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8"
        viewBox="0 0 512 512"
      >
        <title>Logo Github</title>
        <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
      </svg>
    </a>
  )
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pelmanism</title>
        <meta name="description" content="Pelmanism" />
      </Head>

      <main>
        <PelmanismGame />
        <div className="fixed bottom-0 w-full">
          <div className="flex flex-col items-center my-2">
            <GithubButton />
          </div>
        </div>
      </main>
    </>
  )
}

export default Home

type Card = {
  id: string
  title: string
  imgSrc: string
}

type Picsum = {
  id: string
  author: string
  width: number
  height: number
  url: string
  download_url: string
}

function shuffle<T>(unshuffled: T[]): T[] {
  return unshuffled
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function picsumToCard(picsum: Picsum): Card {
  return {
    id: picsum.id,
    title: `${picsum.author} ${picsum.id}`,
    imgSrc: `https://picsum.photos/id/${picsum.id}/160/160`,
  }
}

function duplicateAndShuffle(cards: Card[]): Card[] {
  return shuffle(cards.concat(cards))
}

const Card = ({ card }: { card: Card }) => {
  return (
    <div className="w-24 h-24">
      <Image width={96} height={96} src={card.imgSrc} alt={card.title} />
    </div>
  )
}

const CardClosed = () => {
  return <div className="w-24 h-24 bg-teal-600"></div>
}

type State = {
  selectedIndex: number
  tempOpenIndices: number[]
  remainingCards: Card[]
  solvedCards: Card[]
}

const PelmanismGame = () => {
  const numCards = 6
  const [state, setState] = React.useState<State>({
    selectedIndex: -1,
    tempOpenIndices: [],
    remainingCards: [],
    solvedCards: [],
  })
  const isCardSolved = (card: Card) => {
    return state.solvedCards.find((c) => c.id === card.id)
  }
  const handleClick = (card: Card, index: number) => {
    if (state.tempOpenIndices.length === 2) {
      return
    }
    if (state.selectedIndex === -1) {
      setState({
        ...state,
        selectedIndex: index,
        tempOpenIndices: [index],
      })
    }
    if (state.selectedIndex !== -1) {
      const selectedCard = state.remainingCards[state.selectedIndex]
      setState({
        ...state,
        tempOpenIndices: state.tempOpenIndices.concat(index),
      })
      if (selectedCard?.id === card.id) {
        setState({
          ...state,
          solvedCards: state.solvedCards.concat(card),
          selectedIndex: -1,
          tempOpenIndices: [],
        })
        return
      }
      setTimeout(() => {
        setState({
          ...state,
          selectedIndex: -1,
          tempOpenIndices: [],
        })
      }, 700)
    }
  }
  // TODO: pre fetch images as blob
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    fetch(`https://picsum.photos/v2/list?limit=${numCards + 1}`)
      .then((res) => res.json())
      .then((res: Picsum[]) => res.slice(1).map(picsumToCard))
      .then(duplicateAndShuffle)
      .then((cards) => {
        setState({ ...state, remainingCards: cards })
      })
  }, [])
  React.useEffect(() => {
    if (state.solvedCards.length === numCards) {
      setTimeout(() => {
        window.alert("SELAMAT, ANDA GABUT!")
      }, 100)
    }
  }, [state.solvedCards.length, numCards])
  return (
    <div className="w-full flex flex-col items-center justify-center pt-8">
      <div className="max-w-2xl flex flex-row flex-wrap justify-center items-center">
        {state.remainingCards.map((card, i) => {
          if (isCardSolved(card) || state.tempOpenIndices.includes(i)) {
            return (
              <div key={i} className="pb-2 px-1">
                <Card card={card} />
              </div>
            )
          }
          return (
            <div
              key={i}
              onClick={() => handleClick(card, i)}
              className="pb-2 px-1"
            >
              <CardClosed key={i} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
