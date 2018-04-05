$(function() {
    var initOptions = {
        language: 'en', //avaliable languages are ['ar', 'en'], default language is 'ar'
        filters: {
            title: "Filtering Tools", //Comes from backend JSON by default, and you can override it here
            classes: [],
            enable: true, //to show filters panel
            active: false, //to set filters as Active direct once table loaded
        },
        datatable: {
            title: "Brisk DataTable Demo", //Comes from backend JSON by default, and you can override it here
            resource: {
                base_url: 'http://domain-name.com',
                entity: '/resource',
                datatable: '/datatable-get-method' //required returned JSON format was described in the beginning of README 
            },
            classes: [],
            buttons: [
                {
                    title: "New record",
                    data_action: "insert",
                    classes: {
                        button: "btn btn-xs btn-primary",
                        icon: "fa fa-plus"
                    }
                }
            ],
            refresh: {
                enable: true, //to show/hide refresh button. The defualt is true.
                clear: false //to clear table results when refresh. The defualt is false. 
            },
            order_by: {
                column: 'serial_no', //column of first GET call sort
                method: 'DESC' //method of first GET call sort
            },
            execution_time: true, //to show/hide the execution time of the table
            tbody: {
                height: '60vh'
            },
            
            //if you are not using it, it should not be declared
            rows_reformat: function(columns, key, record){ 
                //ALERT: you can check what (columns, key, record) have using console.log();
                
                var row = ''; //DO SOME WORK HERE, to edit the HTML of this row, then return it to the table
                var row = '';
                return row;
            },
    
            //if you are not using it, it should not be declared
            row_reformat: function(row, key, record){
                //ALERT: you can check what (row, key, record) have using console.log();
                
                /**
                 * START:: column_title update
                 */
                var cell_html = ""; //DO SOME WORK HERE, to edit the HTML of this cell, then return it to the table
                row.find('[data-column="column_title"]').html(cell_html);
                //END:: column_title update
    
                return row;
            }
        }
    };

    var briskDemo = new $.BriskDataTable($("#brisk-demo"), initOptions);

    briskDemo.InitBrisk();
    briskDemo.get(); 
});