---
title: "Our weekend project Scavengeroo.com launches"
pubDate: 2011-05-02T16:43:07-05:00
path: "/content/our-weekend-project-scavengeroocom-launches/"
description: "Effie & I just launched our new QR Code Scavenger Hunt game, Scavengeroo this past weekend. To build it, we spent 2 long weekends (Friday night, all day…"
tags: ["games", "mobile", "programming", "qr codes", "ruby on rails", "scavengeroo"]
draft: false
legacy:
  drupalNid: 8
  publishedOnDrupal: true
---
[<img alt="Scavengeroo.com screen capture" height="200" src="/sites/wegeekout.com/files/scavengeroo-screencap.png" width="300" class="float-right">](https://web.archive.org/web/20120320002037/http://scavengeroo.com:80/)Effie & I just launched our new [QR Code Scavenger Hunt game, Scavengeroo](https://web.archive.org/web/20120320002037/http://scavengeroo.com:80/) this past weekend.

To build it, we spent 2 long weekends (Friday night, all day Saturday & Sunday, with meal breaks) and a few scattered evenings over the past month or so. I'll outline our basic development process and technological considerations (i.e. what plugins/gems I used).

## Weekend Business Sprint & Codeathon

The first weekend was roughly 5 hours of brainstorming: features, user stories, marketing, monetization. We refined our feature list down to an achievable 1.0 (or so we thought) and started building it on Saturday.

I chose [Ruby on Rails](http://www.rubyonrails.org) for it's rapid prototyping and plugin availability. I decided to go with Rails v3.0, because it's the latest stable release. I ran into a handful of issues where plugins were created for use with Rails2 and wouldn't work with Rails3, but in almost all cases I was able to either find a replacement gem, a patch or a rails3 branch of the same gem. I'm more familiar with the Rails 2.x conventions, but I've found that with web applications, the older your framework is, the less maintainable your application is.

I used the following gems:

-   [AuthLogic](https://github.com/binarylogic/authlogic) for authentication, in part because of it's professed support for Facebook integration, which turned out not to be the case. Apart from that, it handles user authentication very well. The only thing I had to add manually was ["Forgot Password" functionality](http://www.binarylogic.com/2008/11/16/tutorial-reset-passwords-with-authlogic/).
-   RQRCode for QR code generation (NOTE: RQRCode only generates the data stream, if you want an image created, check out the rqr gem instead.
-   Prawn for PDF generation (to download the QR codes).

Our initial application scaffolding and basic functionality included:

-   Creating a game
-   Adding items to the game
-   Generating downloadable PDF with QR codes
-   Players scanning codes
-   Creating teams
-   Players joining teams
-   Scoreboard

Effie spent a lot of the first weekend learning Illustrator and building our kick-ass kangaroo logo. I whipped up a reasonable CSS theme that matched the logo (functionality is my strong suit).

I implemented Paypal integration via auto-generated, encrypted "buy now" buttons containing the user's ID and/or game ID. The Paypal sandbox/developer area is great.

Next, I tried to add FaceBook connect with the authlogic-connect gem, but had a lot of trouble (lots of obscure "406 Unsupported" errors that I couldn't figure out) and ended up scrapping it. I'll probably go back and use the [Facebooker gem](https://web.archive.org/web/20101124102814/http://martyhaught.com:80/articles/2010/04/20/facebook-connect-with-facebooker/), which I've had success with in the past.

User feedback is vital, so I wanted to make it easy for our users to tell us what they thought right from the start. I added an easy feedback mechanism via the "feedback\_form" gem. It provides a persistent tab that shows up on every page of the website which, when clicked, creates a hovering panel over the current webpage containing a simple feedback form with customizable fields and Subject line.

I would say we got about 75% there the first weekend, but not quite far enough that we felt ready to launch it yet. We scheduled a second weekend to finish it up and planned our launch for Eeyore's Birthday Party, a big charity fundraiser held at Pease Park. It's my favorite Austin holiday and would be the perfect place to test our technology literally "in the field."

## Second weekend

The second weekend comprised mainly of finishing the paid-order code, and since people would be primarily playing the game through their phones, implementing a mobile version of the website with a more touch-friendly interface.

For the mobile website, I used the [JQTouch javascript library](https://web.archive.org/web/20110502074750/http://www.jqtouch.com:80/), which comes with a couple of CSS themes included. After watching a screencast, it was fairly easy to implement, although it represented a complete overhaul of the View layer of our MVC stack. I sketched out an interaction tree based on the possible entry points for players coming to the mobile website, and then implemented the menus accordingly.

A lot of the time during our second weekend was spent improving the visual layout and interaction, adding help pages, and reviewing data protection (so for example, one user cannot edit another user's games). From the quote "You get 80% of the results with 20% of the work," we were now working on the other 20% of the results.

We added descriptions for each item, and added a start & end time to games, so that people cannot scan items early or late. The full version of the site includes a way to watch the game as it progresses. Just check the "automatically refresh" box when looking at a game's activity, and your screen will get updated whenever someone scans an item.

Final launch tasks included switching to our live PayPal account, adding the [ExceptionNotifier plugin](https://github.com/smartinez87/exception_notification), and adding a "win message" which is displayed when someone scans all the items. The ExceptionNotifier is especially nice; it e-mails you a report whenever the site experiences an unhandled error. In these cases, the user sees a big ugly error message, so you want to know about these kinds of bugs and eliminate them as soon as possible.

Future development rounds will probably include the creation of a full native mobile application via the [PhoneGap framework](https://web.archive.org/web/20110503031605/http://www.phonegap.com:80/). Some of the other features we're considering are:

-   pictures for everything (users, players, teams, items)
-   player chat so teams can talk to each other as they play
-   enhancing items with different point values
-   ... and more...?
