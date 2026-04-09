import sys
import os

# add to path just in case
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from nltk.tokenize import sent_tokenize

text = "This is a sentence. \n\nThis is another sentence."
print(repr(sent_tokenize(text)))
