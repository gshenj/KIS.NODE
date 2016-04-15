/**
 * Created by jin on 2015/11/23 0023.
 */
const ipcRenderer = require('electron').ipcRenderer;

var datepicker_options = {
    changeMonth: true,
    changeYear: true,
    dateFormat: 'yy-mm-dd',//日期格式
    clearText: "清除",//清除日期的按钮名称
    closeText: "关闭",//关闭选择框的按钮名称
    prevText: '<上月',
    nextText: '下月>',
    currentText: '今天',
    yearSuffix: '年', //年的后缀
    showMonthAfterYear: true,//是否把月放在年的后面
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    showButtonPanel: true,
    gotoCurrent: true
};
accounting.settings = {
    currency: {
        symbol: "¥",   // default currency symbol is '$'
        format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
        decimal: ".",  // decimal point separator
        thousand: ",",  // thousands separator
        precision: 2   // decimal places
    },
    number: {
        precision: 0,  // default precision on numbers is 0
        thousand: ",",
        decimal: "."
    }
};

//var modals = null;
//var p_win = null;

var user = ipcRenderer.sendSync('session', {opt: 'get', key: 'user'});
var company = ipcRenderer.sendSync('session', {opt:'get', key: 'company'});

$(function () {
    $('#pass_update').colorbox({inline: true,"href":'#pass_update_div',width: '500px', height: '450px',
        speed: 0,
        overlayClose: false})

    $(".m_a").click(function () {
        $('.container').hide();
        var target = $(this).attr("data-target");
        $("#" + target).show();
        $('.navbar-nav li').removeClass('active')
        $(this).parent().addClass("active")


        /*if (target == '__new__') {

         } else*/
        if (target == '__list__') {
            // listOrders(15, 0)
            loadOrdersTable()
        } else if (target == '__sys__') {
            //showSysManage();
        }
    });

    // 当前选项卡内容初始化
    initNewOrderPage();
});

var ordersTable = null;
var table_click_attached = false;

/**
 * 显示表格 */
function loadOrdersTable() {

    if (ordersTable != null) {
        ordersTable.destroy();
        $('#orders_table').empty();
        ordersTable = null;
    }

    ordersTable = $('#orders_table').DataTable({
        //  "scrollY": 500,
        "order": [[0, "desc"]],
        "dom": '<"DT_top"<"DT_condition"><"DT_search"f><"DT_clear">>tip',
        "scrollCollapse": false,
        "pagingType":'full_numbers',
        "pageLength": 10,
        //"paging": false,
        "data": [],
        "rowId": 'DT_rowId',
        "columnDefs": [
            {
                "render": function (data, type, row) {
                    return '<a href="javascript:openPreviewSelect(\'' + data + '\')">' + data + '</a>';
                },
                "title": "出货单号",
                "width": "10%",
                "targets": [0],
                "data": "dh"
            },
            {
                className: "center",
                "title": "送货日期",
                "width": "10%",
                "targets": [1],
                "data": 'shrq'
            },
            {
                "title": "客户",
                "width": "20%",
                "targets": [2],
                "data": 'kh'
            },
            {
                "orderable": false,
                "title": "内容",
                "width": "30%",
                "targets": [3],
                "data": 'nr'
            },
            {
                className: "center",
                "orderable": false,
                "title": "制单人",
                "width": "8%",
                "targets": [4],
                "data": 'dz'
            },
            {
                className: "center",
                "orderable": false,
                "title": "录入时间",
                "width": "12%",
                "targets": [5],
                "data": 'llsj'
            },
            {
                className: "center",
                "title": "作废",
                width:"10%",
                targets:[6],
                "data": "zf",
                "render": function (data, type, row) {
                    return (data == '1') ?'<span style="color:red">是</span>':'否';
                },
            }
        ],
        scroller: {
            rowHeight: 22
        },
        "language": {
            "url": "scripts/datatable/cn.json"
        },
        "initComplete": function (settings, json) {
            var condition = '<label style="margin-left:10px;">客户名称：</label><input id="search_customer"  onchange="changeCustomerSearch()" onclick="openCustomerWindowInList()" type="text" style="width:300px;" /><label style="margin-left:20px;" for="sale_date_begin">送货日期：</label>' +
                '<input id="sale_date_begin" onchange="findOrders()" style="width:120px;" />' +
                '<label for="sale_date_end">至</label>' +
                '<input id="sale_date_end" onchange="findOrders()" style="width:120px;"  />'

            $(".DT_condition").html(condition);
            $("#sale_date_begin").datepicker(datepicker_options);
            $("#sale_date_end").datepicker(datepicker_options);
            /*if (flag == 1) {
             $('.opt-select').show();
             } else if (flag == 2) {
             $('.opt-manage').show();
             }*/


            findOrders();
            //    fillAllCustomers();
        }
    });

    if (table_click_attached) {
        return;
    }

    table_click_attached = false;
}


