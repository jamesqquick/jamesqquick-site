---
title: Convert Number from Decimal to Hexadecimal in JavaScript (and visa versa)
slug: convert-number-from-decimal-to-hexadecimal
coverImage: /images/posts/convert-number-from-decimal-to-hexadecimal/cover.png
pubDate: 2020-06-18
description: Learn how to convert a number in JavaScript from Decimal (base 10) to Hexadecimal (base 16)
---

I'm currently working on a mini course where I will show to dynamically lighten and darken colors in JavaScript. To do this, I needed to be able to convert numbers from decimal to hexadecimal and visa versa. Let's see how!

## Intro

One of the most common ways to represent colors is with RGB where you have three (hexadecimal) numbers that represent the red, green, and blue values respectively. Here's an example using my brand color.

```
#de5254
```

If you separate this out, you get three values of `de`, `52`, and `54`. This might seem odd to have letters represent a number, but that's how hexadecimal numbers work. Instead of using `1-10` digits it uses `1-f` (1-9,a,b,c,d,e,f) as digits.

Alright, let's dive in.

## Convert Decimal to Hexidecimal

If you have a decimal number that you want to convert to hexidecimal, you can call the `toString()` function with the number and pass in a target base (binary, decimal, hexedecimal, etc.). This parameter is known as the `radix`. Here's a few examples.

    let num = 15;
    num.toString(16) //f
    num = 10
    num.toString(16) //a
    num = 1
    num.toString(16) //1

[](https://www.w3schools.com/jsref/jsref_tostring_number.asp)

[W3 Schools Docs - toString()](https://www.w3schools.com/jsref/jsref_tostring_number.asp)

[](https://www.w3schools.com/jsref/jsref_tostring_number.asp)

## Convert Hexadecimal to Decimal

What about the reverse? If you're converting hexadecimal back to decimal you can use the `parseInt()` function and pass the the original number (as a string) in the first parameter and the `radix` in the second.

    parseInt("f", 16) //15
    parseInt("a", 16) //10
    parseInt("1", 16) //1

[W3 Schools Docs - parseInt()](https://www.w3schools.com/jsref/jsref_parseint.asp)

## Wrap Up

Not too bad huh? Working with different bases in numbers can certainly be tricky to understand, but you can let JavaScript take care of most of it for you!
