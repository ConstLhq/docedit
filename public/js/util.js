L.HTMLUtils={
    buildLocaneTable: function (obj, dictionary,className, ignoreFields) {
        className = className || 'table table-condensed table-striped table-bordered';

        var fragment = document.createDocumentFragment();
        var table = L.DomUtil.create('table', className, fragment);
        var thead = L.DomUtil.create('thead', '', table);
        var tbody = L.DomUtil.create('tbody', '', table);

        var thead_tr = L.DomUtil.create('tr', '', thead);
        var thead_values = ['属性', '内容'];
        for (var i = 0, l = thead_values.length; i < l; i++) {
            var thead_th = L.DomUtil.create('th', '', thead_tr);
            thead_th.innerHTML = thead_values[i];
        }

        ignoreFields = ignoreFields || [];

        function inArray(arrayObj, value) {
            for (var i = 0, l = arrayObj.length; i < l; i++) {
                if (arrayObj[i] === value) {
                    return true;
                }
            }
            return false;
        }

        for (var property in obj) {
            if (obj.hasOwnProperty(property) && !inArray(ignoreFields, property)) {
                var value = obj[property];
                if (typeof value === 'object') {
                    var container = document.createElement('div');
                    container.appendChild(L.HTMLUtils.buildTable(value, ignoreFields));
                    value = container.innerHTML;
                }

                var tbody_tr = L.DomUtil.create('tr', '', tbody);
                var tbody_values = [dictionary[property], value];
                for (i = 0, l = tbody_values.length; i < l; i++) {
                    var tbody_td = L.DomUtil.create('td', '', tbody_tr);
                    tbody_td.innerHTML = tbody_values[i];
                }
            }
        }

        return table;
    }
};