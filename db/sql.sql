--insert into regions(region) values('{"id":"1", "name":"江苏", "cities":[{"id":"1", "name":"苏州"},{"id":"2","name":"常州"},{"id":"3","name":"丹阳"},{"id":"4","name":"南京"}]}');

select * from (
select region, jsonb_array_elements(region->'cities') as res from regions
) t --where res @> '{"id":"1"}'
