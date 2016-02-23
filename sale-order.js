/**
 * Created by jin on 2015/11/23 0023.
 */

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



var ipc = require('ipc');
var user = ipc.sendSync('session', {opt: 'get', key: 'user'});
console.log('Login user: ' + user.name); // prints "pong"

ipc.on("hide_overlay", function (arg) {
    console.log(arg)
    hide_overlay(arg);
});

var hide_overlay = function (arg) {
    $("#__m").modal("hide");
    if (arg.type == 'create') {
        if (arg.printed) {

            //todo  清空填
            setOrderForm(true);

            // jump to list
            $('.m_a[data-target="__list__"]').click();

        }
    } else if (arg.type == 'select') {

    }
}

var logout = function () {
    // if (window.confirm("确定退出？")) {
    // doLogout()
    var ret = ipc.sendSync('session', {opt: 'clear', key: ''});
    if (ret == 'true') {
        console.log("Clear session!")
        user = ipc.sendSync('session', {opt: 'get', key: 'user'});
        console.log('User -> ' + user); // prints "pong"
    }
    document.location.href = "login.html"
    // }
}

$(function () {
    $(".m_a").click(function () {
        $('.container').hide();
        var target = $(this).attr("data-target");
        $("#" + target).show();
        $('.navbar-nav li').removeClass('active')
        $(this).parent().addClass("active")

        if (target == '__list__') {
            listOrders(15, 0)
        } else if (target=='__sys__') {

        }
    })
})


function findByOrderNumber(order_number) {
    pgquery({
        sql: findSaleOrder, params: [order_number], doResult: function (result) {
            //console.log(result.rows)
            var json_data = result.rows[0].data;
            //console.log(json_data)
            var r = ipc.sendSync('session', {
                opt: 'put',
                key: 'order',
                value: {order_info: json_data, type: "select"}
            });
            $('#__m').modal('show')
            //var r = ipc.sendSync('hide_main_window', {});
            p_win = window.open('sale-order-preview.html', '打印', "width=800,height=600,alwaysOnTop=true");
            window.onfocus = function () {
                if (!p_win.closed) {
                    p_win.focus();
                }
            }
        }
    });
}
var customerData = new Array();
var customerInfo = new Array();
var modals = new Array();
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
}
var p_win = null;

var c_customer_id = null;
var c_customer_name = null;
var c_customer_address = null;
var c_customer_phone = null;
var c_customer_principal = null;
var c_sale_date = null;
var c_product_modals = null;
var c_product_total_sum = null;

