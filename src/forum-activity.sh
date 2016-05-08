#!/bin/sh

# Generate a bar chart about GeoNode users forum activity.
# See forum-activity.el for how data gets generated.

rm -f forum-activity-posts.png
gnuplot forum-activity.plt
gimp forum-activity-posts.png &
