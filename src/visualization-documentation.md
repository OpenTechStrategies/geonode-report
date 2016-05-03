# Using *Grimoire to make repo visualizations

I want to make several figures about commit rate and diversity over time
in a given project.

My initial figure ideas were:

- Rate of committing (number of commits per month) over time
- Total number of committers over time
- Number of new committers over time
- Number of commits that are merges of PRs v. “regular”

The *Grimoire (MetricsGrimoire and VizGrimoire) tools seem to be the
right way to do this.  See [this
presentation](https://archive.fosdem.org/2013/schedule/event/do_you_want_to_measure_your_project/)
for an overview of these tools and [this
doc](https://github.com/VizGrimoire/VizGrimoireR/wiki/Example-of-use-with-GitHub-projects)
for an explanation of how to put them together.

1. Get the tools and their dependencies.

   ```
    # actually the setup script gets these later, so these steps are unnecessary
    $ git clone https://github.com/MetricsGrimoire/CVSAnalY
    $ git clone https://github.com/MetricsGrimoire/RepositoryHandler
    $ cd RepositoryHandler
    $ sudo python setup.py install
    $ cd ../CVSAnalY
    $ sudo apt-get install python-setuptools
    $ sudo python setup.py install
    $ cd ..
    # can we skip this one?
    $ git clone git@github.com:VizGrimoire/GrimoireLib.git # or https://github.com/VizGrimoire/GrimoireLib.git
    $ cd GrimoireLib/
    $ sudo python setup.py install
    $ cd ..
    $ git clone git@github.com:VizGrimoire/VizGrimoireJS.git # or https://github.com/VizGrimoire/VizGrimoireJS.git
    $ cd VizGrimoireJS
    $ make
    $ ./templates/gen.sh
    $ cd ..
    $ git clone git@github.com:VizGrimoire/VizGrimoireR.git # or https://github.com/VizGrimoire/VizGrimoireR.git
    $ git clone git@github.com:VizGrimoire/VizGrimoireUtils.git # or https://github.com/VizGrimoire/VizGrimoireUtils.git

    # get R dependencies
    # most Debian users will have most of these already
    $ sudo apt-get update
    $ sudo apt-get install r-base-core r-base-dev r-cran-boot r-cran-class \
        r-cran-cluster r-cran-codetools r-cran-dbi r-cran-foreign \
        r-cran-kernsmooth r-cran-lattice r-cran-mass r-cran-matrix r-cran-mgcv \
        r-cran-nlme r-cran-nnet r-cran-rgl r-cran-rmysql r-cran-rpart \
        r-cran-spatial r-cran-survival

    $ sudo R
    > p<-c("ggplot2", "rjson", "optparse", "zoo", "ISOweek")
    > install.packages(p)
    > quit()

    # choose the CRAN mirror nearest you when prompted

    $ cd VizGrimoireR
    $ sudo R CMD INSTALL vizgrimoire

    # setup the tool in whatever directory you like, then add that
    # directory to the PATH
    $ misc/metricsgrimoire-setup.py /tmp/mg
    $ export PATH=/tmp/mg/CVSAnalY:/tmp/mg/Bicho/bin:/tmp/mg/MailingListStats:$PATH
    $ export PYTHONPATH=/tmp/mg/CVSAnalY:/tmp/mg/RepositoryHandler:/tmp/mg/Bicho:/tmp/mg/MailingListStats:$PYTHONPATH
    ```
    
2. To include issue analysis, get Bicho and dependencies.  Note that
   this script defaults to calling Bicho with a 1 second delay between
   calls to the GitHub API (to avoid blocking).  This makes the script
   *very* slow for repos that have a lot of issues.  I haven't tried
   shorter delays and would need to read up on GitHub's policy for API
   calls.

   ```
    $ git clone git@github.com:MetricsGrimoire/Bicho.git
    $ cd Bicho
    $ sudo python setup.py install

    # get Bicho's dependencies
    $ sudo apt-get install python-storm python-dateutil python-lazr.restfulclient
   ```

3. If you don't have it already, install mysql and create a root user.

4. Run the tools as in the example.  Note that the database user you
   pass must have the ability to drop and create databases.  This
   example script assumes that you are visualizing a project with a
   GitHub repo, hence the user / repo name arg.  This example call
   assumes that you've installed all of the tools in the same directory
   (see the `--vgdir` option), from which you are invoking the script.

   ```
    $ VizGrimoireR/examples/github/vg-github.py --user __YOUR_DB_USER_HERE__ --passwd __YOUR_DB_PASSWD_HERE__ \
        --dir /tmp/temp --removedb --verbose --nordep  --dbprefix test \
        --vgdir . __GITHUB_USER__/__PROJECT_REPO_NAME

    # or, to get the issue info too, include gh username and password:
   
    $ VizGrimoireR/examples/github/vg-github.py --user __YOUR_DB_USER_HERE__ --passwd __YOUR_DB_PASSWD_HERE__ \
        --dir /tmp/temp --removedb --verbose --nordep --ghuser __YOUR_GITHUB_USERNAME__ \
        --ghpasswd __YOUR_GITHUB_PASSWORD__  --dbprefix test \
        --vgdir . __GITHUB_USER__/__PROJECT_REPO_NAME
   ```

5. Run the generated browser files.

   ```
    $ cd /tmp/temp
    $ python -m SimpleHTTPServer
   ```

6. Check the generated dashboard by navigating to [localhost:8000](localhost:8000).


This doesn't fully work yet, but it does generate some charts of commit
rate and issues on the dashboard.
