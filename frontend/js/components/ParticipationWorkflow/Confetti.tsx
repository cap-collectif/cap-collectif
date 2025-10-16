import React from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { TCanvasConfettiAnimationOptions } from 'react-canvas-confetti/dist/types/normalization'

const commonOptions = {
  gravity: 2,
  origin: { y: 0 },
  ticks: 125,
}

const count = 100

export const Confetti = () => {
  const instance = React.useRef(null)

  const onInit = ({ confetti }) => {
    instance.current = confetti
  }

  const fire = React.useCallback((particleRatio: number, options: TCanvasConfettiAnimationOptions) => {
    instance.current({
      ...commonOptions,
      ...options,
      particleCount: Math.floor(count * particleRatio),
    })
  }, [])

  const fireManually = React.useCallback(() => {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })
    fire(0.2, {
      spread: 60,
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })
  }, [fire])

  React.useEffect(() => {
    fireManually()
  }, [fireManually])

  return (
    <>
      <ReactCanvasConfetti onInit={onInit} />
    </>
  )
}

export default Confetti
