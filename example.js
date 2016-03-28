/**
 * Created by Goddice on 3/28/2016.
 */

$(function () {
    var dataURL;
    var dataType;
    var chartType;
    var selectedAttributes = [];

    $("#json").click(function () {
        dataType = "json";
        dataURL = $("#url").val();
        var target;
        $.ajax({
            type: 'GET',
            url: dataURL,
            dataType: 'json',
            success: function (json) {
                target = json;
            },
            async: false
        });

        $("#graph").empty();
        $("#struct").empty();
        makeSelectChartType();
        $("#struct").append("select data attribute: ");
        recursiveCreate(target, 0);

        function recursiveCreate(json, level)
        {
            if (json)
            {
                $("#struct").append("<select id='json" + String(level) + "'></select>");
                for (elem in json)
                {
                    $("#json" + String(level)).append("<option value='" + elem + "'>" + elem + "</option>");
                }
                $("#json" + String(level)).change(function () {
                    if (selectedAttributes[level] === undefined)
                    {
                        selectedAttributes.push($(this).val());
                    }
                    else
                    {
                        selectedAttributes[level] = $(this).val();
                    }
                    njson = json[$(this).val()];
                    if(Array.isArray(njson))
                    {
                        njson = njson[0];
                    }
                    if (typeof njson === "object")
                    {
                        recursiveCreate(njson, level + 1);
                    }
                    else
                    {
                        var childrenList = $("#struct").children();
                        for (var i = 0; i < childrenList.length; i++)
                        {
                            idStr = childrenList[i].id;
                            if (Number(idStr[idStr.length - 1]) > level)
                            {
                                childrenList[i].remove();
                            }
                        }
                        if (selectedAttributes[level])
                        {
                            selectedAttributes = selectedAttributes.slice(0, level + 1);
                        }
                    }
                    drawChart();
                });
            }
        }

    });

    $("#csv").click(function () {
        dataType = "csv";
        dataURL = $("#url").val();
        var attrList = [];
        $.ajax({
            type: 'GET',
            url: dataURL,
            dataType: 'text',
            success: function (csv) {
                var target = $.csv.toArrays(csv);
                attrList = target[0];
            },
            async: false
        });

        $("#graph").empty();
        $("#struct").empty();
        makeSelectChartType();
        $("#struct").append("select data attribute: ");
        $("#struct").append("<select id='csv0'></select>");
        for (var i = 0; i < attrList.length; i++)
        {
            $("#csv0").append("<option value='" + attrList[i] + "'>" + attrList[i] + "</option>");
        }
        $("#csv0").change(function () {
            selectedAttributes = [];
            selectedAttributes.push($(this).val());
            drawChart();
        });
    });

    function makeSelectChartType()
    {
        $("#struct").append("select chart type: <select id='chart-type'></select><br><br>");
        $("#chart-type").append("<option value='bar'>Bar Chart</option>");
        $("#chart-type").append("<option value='line'>Line Chart</option>");
        $("#chart-type").change(function () {
            chartType = $(this).val();
            drawChart();
        })
    }

    function drawChart()
    {
        $("#graph").empty();
        $("#graph").chart({
            dataURL: dataURL,
            dataType: dataType,
            dataAttribute: selectedAttributes,
            chartType: chartType,
            width: "800",
            height: "600",
            margin: {top: 80, right: 80, bottom: 80, left: 80},
            containerID: "#graph"
        });
    }
});