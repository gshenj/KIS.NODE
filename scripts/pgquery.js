/**
 * 给页面添加jQuery支持，必须在所有<script></script>标签之前.
 * @type {jQuery|exports|module.exports}
 */
jQuery = require('jquery')
$ = jQuery;
//console.log(jQuery.fn.jquery)


/**
 * 添加node.js for Postgres支持。
 * @type {PG|exports|module.exports}
 */
var pg = require('pg');
var conString = "postgres://kisweb:kisweb@localhost/kisweb";
//this initializes a connection pool 
//it will keep idle connections open for a (configurable) 30 seconds 
//and set a limit of 20 (also configurable) 

//query is map like this {sql:'',params:[], doResult:callback}
var pgquery = function (query) {
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
    "FROM customer,city " +
    "where customer.city = city.id " +
    "order by city.id, customer.id asc; ";

var getProductModals = "SELECT product_modal.id as modal_id, product_modal.name as modal_name, product_modal.description, category category_id, product_category.name category_name, customer, product_units.id units_id, product_units.cn_name units_name, suggest_unit_price " +
    "FROM product_modal , product_category, product_units " +
    "where product_modal.customer = $1 and product_modal.category = product_category.id and product_units.id=product_modal.units " +
    "order by product_modal.id"

var setUpdateOrderNumber = "update sale_order_number set order_number=order_number+1";
//var getCurrentOrderNumber = "select order_number from sale_order_number";
var getCurrentOrderNumber = "select nextval('seq_order_number') as order_number";

var addSaleOrder = "insert into sale_order_json(order_number,customer_id, sale_date, data) values($1, $2, $3,$4)";

var findAllSaleOrder = "select data,order_number, customer_id, create_date from sale_order_json order by order_number desc limit $1 offset $2";  // limit 20 offset 0
var countAllSaleOrder = "select count(*) as cnt from sale_order_json";

var sql_find_order = "select order_number, customer,customer_info, create_user, create_user_info, sale_date, create_time, products, total_sum, total_num from orders where order_number = $1";
var sql_find_all_orders = "select order_number, customer,customer_info, create_user, create_user_info, sale_date, create_time, products, total_sum, total_num from orders __condition__ order by order_number desc";

var findSaleOrder = "select customer.name, customer.id, sale_order.order_number, sale_order.data from customer, sale_order_json sale_order where sale_order.customer_id = customer.id and order_number = $1";

var sql_add_order = "insert into orders(order_number, sale_date, customer, customer_info, create_user, create_user_info, products, total_num, total_sum) values($1,$2,$3,$4,$5,$6,$7,$8,$9)";

var sql_find_regions = "select region from regions order by region->>'pcode';"

var sql_find_customers_by_region = "select id, region,customer_info from customers where region >= $1 and region <= $2 order by region";
var sql_add_customer = "insert into customers(id, name, region, customer_info) values(nextval('seq_kis'), $1, $2, $3)";
var sql_update_customer = "update customers set name = $1, customer_info = $2 where id = $3";
var sql_delete_customer = "delete from customers where id = $1";
var sql_find_customer_by_id = "select * from customers where id = $1"

var sql_find_products_by_customer = "select name, modals from products where customer = $1 order by name asc";
var sql_add_product = "insert into products(customer, name, modals) values($1, $2, $3)";
var sql_delete_product = "delete from products where customer=$1 and name=$2"
var sql_update_product = "update products set name = $1 where customer=$2 and name=$3"
var sql_update_modals = "update products set modals = $1 where customer=$2 and name=$3"

var sql_add_region = "insert into regions(region) values($1)";
var sql_update_region = "update regions set region = $1 where (region ->>'name') = $2"
var sql_delete_region = "delete from regions where region->>'name'= $1"


/**
 * 获取URL中的参数值
 * @param name
 * @returns {null}
 */
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

/**
 * Created by kp on 2015-11-23.
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;

    //return formatDate(this,fmt)
}

/**
 * 格式化显示日期类型
 * @param date
 * @param fmt
 * @returns {*}
 */
function formatDate(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}