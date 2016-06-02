#!/bin/sh

# Generate a bar chart about GeoNode users forum activity.
# See forum-activity.el for how data gets generated.

# Clear away any old images, so that if this run fails,
# we won't be fooled into thinking it succeeded.
rm -f forum-activity-posts.png forum-activity-views.png

# Fill in the variable parts of the chart template.
cp forum-activity.plt.in forum-activity-posts.plt
cp forum-activity.plt.in forum-activity-views.plt
sed -e 's/___THING___/posts/g' \
    < forum-activity-posts.plt > forum-activity-posts.plt.tmp
mv forum-activity-posts.plt.tmp forum-activity-posts.plt
sed -e 's/___CAPTHING___/Posts/g' \
    < forum-activity-posts.plt > forum-activity-posts.plt.tmp
mv forum-activity-posts.plt.tmp forum-activity-posts.plt
sed -e 's/___THING___/views/g' \
    < forum-activity-views.plt > forum-activity-views.plt.tmp
mv forum-activity-views.plt.tmp forum-activity-views.plt
sed -e 's/___CAPTHING___/Views/g' \
    < forum-activity-views.plt > forum-activity-views.plt.tmp
mv forum-activity-views.plt.tmp forum-activity-views.plt

# Plot!
gnuplot forum-activity-posts.plt
gnuplot forum-activity-views.plt
gimp forum-activity-posts.png forum-activity-views.png &
