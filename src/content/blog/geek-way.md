---
title: "The Geek Way"
pubDate: 2011-02-07T20:19:01-06:00
path: "/content/geek-way/"
description: "Several years ago, I created my own Contact Manager application. I did it in Ruby on Rails because it was quick. I had it published online at a semi-public…"
tags: ["api", "google", "programming"]
draft: false
legacy:
  drupalNid: 2
  publishedOnDrupal: true
---
Several years ago, I created my own Contact Manager application. I did it in Ruby on Rails because it was quick. I had it published online at a semi-public URL, so I could access it from anywhere. It was open to public registration, but I was the only one who ever created an account on it. So basically it was a single-user custom app that had exactly the features I wanted it to.

It was perfect. It had tagging, and you could add as many phone numbers, e-mail addresses, or postal addresses as you wanted. It would keep track of accounts like Livejournal, AIM and MSN Messenger. I could even keep track of relatives & roommates sharing the same address, and each contact had three dates associated with it: how long I'd known them, how old their contact information was, and how long it had been since we talked.

I could import data from other apps via csv files. If I ever needed to transfer contacts to another app, I could export whatever fields I wanted to a csv or vCard file, including a list of only e-mail addresses so I could send a mass e-mail. I could generate a list of birthdays in iCal format. And one of the coolest things, I thought, was I could put everyone on a Google map, to see where all my friends lived. It had field search and a nice AJAX interface.

I guess I tend to go kinda feature-crazy sometimes. But hey, it was \*my\* Contact Manager application, so why the hell not? I do this kind of thing for fun.

It's been a few years since I've done any development work on it and I just got my first Android phone. The Android syncs all my contacts with my Google account. I already use Google for e-mail and my phone for phone calls, so combining those two puts 90% of the contact information I access on a daily basis all in the same place. At this point, the Contact Manager is, well, it's time to let it move on into the "Archives" folder as a tarball.

Not so fast! I've first got to combine the data in the Contact Manager with my Google Contacts list.

Now any sane person would export their data as a CSV and import it into the Google fields from the same CSV file. It wouldn't get everything, but it would get the basic information for each person. I could use Google's de-duplication process to combine two of the same contact. It would be okay.

It just didn't seem like a fitting end for the Contact Manager. I know Google has an API for their services - after all, Android syncs with it, so it must be out there. And chances are someone has already written a Ruby gem to interface with it. It should be possible to write a feature into my rails application which would programmatically import my contact data into my Google account.

So I did. It's probably taken less than 10 hours overall development time. There were a few tricks to figuring out the API (namely, the gdata gem seems to default to version 2 of the API, you have to set it explicitly to 3 if you want to use the newer features). But really, most of my work was writing my own business logic. Programming is getting a lot easier these days. With all the APIs, modules, and plug-ins available, you basically get a set of pipes and you just have to stick 'em together.

I decided not to import the date fields (only the birthday), since I didn't really use them that much. I also left out the relationship links. The Google contact API does support relation links (spouse, brother, etc.) but it doesn't hard-link to another contact record, only a simple text field for their name. It was a field in my own app that I didn't use that much, so I let it go.

I spent about 10 hours doing this project. I had 400 contacts, so if it took me one minute to copy all the data over for each one, it would have taken me almost 7 hours to finish it manually. So I spent the extra 3 hours. Now I have all my contact data in one place, all the data I care for is preserved, AND now I know how to use the Google Data API. Bonus!
