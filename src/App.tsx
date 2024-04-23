import { Button, Flex, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from "@tauri-apps/api/notification"

import { ask } from "@tauri-apps/api/dialog"

import { SpotifyApi } from "@spotify/web-api-ts-sdk"

{
  /* TODO: Add a section for the user to include a Spotify token */
}

const CLIENT_ID = ""
const CLIENT_SECRET = ""
const REDIRECT_URI = "http://localhost:1420/callback"

const api = SpotifyApi.withUserAuthorization(CLIENT_ID, REDIRECT_URI, [
  "user-read-playback-state",
  "user-modify-playback-state"
])

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

    if (!timerStart) {
      notifyUser("play")
    } else {
      notifyUser("pause")
    }
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

  // FIX: All Spotify related code for playback is working, but for some reason, it still can't find all of the available devices automatically
  // If you add the device ID manually, it works fine
  const getActiveDeviceId = async (): Promise<string> => {
    const devices = await api.player.getAvailableDevices()
    const activeDevice = devices.devices.find((device) => device.is_active)!
    return activeDevice.id!
  }

  const pauseSpotify = async (): Promise<void> => {
    sendNotification({
      title: "Spotify Paused"
    })

    await api.player.pausePlayback(await getActiveDeviceId())
  }

  const playSpotify = async (): Promise<void> => {
    sendNotification({
      title: "Spotify Playing"
    })

    await api.player.startResumePlayback(await getActiveDeviceId())
  }

  {
    /*
    For some reason, notifications only work when building the applications. This means development won't work.
    npm run tauri build
  */
  }
  const notifyUser = async (timerStatus: string) => {
    let permissionGranted = await isPermissionGranted()

    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === "granted"
    }

    if (permissionGranted) {
      if (timerStatus == "play") {
        playSpotify()
      }

      if (timerStatus == "pause") {
        pauseSpotify()
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerStart) {
        if (time > 0) {
          setTime(time - 1)
        } else if (time == 0) {
          notifyUser("pause")
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
            // If the timer is less than 10, make sure to add an extra 0
            Math.floor(time / 60) < 10
              ? `0${Math.floor(time / 60)}`
              : // No need for the 0 here
                `${Math.floor(time / 60)}`
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
              background="#E53265"
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
        <Flex>{/* TODO: Add Spotify integration visual here */}</Flex>
      </Flex>
    </div>
  )
}

export default App
