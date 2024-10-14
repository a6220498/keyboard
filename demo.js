$(document).ready(function () {
  var url = "ajax/ajaxCard";
  var ajaxobj = new AjaxObject(url, 'json');
  var otherModal = document.getElementById('otherModal')
  var otherModalTitle = document.getElementById('modal-title')
  var otherModalSubmit = document.getElementById('submit-btn')
  var formBody = $('#form_body')
  var modalText = {
    'title': {
      'edit': '修改表單',
      'add': '新增表單'
    },
    'submit': {
      'edit': '修改',
      'add': '新增'
    }
  }

  ajaxobj.getall();
  
  // 搜尋按鈕
  $("#searchbutton").click(function () {
      $("#dialog-searchconfirm").dialog({
          resizable: true,
          height: $(window).height() * 0.4,// dialog視窗度
          width: $(window).width() * 0.4,
          modal: true,
          buttons: {
              // 自訂button名稱
              "搜尋": function (e) {
                  var url = "ajax/ajaxCard";
                  // var data = $("#searchform").serialize();
                  var cnname = $("#secnname").val();
                  var enname = $("#seenname").val();
                  var sex = $('input:radio:checked[name="sesex"]').val();
                  var ajaxobj = new AjaxObject(url, 'json');
                  ajaxobj.cnname = cnname;
                  ajaxobj.enname = enname;
                  ajaxobj.sex = sex;
                  ajaxobj.search();
                  e.preventDefault(); // avoid to execute the actual submit of the form.
              },
              "重新填寫": function () {
                  $("#searchform")[0].reset();
              },
              "取消": function () {
                  $(this).dialog("close");
              }
          }
      });
  })

  otherModal.addEventListener('show.bs.modal', e => {
    var type = $(e.relatedTarget).data('type')
    otherModalTitle.textContent = modalText['title'][type]
    otherModalSubmit.textContent = modalText['submit'][type]
    switch(type) {
      case'edit':
        var rowIndex = $(e.relatedTarget).parents('tr')[0].rowIndex
        var ajaxobj = new AjaxObject(url, 'json');
        ajaxobj.modify_get(rowIndex);
        formBody.submit(function (e) { actions('modify', e); formBody.off('submit') })
      break
      case 'add':
        $('#form_body > #modal-body > input').val('')
        $('#form_body > #modal-body > input:radio:checked').attr('checked', false)
        formBody.submit(function (e) { actions('add', e); formBody.off('submit') })
      break
      default:
    }
  })

  otherModal.addEventListener('hide.bs.modal', function () { formBody.off('submit') })

  // 自適應視窗
  $(window).resize(function () {
      var wWidth = $(window).width();
      var dWidth = wWidth * 0.4;
      var wHeight = $(window).height();
      var dHeight = wHeight * 0.4;
      $("#dialog-confirm").dialog("option", "width", dWidth);
      $("#dialog-confirm").dialog("option", "height", dHeight);
  });
});

function refreshTable(data) {
  // var HTML = '';
  $("#cardtable tbody > tr").remove();
  $.each(data, function (key, item) {
      var strsex = '';
      if (item.sex == 0)
          strsex = '男';
      else
          strsex = '女';
      var row = $("<tr></tr>");
      row.append($(`<td data-bs-toggle='tooltip' title='[${strsex}]${item.cnname}(${item.enname})'></td>`).html(item.cnname));
      row.append($("<td></td>").html(item.enname));
      row.append($("<td></td>").html(strsex));
      row.append($(`<td data-bs-toggle='popover' data-bs-content='聯絡方式:${formatPhoneNum(item.mobile)}'></td>`).html(item.mobile));
      row.append($("<td></td>").html(item.email));
      row.append($("<td></td>").html('<button id="modifybutton' + item.s_sn + '" class="modifybutton btn btn btn-primary btn-sm" style="font-size:16px;font-weight:bold;" data-bs-toggle="modal" data-bs-target="#otherModal" data-type="edit">修改 <span class="glyphicon glyphicon-list-alt"></span></button>'));
      row.append($("<td></td>").html('<button id="deletebutton' + item.s_sn + '" class="deletebutton btn btn-danger btn-sm" style="font-size:16px;font-weight:bold;" data-bs-toggle="modal" data-bs-target="#deleteModal">刪除 <span class="glyphicon glyphicon-trash"></span></button>'));
      $("#cardtable").append(row);
  });
  executeToolTip()
  highlightTable()
  executePopover()
}

function formatPhoneNum(v) {
  var str = v.toString()
  return str.substr(0, 4) + '-' + str.substr(4, 3) + '-' + str.substr(7, 3)
}

