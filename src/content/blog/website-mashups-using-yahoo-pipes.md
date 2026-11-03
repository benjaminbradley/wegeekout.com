---
title: "Website mashups using Yahoo! Pipes"
pubDate: 2012-08-24T19:30:18-05:00
updatedDate: 2012-08-30T16:38:35-05:00
path: "/content/website-mashups-using-yahoo-pipes/"
description: "In the same way that audio software enables DJs to remix music, combining several songs together to create a new one, modern web technologies allow programmers…"
tags: ["hacks", "maps", "mashups"]
draft: false
legacy:
  drupalNid: 27
  publishedOnDrupal: true
---
<img alt="screenshot from Yahoo Pipes" src="/sites/wegeekout.com/files/yahoo%20pipes.png" width="250" height="150" class="float-right">In the same way that audio software enables DJs to remix music, combining several songs together to create a new one, modern web technologies allow programmers to mash-up data from websites with relative ease.

When I went looking for a map of ATM locations for my local credit union, I was disappointed to find only [an HTML table with a bunch of addresses](https://web.archive.org/web/20120920162347/http://atfcu.org/index.php/branches-a-atms/atm-locations). Now, I can tell that those are all addresses, and if I were to copy & paste any of them into Google Maps, it would have no problem finding that location on the map. But getting **all** of them to show up on the same map? A little trickier.

Having recently read [an article about mashing up websites](http://blog.ouseful.info/2008/10/14/data-scraping-wikipedia-with-google-spreadsheets/) with Yahoo Pipes, I decided to try it out for myself. Yahoo! pipes is kind of like sed/awk for RSS feeds, but better. It can read input from various standard web data formats like RSS and CSV. You can then slice and dice, filter, sort, and transform the data however you want by "piping" it through a sequence of widgets before finally spitting it out in another standard web data format.

Instead of relying on a standard data format as input, my Pipe uses the [XPath Fetch Page](https://web.archive.org/web/20120710203919/http://pipes.yahoo.com/pipes/docs?doc=sources) widget to retrive the webpage containing the list of ATM locations mentioned above, and extract the relevant information. That data source widget produces a series of data items, one for each ATM location, but with all the data in a single HTML field. Once the data is extracted, I put it through several transformations, including a couple of [regular expressions](/content/using-regular-expressions-find-ham-radio-vanity-call-sign/), to separate the name and location for each item, and finally run each street address through a geocoder which assigns latitude & longitude values to each item. This final location data is then outputted as a standard KML file format, which can be imported into a Google Map for easy viewing.

[Austin Telco ATM locations](https://web.archive.org/web/20120920162347/http://atfcu.org/index.php/branches-a-atms/atm-locations) - raw HTML page

[Yahoo Pipe: Austin Telco ATM locations](http://pipes.yahoo.com/pipes/pipe.info?_id=0c26d602d96138d07da2679c6cb8b652)

[Google Map of](https://maps.google.com/maps?q=http://pipes.yahoo.com/pipes/pipe.run%3F_id%3D0c26d602d96138d07da2679c6cb8b652%26_render%3Dkml) Austin Telco ATM locations

**\*UPDATE: 2012-08-27\***

I found a more comprehensive list of Austin Credit Union ATM locations and created a similar Pipe/Map mashup for the whole list.

Data source: [Alliance of Austin Credit Unions - ATM locations](https://web.archive.org/web/20130127125307/http://www.freecuatms.org:80/search_results.cfm?cty=Travis)

Yahoo Pipe: [Alliance of Austin Credit Unions - ATM locations (Travis county)](http://pipes.yahoo.com/pipes/pipe.info?_id=cb00c02a5809dc312cddead7caa61f32)

Google Map: [Map of Austin Credit Union Alliance ATMs](http://maps.google.com/maps?sourceid=Mozilla-search&q=http%3A%2F%2Fpipes.yahoo.com%2Fpipes%2Fpipe.run%3F_id%3Dcb00c02a5809dc312cddead7caa61f32%26_render%3Dkml)
