---
title: "Where you see junk, I see a battlefield."
pubDate: 2011-06-11T00:52:07-05:00
updatedDate: 2011-06-13T22:46:39-05:00
path: "/content/where-you-see-junk-i-see-battlefield/"
description: "I got the following e-mail in my inbox on Friday: from mailer-daemon@my-server to benjamin@benjamins-computer date Fri, Jun 10, 2011 at 11:59 PM subject…"
tags: ["robots", "spam", "sysadmin", "war", "web"]
draft: false
legacy:
  drupalNid: 11
  publishedOnDrupal: true
---
I got the following e-mail in my inbox on Friday:

> **from** mailer-daemon@my-server\
> **to** benjamin@benjamins-computer\
> **date** Fri, Jun 10, 2011 at 11:59 PM\
> **subject** WARNING: delayed mail.
>
> ```
> Diagnostic information is provided below for each recipient.  If copies of
> this message were sent to additional recipients, deliveries to those
> addresses are not included in this notice.  This is an advisory notice for
> the following addresses only:
>
> <judyoco7y@example.com>:
>    mail.example.com [IP redacted]:
> >>> STARTTLS
> <<< 454 TLS currently unavailable
>
> ---------------------------------------------------------------------------
> ```

Where you see junk, I see a battlefield.

What we have here is a spam robot (or possibly a human) registering a new user account on my website. How do I know it's spam? I've seen several registrations in the past few days with similar user names - always someone's real name (judy) followed by a bunch of random letters/numbers (oco7y). One person might pick that as their username, but 10 in a row is unusual. And they've all had bounces similar to the one above.

There is an image CAPTCHA on the registration form, so it's either a real human or a smart bot (which typically operates by feeding the CAPTCHA image through to a human for interpretation on a porn site or similar).

When the user account was created, a message was sent to verify the e-mail address, but it bounced back. Why? The error message ("TLS currently unavailable") means the target mail server is misconfigured. (It says it supports TLS encryption in one place, and that it doesn't in another.)

If it \*had\* gone through, it would have alerted the sleaze's home base of a nice new website ripe for violation. Their attacks may have included posting spam on my website, as junky link spam, or insidious fake-comment spam, but always with links back to their crummy websites. They may abuse some feature of my website to send spam to others - the "tell a friend" form which allows you to enter a recipient e-mail address and your own custom message - is a prime target. In extreme cases, they may try and exploit some vulnerability in my website's code and upload their own repellant offspring in an attempt to use my server like a parasite or in the worst case, take it over like a terrorist.

So where you see junk from the elusive "mailer daemon," I see a filthy zombie trying to call home - and failing.

EDITOR's NOTE: *The e-mail message above has been shortened for brevity.*
