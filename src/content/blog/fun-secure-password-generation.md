---
title: "Fun Secure Password Generation"
pubDate: 2013-10-25T14:36:27-05:00
updatedDate: 2013-10-27T11:38:38-05:00
path: "/content/fun-secure-password-generation/"
description: "If you use a computer, chances are you're familiar with passwords. There's a lot of debate over what constitutes a secure password, and that topic will NOT be…"
tags: ["howto", "passwords", "security"]
draft: false
legacy:
  drupalNid: 30
  publishedOnDrupal: false
  publishedFromDraft: 2026-11-03
---
If you use a computer, chances are you're familiar with passwords. There's a lot of debate over what constitutes a secure password, and that topic will NOT be covered here. What I'm sharing with you today is a password-generation scheme that I've used recently to generate a list of secure passwords that are memorable.

## How to create memorable, secure passwords

The extreme scenario would use for each of us to use completely random passwords which are very long and different for every account we hold. In reality, we like to use passwords that are easy to remember, and like to share some of them across multiple accounts.

Here was our process:

### Step 1: Generate random words

If you're in a group, go around the room and shout random words, popcorn style. Come up with a list of words - half adjectives, and half nouns. They should be a minimum of 4 letters (or longer for longer passwords).

Here are the words I came up with:

#### Adjectives:

-   contagious
-   emphatic
-   logical
-   silly
-   simple

#### Nouns:

-   coach
-   feta
-   merangue
-   slideshow
-   tabletop

### Step 2: Pair them up

Next, pair up the words, one adjective with one noun, however you like. We went with pairs that would be memorable. For example Logical Feta.

If you want to use phrases with more than 2 words each, you'll need to generate more words in step 1 - for example, 2 adjectives per noun.

We've chosen:

-   logical feta
-   silly slideshow
-   contagious coach
-   emphatic merangue
-   simple tabletop

### Step 3: Encode them

One of the most basic ways that passwords are cracked is to use a dictionary attack. This works by combining words from the dictionary to create passwords to test. So to frustrate these attempts, we change our words so they're no longer in the dictionary. Some of the letters become numbers or special characters. For example, we might replace the first 9 letters with the digits 1-9, and the letter o with the number 0.

Translation table for our encoding algorithm:

462837951 <- convert this\
\
abcdefghi <- to this

Applying this to our password phrases above, we get:

-   Lo9124173t4
-   S1llySl183s5ow
-   2ont491ous2o425
-   3mph4t12M3r4n9ue
-   S1mpl3T46l3top

Here I've also capitalized the first letter of each word, to add variation.

### Step 4: Encrypt them

Finally, we would take our list of passwords above and put them in an encrypted file. Using public key encryption, we lock the whole list with a single key that only we hold, protected by one strong passphrase.

This means that you only have to remember one password entirely in your head. You have a record, but it's hidden in a locked drawer of sorts.

**Step 5: Rotate them**

Even if you start with good passwords, and follow best practices to keep them secret, it's still recommended to change your passwords on a regular basis. This ensures that, if one of your passwords DOES get compromised, it will only be exploitable for a limited amount of time.

## How to remember your passwords

I said these are memorable, and what that means to me is that they are "sticky." You probably will not remember your passwords after a few minutes, but after typing them a handful of times they stick, because a silly pair like "logical feta" is much easier to recall than a string of random characters.

---

*This post was originally left as an unpublished draft. Published as work-in-progress in November 2026 for historical reference.*
