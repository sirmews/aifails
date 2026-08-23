-- Reset all solidarity counts to reflect actual genuine votes from confession_solidarity
UPDATE confessions
SET solidarity_count = (
  SELECT COUNT(*)
  FROM confession_solidarity
  WHERE confession_solidarity.confession_id = confessions.id
);