function highlightTable() {
  var table = document.getElementById('cardtable')
  var targetRowIndex, targetCellIndex, targetRowLen
  $('#cardtable > tbody > tr > td').on('mouseover', function (e) {
    if (e.target.tagName !== 'TD') return
    
    targetRowIndex = e.target.parentElement.rowIndex
    targetCellIndex = e.target.cellIndex
    targetRowLen = $('#cardtable > tbody > tr').length
    
    for (var i = 0; i < targetRowLen; i++) { $(`#cardtable > tbody > tr:eq(${i}) > td:eq(${targetCellIndex})`).addClass('highlight') }
    table.rows[targetRowIndex].classList.add('highlight')
  })
  $('#cardtable > tbody > tr > *').on('mouseleave', function (e) {
    for (var i = 0; i < targetRowLen; i++) { $(`#cardtable > tbody > tr:eq(${i}) > td:eq(${targetCellIndex})`).removeClass('highlight') }
    table.rows[targetRowIndex].classList.remove('highlight')
  })
}

function formReset() {
  var el = document.getElementById('form_body')
  if (el) el.reset()
}

function initEdit(response) {
  var modifyid = $("#cardtable").attr('id').substring(12);
  $("#otherModal #modifysid").attr('value', modifyid)
  
  Object.keys(response).forEach(e => {
    if (e === 'sex') {
      var male = $('#otherModal #male')
      var female = $('#otherModal #female')
      response[e] === '0' ? male.attr('checked', 'true') : female.attr('checked', 'true')
    } else {
      var el = $(`#otherModal #${e}`)
      if (el) el.attr('value', response[e])
    }
  })
}

function edit(v) {
  var modifyid = $("#modifysid").val()
  var cnname = $("#cnname").val()
  var enname = $("#enname").val()
  var mob = $("#mobile").val()
  var em = $("#email").val()
  var sex = $('input:radio:checked[name="sex"]').val()
  v.cnname = cnname;
  v.enname = enname;
  v.mobile = mob;
  v.email = em;
  v.sex = sex;
  v.id = modifyid;
  v.modify();
}

function add(v) {
  var cnname = $("#addcnname").val();
  var enname = $("#addenname").val();
  var mob = $("#mobile").val()
  var em = $("#email").val()
  var sex = $('input:radio:checked[name="addsex"]').val();
  v.cnname = cnname;
  v.enname = enname;
  v.mobile = mob;
  v.email = em;
  v.sex = sex;
  v.add();
}

function actions(type, e) {
  e.preventDefault()
  var url = "ajax/ajaxCard"
  var ajaxobj = new AjaxObject(url, 'json')
  switch(type) {
    case 'modify':
      edit(ajaxobj)
    break
    case 'add':
      add(ajaxobj)
    break
    default:
  }
  $(otherModal).modal('hide')
}

function convertNum(v) {
  return v.value = v.value.replace(/[^0-9]+/,'')
}

function executeToolTip() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}

function executePopover() {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  })
}

/**
* 
* @param string
*          url 呼叫controller的url
* @param string
*          datatype 資料傳回格式
* @uses refreshTable 利用ajax傳回資料更新Table
*/
function AjaxObject(url, datatype) {
  this.url = url;
  this.datatype = datatype;
}
AjaxObject.prototype.cnname = '';
AjaxObject.prototype.enname= '';
AjaxObject.prototype.sex = '';
AjaxObject.prototype.mobile = '';
AjaxObject.prototype.email = '';
AjaxObject.prototype.id = 0;
AjaxObject.prototype.alertt = function () {
  alert("Alert:");
}
AjaxObject.prototype.getall = function () {
response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
refreshTable(JSON.parse(response));
}
AjaxObject.prototype.add = function () {
response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"52","cnname":"新增帳號","enname":"NewAccount","sex":"1", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
refreshTable(JSON.parse(response));
// $("#dialog-addconfirm").dialog("close");
}
AjaxObject.prototype.modify = function () {
response = '[{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
refreshTable(JSON.parse(response));
// $("#dialog-modifyconfirm").dialog("close");
}
AjaxObject.prototype.modify_get = function (rowIndex) {
response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"},{"s_sn":"50","cnname":"趙雪瑜","enname":"Sharon","sex":"0", "mobile": "0955661144", "email": "agd@sdfgdfgd.com"},{"s_sn":"51","cnname":"賴佳蓉","enname":"Yoki","sex":"1", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
initEdit(JSON.parse(response)[rowIndex - 1]);
}
AjaxObject.prototype.search = function () {
response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
refreshTable(JSON.parse(response));
$("#dialog-searchconfirm").dialog("close");
}
AjaxObject.prototype.delete = function () {
response = '[{"s_sn":"35","cnname":"邱小甘","enname":"Peter","sex":"0", "mobile": "0955661144", "email": "agd@sdfgdfgd.com"},{"s_sn":"49","cnname":"蔡凡昕","enname":"Allen","sex":"0", "mobile": "0955514854", "email": "21562d@sdfgdfgd.com"}]';
refreshTable(JSON.parse(response));
}


// 實作Ajax
$.ajax({
  method: 'get',
  url: 'https://datacenter.taichung.gov.tw/swagger/yaml/387020000A',
  success: function(res) { console.log(res) },
  error: function(err) { console.log(err) }
})