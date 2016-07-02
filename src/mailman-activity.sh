#!/bin/sh

# Generate a bar chart about GeoNode mailman forums activity.

USERS_MBOXES=../data/mailing-lists/mailman/geonode-users-2015-2016/
DEVEL_MBOXES=../data/mailing-lists/mailman/geonode-devel-2015-2016/

(cd ${USERS_MBOXES}; gunzip -k -f *.txt.gz)
(cd ${DEVEL_MBOXES}; gunzip -k -f *.txt.gz)

cat ${USERS_MBOXES}/*.txt | ./mbox-stats.py > Mailman_Users_Stats.out
cat ${DEVEL_MBOXES}/*.txt | ./mbox-stats.py > Mailman_Devel_Stats.out

for LIST in Users Devel; do
  sed -e 's/|/ /g' < Mailman_${LIST}_Stats.out > Mailman_${LIST}_Stats.out.tmp
  mv Mailman_${LIST}_Stats.out.tmp Mailman_${LIST}_Stats.out
  cat Mailman_${LIST}_Stats.out | cut -d " " -f 1,2 > Mailman-Activity-${LIST}.in
  cp mailman-activity.plt.in mailman-activity.plt
  # Fill in the variable parts of the chart template.
  sed -e "s/___LISTNAME___/${LIST}/g" \
    < mailman-activity.plt > mailman-activity.plt.tmp
  mv mailman-activity.plt.tmp mailman-activity.plt
  # Plot!
  gnuplot mailman-activity.plt
  gimp Mailman-Activity-${LIST}.png &
done

