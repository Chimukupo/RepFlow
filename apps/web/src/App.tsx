// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { Button } from "@/components/ui/button"
 
function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">RepFlow</h1>
      <p className="text-lg text-gray-500 text-center">
        Breath, Train, Conquer
      </p>
      <Button className="mt-4">Join Now</Button>
    </div>
  )
}
 
export default App