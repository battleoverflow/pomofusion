import { Button, Flex, Text, Image } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from "@tauri-apps/api/notification"

import { ask } from "@tauri-apps/api/dialog"
import { SpotifyApi } from "@spotify/web-api-ts-sdk"

import { invoke } from '@tauri-apps/api/tauri'

const getSpotifyAuth = async (method: String) => {
  // Grab the Spotify credentials from Rust, then convert the Rust string to a TypeScript string and trim the quotations
  return (await invoke(`get_${method}`).then((auth_type) => String(auth_type))).replace(/['"]+/g, '')
}

const api = SpotifyApi.withUserAuthorization(await getSpotifyAuth("client_id"), await getSpotifyAuth("redirect_uri"), [
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

  // Set the timer with the provided values
  // This also handles some Spotify callbacks and notifications for the aforementioned callbacks
  // This function only runs onClick, so it should never run more than a single time
  const toggleTimer = () => {
    setTimerStart(!timerStart)

    if (!timerStart) {
      // Play Spotify if the timer is active
      playSpotify()
      notifyUser("Playing Spotify", "")
    } else {
      // Pause Spotify if the timer is any other state
      pauseSpotify()
      notifyUser("Paused Spotify", "")
    }
  }

  // If you'd like to reset the timer, this will pop up with a confirmation and reset accordingly
  const triggerResetDialog = async () => {
    let shouldReset = await ask("Reset timer?", {
      title: "PomoFusion",
      type: "warning"
    })
    if (shouldReset) {
      // Reset the timer to 15 minutes
      setTime(900)
      setTimerStart(false)

      // Pause all Spotify playback during this time + notify the user
      pauseSpotify()
      notifyUser("Paused Spotify", "")
    }
  }

  // Attempt to locate the active device that Spotify is running on
  // This should more appropiately be referred to as "session" for our use case since we primarily focus on the machine being used with PomoFusion
  const getActiveDeviceId = async (): Promise<string> => {
    const devices = await api.player.getAvailableDevices()

    // If the not devices are found, Spotify's API is being kinda wonky
    // You'll need to either locate your Spotify client and press for a second or it mean you need to authenticate
    // If you need to authenticate, a seperate window should pop up with a login prompt
    if (devices === null) {
      notifyUser(
        "Unable to locate session",
        "Please play a few seconds of any track. This should help Spotify locate your session. Or authenticate with Spotify."
      )
    }

    // We just need the ID, so as long as a device is found, we can use it
    const activeDevice = devices.devices.find((device) => device.is_active)!
    return activeDevice.id!
  }

  const pauseSpotify = async (): Promise<void> => {
    const spotifyPlaybackState = await api.player.getPlaybackState()

    // We do this to make sure the playback state of Spotify is not already paused
    if (spotifyPlaybackState === null) {
      notifyUser(
        "Unable to locate playback",
        "Please play a few seconds of any track. This should help Spotify locate your session. Or authenticate with Spotify."
      )
    }

    // If the playback state is currently playing, we can pause it
    if (spotifyPlaybackState.is_playing) {
      await api.player.pausePlayback(await getActiveDeviceId())
    }
  }

  const playSpotify = async (): Promise<void> => {
    const spotifyPlaybackState = await api.player.getPlaybackState()

    // We do this to make sure the playback state of Spotify is not already playing
    if (spotifyPlaybackState === null) {
      notifyUser(
        "Unable to locate playback",
        "Please play a few seconds of any track. This should help Spotify locate your session. Or authenticate with Spotify."
      )
    }

    // If the playback state is currently playing, we can play
    if (!spotifyPlaybackState.is_playing) {
      await api.player.startResumePlayback(await getActiveDeviceId())
    }
  }

  // We just need to verify that the permissions are granted for the notifications
  const notificationsPermitted = async (): Promise<boolean> => {
    let permissionGranted = await isPermissionGranted()

    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === "granted"
    }

    if (permissionGranted) {
      return true
    }

    return false
  }

  // Simple notification funciton for use across the entire app
  const notifyUser = async (title: string, body: string) => {
    if (await notificationsPermitted()) {
      sendNotification({
        title: title,
        body: body
      })
    }
  }

  useEffect(() => {
    // Timer interval, this is main timer section for the project
    // Nothing too complicated, it mainly just runs the entire interval until a condition or met or the timer is 0
    const interval = setInterval(() => {
      if (timerStart) {
        if (time > 0) {
          setTime(time - 1)
        } else if (time == 0) {
          pauseSpotify()
          notifyUser("Paused Spotify", "")
          clearInterval(interval)
        }
      }
    }, 1000)

    // Clear the timer
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
        <Image src="icon.png" width="20%" marginTop="10" />
        <Text color="white" fontWeight="bold" marginTop="2" fontSize="35">
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
                pauseSpotify()
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