/**
 * 选择出货单号，显示预览窗口。
 * @param src
 */
function openPreviewSelect(orderNumber) {
    DB_QUERY({
        sql: SQL_FIND_ORDER_BY_ORDER_NUMBER, params: [orderNumber], doResult: function (result) {
            if (result.rows.length == 0) {
                alert('error');
                return;
            }

            var order_info = result.rows[0];
            var order = {order_info: order_info, type: "select"}
            ipcRenderer.sendSync('session', {opt: 'put', key: 'order', value: order});
            openPreviewWindow();
        }
    });

}


function logout() {
    // doLogout()
    var ret = ipcRenderer.sendSync('session', {opt: 'clear', key: ''});
    if (ret == 'true') {
        console.log("Clear session!")
        user = ipcRenderer.sendSync('session', {opt: 'get', key: 'user'});
        console.log('User -> ' + user); // prints "pong"
    }
    document.location.href = "login.html"
}


function openPreviewWindow() {
    const BrowserWindow = require('electron').remote.BrowserWindow;
    var mainWin = BrowserWindow.getFocusedWindow();
    var win = new BrowserWindow({width: 900, height: 600, show: false, resizable: false, minimizable:false,alwaysOnTop:true, autoHideMenuBar: true});
    win.on('closed', function () {
        win = null;
        mainWin.setClosable(true);
        mainWin.setResizable(true);
        mainWin.setMinimizable(true);
        mainWin.setMaximizable(true);
        mainWin.setMovable(true);
        $.colorbox.close()
    });
    mainWin.setClosable(false);
    mainWin.setResizable(false);
    mainWin.setMinimizable(false);
    mainWin.setMaximizable(false);
    mainWin.setMovable(false);

    win.on('printed', function (data) {
        if (data == 'create') {
            // resetForm();
            resetOrderForm()
        } else if (data == 'cancel') {
            // reload table
            findOrders();
        }
    });

    $.colorbox({
        inline: "#main_layout",
        width: -1,
        height: -1,
        open: true,
        speed: 0,
        overlayClose: false,
        escKey: false,
        arrowKey: false
    });

    win.loadURL('file://' + __dirname + '/order/order-preview.html');
    win.show();

}


