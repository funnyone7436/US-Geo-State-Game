import React from 'react'
import { useControls } from 'leva'
import { Color } from 'three'

export default function SceneBackground() {
  const { color } = useControls('Scene Background', {
    color: { value: '#8dc7b9' } // Default dark gray
 //   color: { value: '#f5a0a0' } // Default dark gray
  })

  return <color attach="background" args={[color]} />
}