function print_order() {
    //window.print();
    c_customer_id = $('#customer_name').val()
    for (var i = 0; i < customerData.length; i++) {
        var _children = customerData[i].children;
        for (var j = 0; j < _children.length; j++) {
            if (_children[j].id == c_customer_id) {
                c_customer_name = _children[j].text;
                break;
            }
        }
    }
    c_customer_address = $('#customer_address').val();
    c_customer_principal = $('#customer_principal').val();
    c_customer_phone = $('#customer_phone').val();
    c_sale_date = $('#sale_date').val();
    c_product_total_sum = $('#product_total_sum').html();
    if (c_product_total_sum != '') {
        c_product_total_sum = accounting.unformat(c_product_total_sum)
    }

    c_product_modals = new Array();
    var _modals = $('.product_modal');
    for (var i = 0; i < _modals.length; i++) {
        var modal_id = $(_modals[i]).val();
        if (modal_id <= 0) {
            continue;
        }

        var modal_name = getProductModalNameById(modal_id);
        var idx = $(_modals[i]).parent().parent().attr("idx");
        var product_category = $('tr[idx="' + idx + '"] .product_category').val();
        var product_category_id = $('tr[idx="' + idx + '"] .product_category').attr("category_id");
        var product_num = $('tr[idx="' + idx + '"] .product_num').val();
        var product_units = $('tr[idx="' + idx + '"] .product_units').val();
        var product_unit_price = $('tr[idx="' + idx + '"] .product_unit_price').val();
        var product_sum = $('tr[idx="' + idx + '"] .product_sum').val();
        var product_memo = $('tr[idx="' + idx + '"] .product_memo').val();


        c_product_modals.push({
            product_modal_id: modal_id,
            product_modal_name: modal_name,
            product_category_id: product_category_id,
            product_category_name: product_category,
            product_units: product_units,
            product_num: product_num,
            product_unit_price: product_unit_price,
            product_sum: product_sum,
            product_memo: product_memo
        })

    }


    function getProductModalNameById(id) {
        for (var j = 0; j < modals.length; j++) {
            var options = modals[j].options;
            for (var k = 0; k < options.length; k++) {
                if (options[k].modal_id == id) {
                    return options[k].modal_name;
                }
            }
        }
        return null;
    }


    var order_info = {
        customer_id: c_customer_id,
        customer_name: c_customer_name,
        customer_address: c_customer_address,
        customer_principal: c_customer_principal,
        customer_phone: c_customer_phone,
        sale_date: c_sale_date,
        modals: c_product_modals,
        create_user: user.name,
        create_user_id: user.id,
        product_total_sum: c_product_total_sum
    };

    var order = {order_info: order_info, type: "create"}

    pgquery({
        sql: getCurrentOrderNumber, params: [], doResult: function (result) {
            order.order_info.order_number = result.rows[0].order_number;
            order.order_number = order.order_info.order_number;
            //console.log(JSON.stringify(order_info))
            var r = ipc.sendSync('session', {opt: 'put', key: 'order', value: order});

            // way1
            // r = ipc.sendSync('show_print_win', {url:'sale-order-preview.html'});


            $('#__m').modal('show')
            //var r = ipc.sendSync('hide_main_window', {});
            p_win = window.open('sale-order-preview.html', '打印', "width=900,height=600,alwaysOnTop=true");
            window.onfocus = function () {
                if (!p_win.closed) {
                    p_win.focus();
                }
            }
        }
    });
}




function initSaleDate() {

    $("#sale_date").datepicker(datepicker_options);
    $("#sale_date").datepicker("setDate",new Date());
    $("#sale_date_begin").datepicker(datepicker_options);
    $("#sale_date_end").datepicker(datepicker_options);

}

function clear_modal_items() {
    $('.product_category').val('');
    $('.product_units').val('');
    $('.product_unit_price').val('');
    $('.product_num').val('');
    $('.product_sum').val('');
    $('.product_memo').val('');
}

function change_modal(src) {
    var _modal_id = $(src).val();
    var _idx = $(src).parent().parent().attr('idx');  // tr attr 'idx'
    if (_modal_id == 0 || _modal_id == '') {
        // 选择空项目

        $('tr[idx="' + _idx + '"] .product_category').val('');
        $('tr[idx="' + _idx + '"] .product_category').attr("category_id", '');

        $('tr[idx="' + _idx + '"] .product_units').val('');
        $('tr[idx="' + _idx + '"] .product_units').attr("units_id", '');
        $('tr[idx="' + _idx + '"] .product_unit_price').val('');

        $('tr[idx="' + _idx + '"] .product_num').val('');
        $('tr[idx="' + _idx + '"] .product_sum').val('');
        $('tr[idx="' + _idx + '"] .product_memo').val('');
        // 重新计算金额
        changeNumOrUnitPrice(src);
        return;

        //  $('.product_category[idx="'+_idx+'"]').val('');
        //  $('.product_category[idx="'+_idx+'"]').attr("category_id", '');

        //  $('.product_units[idx="'+_idx+'"]').val('');
        //  $('.product_units[idx="'+_idx+'"]').attr("units_id", '');
        //  $('.product_unit_price[idx="'+_idx+'"]').val('');

        //  $('.product_num[idx="'+_idx+'"]').val('');
        //  $('.product_sum[idx="'+_idx+'"]').val('');
        //  $('.product_memo[idx="'+_idx+'"]').val('');
    }

    var found = false;
    for (var i = 0; i < modals.length; i++) {
        var modalOptions = modals[i].options;
        for (var j = 0; j < modalOptions.length; j++) {
            if (modalOptions[j].modal_id == _modal_id) {
                $('tr[idx="' + _idx + '"] .product_category').val(modalOptions[j].category_name);
                $('tr[idx="' + _idx + '"] .product_category').attr("category_id", modalOptions[j].category_id);

                $('tr[idx="' + _idx + '"] .product_units').val(modalOptions[j].units_name);
                $('tr[idx="' + _idx + '"] .product_units').attr("units_id", modalOptions[j].units_id);
                $('tr[idx="' + _idx + '"] .product_unit_price').val(modalOptions[j].suggest_unit_price);

                found = true;
                break;
            }
        }

        if (found)
            break;
    }
    // 重新计算金额
    changeNumOrUnitPrice(src);
}

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

    $('#product_total_sum').html(getTotalSum());
}

