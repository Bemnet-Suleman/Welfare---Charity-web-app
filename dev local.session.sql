delete from users
where id in (select id from users where username != 'Bemnet');