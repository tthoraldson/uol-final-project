# University of London CS Final Project


### Generate midterm report

Must be inside midterm folder
```bash
pandoc --citeproc --bibliography=references.bib -o REPORT.pdf REPORT.md  --csl=../ieee.csl
```



4 CM3020 Artificial Intelligence
4.1 Project Idea 1: Orchestrating AI models to achieve a goal
What problem is this project solving, or what is the project idea?
This project is based around the idea of combining multiple pre-trained models into a
workflow that achieves a particular goal. It is up to you to decide what that goal is. For
example, in the artificial intelligence course, you saw how it is possible to combine multi-
ple models to generate lyrics, music and a singing performance for a pop song. You do not
need to address a creative problem like this, but you do need to combine multiple models
to solve a well specified problem. Below we provide some starting ideas for the kinds of
models you might work with. You should think of a problem space (e.g. music, cybersecu-
rity, creative writing, education, healthcare) then build a system that can operate in that
space based around multiple pre-trained models operating on different types of data.
What is the background and context to the question or project idea above?
Many pre-trained models are now available that allow ‘artificially intelligent’ computer
programs to extract information from the world, and to generate information to put back
into the world. As a final year computer science student, we would like to challenge you
in this project to identify a problem space that you feel is important to you and to build a
system that can operate in that problem space. The system should make use of several
pre-trained models to make sense of the world and to put information into the world.
Here are some recommended sources for you to begin your research.
Example of the kinds of pre-trained models you can use are as follows. Note that these
links are valid and working at the time of publication of this document. You should be able
to use them as starting points to find working models.
1. Speech to text: transcribes audio containing speech into text e.g. openai whisper:
https://github.com/openai/whisper
2. Language processing and generation: using local language models to understand and
generate text e.g. ollama: https://ollama.com/
3. Image to text: Image analysis and description, detect objects in images, describe im-
ages e.g. mobilenet: https://github.com/tensorflow/tfjs-models/tree/
master/mobilenet and
https://huggingface.co/Salesforce/blip-image-captioning-base
4. Audio to text: audio scene description e.g. yamnet https://huggingface.co/
STMicroelectronics/yamnet and https://github.com/tensorflow/tfhub.
dev/blob/master/assets/docs/google/models/yamnet/1.md
5. Sentiment analysis: detect emotions in text https://huggingface.co/tabularisai/
multilingual-sentiment-analysis
6. Human body and face analysis, for example ml5 models for hands and poses: https:
//docs.ml5js.org/
7. Other sources: You can find many pre-trained models for many different tasks here:
https://huggingface.co/models
What would the final product or final outcome look like?
The final product should consist of a working piece of software that can be used to achieve
your specified goal or to operate in your specified problem space. The product should in-
clude at least THREE pre-trained models, operating in different domains/ data spaces, for
example, text, image and audio. You should clearly state what the purpose of the system
is and show how you went about identifying, operationalising, testing etc. your models. It
is likely that you will have to go through a process of testing and rejecting models to find
the ideal choices for your project. We would like to see evidence of that process and your
decision making process.
What would a prototype look like?
A prototype should show the chosen models operating successfully, generating and pro-
cessing data in several different models, with a clearly described objective or purpose for
the overall system.
What kinds of techniques/processes/CS fundamentals are relevant to this project?
This project will involve working through lots of different models – getting them working,
testing them out to see if they will work with the data you want to use. We want you to use
your software engineering and testing skills here.
You will need to work with different types of data, figuring out how to feed it into the dif-
ferent models.
You should show that you can evaluate pre-trained models for example by sending test
data and validating the outputs.
Also you might need to test the performance of the models and to relate this to the sys-
tem you are building and how it shall be used.
What would the output of these techniques/processes/CS fundamentals look like?
We are keen to see evidence that you have tested several models and made decisions
about which are and are not appropriate for your needs. One aspect of this will be test-
ing the performance of the models to see if they are viable to use for your project. We will
want to see evidence that you have thought about how to combine different models to
achieve an overall system goal.
How will this project be evaluated and assessed by the student (i.e. during iteration of
the project)? What criteria are important?
As noted above, we anticipate that you will be installing and testing lots of different mod-
els in order to figure out which ones are appropriate for your needs. You should evaluate
your process here and be able to come up with an overarching method for doing this. You
should ensure that you meet the requirement to have at least THREE pre-trained models
working on different types of data in the project. You should ensure that the project de-
livers a working system that achieves a clear goal. Just downloading some models and
running them is not enough!
For this brief, what might a minimum pass (e.g. 3rd) student project look like?
A minimum pass would include a working system which includes three pre-trained mod-
els working to achieve a clearly specified goal. There should be evidence that you have
evaluated the models using appropriate criteria.
For this brief, what might a good (e.g. 2:2 – 2:1) student project look like?
A 2:2 – 2:1 project would include a working system which includes three pre-trained mod-
els working to achieve a clearly specified goal. You should have chosen a challenging goal
which is not easily achievable using standard software engineering techniques and au-
tomation – it should be clear why these pre-trained models are needed. We are looking
for an integrated piece of software here. We would like to see evidence of software test-
ing, ideally with unit testing but potentially with users as well.
For this brief, what might an outstanding (e.g. 1st) student project look like?
An outstanding project would use an original approach to address an interesting and chal-
lenging problem. We would like to see evidence that you have thoroughly explored the
space of pre-trained models relevant to your project and chosen appropriate models based
on evidence presented in the report. You should choose a difficult problem and consider
the best way to design the user interaction. We want to see thorough evaluation of the
models and solid software testing, including user testing and iteration of the design based
on the testing results.