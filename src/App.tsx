import { Button, Flex, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from "@tauri-apps/api/notification"

import { ask } from "@tauri-apps/api/dialog"

{
  /* TODO: Add a section for the user to include a Spotify token */
}

function App() {
  const [time, setTime] = useState(0)
  const [timerStart, setTimerStart] = useState(false)

  const buttons = [
    {
      value: 900, // seconds
      display: "15 Minutes"
    },
    {
      value: 1800, // seconds
      display: "30 Minutes"
    },
    {
      value: 3600, // seconds
      display: "60 Minutes"
    }
  ]

  const toggleTimer = () => {
    setTimerStart(!timerStart)
  }

  const triggerResetDialog = async () => {
    let shouldReset = await ask("Reset timer?", {
      title: "PomoFusion",
      type: "warning"
    })

    if (shouldReset) {
      setTime(900)
      setTimerStart(false)
    }
  }

  {
    /*
    For some reason, notifications only work when building the applications. This means development won't work.

    npm run tauri build
  */
  }
  const isPermitted = async () => {
    let permissionGranted = await isPermissionGranted()

    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === "granted"
    }

    if (permissionGranted) {
      sendNotification({
        title: "Time's up!",
        body: "Session complete"
      })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerStart) {
        if (time > 0) {
          setTime(time - 1)
        } else if (time == 0) {
          isPermitted()
          {
            /* TODO: Stop playing Spotify song */
          }
          clearInterval(interval)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerStart, time])

  return (
    <div className="App" style={{ height: "100%" }}>
      <Flex
        background="#18181B"
        height="100%"
        alignItems="center"
        flexDirection="column"
      >
        <Text color="white" fontWeight="bold" marginTop="20" fontSize="35">
          PomoFusion
        </Text>
        <Text fontWeight="bold" fontSize="7xl" color="white">
          {`${
            Math.floor(time / 60) < 10
              ? `0${Math.floor(time / 60)}`
              : `${Math.floor(time / 60)}`
          } : ${time % 60 < 10 ? `0${time % 60}` : time % 60}`}
        </Text>
        <Flex>
          <Button
            width="7rem"
            background="#E53265"
            color="white"
            onClick={toggleTimer}
            _hover={{ bg: "#000000", border: "1px solid #E53265" }}
          >
            {/* TODO: Stop playing Spotify song if paused */}
            {!timerStart ? "Start" : "Pause"}
          </Button>
          <Button
            background="#E53265"
            color="white"
            marginX={5}
            onClick={triggerResetDialog}
            _hover={{ bg: "#000000", border: "1px solid #E53265" }}
          >
            Reset
          </Button>
        </Flex>
        <Flex marginTop={10}>
          {buttons.map(({ value, display }) => (
            <Button
              marginX={4}
              background="#E53265" // green.300
              color="white"
              _hover={{ bg: "#000000", border: "1px solid #E53265" }}
              onClick={() => {
                setTimerStart(false)
                setTime(value)
              }}
            >
              {display}
            </Button>
          ))}
        </Flex>

        {/* TODO: Add Spotify integration visual here */}
      </Flex>
    </div>
  )
}

export default App