function getTotalSum() {
    var arr_modals = $('.product_modal');
    var arr_sum = $('.product_sum');
    var show_total_sum = true;
    var total_sum = 0;
    for (var i = 0; i < arr_modals.length; i++) {

        if ($(arr_modals[i]).val() > 0) {
            // 没选
            var _sum_val = $(arr_sum[i]).val();
            if (_sum_val == '') {
                return '';
            } else {
                total_sum += accounting.unformat(_sum_val);
            }
        }
    }

    return accounting.formatMoney(total_sum);
}


function listOrders(limit, offset) {
    pgquery({
        sql: countAllSaleOrder, params: [], doResult: function (result) {
            var count = result.rows[0].cnt;
            console.log("order size -> " + count);
            pgquery({
                sql: findAllSaleOrder, params: [limit, offset], doResult: function (result1) {
                    showRows(result1.rows);
                }
            });
        }
    });
}

function showRows(rows) {
    //遍历结果显示表格
    //清空现有的行
    $('#list_table tbody').empty();

    //todo
    for (var i = 0; i < rows.length; i++) {
        var s = '<tr>';
        s += '<td><a href="#" onclick="findByOrderNumber('+rows[i].order_number+')">' + rows[i].order_number + '</a></td>';
        s += '<td>' + rows[i].data.sale_date + '</td>'
        s += '<td>' + rows[i].data.customer_name + '</td>'
        s += '<td>' + showModalText(rows[i].data.modals) + '</td>'
        s += ' <td>' + rows[i].data.create_user + '</td>'
        s += '<td>' + rows[i].create_date.Format("yyyy-MM-dd hh:mm") + '</td>'
        s += '</tr>';
        $(s).appendTo('#list_table tbody');
        //console.log(s)
        // $('#list_table').append(s)
    }
}


function showModalText(modals) {
    var r = "";
    if (modals.length>0) {
        var modal0 = modals[0];
        r = modal0.product_modal_name +","+modal0.product_category_name+","+
        modal0.product_num + modal0.product_units

        if (modals.length>1) {
            r +="   ..."
        }
    }

    return r;
}




$(function () {


    setOrderForm(false);
});


