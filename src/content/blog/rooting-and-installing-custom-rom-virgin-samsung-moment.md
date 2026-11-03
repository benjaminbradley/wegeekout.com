---
title: "Rooting and Installing a custom ROM on a virgin Samsung Moment"
pubDate: 2011-07-20T14:53:24-05:00
path: "/content/rooting-and-installing-custom-rom-virgin-samsung-moment/"
description: "GOAL: Upgrade to Android 2.2 on my Samsung Moment WHY: My phone sucks ass. Android 2.2 is supposed to be way better than 2.1 for performance and battery life,…"
tags: ["hacks", "mobile", "root"]
draft: false
legacy:
  drupalNid: 12
  publishedOnDrupal: true
---
**<img alt="" src="/sites/wegeekout.com/files/android_200.jpg" width="200" height="150" class="float-right">GOAL**: Upgrade to Android 2.2 on my Samsung Moment\
**WHY**: My phone sucks ass. Android 2.2 is supposed to be way better than 2.1 for performance and battery life, hopefully fixing my two biggest complaints.\
**PROBLEM**: Sprint dropped official support after 2.1. They want me to buy a new phone as often as possible.

So, to get Andoid 2.2 on my phone, I'll have to get full control over the device's software ("rooting" the phone) and install a custom-made software ROM which was created by independent software developers ("hackers" in the traditional sense of the word).

I checked about 6 months ago and there didn't seem to be a stable release yet. I've recently run across some youtube videos of Android 2.2 on a Moment, so it looks like the home-brewed software is finally mature. That is, it is stable enough to be installed by a non-hobbyist and performs suitably with regular daily usage.

## What Version to Install?

Since the Android 2.2 release for my phone is fan-created, there are several people working on different versions. Each has it's own bugs, bug fixes, enhancements and quirks. The Android 2.2 ROM that I heard about most prominently was CyanogenMOD, but there are no doubt others available as well. How do they compare?

