CKEDITOR.plugins.add('btgrid', {
    lang: 'fr, en',
    requires: 'widget,dialog',
    icons: 'btgrid',
    init: function(editor) {
        var maxGridColumns = 12;
        var lang = editor.lang.btgrid;
        CKEDITOR.dialog.add('btgrid', this.path + 'dialogs/btgrid.js');
        editor.addContentsCss( this.path + 'styles/editor.css');
        editor.widgets.add('btgrid', {
            allowedContent: 'div(!btgrid);div(!row, !row-*);div(!col-*);div(!content)',
            requiredContent: 'div(btgrid)',
            parts: {
                btgrid: 'div.btgrid'
            },
            editables: {
                content: ''
            },
            template:
            '<div class="btgrid">' +
            '</div>',
            button: lang.createBtGrid,
            dialog: 'btgrid',
            upcast: function(element) {
                return element.name == 'div' && element.hasClass('btgrid');
            },
            init: function() {
                var rowCount = this.element.getChildCount();
                if (rowCount) {
                    this.setData('rowCount', rowCount);
                    var colCount = this.element.getFirst().getChildCount();
                    this.setData('colCount', colCount);
                }
                for (var rowNumber= 1;rowNumber <= rowCount;rowNumber++) {
                    this.createEditable(maxGridColumns, rowNumber);
                }
            },
            data: function() {
                if (this.data.colCount) {
                    var colCount = this.data.colCount;
                    var rowCount = this.data.rowCount;
                    var block = this.element;
                    this.updateGrid(rowCount, colCount, block);
                }
            },
            updateGrid: function(rowCount, colCount, block) {
                var currentRowsCount = block.getChildCount();
                while (currentRowsCount < rowCount) {
                    currentRowsCount++;
                    this.addRow(block, colCount, currentRowsCount);
                }
                while (currentRowsCount > rowCount) {
                    currentRowsCount--;
                    this.removeRow(block);
                }

                for (var rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
                    var row = block.getChild(rowNumber-1);
                    if (row != null) {
                        var currentColsCount = row.getChildCount();
                        while (currentColsCount < colCount) {
                            currentColsCount++;
                            this.addCol(row, colCount, currentColsCount);
                        }
                        while (currentColsCount > colCount) {
                            currentColsCount--;
                            this.removeCol(row);
                        }
                        this.updateCol(row, colCount);
                        this.createEditable(colCount, rowNumber);
                    }
                }
            },
            addRow: function(block, colCount, rowNumber) {
                var content = '<div class="row row-' + rowNumber + '">';
                for (var i = 1; i <= colCount; i++) {
                    content = content + '<div class="col-md-' + maxGridColumns/colCount + '">' +
                    '  <div class="content">' +
                    '    <p>Col ' + i + '</p>' +
                    '  </div>' +
                    '</div>';
                }
                content = content + '</div>';
                block.appendHtml(content);
            },
            removeRow: function(block) {
                block.getLast().remove();
            },
            addCol: function(row, colCount, colNumber) {
                var content = '<div class="col-md-' + maxGridColumns/colCount + '">' +
                    '  <div class="content">' +
                    '    <p>Col ' + colNumber + '</p>' +
                    '  </div>' +
                    '</div>';
                row.appendHtml(content);
            },
            removeCol: function(row) {
                row.getLast().remove();
            },
            updateCol: function(row, colCount) {
                for (var colNumber = 1; colNumber <= row.getChildCount(); colNumber++) {
                    var col = row.getChild(colNumber-1);
                    col.setAttribute("class", "");
                    col.addClass('col-md-' + maxGridColumns/colCount);
                }
            },
            createEditable: function(colCount, rowNumber) {
                for (var i = 1; i <= colCount; i++) {
                    this.initEditable( 'content'+ rowNumber + i, {
                        selector: '.row-'+ rowNumber +' > div:nth-child('+ i +') div.content'
                    } );
                }
            }
        });
        editor.ui.addButton('btgrid', {
            label: lang.createBtGrid,
            command: 'btgrid',
            toolbar: 'insert,10',
            icon: this.path + "icons/" + (CKEDITOR.env.hidpi ? "hidpi/" : "") + "btgrid.png"
        });
    }
});