function setOrderForm (reset){

    if (reset) {
        $('.product_modal').select2('destroy');
        $('tr.modal_tr').remove();
    }


    $('#customer_address').val('');
    $('#customer_principal').val('');
    $('#customer_phone').val('');
    $('#product_total_sum').html('');


    initSaleDate();

    $('#customer_name').select2()


    var modal_td_str = '<td><select class="product_modal"></select></td>'+
        '<td><input type="text" class="product_category"/></td>'+
        '<td><input type="text" class="product_units"/></td>'+
        '<td><input type="text" class="product_num"/></td>'+
        '<td><input type="text" class="product_unit_price"/></td>'+
        '<td><input type="text" class="product_sum"/></td>'+
        '<td><input type="text" class="product_memo"/></td>';

    for (var i = 1; i <= 5; i++) {
        $('<tr class="modal_tr" idx="'+ i +'">'+modal_td_str+'</tr>').insertBefore($('#total_sum_tr'));
    }
    //
    $('.product_modal').html('<option class="opt" value="0">&nbsp;</option>');
    //
    $('.product_modal').select2({width: '100%'});
    //
    //$('.product_modal').on('change', function(){change_modal(this)});

    $('.product_num').on('change', function () {
        changeNumOrUnitPrice(this);
    })
    $('.product_unit_price').on('change', function () {
        changeNumOrUnitPrice(this);
    })

    // 清空数组
    customerData.length=0;

    pgquery({
        sql: getCustomers, params: [], doResult: function (result) {
            var rows = result.rows;
            if (rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var found = false;
                    var _customer_option = {id: rows[i].customer_id, text: rows[i].customer_name};
                    var _customer_info = {
                        address: rows[i].address,
                        phone: rows[i].mobile_number,
                        principal: rows[i].principal
                    };
                    for (var j = 0; j < customerData.length; j++) {
                        if (rows[i].city_name == customerData[j].text) {
                            customerData[j].children.push(_customer_option)
                            customerInfo['"' + rows[i].customer_id + '"'] = _customer_info;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        customerData.push({text: rows[i].city_name, children: [_customer_option]});
                        customerInfo['"' + rows[i].customer_id + '"'] = _customer_info;
                    }
                }
            }


            // 清空原有内容
                $('#customer_name').html('');
                $('#customer_name').select2({
                    data: customerData,
                    // allowClear: true,
                    placeholder: "请选择公司"
                })
                $('#customer_name').select2('val', null)


            var changeCustomerDeal =   function () {
                console.log('Change_customerName');
                var _id = $('#customer_name').val();
                if (_id==''||_id==null) {
                    $('#customer_address').val('');
                    $('#customer_phone').val('');
                    $('#customer_principal').val('');

                } else {

                    $('#customer_address').val(customerInfo['"' + _id + '"'].address);
                    $('#customer_phone').val(customerInfo['"' + _id + '"'].phone);
                    $('#customer_principal').val(customerInfo['"' + _id + '"'].principal);
                }
                // get product_modals
                var ccid = $('#customer_name').val()
                modals = new Array();
                pgquery({
                    sql: getProductModals, params: [ccid], doResult: function (res) {

                        if (res.rows.length > 0) {
                            // alert(result.rows.length)
                            for (var i = 0; i < res.rows.length; i++) {
                                var category_id = res.rows[i].category_id;
                                var category_name = res.rows[i].category_name;
                                var modal_name = res.rows[i].modal_name;
                                var modal_id = res.rows[i].modal_id;
                                var units_id = res.rows[i].units_id;
                                var units_name = res.rows[i].units_name;
                                var suggest_unit_price = res.rows[i].suggest_unit_price;
                                var found = false;

                                var _option_modal = {
                                    modal_name: modal_name,
                                    modal_id: modal_id,
                                    category_id: category_id,
                                    category_name: category_name,
                                    units_id: units_id,
                                    units_name: units_name,
                                    suggest_unit_price: suggest_unit_price
                                };

                                for (var j = 0; j < modals.length; j++) {
                                    if (modals[j].category_id == category_id) {
                                        modals[j].options.push(_option_modal)
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found)
                                    modals.push({
                                        category_id: category_id,
                                        category_name: category_name,
                                        options: [_option_modal]
                                    })
                            }
                        }

                        var s = '<option class="opt" value="0">&nbsp;</option>';
                        for (var k = 0; k < modals.length; k++) {
                            s += '<optgroup label="' + modals[k].category_name + '">';
                            var options = modals[k].options;
                            for (var x = 0; x < options.length; x++) {
                                s += '<option class="opt" units="' + options[x].units + '" value="' + options[x].modal_id + '">' + options[x].modal_name + '</option>'
                            }
                            s += '</optgroup>';
                        }

                        // $('.product_modal').select2('destroy');
                        // $('.product_modal').off('change');
                        $('.product_modal').html(s);
                        clear_modal_items();
                        $('.product_modal').select2({width: '100%'});
                        if (!reset) {
                            // change事件只绑定一次
                            $('.product_modal').on('change', function () {
                                change_modal(this)
                            });
                        }
                    }
                });
            };


            if (!reset) {
                // change 事件只绑定一次
                $('#customer_name').on('change', changeCustomerDeal);
                console.log("Bind change event on #customer_name")
            }


////////////////////////////////////////////////// for list.
            $('#customer_name_1').select2({
                data: customerData,
                allowClear: true,
                placeholder: "请选择公司"
            })
////////////////////////////////////////////////// for list.

        }
    });
}




