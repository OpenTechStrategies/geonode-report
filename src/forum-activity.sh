#!/bin/sh

# Generate a bar chart about GeoNode users forum activity.
# See forum-activity.el for how data gets generated.

rm -f forum-activity-posts.png forum-activity-views.png

sed -e 's/___THING___/posts/g' \
    < forum-activity.plt.in > forum-activity-posts.plt
sed -e 's/___THING___/views/g' \
    < forum-activity.plt.in > forum-activity-views.plt

gnuplot forum-activity-posts.plt
gnuplot forum-activity-views.plt
gimp forum-activity-posts.png forum-activity-views.png &
