window.onload = function () {
    // ehr获取用户id
    if (document.URL.includes('https://ehr.supcon.com/') && self === top) {
        var script = document.createElement("script");
        script.id = 'staff_id_get'
        script.innerHTML = "document.querySelector('#staff_id_get').innerHTML = window.hrm_index.staffId"
        document.head.appendChild(script)
        chrome.storage.sync.set({ 'staff_id': document.querySelector('#staff_id_get').innerHTML });
        chrome.storage.sync.set({ 'staff_expired': false });
    }
    // 小助手修改iframe样式
    if (document.URL.includes('http://101.43.98.75:8088/#/')) {
        document.body.classList = 'custom-funds'
        document.body.style.marginTop = '-5px'
        document.querySelector('.custom-funds .table-row table').style.marginTop = '0'
        document.querySelector('.custom-funds .table-row thead').style.position = 'sticky'
        document.querySelector('.custom-funds .table-row thead').style.top = '0'
        document.querySelector('.custom-funds .table-row thead').style.background = '#fff'
    }
}
function myMain() {
    if (document.URL.includes('https://ehr.supcon.com/') && self === top) {
        chrome.runtime.sendMessage({ url: document.URL }, function (response) {
            chrome.storage.sync.set({ 'staff_cookie': response }, function () { });
        });
    }
}
myMain()