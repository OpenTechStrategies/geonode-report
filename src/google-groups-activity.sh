#!/bin/sh

# Generate a bar chart about GeoNode Google Groups activity.
# See google-groups-activity.el for how data gets generated.

# Clear away any old images, so that if this run fails,
# we won't be fooled into thinking it succeeded.
rm -f google-groups-activity-posts.png google-groups-activity-views.png

# Fill in the variable parts of the chart template.
cp google-groups-activity.plt.in google-groups-activity-posts.plt
cp google-groups-activity.plt.in google-groups-activity-views.plt
sed -e 's/___THING___/posts/g' \
    < google-groups-activity-posts.plt > google-groups-activity-posts.plt.tmp
mv google-groups-activity-posts.plt.tmp google-groups-activity-posts.plt
sed -e 's/___CAPTHING___/Posts/g' \
    < google-groups-activity-posts.plt > google-groups-activity-posts.plt.tmp
mv google-groups-activity-posts.plt.tmp google-groups-activity-posts.plt
sed -e 's/___THING___/views/g' \
    < google-groups-activity-views.plt > google-groups-activity-views.plt.tmp
mv google-groups-activity-views.plt.tmp google-groups-activity-views.plt
sed -e 's/___CAPTHING___/Views/g' \
    < google-groups-activity-views.plt > google-groups-activity-views.plt.tmp
mv google-groups-activity-views.plt.tmp google-groups-activity-views.plt

# Plot!
gnuplot google-groups-activity-posts.plt
gnuplot google-groups-activity-views.plt
gimp google-groups-activity-posts.png google-groups-activity-views.png &
