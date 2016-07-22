DROP TABLE IF EXISTS `composers`;
DROP TABLE IF EXISTS `musical_works`;
DROP TABLE IF EXISTS `movements`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `movements_tags`;

CREATE TABLE composers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  dob DATE,
  PRIMARY KEY  (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE musical_works (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  composer_id INT UNSIGNED NOT NULL,
  PRIMARY KEY  (id),
  CONSTRAINT fk_mw_composer FOREIGN KEY (composer_id) REFERENCES composers (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE movements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  musical_work_id INT UNSIGNED NOT NULL,
  order INT UNSIGNED NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY(musical_work_id, order),
  CONSTRAINT fk_mv_musical_work FOREIGN KEY (musical_work_id) REFERENCES musical_works (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  content VARCHAR(255) NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY (content)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE movements_tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tag_id INT UNSIGNED NOT NULL,
  movement_id INT UNSIGNED NOT NULL,
  PRIMARY KEY  (id),
  UNIQUE KEY(tag_id, movement_id),
  CONSTRAINT fk_mvtg_tag FOREIGN KEY (tag_id) REFERENCES tags (id),
  CONSTRAINT fk_mvtg_mvt FOREIGN KEY (movement_id) REFERENCES movements (id),
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


