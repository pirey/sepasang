import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import React from "react"

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pelmanism</title>
        <meta name="description" content="Pelmanism" />
      </Head>

      <main>
        <PelmanismGame />
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
    <div className="w-screen flex flex-col items-center justify-center">
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
