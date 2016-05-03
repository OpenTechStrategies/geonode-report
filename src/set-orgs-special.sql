/* 
*
* A script that automatically generates org names from email
* addresses, moves those orgs to their own table, and associates people
* with orgs, instead of their "upeople" ids (as is normal with VizGrimoire). 
*
* This script assumes the existence of a *Grimoire database generated
* from a git-based repository. 
*/

-- create org table
DROP TABLE IF EXISTS geonode_orgs;

CREATE TABLE `geonode_orgs` (`id` int(11) NOT NULL AUTO_INCREMENT,
`organization` varchar(255) UNIQUE,
PRIMARY KEY (`id`)); 

-- pulls out org from email address and inserts into org table

insert into geonode_orgs (organization) SELECT DISTINCT SUBSTRING_INDEX(email, '@', -1) AS org FROM people;

-- rename people_upeople to safe_people_upeople

RENAME TABLE people_upeople TO safe_people_upeople;

-- create new "people_upeople" aka "people_org"
-- upeople_id here is org_id

CREATE TABLE `people_upeople` (
  `people_id` int(11) NOT NULL,
  `upeople_id` int(11) NOT NULL,
  PRIMARY KEY (`people_id`)
);

-- links person and org in people_upeople table

INSERT INTO people_upeople (people_id, upeople_id) SELECT people.id, geonode_orgs.id FROM people INNER JOIN geonode_orgs ON ( geonode_orgs.organization COLLATE utf8_general_ci = SUBSTRING_INDEX(people.email, '@', -1) );
