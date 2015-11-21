var pg = require('pg');
var conString = "postgres://kisweb:kisweb@localhost/kisweb";  

//this initializes a connection pool 
//it will keep idle connections open for a (configurable) 30 seconds 
//and set a limit of 20 (also configurable) 

//query is map like this {sql:'',params:[], doResult:callback}
var pgquery = function(query) {
		pg.connect(conString, function (err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
		
			client.query(query.sql, query.params, function (err, result) {
				//call `done()` to release the client back to the pool 
				done();
				if (err) {
					return console.error('error running query', err);
				}
				console.log(result.toString())
				query.doResult(result);
			});
		});
    };
	
var getCustomers = "SELECT customer.id customer_id, customer.name as customer_name, tel_number, mobile_number, address,  principal, company, city.name as city_name, city.id " +
  "FROM customer,city "+
  "where customer.city = city.id "+
  "order by city.id, customer.id asc; ";
  
var getProductModals = "SELECT product_modal.id as modal_id, product_modal.name as modal_name, product_modal.description, category category_id, product_category.name category_name, customer, product_units.id units_id, product_units.cn_name units_name, suggest_unit_price "+
  "FROM product_modal , product_category, product_units "+
  "where product_modal.customer = $1 and product_modal.category = product_category.id and product_units.id=product_modal.units " +
  "order by product_modal.id"

var setUpdateOrderNumber = "update sale_order_number set order_number=order_number+1";
var getCurrentOrderNumber = "select order_number from sale_order_number";