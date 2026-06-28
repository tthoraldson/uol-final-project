---
title: "Final Project Preliminary Report"
author: "Theresa Thoraldson"
date: 2026-06-29
bibliography: references.bib
---

# Introduction
<!-- An introduction: this explains the project concept and motivation for the project (this can be based on your proposal). This must also state which project template you are using (max 1000 words). -->

*The template I am choosing is Artificial Intelligence Project Template 1: Orchestrating AI Models to Achieve a Goal.*

In music, there is a concept called sight reading. It involves being given a piece of sheet music and trying to play it or sing it right away with little or no preparation. According to the National Association for Music Education, the ability to sight read music has many benefits including increased confidence, stronger foundations in rhythm and pitch, and less stress when it comes to learning new music pieces [@empowering].

## An overview

## Why Would People Want This Project?

For me personally, I've always wanted to get better at sight reading but haven't found any existing products on the market that make me stick with working through exercises. The generated exercises are often boring, and only target one music area at a time (i.e. advance rhythms, chords, harmony, etc)

The existing free projects on the market have limited instrument support, and have no way to track exercise history.

The paid options are 

\newpage

## Existing/Similar Projects

### Sight Reading Factory

![Sight Reading Factory screen capture](images/sightreadingfactory.png){width=300px}

Sight Reading Factory[@sighta] is a platform for sight reading exercises mainly aimed towards educators. This platform supports ~30 instruments, and offers different difficulties of music passages to play. They offer generated music exercises for learners to practice with, getting feedback with each attempt at playing a passage.

#### Advantages

Sight Reading factory has a wide variety of features, including the ability to assess how well a user did on a given passage of music, and the ability to control how difficult generated passages are by limiting the note range, tempo, and rhythmic complixty. Sight Reading Factory supports both general audio/microphone input and MIDI.

#### Disadvantages

- Sight Reading Factory only has 30 supported instruments
- Paid platform, at $45 a year for an individual plan
- Focused on music education related tasks, instead of general sight reading

### SightReading.Training

![sightreading.training screen capture](images/sightreadingtraining.png){width=300px}

#### Advantages

- Midi support
- Free, works right away in browser
- Digital/web based keyboard, can pratice right away

#### Disadvantages

# Literature Review
<!-- A literature review: this is a revised version of the document that you submitted for your second peer review (max 2500 words). -->

There are lots of existing pre-trained models available that do different tasks related to music. This is an overview of the models I found most relevent to this project, and the models that I will test for usage in this project.

## Pitch Estimation and Tempo Estimation

### CREPE

CREPE is a deep convolutional neural network that does pitch estimation [@kim2018crepe]. Given an audio file, such as a .wav or .mp3 file, CREPE will give a predicted frequency in hertz alongside a confidence score for every 10 miliseconds. Having a confidence interval allows for 

There is also a demo of CREPE[@crepea] that runs fully in the browser using Tensorflow JS (tfjs)[@tensorflowjs]. It shows real time pitch estimation based on microphone input. In regards to this project, being able to have real time pitch estimation would allow for immediate feedback on a music passage.


## Music Generation

### Basic Pitch

Basic Pitch is a model built by spotify that

### MusicGEN

In "Simple and Controllable Music Generation", 

### NotaGen

NotaGen[@wang2025notagen] is a model that generates classical sheet music. The paper proposes a new "ClaMP-DPO" method for reinforcement learning, which increases generation quality when compared to

This model requires at least 8GB of GPU RAM to run the smallest model. The goal of my project is to have  Because of these large compute requirements, I don't believe this model will be a good fit for this project.

# Design
<!-- A design: this is a revised version of the document that you submitted for your third peer review (max 2000 words). -->

## Domain and Project Users

TODO:  Who is the project for? What is the domain of the project (e.g. music game, history education, therapy for phobias, narrative films)?

The goal of this project is to create a sight reading web application that utilizes various machine learning models to create

The ideal user for this project is an independent musician that's looking to improve their sight reading abilities.

This project is not ideal for users just learning an instrument, as this application requires at least an elementary understanding of reading sheet music, and playing their instrument of choice.

## Design Overview

## Design Choices

TODO: Why did we make the choices we did? How will these choices best fufil the needs of the users?

## Project Structure

## Project Plan

TODO: GANTT chart

## Testing Plan

##

# Feature Prototype
<!-- A feature prototype: this is the only new element of the submission, details below (max 1500 words). -->

## Getting a model to work in browser

##

\newpage
# Acknowledgements
- I'm grateful to my sister Anna, and my partner J for proof reading through this report too many times to count
- [Pandoc](https://pandoc.org/) was used to generate this report from a markdown file
- [Zotero](https://www.zotero.org/) was used to manage sources, and generate a BibTex file for references/citations

# References