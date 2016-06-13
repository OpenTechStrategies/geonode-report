# Plot the rate of issues closed in one day over time, with the total
# number of issues.
#
# Get all GeoNode issues from github API and store the result as json.
# Feed that file to this script.
#
# where pages is the number of paginated results from GitHub API call
# for n in pages:
#     curl github.com/api/GeoNode/geonode/issues?state=all&page=n&per_page=100
#
# Call this from the top level of the geonode-reports repository, like:
# $ python src/rate-issues-1-day.py
#
# You might need to install Python non-core packages 'dateutils' and
# 'matplotlib'.  There are various ways to do this, one of which is:
#
# $ sudo pip install dateutils
# $ sudo pip install matplotlib

import json
from pprint import pprint
from dateutil.parser import parse
import datetime
from datetime import date, timedelta
import operator
import matplotlib.pyplot as plt
import numpy as np

with open('issues-list-safe.json') as data_file:    
    issue_data = json.load(data_file)

# A dictionary whose keys are strings of the form 'YYYY-MM' and whose
# values are subdictionaries.  The possible keys in each subdictionary
# are 'issue_counter' and 'closed_counter'.  The values are,
# respectively, the count of issues opened in that month, and the
# number of those issues that were closed within 1 day.
month_years = {}

# loop over issue_data['issues'] and count issues per month
for issue in issue_data['issues']:

    # ignore pull requests
    if issue.has_key('pull_request'):
        continue
        
    created_date = parse(issue['created_at'])
    closed_date = None
    if issue['closed_at']:
        closed_date = parse(issue['closed_at'])

    # make the months order correctly
    if len(str(created_date.month)) < 2:
        this_month_year = str(created_date.year) + '-0' + str(created_date.month)
    else:
        this_month_year = str(created_date.year) + '-' + str(created_date.month)
    
    # add month-year array element to an array of month-years, and
    # increment a counter in that element (to account for out-of-order
    # issues)
    if month_years.has_key(this_month_year):
        month_years[this_month_year]['issue_counter'] +=1
    else:
        month_years[this_month_year] = {'issue_counter': 1, 'closed_counter': 0}

    # Filter the issues based on time-to-close.  Each issue has "closed_at"
    # and "created_at."  Count issues for each month where "closed_at" <=
    # ("created_at" + 24 hrs)
    if closed_date and (closed_date <= (created_date + datetime.timedelta(days=1))):
        month_years[this_month_year]['closed_counter'] +=1
   

months = []
issue_count = []
closed_count = []
# account for months with no issues filed (sorry about this...)
missing_months = ['2010-03', '2010-05', '2010-09', '2011-10', '2011-11', '2012-01', '2012-02', '2012-03']

for month in missing_months:
    month_years[month] = {'issue_counter': 0, 'closed_counter': 0}

sorted_months = sorted(month_years.items(), key=operator.itemgetter(0))

for month, counts in sorted_months:
    months.append(month)
    issue_count.append(counts['issue_counter'] - counts['closed_counter'])
    closed_count.append(counts['closed_counter'])


# make the graph
# see http://matplotlib.org/examples/pylab_examples/bar_stacked.html

# number of months
N=len(months)
ind = np.arange(N)
width = 0.35 

p1 = plt.bar(ind, issue_count, width, color='b')
p2 = plt.bar(ind, closed_count, width, color='y',
             bottom=issue_count)

plt.ylabel('Number of issues')
plt.title('Issues opened each month / those closed within one day')
plt.xticks(np.arange(0, N, 12), ('Dec 2009', 'Dec 2010','Dec 2011','Dec 2012','Dec 2013','Dec 2014','Dec 2015'))
plt.yticks(np.arange(0, 170, 10))
plt.legend((p1[0], p2[0]), ('Number of issues opened', 'Portion of them closed within 1 day'))

plt.show()