function openPreviewCreate() {
    //window.print();
    var c_customer_id = $('#customer_id').val();
    var c_customer_name = $('#customer_name').val();

    var c_customer_address = $('#customer_address').val();
    var c_customer_principal = $('#customer_principal').val();
    var c_customer_phone = $('#customer_phone').val();
    var c_sale_date = $('#sale_date').val();
    var c_product_total_sum = $('#product_total_sum').html();
    if (c_product_total_sum != '') {
        c_product_total_sum = accounting.unformat(c_product_total_sum)
    }

    var c_products = new Array();
    var _modals = $('.product_modal');
    var total_num = 0;
    for (var i = 0; i < _modals.length; i++) {
        var modal = $(_modals[i]).val();
        if (modal == '') {
            continue;
        }

        //var modal_name = getProductModalNameById(modal);
        var idx = $(_modals[i]).parent().parent().attr("idx");
        var product_name = $('tr[idx="' + idx + '"] .product_name').val();
        // var product_category_id = $('tr[idx="' + idx + '"] .product_category').attr("category_id");
        var product_num = $('tr[idx="' + idx + '"] .product_num').val();
        if (product_num == '') {
            continue;
        }
        total_num += accounting.unformat(product_num);

        var product_units = $('tr[idx="' + idx + '"] .product_units').val();
        var product_unit_price = $('tr[idx="' + idx + '"] .product_unit_price').val();
        var product_sum = $('tr[idx="' + idx + '"] .product_sum').val();
        var product_memo = $('tr[idx="' + idx + '"] .product_memo').val();


        c_products.push({
            // product_category_id: product_category_id,
            product_name: product_name,
            // product_modal_id: modal,
            modal_name: modal,
            modal_units: product_units,
            product_num: product_num,
            modal_price: product_unit_price,
            product_sum: product_sum,
            product_memo: product_memo
        })

    }


    /**
     * 数据结构
     */
    var order_info = {
        customer: c_customer_id,
        customer_info: {
            id: c_customer_id,
            name: c_customer_name,
            address: c_customer_address,
            principal: c_customer_principal,
            phone: c_customer_phone
        },
        sale_date: c_sale_date,
        products: c_products,
        create_user_info: user,
        create_user: user.id,
        total_num: total_num,
        total_sum: c_product_total_sum,
        canceled: 0
    };
    var order = {order_info: order_info, type: "create"}
    DB_QUERY({//获取最后的order_number
        sql: SQL_LAST_ORDER_NUMBER, params: [], doResult: function (result) {
            var curr_order_number = result.rows[0].order_number;
            order.order_info.order_number = (curr_order_number + 1);
            order.order_number = order.order_info.order_number;
            //console.log(JSON.stringify(order_info))
            ipcRenderer.sendSync('session', {opt: 'put', key: 'order', value: order});

            openPreviewWindow();
        }
    });


}

/**
 * 加载并初始化日期控件
 */
function initSaleDate() {
    $("#sale_date").datepicker(datepicker_options);
    $("#sale_date").datepicker("setDate", new Date());

}

/*清空某一商品项*/
function clearOneProductItem(src) {
    var idx = $(src).parent().parent().attr('idx')
    $('tr[idx="' + idx + '"] .product_modal').html('<option value=""></option>');
    $('tr[idx="' + idx + '"] .product_units').val('');
    $('tr[idx="' + idx + '"] .product_unit_price').val('');
    $('tr[idx="' + idx + '"] .product_num').val('');
    $('tr[idx="' + idx + '"] .product_sum').val('');
    $('tr[idx="' + idx + '"] .product_memo').val('');
    setTotalSum();
}

/*清空某一商品项*/
function clearOneModalItem(src) {
    var idx = $(src).parent().parent().attr('idx')
    // onchange的时候值还没有设置为空，所以手动设置。
    // $('tr[idx="' + idx + '"] .product_modal').val('');
    //
    $('tr[idx="' + idx + '"] .product_units').val('');
    $('tr[idx="' + idx + '"] .product_unit_price').val('');
    $('tr[idx="' + idx + '"] .product_num').val('');
    $('tr[idx="' + idx + '"] .product_sum').val('');
    $('tr[idx="' + idx + '"] .product_memo').val('');
    setTotalSum();
}

/*清空所有商品项*/
function clearProductItems() {
    // $('.product_name').val('')
    // $('.product_modal').val('')
    $('.product_units').val('')
    $('.product_unit_price').val('')
    $('.product_num').val('');
    $('.product_sum').val('');
    $('.product_memo').val('');
}

/*清空商品总金额*/
function clearTotalSum() {
    $('#product_total_sum').html('');
}

