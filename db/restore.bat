C:\Program Files\PostgreSQL\9.4\bin\createdb" newdatabase
"C:\Program Files\PostgreSQL\9.4\bin\psql" -h localhost -U postgres kisweb < E:\Programming\GitHub\KIS.NODE\db\kisweb.bak.20151123
 pause



"C:\Program Files\PostgreSQL\9.4\bin\pg_dump" -h localhost -U postgres kisweb >  E:\Programming\GitHub\KIS.NODE\db\kisweb.bak.20151123