I read a few forum posts linked from Google for some background and finally found a very recent post (less than a month old at time of discovery) where the author solicited recommendations for "[Best Android 2.2 Samsung Moment ROM](http://forum.sdx-developers.com/index.php?topic=14796.0)." The posters there recommended several different ROMs, and based on the number of recommendations and the visibility of the developer, I chose the Bassman's KeyLime. His ROM is based on a general EB28 ROM (which has several recommendations by itself), and includes a lot of fixes on top of that. It also includes both the Kernel & ROM updates, combining 2 steps into one. Plus, the "final version" claiming to include all possible bug fixes was just released before I finished this article, so it's got all the latest updates. [Get the latest version of the KeyLime ROM here](http://forum.sdx-developers.com/index.php?topic=13981.0).

## Installation Process Overview

I read several guides and watched some YouTube videos detailing the process, to make sure I had it all down. I was very wary of "bricking" my phone - which renders the phone completely useless (i.e. an expensive paperweight) if you apply the update incorrectly.

The process is broken into roughly three parts:

1.  Reset to a known configuration
2.  Gain full access to the phone by "rooting" it
3.  Install the new software

The first two steps use the Software Updated program released by Sprint. If you updated your phone to Android 2.1 yourself, then you've used it before.

The "root" software must be applied to a phone with a set, known configuration. So the first thing we need to do is reset the phone to the stock Android 2.1 release by uploading it to the phone - this is known as "flashing" the "ROM" or "ROM image" onto the phone.\
Once the phone as been reset to stock, we apply the "root" package with the same Software Updater program, after putting our new data file in place of the official one.\
Part of the "rooting" process installs a small manager program on your phone known as the "Recovery" program. This allows your phone to start up in a sort of bare bones mode, kind of like Safe Mode on a Windows computer. The Recovery program has full access to write to any files on the system, so this is how we will apply the custom ROM image in the third step.

## Resources & Guides

Here are some of the pages I checked out while learning about this process:

Videos:

-   [How to upgrade to Android 2.2 on Samsung Moment](http://www.youtube.com/watch?v=0Kb-xUVHpM4) - this video has the clearest explanation and the best production. Although I find the narrator a bit on the smarmy side.
-   [How to install android 2.2.2 on a virgin samsung moment](http://www.youtube.com/watch?v=G4avGyukjCA) - the author here goes through the entire process but doesn't explain very well what he's doing, and there's some distracting talking in the background. There are written instructions in the "information" section of the youtube video.

Written guides:

-   [How To Root Your Samsung Moment (2.2.2 Froyo)](http://forum.sdx-developers.com/index.php?topic=13731.0) - This is the best written guide that I found. It's got links to the files and explanations for each step.
-   Simple Rooting Instructions - a minimal simple set of step-by-step instructions

## What You'll Need

-   your Samsung Moment phone
-   a computer running Windows
-   a USB cable to connect your phone to the computer
-   the following software:
    -   SamsungMoment\_Update.exe - the Software Updater program
    -   SPH-M900\_MR4\_DJ07\_REL.tar - the stock Android 2.1 image
    -   recovery3\_1\_1.tar - the Recovery program
    -   Basic Android 2.2 EB28 base (required for our custom ROM image)
    -   [BasicEB28.zip](http://www.mediafire.com/?z0yvt9unc92do7n) - a basic Android 2.2 base (required for our custom ROM image) - linked from [SDX forums](http://forum.sdx-developers.com/index.php?topic=13326.0)
    -   [The latest KeyLime ROM](http://www.megaupload.com/?d=BY3XUGUJ) - linked from SDX forums

## The Installation Process

1.  On your Windows computer, download & install the Samsung Moment Updater windows app (referred to as CL14): SamsungMoment\_Update.exe or SamsungMoment\_Update-CL14.exe if you get the file bundle from the youtube video.
2.  Open windows explorer, go to the directory C:\\Program Files\\Samsung Electronics\\SWUpgrade\\Models\\Binary\\\
    and remove all the files already in there, replacing them with just the file SPH-M900\_MR4\_DJ07\_REL.tar\
    Youtube guy does this step a little differently, which involves using a samsungPST\_SPHM900.dll file and only flashing the phone once, but the stock ROM/recovery method matches the other guides online, so I went with the more recommended process.
3.  Run the SWUpgrade program, follow the instructions until it finishes and the phone restarts.-- this gives you a stock 2.1 phone --
4.  Remove the DJ07 file from the ...\\Binary\\ directory and place the recovery3\_1\_1.tar into that folder instead.
5.  Run the SWUpgrade program again, let it finish and restart the phone.\
    \
    \--- At this point your phone is "rooted" and you can install a custom ROM on it. ---
6.  The custom ROM files have to be on your phone's SD card, either in the top-most (root) directory or in the directory /sdx/zip/\
    If you need to put them on there now, boot your phone up into the regular system (still the stock 2.1). When your phone boots back up, connect the USB cable and put it in USB mode so we can put some files on the sdcard. Put the EB28 and KeyLime files on there.
7.  Now you'll need to reboot into the Recovery program. Power the phone down and then hold down these three keys at the same time: Volume Down + Talk (Green/Answer Phone) + Power (Red/Hangup). I find it works best if you hold the first two, then hold the Power button down until the startup screen appears.
8.  From the Recovery menu, go down to the menu entry that says "Apply zip from SD card" (using the black mouse scroller button) and click it.
9.  Select the Basic EB28 file and select install. It may take a little while ()
10.  On the main menu, select "Reboot to <u>Recovery"</u>
11.  Go down to "Apply zip from SD card" again, this time select the KeyLime file and install it
12.  Go back to the main menu and this time, select "Reboot to <u>System"</u>

Ta-da! Your Samsung Moment is now running the KeyLime ROM version of Android 2.2.\
Now you can set up your Google account, re-install your favorite apps, restore any settings from backup, etc.

## Results

So, what are the results? Well, my battery is performing a LOT better now than it did before the upgrade. Before, I would get maybe 4-5 hours out of a charge, even without using the phone hardly at all, but now I get almost 24 hours before it needs a recharge. A very significant improvement!

For a performance test, I tried out Angry Birds. Before the upgrade, my graphics were glitchy and it was so slow it was unplayable. Now after the upgrade, the graphics are still glitchy (in particular, all text areas show up as a blank white box), but performance is decently playable. I even tried out "raging thunder lite" - while pretty laggy, it was playable (I got 4th place out of 6). This is a game that was unplayable before my upgrade.

**UPDATE:**\
I've now had Android 2.2 on my phone for about a month, and I have to say it hasn't been the perfect upgrade I imagined it to be. First, there are some quirks: GPS doesn't work, I still have laggy behavior (for example, the phone starts ringing, but the call is lost before I'm given a chance to answer the call when the caller ID is displayed), and I have random apps crashing on a regular basis. There is a new release of the KeyLime ROM available (I installed 3.3, but 4.0 was just released), so that may make some improvements, but it's still far from the silver bullet I had hoped for.

## Extras

There are some other "extra" enhancements that you can do to boost performance even more (see the [KeyLime ROM](http://www.megaupload.com/?d=BY3XUGUJ) page). I did the battery recalibration, and while it stays at 100% for a while after I unplug the phone, whenever it hits 30%, it drops to 5% within 10 minutes. So I can't say that it made a big difference. I haven't tried the conversion to the ext2/ext4 file system yet, but that'll be my next attempt to boost this phone's performance.
