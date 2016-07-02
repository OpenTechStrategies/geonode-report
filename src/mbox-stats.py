#!/usr/bin/python

"""Convert mbox input into statistics to be fed into gnuplot or
some other charting program.

Usage: mbox-stats.py [--verbose|-v] < STDIN > OUTPUT

With --verbose, the output is in this format

  Messages:

  YYYYMMDD|SENDER|NUM_REFERENCES|SUBJECT|MESSAGE_ID
  YYYYMMDD|SENDER|NUM_REFERENCES|SUBJECT|MESSAGE_ID
  YYYYMMDD|SENDER|NUM_REFERENCES|SUBJECT|MESSAGE_ID
  ...etc...

  Date counts:

  YYYYMMDD|TOTAL_COUNT_DAY|NUM_REPLIES_DAY
  YYYYMMDD|TOTAL_COUNT_DAY|NUM_REPLIES_DAY
  YYYYMMDD|TOTAL_COUNT_DAY|NUM_REPLIES_DAY
  ...etc...

Without --verbose, it's:

  YYYYMM|TOTAL_COUNT_MONTH|NUM_REPLIES_MONTH
  YYYYMM|TOTAL_COUNT_MONTH|NUM_REPLIES_MONTH
  YYYYMM|TOTAL_COUNT_MONTH|NUM_REPLIES_MONTH

Presumably, from those you can massage to whatever format you need."""

# TODO: Consider using Flanker (https://github.com/mailgun/flanker)
# to parse the email addreses.  Description:
#
#   "Flanker is an open source parsing library written in Python
#   by the Mailgun Team. Flanker currently consists of an address
#   parsing library (flanker.addresslib) as well as a MIME parsing
#   library (flanker.mime)."

import os
import sys
import re
import string
import email.Utils
import email.Parser
import getopt

# We need this for the same reason we always do.
month_vals = {
  "jan" : "01",
  "feb" : "02",
  "mar" : "03",
  "apr" : "04",
  "may" : "05",
  "jun" : "06",
  "jul" : "07",
  "aug" : "08",
  "sep" : "09",
  "oct" : "10",
  "nov" : "11",
  "dec" : "12"
  }


def handle_msg(msg, out, accum, verbose=False):
  """Handle email.Message MSG, sending output to OUT.

  ACCUM is a dictionary mapping dates to lists of the form:
  [total_messages_that_date, number_that_were_replies].
  The dates are *both* "YYYYMMDD" strings and "YYYYMM" strings; we
  accumulate both month scores and day scores at the same time.

  VERBOSE means emit individual message details; if not VERBOSE,
  then just accumulate information in ACCUM.

  """
  froms = msg.get_all('from', [ ]) # Apparently sometimes multiple?
  tos = msg.get_all('to', [ ])
  ccs = msg.get_all('cc', [ ])
  bccs = msg.get_all('bcc', [ ])
  subject = msg.get_all('subject', None)
  msg_id = msg.get_all('message-id', None)
  date = msg.get_all('date', None)
  in_reply_to = msg.get_all('in-reply-to', None)
  references = msg.get_all('references', [ ])

  if msg_id is None:
    msg_id = "?"
  else:
    msg_id = msg_id[0]

  if subject is None:
    subject = ""
  else:
    subject = subject[0]

  if date is not None:
    date = date[0]
    # date is ordinarily something like "Mon, 17 Aug 2007 17:37:33 -0700";
    # we want that to be "20070817".
    for day in 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun':
      date = date.replace(day + ', ', '')
    idx = date.find(':')
    if idx is not None:
      while idx > 0 and date[idx] != ' ':
        idx = idx - 1;
      if idx > 0:
        date = date[:idx]
        date = date.split()
        # Give single-digit days a leading zero.
        if len(date[0]) == 1:
          date[0] = "0" + date[0]
        # Occasionally we get weird dates, like "Sat, 21 6 9:12:28-0500";
        # be ready for them.
        if len(date) >= 3:
          date = date[2] + ' ' + date[1] + ' ' + date[0]
        elif len(date) == 2:
          date = date[1] + ' ' + date[0] + ' ' + '(YYYY?)'
        else:
          date = date[0] + ' ' + '(YYYY?)'
    # Fix the month
    month_num_str = month_vals[date[5:8].lower()]
    date = date.replace(" %s " % date[5:8], month_num_str)
  else:
    # No date seems to always means no message.  Skip it.
    return

  reference_count = len(references)
  if reference_count >= 1:
    reference_count = len(references[0].split("\n"))
  elif reference_count == 0 and in_reply_to is not None:
    reference_count = 1

  if verbose:
    out.write("%s|%s|%s|%s|%s\n" %
              (date, ", ".join(froms), reference_count, subject, msg_id))

  # Increment the accumulator, for both day and month.
  for d in date, date[:6]:
    elt = accum.get(d, [0, 0])
    elt[0] += 1
    if reference_count > 0:
      elt[1] += 1
    accum[d] = elt


def main():
  # Dictionary matching the 'accum' param of handle_msg()
  verbose = False
  date_counts = { }
  p = email.Parser.HeaderParser()

  try:
    (opts, args) = getopt.getopt(sys.argv[1:], "v", ["verbose"])
  except getopt.GetoptError, err:
    sys.stderr.write(str(err))
    sys.stderr.write("\n")
    sys.exit(1)

  for opt, optarg in opts:
    if opt in ("-v", "--verbose"):
      verbose = True
    else:
      print "Unrecognized option '%s'" % opt
      sys.exit(1)

  msg_start_re = re.compile("^From |^X-From-Line: ")
  msg_str = ""
  line = sys.stdin.readline()
  if verbose:
    sys.stdout.write("Messages:\n")
    sys.stdout.write("\n")
  while line:
    if msg_start_re.match(line):
      if msg_str:
        msg = p.parsestr(msg_str)
        handle_msg(msg, sys.stdout, date_counts, verbose)
      msg_str = line
    else:
      msg_str += line
    line = sys.stdin.readline()
  # Polish off the last message.
  if msg_str:
    msg = p.parsestr(msg_str)
    handle_msg(msg, sys.stdout, date_counts, verbose)
  if verbose:
    sys.stdout.write("\n")
    sys.stdout.write("Date counts:\n")
    sys.stdout.write("\n")
  for date in sorted(date_counts.keys()):
    if verbose and (len(date) < 8):
      continue
    elif (not verbose) and (len(date) > 6):
      continue
    elt = date_counts[date]
    num_posts = elt[0]
    num_replies = elt[1]
    if num_replies > num_posts:
      sys.stderr.write("ERROR: %d replies but only %d posts on %s\n"
                       % (num_replies, num_posts, date))
    sys.stdout.write("%s|%d|%d\n" % (date, num_posts, num_replies))


if __name__ == '__main__':
  main()
