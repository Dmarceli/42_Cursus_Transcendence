# Contributing

## Pull request

When making a pull request it is helpful to add information so the reviewers have an easier time to test and review your code. It should start with a list of changes. This helps to give an overview of what has changed in this pull request. If extra context is required / if you think it would be helpful you should add it under the list with a qoute to the brief description. In this section you can also give some overall context of why these changes should be implemented.

Under the descriptions should be related issues and/or pull requests.


```md
## What has been implemented:
1. Brief description of what has been implemented
2. Brief description of what has been implemented
3. Brief description of what has been implemented

1 - Bigger explanation of what has changed. This can also include reasoning why it has changed.

3 - Not all changes require extra context. So you can just leave them out when you think they are self explenatory. But you should keep them in the order that showed up in the list.

## Related issues:
- #5
- #19

```
### Preview:
---
## What has been implemented:
1. Brief description of what has been implemented
2. Brief description of what has been implemented
3. Brief description of what has been implemented


1 - Bigger explanation of what has changed. This can also include reasoning why it has changed.

3 - Not all changes require extra context. So you can just leave them out when you think they are self explenatory. But you should keep them in the order that showed up in the list.

## Related issues:
- #5
- #19

---

Make sure to add labels and requests reviews once your pull request is created. Labels can be added on the right when creating a pull request (or after having created one). This is also where you can added reviewers and relate issues. Labels are usually similar to the labels from related issues.

## Review

The reviewer should go through each changed file and thoroughly look through it and point out any mistakes. It helps to add a comment for each mistake you find so you can more easily create the final review message.

In the final review you should mention what issues you ran into. If possible try to give steps to reproduce it and a possible fix. Then you should mention the style related issues. These will not necessarily break the program but can cause confusion or enforce bad practices.

```md
## Issue(s) found:
- function runs in infinite loop if negative value is given.

> function runs in infinite loop if negative value is given.

If you pass a negative value to `function` it will run into an infinite loop. One way to solve this is to check if the given number is negative and exit the function early. At the end you can give some extra notes if applicable.

## Style related issue(s) found:
- functions should always start with a capital letter.
- Name of `function` is not descriptive/confusing.

## Notes:
Although `lib.func` does work, it's not very efficient. Try using the build-in `func` instead.
```

### preview:
---
## Issue(s) found:
- function runs in infinite loop if negative value is given.

> function runs in infinite loop if negative value is given.

If you pass a negative value to `function` it will run into an infinite loop. One way to solve this is to check if the given number is negative and exit the function early.

## Style related issue(s) found:
- functions should always start with a capital letter.
- Name of `function` is not descriptive/confusing.

## Notes:
Although `lib.func` does work, it's not very efficient. Try using the build-in `func` instead.

---

A review containing "normal" issues should **NEVER** be accepted. If these are found the review should be marked with `request changes`. Once the pull request has been accepted the reviewer should convert the style related issues into issues. Make sure to mark them with the correct labels.