/*商品数量或者单价修改触发*/
function changeNumOrUnitPrice(src) {
    var idx = $(src).parent().parent().attr('idx')
    var j_product_num = $('tr[idx="' + idx + '"] .product_num');
    var j_product_unit_price = $('tr[idx="' + idx + '"] .product_unit_price');
    var j_product_sum = $('tr[idx="' + idx + '"] .product_sum');

    var v_product_num = j_product_num.val();
    var v_product_unit_price = j_product_unit_price.val();
    var v_product_sum;

    if ($.trim(v_product_num) == '') {
        if ($.trim(v_product_unit_price) == '') {
            j_product_unit_price.val('');
        } else {
            j_product_unit_price.val(accounting.formatNumber(v_product_unit_price, 2));
        }

        j_product_num.val('');
        j_product_sum.val('');

    } else {
        j_product_num.val(accounting.formatNumber(j_product_num.val()))
        if ($.trim(v_product_unit_price) == '') {
            j_product_unit_price.val('');
            j_product_sum.val('');
        } else {
            j_product_unit_price.val(accounting.formatNumber(v_product_unit_price, 2));
            //alert(accounting.unformat(j_product_unit_price.val()))
            var sum = accounting.unformat(j_product_num.val()) * accounting.unformat(j_product_unit_price.val()) * 100 / 100
            j_product_sum.val(accounting.formatNumber(sum, 2))
        }
    }

    setTotalSum();
}

/*计算总金额*/
function calcTotalSum() {
    var arr_modals = $('.product_modal');
    var arr_sum = $('.product_sum');
    var total_sum = '';
    for (var i = 0; i < arr_modals.length; i++) {

        if ($(arr_modals[i]).val() != '') {
            // 选了型号
            var _sum_val = $(arr_sum[i]).val();
            if (_sum_val == '') {
                return '';
            } else {
                if (total_sum == '') total_sum = 0;
                total_sum += accounting.unformat(_sum_val);
            }
        }
    }

    if (total_sum == '')
        return total_sum;
    else
        return accounting.formatMoney(total_sum);
}

/*设置总金额*/
function setTotalSum() {
    $('#product_total_sum').html(calcTotalSum());
}


/**
 *
 */
function initNewOrderPage() {
    initSaleDate()
    $('.product_num').on('change', function () {
        changeNumOrUnitPrice(this)
    })
    $('.product_unit_price').on('change', function () {
        changeNumOrUnitPrice(this)
    })
    $(".product_name").on('change', function () {
        selectProduct(this)
    })
    $(".product_modal").on('change', function () {
        selectModal(this)
    })

    //todo
    $('#customer_name').on('click', function () {
        openCustomerWindow(function (customer) {
            console.log("Get customer => " + JSON.stringify(customer));
            // 获取到客户数据
            $('#customer_id').val(customer.id);
            $('#customer_name').val(customer.name);
            $('#customer_address').val(customer.address);
            $('#customer_principal').val(customer.principal);
            $('#customer_phone').val(customer.phone);
            // get products of customer
            DB_QUERY({
                sql: SQL_FIND_PRODUCTS_BY_CUSTOMER, params: [customer.id], doResult: function (result) {
                    var products = result.rows;
                    setProductSelect(products)
                    $.colorbox.close();
                }
            });

        });
    })

}

function changeCustomerSearch() {
    findOrders()
}

function openCustomerWindowInList() {
    openCustomerWindow(function (customer) {
        console.log("Get customer => " + JSON.stringify(customer));
        // 获取到客户数据
       // $('#search_customer').attr('customer_id', customer.id);
        $('#search_customer').val(customer.name);

        findOrders()
    });
}


function openCustomerWindow(onSelectListener) {
    const BrowserWindow = require('electron').remote.BrowserWindow;
    var mainWin = BrowserWindow.getFocusedWindow()
    // In the main process.
    //const BrowserWindow = require('electron').BrowserWindow;
    $.colorbox({
        inline: "#main_layout",
        width: -1,
        height: -1,
        open: true,
        speed: 0,
        overlayClose: false,
        escKey: false,
        arrowKey: false
    });

    var win = new BrowserWindow({
        title: '选择客户',
        width: 1200,
        height: 700,
        show: false,
        resizable: false,
        minimizable:false,
        alwaysOnTop:true,
        autoHideMenuBar: true,
        acceptFirstMouse: true
    });
    win.on('select_customer', onSelectListener /*function(customer){onSelectCallback(customer);} */);

    win.on('closed', function () {
        win = null;
        mainWin.setClosable(true);
        mainWin.setResizable(true);
        mainWin.setMinimizable(true);
        mainWin.setMaximizable(true);
        mainWin.setMovable(true);
        $.colorbox.close()
    });

    win.loadURL('file://' + __dirname + '/sys_manage/customer-manage.html?flag=1');
    win.show();
    mainWin.setClosable(false);
    mainWin.setResizable(false);
    mainWin.setMinimizable(false);
    mainWin.setMaximizable(false);
    mainWin.setMovable(false);

}

