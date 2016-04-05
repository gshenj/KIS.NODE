/**
 * Created by jin on 2015/11/23 0023.
 */

var customerTable = null;
var table_click_attached = false;

var zTreeObj = null;;
var setting = {
    view: {
        fontCss : {"font-size":"16px"},
       dblClickExpand: dblClickExpand

    },
    callback: {
        onClick: zTreeOnClick
    }
};

function dblClickExpand(treeId, treeNode) {
    return treeNode.level > 0;
}

var first_time_load_new_order_target = true;

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



        /*if (target == '__new__') {

        } else*/
        if (target == '__list__') {
            listOrders(15, 0)
        } else if (target=='__sys__') {
            showSysManage();
        }
    });

    // 当前选项卡内容初始化
    initNewOrderPage();
});


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
    c_customer_id = $('#customer_name').select2('val');
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






function initNewOrderPage() {
    initSaleDate()
    $('.product_num').on('change', function (){ changeNumOrUnitPrice(this)})
    $('.product_unit_price').on('change', function (){changeNumOrUnitPrice(this)})
    $(".product_name").on('change', function (){selectProduct(this)})
    $(".product_modal").on('change', function (){selectModal(this)})

    //setOrderForm(false);
    $('#customer_name').colorbox({
            //  transition:'none',
            inline: true, width: '90%', height: '96%', href: '#customer_choosen', title: '选择客户',
            onComplete: function () {

                initRegionsTree();
                // 初始化加载所有客户
                initCustomerTable();
            },
            onClosed: function () {
                if (zTreeObj != null) {
                    zTreeObj.destroy();
                    zTreeObj = null;
                }
                if (customerTable != null) {
                    customerTable.destroy();
                    $('#customer_table').empty();
                    customerTable = null;
                }
            }
    });
}


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


            //$('#customer_name').select2('destroy');
            // 清空原有内容
                $('#customer_name').html('');
                $('#customer_name').select2({
                    data: customerData,
                    // allowClear: true,
                    placeholder: "请选择公司"
                })
               // $('#customer_name').select2('val', '')
               // console.log("val: "+$('#customer_name').select2('val'))


            var changeCustomerDeal =   function () {
                console.log('Change_customerName');
                var _id = $('#customer_name').val();
                console.log('Change_customerName, '+_id);
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
                //var ccid = $('#customer_name').val()
                var ccid = $('#customer_name').select2('val')
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


/*初始化地区菜单树*/
function initRegionsTree() {
    if (zTreeObj != null) {
        zTreeObj.destroy();
        zTreeObj = null;

    }
    pgquery({
        sql: findRegions, params: [], doResult: function (result) {
            //alert(result.rows[0].region.cities[0].name)
            var nodes = [];
            var rows = result.rows;
            for (var i = 0; i < rows.length; i++) {
                var _node = {name: rows[i].region.name};
                if (rows[i].region.cities != null) {  // or undefined
                    _node.isParent = true;
                    _node.children = rows[i].region.cities;
                }
                nodes.push(_node);
            }

            console.log(nodes);

            var nodeAll = [];
            nodeAll.isParent = true;
            nodeAll.children = nodes;
            nodeAll.name="归属地区";
            nodeAll.pcode = ""
            nodeAll.open=true;
            zTreeObj = $.fn.zTree.init($("#region_tree"), setting, [nodeAll]/*nodes*/);
        }
    });
}

/*地区点击响应函数*/
function zTreeOnClick(event, treeId, treeNode) {
    if (treeNode.pcode == '') {
        // root node
        fillAllCustomers();
        return;
    }


    if(treeNode.isParent) {
        var pcodeArray = [];
        for (var x in treeNode.children) {
            pcodeArray.push(treeNode.children[x].pcode);
        }
        changeDataTable(pcodeArray)
    } else {
        changeDataTable(treeNode.pcode)
    }

}

/*初始化客户列表表格*/
function initCustomerTable() {
    if (customerTable != null) {
        customerTable.destroy();
        $('#customer_table').empty();
        customerTable = null;
    }

    customerTable =  $('#customer_table').DataTable({
        "scrollY":$('#regions_menu_div').height() - 150,
        "dom": '<"datatable_search"f><"datatable_toolbar">ti',
        "scrollCollapse": false,
        "paging": false,
        "data":[],
        "rowId":'DT_rowId',
        "columnDefs": [
            //{
            //    "targets": [ 0 ],
            //    "visible": false,
            //    "searchable": false
            //},
            {
                "title":"名称",
                "width":"30%",
                "targets":[0],
                "data":"mc"
            },
            {"title":"简码",
                "width":"10%",
                "targets":[1],
                "data": 'jm'
            },
            {"title":"电话",
                "width":"10%",
                "targets":[2],
                "data": 'dh'
            },
            {"title":"负责人",
                "width":"10%",
                "targets":[3],
                "data": 'fzr'
            },
            {"title":"地址",
                "width":"30%",
                "targets":[4],
                "data": 'dz'
            }
        ],
        scroller: {
            rowHeight: 20
        },
        "language": {
            "url": "scripts/datatable/cn.json"
        },
        "initComplete": function(settings, json) {
            console.log("initComplete")
           // console.log($('.datatable_toolbar').html())
            $(".datatable_toolbar").html('<button onclick="doneSelectCustomer()">确定选择</button>');
            //
            fillAllCustomers();
        }
    });


    if (table_click_attached) {
        return;
    }

    $('#customer_table tbody').on('click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            customerTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    });
    table_click_attached = false;
}



function doneSelectCustomer() {
    var rowId = customerTable.row('.selected').id();
    var data = customerTable.row('.selected').data();

    var customer = {id:rowId, name:data.mc, address:data.dz, phone:data.dh, principal:data.fzr }
    console.log("Selected customer: "+JSON.stringify(customer))
    if ($('#customer_name').val() == customer.name) {
        console.log("Customer name not changed!")
        /*没有重新选择客户，直接关闭弹出框*/
        $.colorbox.close();
        return;
    }


    $('#customer_id').val(customer.id);
    $('#customer_name').val(customer.name);
    $('#customer_address').val(customer.address);
    $('#customer_principal').val(customer.principal);
    $('#customer_phone').val(customer.phone);

    // get products of customer
    pgquery({
        sql: findProductsByCustomer, params: [customer.id], doResult: function (result) {
            //
            //var products = [];
            //var rows = result.rows;
            //for (var i = 0; i < rows.length; i++) {
            //    var _name = rows[i].name;
            //    var _modals = rows[i].modals;
            //    products
            //    alert(JSON.stringify(rows[i]))
            //}
            var products = result.rows;
            setProductSelect(products)

            $.colorbox.close();
        }
    })
}


/*
$('#example tbody').on( 'click', 'tr', function () {
    if ( $(this).hasClass('selected') ) {
        $(this).removeClass('selected');
    }
    else {
        table.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');
    }
} );

$('#button').click( function () {
    table.row('.selected').remove().draw( false );
} );
*/


/**/
function fillAllCustomers() {
    changeDataTable(["000000", "999999"]);
}

/*根据选择的地区更新用户列表表格的内容*/
function changeDataTable(pcode) {
    if (pcode instanceof Array) {
        // 按pcode大小排序
        pcode = pcode.sort();
        console.log("Sorted pcodes: "+pcode);
        changeData([pcode[0], pcode[pcode.length-1]]);
    } else {
        changeData([pcode, pcode]);
    }
}

function changeData(params) {
    pgquery({
        sql: findCustomersByRegion, params: params, doResult: function (result) {
            var tableData = [];
            var rows = result.rows;
            for (var i = 0; i < rows.length; i++) {
                var _info = rows[i].customer_info;
                var customer = {"DT_rowId":rows[i].id, "mc":_info.name, "jm":_info.simple_code,
                    "dz":_info.address, "dh":_info.phone, "fzr":_info.principal/*, "kpzl":_info.kaipiaoziliao*/}
                tableData.push(customer);
            }
            customerTable.clear();  //.draw()
            customerTable.rows.add(tableData).draw();
        }
    })
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
       str += '<option value="'+ products[x].name+'">' + products[x].name +'</option>';
    }

    $('.product_name').html(str);
    console.log("Set product name.")
    // 清空所有选择项目
    clearProductItems();
    CURRENT_PRODUCTS = products;
}

function selectProduct(src) {
    var _product_name = $(src).val();
    console.log("Select product '"+_product_name+"'")
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
        str += '<option value="'+modals[x].name+'">' + modals[x].name + '</option>';
    }
    $(src).parent().next().children().html(str);
    CURRENT_MODALS = modals;
}

function selectModal(src) {
    var _modal_name = $(src).val();
    console.log("Select Modal: '"+ _modal_name+"'");
    if (_modal_name == '') {
        clearOneModalItem(src)
        return;
    }
    for (var x in CURRENT_MODALS) {
        if (_modal_name == CURRENT_MODALS[x].name) {
            $(src).parent().next().children().val(CURRENT_MODALS[x].unit);
            var _suggest_price = CURRENT_MODALS[x].suggest_unit_price;
            if (_suggest_price == null || _suggest_price >0) {
                $(src).parent().next().next().next().children().val(_suggest_price);
            }
            break;
        }
    }
}

