function gotoRegionManage() {

    const BrowserWindow = require('electron').remote.BrowserWindow;
    var mainWin =  BrowserWindow.getFocusedWindow()

    $.colorbox({inline:"#main_layout", width:-1, height:-1, open:true, speed:0,overlayClose:false,escKey:false,arrowKey:false});


    var win = new BrowserWindow({ width: 1200, height: 700, show: false, resizable:false,autoHideMenuBar:true });
    win.on('closed', function() {
        win = null;
        mainWin.setClosable(true);
        mainWin.setResizable(true);
        mainWin.setMinimizable(true);
        mainWin.setMaximizable(true);
        mainWin.setMovable(true);
        $.colorbox.close()
    });
    //win.on('blur', function(){
    //    win.focus();
    //})
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
    var mainWin =  BrowserWindow.getFocusedWindow()
    // In the main process.
    //const BrowserWindow = require('electron').BrowserWindow;
    $.colorbox({inline:"#main_layout", width:-1, height:-1, open:true, speed:0,overlayClose:false,escKey:false,arrowKey:false});

    var win = new BrowserWindow({ width: 1200, height: 700, show: false, resizable:false,autoHideMenuBar:true,acceptFirstMouse:true });
    win.on('select_customer', function(customer) {
        alert(customer)
    });

    win.on('closed', function() {
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



function showSysManage() {
    console.log('Go to sys manage.')

    console.log($('#__sys__').height())
    $('#__sys__').height($(window).height() - $('#__sys__').offset().top)

    initTreeMenu();
    initCustomerOptTable();

}

var setting2 = {
    view: {
        fontCss : {"font-size":"16px"}
    },
   /* edit: {
        enable: true
    },*/
    callback: {
        beforeEditName: beforeEditName
        //beforeRemove: beforeRemove

    }
};

var regionTreeObj = null;
function initTreeMenu() {
    if (regionTreeObj != null) {
        regionTreeObj.destroy();
    }

    pgquery({
        sql: findRegions, params: [], doResult: function (result) {
            var zNodes2 = new Array();
            var rows = result.rows;
            for (var i = 0; i < rows.length; i++) {
                var _node = {name: rows[i].region.name, pcode: rows[i].region.pcode};
                if (rows[i].region.cities != null) {  // or undefined
                    _node.isParent = true;
                    _node.children = rows[i].region.cities;
                }
                zNodes2.push(_node);
            }

            console.log(zNodes2);
            //var zNodeX = new Array();
            //zNodeX.isParent = true;
            //zNodeX.children = zNodes2;
            //zNodeX.name="所有";
            //zNodeX.pcode = ""

            regionTreeObj = $.fn.zTree.init($("#region_opt_tree"), setting2, zNodes2);
        }
    })
}

function beforeEditName() {
  alert('aaaa');
    return false;
}

function cancelSelect() {
    var nodes = regionTreeObj.getSelectedNodes();
    if (nodes.length>0) {
        regionTreeObj.cancelSelectedNode(nodes[0]);
    }
}

var OPT_FLAG = "";
var PARENT_NODE = null;
var DELETE_NODE = null;
var EDIT_NODE = null;

function addRegion() {
    var nodes = regionTreeObj.getSelectedNodes();
    if (nodes.length>0) {
        if (nodes[0].isParent) {
            $('#region_tip').html('请输入新增地区信息：')
            $('#region_name_input').val('');
            $('#region_pcode_input').val('');
            OPT_FLAG = 'add';
            PARENT_NODE = nodes[0];
            $.colorbox({inline:true, href:'#region_input'})


        } else {

            alert('无法添加下级地区！')
        }

    } else {
        $('#region_tip').html('请输入新增地区信息：')
        $('#region_name_input').val('');
        $('#region_pcode_input').val('');
        OPT_FLAG = 'add';
        PARENT_NODE = null;

        $.colorbox({inline:true, href:'#region_input'})

        // add parent node
        //var newNode = {name:"newNode1", isParent:true};
        //newNode = regionTreeObj.addNodes(null, newNode);
    }
}

function deleteRegion() {
    var nodes = regionTreeObj.getSelectedNodes();
    if (nodes.length>0) {
        if (nodes[0].isParent) {
            if (nodes[0].children.length>0) {
                alert('有下属区域，无法删除！')
                return;
            }

            $('#region_tip').html('确定删除吗？')
            $('#region_name_input').val(nodes[0].name);
            $('#region_pcode_input').val(nodes[0].pcode);
            OPT_FLAG = 'delete';
            DELETE_NODE = nodes[0];
            $.colorbox({inline:true, href:'#region_input'})


        } else {

            // check customer of this region.

            $('#region_tip').html('确定删除吗？')
            $('#region_name_input').val(nodes[0].name);
            $('#region_pcode_input').val(nodes[0].pcode);
            OPT_FLAG = 'delete';
            DELETE_NODE = nodes[0];
            $.colorbox({inline:true, href:'#region_input'})
        }

    } else {
            alert('请先选择一个地区！')
    }
}

function editRegion() {
    var nodes = regionTreeObj.getSelectedNodes();
    if (nodes.length == 0) {
        alert('请选择地区！')
        return;
    }

    $('#region_tip').html('输入新内容？')
    $('#region_name_input').val(nodes[0].name);
    $('#region_pcode_input').val(nodes[0].pcode);
    OPT_FLAG = 'edit';
    EDIT_NODE = nodes[0];

    if (nodes[0].isParent) {
        // 修改省级别;

    } else {
        // 修改市级别
    }

    $.colorbox({inline:true, href:'#region_input'})

}

function doneOptRegion() {
    if (OPT_FLAG == 'add') {
        var _name = $('#region_name_input').val();
        var _pcode = $('#region_pcode_input').val();

        console.log("name:"+_name+", pcode:"+_pcode);

        // add node in nodes[0]
      //  var newNode = {name:_name, pcode:_pcode};
      //  newNode = regionTreeObj.addNodes(nodes[0], newNode);

        if (PARENT_NODE == null) {
            var p1 = {name:_name, pcode:_pcode, cities:[]}
            pgquery({
                sql: sql_add_region, params: [p1], doResult: function (result) {
                    regionTreeObj.destroy();
                    console.log("Re init tree menu.")
                    initTreeMenu();
                }
            });

        } else {
            var cities = [];
            for (var x in PARENT_NODE.children) {
                cities.push({name: PARENT_NODE.children[x].name, pcode: PARENT_NODE.children[x].pcode});
            }

            var _node = {name:_name, pcode:_pcode};
            cities.push(_node);

            var p1 = {name: PARENT_NODE.name, pcode:PARENT_NODE.pcode,  cities:cities};
            console.log("New parent node is :" +JSON.stringify(p1))
            pgquery({
                sql: sql_update_region, params: [p1, p1.name], doResult: function (result) {
                    regionTreeObj.destroy();
                    console.log("Re init tree menu.")
                    initTreeMenu();
                }
            });

        }

        $.colorbox.close();

    }

    else if (OPT_FLAG == 'edit') {
        var _name = $('#region_name_input').val();
        var _pcode = $('#region_pcode_input').val();
        if (EDIT_NODE.isParent) {
            //修改省
            var _old_name = EDIT_NODE.name;
            var _old_pcode = EDIT_NODE.pcode;

            var cities = [];
            for (var x in EDIT_NODE.children) {
                cities.push({name: EDIT_NODE.children[x].name, pcode:EDIT_NODE.children[x].pcode});
            }

            var region_node = {name:_name, pcode:_pcode, cities: cities};
            pgquery({
                sql: sql_update_region, params: [region_node, _old_name], doResult: function (result) {
                    regionTreeObj.destroy();
                    console.log("Re init tree menu.")
                    initTreeMenu();
                }
            });

        } else {
            var _old_name = EDIT_NODE.name;
            var _old_pcode = EDIT_NODE.pcode;
            if (_old_name == _name && _old_pcode == _pcode) {

            } else {
                var cities = [];
                var _parent_node = EDIT_NODE.getParentNode();
                for (var x in _parent_node.children) {
                    if (_parent_node.children[x].name != _old_name) {
                        cities.push({name:_parent_node.children[x].name, pcode:_parent_node.children[x].pcode});
                    } else {
                        cities.push({name:_name, pcode:_pcode});
                    }
                }
                var region = {name: _parent_node.name, pcode:_parent_node.pcode, cities: cities};
                pgquery({
                    sql: sql_update_region, params: [region, region.name], doResult: function (result) {
                        regionTreeObj.destroy();
                        console.log("Re init tree menu.")
                        initTreeMenu();
                    }
                });

            }
        }

        $.colorbox.close();

    }

    else if (OPT_FLAG == 'delete') {

        if (DELETE_NODE.isParent) {
            // 删除省
            pgquery({
                sql: sql_delete_region, params: [DELETE_NODE.name], doResult: function (result) {
                    regionTreeObj.destroy();
                    console.log("Re init tree menu.")
                    initTreeMenu();
                }
            });

        } else {
            // 删除市
            var _parent_node = DELETE_NODE.getParentNode();
            var _parent_name = _parent_node.name;

            var cities = [];
            for (var x in _parent_node.children) {
                if (_parent_node.children[x].name == DELETE_NODE.name && _parent_node.children[x].pcode == DELETE_NODE.pcode) {
                    continue;
                }
                cities.push({name: _parent_node.children[x].name, pcode: _parent_node.children[x].pcode});
            }

            var p1 = {name: _parent_name, pcode:_parent_node.pcode,  cities:cities};
            console.log("After delete, new parent node json :" +JSON.stringify(p1))

            pgquery({
                sql: sql_update_region, params: [p1, _parent_name], doResult: function (result) {
                    regionTreeObj.destroy();
                    console.log("Re init tree menu.")
                    initTreeMenu();
                }
            });
        }

        $.colorbox.close();
    }
}

var customerOptTable = null;
function initCustomerOptTable() {

    if (customerOptTable != null) {
        customerOptTable.destroy();
        $('#customer_opt_table').empty();
        customerOptTable = null;
    }

    customerOptTable =  $('#customer_opt_table').DataTable({
        "scrollY":$('#region_opt_div').height() - 150,
        "scrollCollapse": false,
        "paging": false,
        "data":[],
        "rowId":'DT_rowId',
        "columnDefs": [
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
        }
    });

    if (table_click_attached) {
        return;
    }

    /*$('#customer_opt_table tbody').on('click', 'tr', function () {
        var rowId = customerTable.row(this).id();
        var data = customerTable.row( this ).data();

        var customer = {id:rowId, name:data.mc, address:data.dz, phone:data.dh, principal:data.fzr }
        console.log("Selected customer: "+JSON.stringify(customer))
        if ($('#customer_name').val() == customer.name) {
            console.log("Customer name not changed!")
            /!*没有重新选择客户，直接关闭弹出框*!/
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
    });*/
    table_click_attached = false;
}