/**
 * 重置表单
 */
function resetOrderForm() {
    /*
     const BrowserWindow = require('electron').remote.BrowserWindow;
     var win = BrowserWindow.getFocusedWindow();
     win.reload();
     */
    $('input').val('');
    $('#sale_date').datepicker('setDate', new Date())

    $('select').html('<option></option>')
    clearTotalSum();

}

/**
 * 根据条件查询订单，并显示在表格上。
 * @param conditions
 */
function findOrders() {
    var condition = null;
    var parameters = [company.id];

    var customer_id = $('#search_customer').val();
    var sale_date_begin = $('#sale_date_begin').val();
    var sale_date_end = $('#sale_date_end').val();

    var condition_sql_arr = []
    var condition_param_arr = []
    if (customer_id != '') {
        condition_sql_arr.push(' customers.name = $? ');
        condition_param_arr.push(customer_id);
    }
    if (sale_date_begin != '') {
        condition_sql_arr.push(" orders.sale_date >= $? ");
        condition_param_arr.push(sale_date_begin);
    }
    if (sale_date_end != '') {
        condition_sql_arr.push(" orders.sale_date <= $? ");
        condition_param_arr.push(sale_date_end);
    }

    if (condition_sql_arr.length > 0) {
        condition = {}
        condition.sql = "";
        for (var x=0; x<condition_sql_arr.length; x++) {
            condition.sql += " and "
            var _sql = condition_sql_arr[x].replace('?', (x+2));
            condition.sql += _sql;
        }
        condition.params = condition_param_arr;
    }


    var sqlFindOrders = SQL_FIND_ALL_ORDERS;
    if (condition != null) {
        console.log(condition.sql)
        sqlFindOrders = sqlFindOrders.replace('__condition__', condition.sql)   // text: where $1 , params:[]
        for (var x in condition.params) {
            parameters.push(condition.params[x])
        }
    } else {
        sqlFindOrders = sqlFindOrders.replace('__condition__', "")
    }

    console.info("SQL_FIND_ORDERS: "+sqlFindOrders +"\nPARAMS: " + JSON.stringify(parameters))
    DB_QUERY({
        sql: sqlFindOrders, params: parameters, doResult: function (result) {
            //showRows(result1.rows);
            var tableData = [];
            var rows = result.rows;

            for (var i = 0; i < rows.length; i++) {
                var productArr = rows[i].products;
                var canceled = rows[i].canceled;

                /*var nr = "";
                 for (var j in productArr) {
                 nr += "[" + productArr[j].product_name + ", "+productArr[j].modal_name +", " + productArr[j].product_num + productArr[j].modal_units +"]"
                 }*/
                var nr = productArr[0].product_name + ", " + productArr[0].modal_name + ", " + productArr[0].product_num + productArr[0].modal_units + " ...";
                var orderInfo = {
                    "DT_rowId": rows[i].order_number,
                    "dh": rows[i].order_number,
                    "shrq": rows[i].sale_date,
                    "kh": rows[i].customer_info.name,
                    "dz": rows[i].create_user_info.name,
                    "llsj": rows[i].create_time.Format("yyyy-MM-dd hh:mm"),
                    "nr": nr,
                    "zf": canceled
                }
                tableData.push(orderInfo);
            }
            ordersTable.clear();  //.draw()
            ordersTable.rows.add(tableData).draw();
        }
    });
}


/********************************************************订单内容部分处理**********************************************/
var CURRENT_PRODUCTS = null;
var CURRENT_MODALS = null;

