#!/usr/bin/env python

import argparse
import yaml
import os

import tablib
from clint.textui import puts, indent
from clint.textui.colored import green, red
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

      # print 'found existing front-matter: ', front_matter_text
      front_matter = yaml.load(front_matter_text)
      # print 'python formatted: ', front_matter

      body_text = split_contents[2]
      if body_text:
        puts(u'existing body_text: {}'.format(body_text))

  except IOError:
    puts(green('file does not yet exist, will create...'))
  except IndexError:
    puts(red('file does not have front-matter yet, will overwrite...'))

  return front_matter, body_text


def create_front_matter(row, old_front_matter=None, accept=False):
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
    'publisher_link': row['Publisher Link'],
    'author_of_text': row['Author of Text'],
    'translator': row['Translator'],
    'soundcloud_ids': str(row['SoundCloud URL']).split(', '),
    'youtube_ids': str(row['YouTube']).split(', '),
    'vimeo_ids': str(row['vimeo']).split(', '),
    'layout': 'composition',
    'history': [
      {
        'performer': '',
        'timeplaces': ['']
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
  # print data

  new_front_matter = recursively_check_conflicts(
    data, old_front_matter, accept=accept)

  new_front_matter_text = yaml.safe_dump(
    new_front_matter, default_flow_style=False)

  return new_front_matter_text


def recursively_check_conflicts(new, old, accept=False):
  puts(u'checking {}'.format(new))
  if hasattr(new, 'Title'):
    puts(u'TITLE: {}'.format(new['Title']))

  with indent(2, quote=" | "):

    if old is None:
      return new

    if new == old:
      return new

    # check if, eg 1990 == '1990' == u'1990'
    u_new = unicode(new)
    u_old = unicode(old)
    if u_new == u_old:
      return new

    puts(green('GREEN (FROM EXCEL):'))
    puts(green(u_new))
    puts(red('RED (FROM OLD VERSION OF DOCUMENT):'))
    puts(red(u_old))

    if accept:
      puts(green('accepting Excel version (green)'))
      return new

    while True:
      selection = raw_input(
        'Should we keep [G]REEN, [R]ED? \n'
        'Or should we [C]ONTINUE recursing, '
        'so you can make a more granular decision? \n'
        'OR Would you prefer to enter some [O]THER value (will be text)? \n'
        '[g/r/c/o]: '
      ).lower()[0]
      if selection in ['g', 'r', 'c', 'o']:
        if selection == 'o':
          new = raw_input('enter a new value: \n')
          puts('Do you confirm the following?')
          puts(new)
          if raw_input('[y/n]: ').lower().startswith('y'):
            return new
        else:
          break
      else:
        puts('-> You must enter g, r, c, or o!')

    if selection == 'g':
      return new
    elif selection == 'r':
      return old
    elif selection == 'c':

      if isinstance(new, dict) and isinstance(old, dict):
        checked = []
        for k, v in new.items():
          new[k] = recursively_check_conflicts(v, old.get(k, None))
          checked.append(k)
        for k, v in old.items():
          if k in checked:
            continue
          v = recursively_check_conflicts(new.get(k, None), v)
          if v:
            new[k] = v

      elif isinstance(new, list) and isinstance(old, list):
        for i, item in enumerate(new):
          if item in old:
            continue
          else:
            new[i] = recursively_check_conflicts(item, old[i])
        for i, item in enumerate(old):
          if item in new:
            continue
          else:
            item = recursively_check_conflicts(new[i], item)
            if item:
              new.append(item)

      else:  # int, str, or unicode (probably)
        if selection == 'c':
          puts(red('-> You cannot recurse further. Try again.'))
          return recursively_check_conflicts(new, old)

      return new


def write_jekyll_file(filepath, new_front_matter, body_text=''):
  with open(filepath, 'w') as f:
    new_file_contents = "---\n{}\n---\n{}".format(new_front_matter, body_text)
    f.write(new_file_contents)


def process_entry(row, dest, accept=False):
  # puts(row)

  filename = slugify(row['Title'])
  filepath = os.path.abspath('{}/{}.md'.format(dest, filename))

  old_front_matter, body_text = read_jekyll_file(filepath)

  new_front_matter = create_front_matter(row, old_front_matter, accept=accept)

  write_jekyll_file(filepath, new_front_matter, body_text)
  # puts('')


def main(input_xls, dest, accept=False):
  with open(input_xls, 'rb') as f:
    sheet = tablib.import_set(f.read())

  for row in sheet.dict:
    process_entry(row, dest, accept=accept)


if __name__ == '__main__':

  parser = argparse.ArgumentParser(prog='bin/import.py')
  parser.add_argument('excel_file', action='store')
  parser.add_argument('destination_directory', action='store')
  parser.add_argument('--accept', action='store_true')
  args = parser.parse_args()

  main(args.excel_file, args.destination_directory, accept=args.accept)
