# Brisk DataTable
Brisk works on making the process of producing datatables easier and faster by keeping the hard usually repeated stuff on Brisk and focusing on building your special tables without giving any care about the small trivial issues if they were clearly constrained or not.

<h1>Requested Backend JSON Format:</h1>
<label>Used to control frontend</label>
<blockquote>Coming versions will work on enabling the control of all frontend attributes from backend side.</blockquote>
<h3>Table resource GET JSON Format:</h3>

    {
       "filters_title":"Filters Panel Title",
       "filters":[
          {
             "title":"Select Filter Title", //filter title
             "type":"select", //filter type
             "name":"type_serial_no", //filter name
             "classes":[ //any custom classes

             ],
             "data":{
                "options_source":"treatment_types", //filter resource name
                "has_empty":false, //show/hide [empty option] in the list
                "has_all":true, //show/hide [all options] option in the list
                "has_none":false //show/hide [none of options] option in the list
             }
          },
          {
             "title":"Input Filter Title",
             "type":"input",
             "name":"full_name",
             "placeholder":"Type here full name plz..",
             "classes":[

             ]
          },
          {
             "title":"From Date:",
             "type":"input",
             "name":"from_date",
             "placeholder":"",
             "classes":[

             ],
             "date":true //so frontend will MASK this input to date format
          },
          {
             "title":"To Date:",
             "type":"input",
             "name":"to_date",
             "placeholder":"",
             "classes":[

             ],
             "date":true
          }
       ],
       "table_title":"Table Panel Title",
       "columns":[
          {
             "title":"Type", //column title
             "sortable":true, //to enable/disable sotring by this column
             "column":"type_title" //column title in DB
          },
          {
             "title":"Full Name",
             "sortable":true,
             "column":"full_name"
          },
          {
             "title":"Zone",
             "sortable":true,
             "column":"zone_title"
          },
          {
             "title":"Record Date",
             "sortable":true,
             "column":"record_date",
             "numeric":true //to make sure of displaying it in a good numeric format
          },
          {
             "title":"Sector Title",
             "sortable":true,
             "column":"redirect_to_sector_title"
          }
       ],
       "footer":{
          "info":"Some text about client balance for example.", //allows you to push any notification about this table to its view
          "execution_time":"0.0090" //allows you to pass server side processing time in seconds to frontend
       },
       "current_page":1,
       "data":[], //your table data comes here
       "from":1,
       "last_page":25,
       "per_page":30,
       "to":30,
       "total":726
    }

<h1>Frontend Part:</h1>

<strong>1. You need to declare very simple \<div> and give it any ID you want, in our demo:</strong>
    
    <div id="brisk-demo"></div>
    
<strong>2. Brisk Instance Options declaration:</strong>

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

<strong>3. Brisk Instance declaration:</strong>

    var briskDemo = new $.BriskDataTable($("#brisk-demo"), initOptions);
    
    briskDemo.InitBrisk(); //initilaize the table and its filters HTML
    briskDemo.get(); //gets table data, and filters
    
<strong>4. Reach Brisk table buttons:</strong>

You can access any method of the injected button from the table using this format, by [data_action] which you already declared in the options:

    briskDemo.datatable.element.find('[data-action="insert"]').click(function(){
        alert();
    });
    
<strong>In case you are going to enable Filters, you need to declare this GLOBALS over your entire app before step #2:</strong>

    const GLOBALS = {
        base_url: 'http://domain-name.com',
        lists: {
            /*
            * These standard options are controlled by backend JSON attributes
            */
            standard_options: function(select){
                if($(select).data('has_empty') === true){
                    $(select).append("<option></option>");
                }
                if($(select).data('has_all') === true){
                    $(select).append("<option value='all'>كافة الخيارات</option>"); //you can change this text to anything fits you
                }
                if($(select).data('has_none') === true){
                    $(select).append("<option value='none'>لا يوجد</option>"); //you can change this text to anything fits you
                }
            },
            /*
            * user_types is the sample which you can make unlimited number of lists like its format
            */
            user_types: {
                data: [],
                get: function(){
                    $.get(GLOBALS.base_url + "/lists/user-types", //your list GET resource
                    $(this).serialize(),
                    function(response, status){
                        GLOBALS.lists.user_types.data = response;

                        var options = "";

                        $.each(response, function(key, value) {
                            options += "<option value='" + value.serial_no + "' data-title-en='" + value.title_en + "' data-calls='" + value.calls + "' data-visits='" + value.visits + "'>" + value.title + "</option>";
                        });

                        $('select[data-options_source="user_types"]').each(function() {
                            if($.trim($(this).html()) == ""){
                                GLOBALS.lists.standard_options(this);

                                $(this).append(options);
                            }
                        }); 
                    })
                    .fail(function() {
                        GLOBALS.lists.user_types.get();
                    }); 
                }
            }
        }
    }
