#!/bin/sh

# Generate a bar chart about GeoNode users forum activity.
# See forum-activity.el for how data gets generated.

rm -f users-forum-activity-posts.png
gnuplot users-forum-activity.plt
gimp users-forum-activity-posts.png &
