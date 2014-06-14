#!/usr/bin/env python

import argparse
import tablib
import yaml
import os
from django.utils.text import slugify


def read_jekyll_file(filepath):
  """
  Reads a file with the following format:
  ```
  ---
  front: matter
  ---
  # Body Text as *Markdown*
  ```
  and returns:
    front_matter, body_text
  """

  front_matter = None
  body_text = ''

  try:
    with open(filepath, 'r') as f:
      contents = f.read()
      split_contents = contents.split('---\n', 2)
      front_matter_text = split_contents[1]

      print 'found existing front-matter: ', front_matter_text
      front_matter = yaml.load(front_matter_text)
      print 'python formatted: ', front_matter

      body_text = split_contents[2]
      if body_text:
        print 'existing body_text: ', body_text

  except IOError:
    print 'file does not yet exist, will create...'
  except IndexError:
    print 'file does not have front-matter yet, will overwrite...'

  return front_matter, body_text


def create_front_matter(row, front_matter=None):
  # OrderedDict([(u'Title', u'Winds Suite'),
  # (u'Instrumentation', u'Piano'),
  # (u'# Instr.', 1.0),
  # (u'Instrumentation Name', ''),
  # (u'Chamber', ''),
  # (u'Solo', u'Solo'),
  # (u'Choir', ''),
  # (u'Vocal', ''),
  # (u'Strings', ''),
  # (u'Keyboard', u'Piano'),
  # (u'Winds', ''),
  # (u'Brass', ''),
  # (u'Harp', ''),
  # (u'Guitar', ''),
  # (u'Perc', ''),
  # (u'Large Enemble', ''),
  # (u'Date', 1987.0),
  # (u'Duration', u'23:00'),
  # (u'Publisher', ''),
  # (u'Author of Text', ''),
  # (u'Translator', ''),
  # (u'SoundCloud URL', ''),
  # (u'YouTube', '')])
  genres = [
    'Chamber',
    'Solo',
    'Choir',
    'Vocal',
    'Large Ensemble',
  ]
  instruments = [
    'Keyboard',
    'Winds',
    'Brass',
    'Harp',
    'Guitar',
    'Perc'
  ]

  try:
    date = int(row['Date'])
  except:
    date = row['Date']

  data = {
    'title': row['Title'],
    'instrumentation': {
      k: v.split(', ')
      for k, v in row.items()
      if k in instruments
      and v
    },
    'instrumentation_name': row['Instrumentation Name'],
    'genre': [
      k for k, v in row.items()
      if k == v
      and k in genres
    ],
    'date': date,
    'duration': {
      'm': int(row['Duration'].split(':')[0]),
      's': int(row['Duration'].split(':')[1])
    },
    'publisher': row['Publisher'],
    'author_of_text': row['Author of Text'],
    'translator': row['Translator'],
    'soundcloud_ids': row['SoundCloud URL'].split(', '),
    'youtube_ids': row['YouTube'].split(', '),

    'layout': 'composition',
    'history': [
      {
        'performer': '',
        'timeplaces': []
      },
    ],
    'reviews': [
      {
        'quote': '',
        'reviewer': '',
        'publication': '',
        'date': '',
        'link': ''
      }
    ]
  }
  print data
  new_front_matter = yaml.safe_dump(data, default_flow_style=False)
  return new_front_matter


def write_jekyll_file(filepath, new_front_matter, body_text=''):
  with open(filepath, 'w') as f:
    new_file_contents = "---\n{}\n---\n{}".format(new_front_matter, body_text)
    f.write(new_file_contents)


def process_entry(row, dest):
  print row

  filename = slugify(row['Title'])
  filepath = os.path.abspath('{}/{}.md'.format(dest, filename))

  front_matter, body_text = read_jekyll_file(filepath)

  new_front_matter = create_front_matter(row, front_matter)

  write_jekyll_file(filepath, new_front_matter, body_text)
  print


def main(input_xls, dest):
  with open(input_xls, 'rb') as f:
    sheet = tablib.import_set(f.read())

  for row in sheet.dict:
    process_entry(row, dest)

  # print yaml.dump(yaml.load(sheet.yaml), default_flow_style=False)
  # for row in sheet.dict:
  #   print yaml.dump(row)


if __name__ == '__main__':

  parser = argparse.ArgumentParser(prog='bin/import.py')
  parser.add_argument('excel_file', action='store')
  parser.add_argument('destination_directory', action='store')
  args = parser.parse_args()

  main(args.excel_file, args.destination_directory)
