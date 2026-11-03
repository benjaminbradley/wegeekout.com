---
title: "Using Regular Expressions to find a Ham Radio Vanity Call Sign"
pubDate: 2011-12-27T17:57:40-06:00
updatedDate: 2012-01-15T16:07:55-06:00
path: "/content/using-regular-expressions-find-ham-radio-vanity-call-sign/"
description: "Today I'm going to tell you about regular expressions and how awesome they are. Background Regular Expressions are a way to define a pattern of letters/numbers…"
tags: ["ham", "pattern matching", "patterns", "programming", "radio", "search"]
draft: false
legacy:
  drupalNid: 20
  publishedOnDrupal: true
---
Today I'm going to tell you about regular expressions and how awesome they are.

## Background

Regular Expressions are a way to define a pattern of letters/numbers to search for. Traditionally, regular expressions are marked with slashes on either side. Here are some simple examples:

-   /bar/\
    Search for the word "bar"\
    This will match: bar
-   /.\*bar/\
    Search for anything ending in "bar"\
    This will match: candybar, foobar, rebar, openbar

There are lots of great guides online that will teach you how to use regular expressions, so I will not duplicate that effort here. In fact, there are entire books written about regular expressions. It's one of those programming tools that no serious geek should be without, like a swiss army knife.

## The Problem

I just passed my ham radio Technician exam and got my very first call sign (a call sign is like your ham radio username). By default, they just assign you the next available call sign in the sequence, which is a semi-random selection of letters like KF5NSY. You have the option to pay about $15 bucks and request a vanity call sign of your choice, sort of like getting a vanity license plate for your vehicle.

The call signs available for me to pick from are 2-by-3 or 3-by-3, which means 2 or 3 letters, then a number, then 3 more letters. In the USA, all ham radio call signs start with N, K or W.

A few years ago, I created a simple web-based program which will take a regular expression and compare it to every entry in my computer's dictionary file. This is really useful for playing scrabble or completing crosswords. You plug in the letters that you know and use dots for the letters that are unknown. If you know you need a five-letter word that starts with A and has an N in the fourth position, the regular expression would be: "a..n." Running this search against my dictionary file returns 47 results, including the worsd "among" and "alone"

By making a simple number-to-letter substitution using the typical "'leet-speak" translations, we can do a search for all dictionary words that would be valid ham radio call signs.

## The Solution

Here are the ham-radio specific rules I used to craft my regular expression:

1.  Must start with N, K, W, or C\
    RegEx: \[knwc\]\
    Explanation: Square brackets indicate a "class" of characters - any of the characters listed will match\
    NOTE: I included C to allow for phonetic translation of words that start with a hard C -- in the call it would use a K instead, like Katch (instead of Catch)
2.  Second letter is optional\
    RegEx: .?\
    Explanation: "Dot" will match any letter, and the "?" modifier indicates that it may or may not be there (zero or one instances of the preceeding symbol).
3.  The number - usually a designator of which region in the USA the call sign comes from - can be anything for a vanity call sign.\
    RegEx: \[oieasb\]\
    Explanation: I'm substituting similar letters for their numerical equivalents (i.e. 0=o, 1=i, 3=E, 4=A, 5=S, 8=B) as in w0rdy, kn1ght, kr4zy and everyone's favorite naughty calculator entry 8008135
4.  The last three characters in the call sign are any 3 letters\
    RegEx: ...

Final Regular Expression for searching dictionary words for vanity call signs: \[knwc\].?\[oieasb\]...

You can access the [dictionary search program here](http://wegeekout.com/cgi-bin/dictlookup.pl).

[Here the vanity call search pattern](http://wegeekout.com/cgi-bin/dictlookup.pl?pattern=%5Bknwc%5D.%3F%5Boileasb%5D...) is already filled in.

## Update: January 15, 2012

My request for a vanity call sign finally came back (it took about 3 weeks over the holidays), so my ham call is now officially: **K0DEX**

Now to get a radio... =D
