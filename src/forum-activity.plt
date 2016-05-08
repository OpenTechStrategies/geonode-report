# Run-time configuration file for gnuplot.
# See forum-activity.sh for details.

set encoding iso_8859_1
set terminal png size 500,312
set output 'users-forum-activity-posts.png'
set xdata time
set timefmt "%Y%m%d"

set title "GeoNode Users Google Group Activity\nmid-2012 through late 2014"
set xlabel "14 June 2012 - 31 Dec 2014"
set ylabel "Posts"
set xrange ["20120614":"20150225"]
set autoscale y
set format x ""
set format y "%.0f"
set grid
set mxtics 1
set mytics 1

plot 'u-posts.in' using 1:2 notitle with boxes lt 3 lw 1
