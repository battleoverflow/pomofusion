<div align="center"><img src="assets/icon.png" width="25%"></div>
<div align="center"><h1>PomoFusion</h1></div>

A simple Pomodoro timer with a Spotify integration.

Currently, PomoFusion only support playback controls with no other functionality. This means while the playback is controlled automatically, things such as shuffling, changing the current playing track, etc. must be modified in the Slack application.

## How to Authenticate

Create a `spotify.json` file under `/opt/pomofusion` and add your credentials into the file. If you need any help, check out the `spotify.json` example file to know which variables to include.

> [!NOTE]
> The spotify.json must be configured exactly like the example. All keys must be present for the Spotify API to work properly.

## FAQ / Help Guide

> [!IMPORTANT]
>
> ### PomoFusion is unable to locate a device. Help?
>
> Spotify may have a difficult time locating your active device or session. A potential fix for this is to restart the Spotify application, play a song for a few seconds, and then pause the song. Once you've done this, Spotify shouldn't have any issues locating your active session.

> [!IMPORTANT]
>
> ### I'm not receiving any notifications from PomoFusion. What's wrong?
>
> First, make sure you've alloted the proper permissions for the application. I've attached a screenshot below.
>
> <div align="center"><img src="assets/macos_notifications_example.png" width="50%"></div>

### Copyright

The PomoFusion "logo" belongs to Yu-Gi-Oh and Konami, respectively. No monetary gain will ever be generated directly from PomoFusion while this image is associated with the project.