function setProductSelect(products) {
    var str = '<option value=""></option>';
    // 更改商品必然需要更改型号
    $('.product_modal').html(str);
    console.log("Reset product modal.")
    for (var x  in products) {
        str += '<option value="' + products[x].name + '">' + products[x].name + '</option>';
    }

    $('.product_name').html(str);
    console.log("Set product name.")
    // 清空所有选择项目
    clearProductItems();
    CURRENT_PRODUCTS = products;
}

function selectProduct(src) {
    var _product_name = $(src).val();
    console.log("Select product '" + _product_name + "'")
    if (_product_name == '') {
        // 商品选择为空，说明不使用这条商品项目，清空之
        clearOneProductItem(src);
        return;
    }
    for (var x in CURRENT_PRODUCTS) {
        if (_product_name == CURRENT_PRODUCTS[x].name) {
            var modals = CURRENT_PRODUCTS[x].modals;
            setModalSelect(src, modals);
        }
    }

}

function setModalSelect(src, modals) {
    var str = '<option value=""></option>';
    for (var x in modals) {
        str += '<option value="' + modals[x].name + '">' + modals[x].name + '</option>';
    }
    $(src).parent().next().children().html(str);
    CURRENT_MODALS = modals;
}

function selectModal(src) {
    var _modal_name = $(src).val();
    console.log("Select Modal: '" + _modal_name + "'");
    if (_modal_name == '') {
        clearOneModalItem(src)
        return;
    }
    for (var x in CURRENT_MODALS) {
        if (_modal_name == CURRENT_MODALS[x].name) {
            $(src).parent().next().children().val(CURRENT_MODALS[x].units);
            var _suggest_price = CURRENT_MODALS[x].suggest_price;
            if (_suggest_price == null || _suggest_price > 0) {
                $(src).parent().next().next().next().children().val(_suggest_price);
            }
            break;
        }
    }
}

function gotoRegionManage() {

    const BrowserWindow = require('electron').remote.BrowserWindow;
    var mainWin = BrowserWindow.getFocusedWindow()

    $.colorbox({
        inline: "#main_layout",
        width: -1,
        height: -1,
        open: true,
        speed: 0,
        overlayClose: false,
        escKey: false,
        arrowKey: false
    });


    var win = new BrowserWindow({width: 1200, height: 700, show: false, resizable: false, autoHideMenuBar: true});
    win.on('closed', function () {
        win = null;
        mainWin.setClosable(true);
        mainWin.setResizable(true);
        mainWin.setMinimizable(true);
        mainWin.setMaximizable(true);
        mainWin.setMovable(true);
        $.colorbox.close()
    });

    win.loadURL('file://' + __dirname + '/sys_manage/region-manage.html');
    win.show();

    mainWin.setClosable(false);
    mainWin.setResizable(false);
    mainWin.setMinimizable(false);
    mainWin.setMaximizable(false);
    mainWin.setMovable(false);
}


function gotoCustomerManage() {
    const BrowserWindow = require('electron').remote.BrowserWindow;
    var mainWin = BrowserWindow.getFocusedWindow()
    // In the main process.
    //const BrowserWindow = require('electron').BrowserWindow;
    $.colorbox({
        inline: "#main_layout",
        width: -1,
        height: -1,
        open: true,
        speed: 0,
        overlayClose: false,
        escKey: false,
        arrowKey: false
    });

    var win = new BrowserWindow({
        title: '管理客户',
        width: 1200,
        height: 700,
        show: false,
        resizable: false,
        minimizable:false,
        alwaysOnTop:true,
        autoHideMenuBar: true,
        acceptFirstMouse: true
    });
    win.on('select_customer', function (customer) {
        alert(customer)
    });

    win.on('closed', function () {
        win = null;
        mainWin.setClosable(true);
        mainWin.setResizable(true);
        mainWin.setMinimizable(true);
        mainWin.setMaximizable(true);
        mainWin.setMovable(true);
        $.colorbox.close()
    });

    win.loadURL('file://' + __dirname + '/sys_manage/customer-manage.html?flag=2');
    win.show();
    mainWin.setClosable(false);
    mainWin.setResizable(false);
    mainWin.setMinimizable(false);
    mainWin.setMaximizable(false);
    mainWin.setMovable(false);
}

