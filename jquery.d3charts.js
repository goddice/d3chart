/**
 * Created by Goddice on 3/27/2016.
 */


(function($) {
    $.fn.chart = function (options) {
        var setting = $.extend({
            // defaults
            dataURL: "data/football.json",
            dataType: "json",
            dataAttribute: ["teams", "stand_home_d"],
            chartType: "bar",
            width: "1000",
            height: "1000",
            margin: {top: 20, right: 20, bottom: 30, left: 40},
            containerID: "#graph"
        }, options);

        var data = extractData();
        makeChart(data);

        function extractData () {
            if (setting.dataType === "json")
            {
                return extractJSONdata();
            }
            if (setting.dataType === "csv")
            {
                return extractCSVdata();
            }

            // functions for different data type
            function extractJSONdata () {
                if (setting.dataAttribute.length === 0)
                {
                    return [];
                }
                else
                {
                    var ret = [];
                    $.ajax({
                        type: 'GET',
                        url: setting.dataURL,
                        dataType: 'json',
                        success: function (json) {
                            var target = json;
                            var len = setting.dataAttribute.length;
                            for (var i = 0; i < len - 1; i++)
                            {
                                target = target[setting.dataAttribute[i]];
                            }

                            for (var i = 0; i < target.length; i++)
                            {
                                var info = Number(target[i][setting.dataAttribute[len - 1]]);
                                if (info)
                                {
                                    ret.push(info);
                                }
                            }
                        },
                        async: false
                    });
                    return ret;
                }
            }

            function extractCSVdata() {
                if (setting.dataAttribute.length === 0)
                {
                    return [];
                }
                else
                {
                    var ret = [];
                    $.ajax({
                        type: 'GET',
                        url: setting.dataURL,
                        dataType: 'text',
                        success: function (csv) {
                            var target = $.csv.toArrays(csv);
                            var idx = target[0].indexOf(setting.dataAttribute[0]);
                            for (var i = 1; i < target.length; i++)
                            {
                                var info = Number(target[i][idx]);
                                if (info)
                                {
                                    ret.push(info);
                                }
                            }
                        },
                        async: false
                    });
                    return ret;
                }
            }

        }

        function makeChart(data)
        {
            if (data.length ===0)
            {
                return;
            }

            if (setting.chartType === "bar")
            {
                makeBarChart(data);
            }
            if (setting.chartType === "line")
            {
                makeLineChart(data);
            }

            // make different charts
            function makeBarChart(data) //http://bl.ocks.org/mbostock/3885304
            {
                var dataWithIdx = [];
                for (var i = 0; i < data.length; i++)
                {
                    dataWithIdx.push({idx:i, value:data[i]});
                }

                var width = setting.width - setting.margin.left - setting.margin.right;
                var height = setting.height - setting.margin.top - setting.margin.bottom;
                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);
                var y = d3.scale.linear()
                    .range([height, 0]);
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");
                var svg = d3.select(setting.containerID).append("svg")
                    .attr("width", setting.width)
                    .attr("height", setting.height)
                    .append("g")
                    .attr("transform", "translate(" + setting.margin.left + "," + setting.margin.top + ")");
                x.domain(dataWithIdx.map(function(d) { return d.idx; }));
                y.domain([
                    d3.min(dataWithIdx, function(d) { return d.value; }) - 10,
                    d3.max(dataWithIdx, function(d) { return d.value; }) + 10
                ]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(setting.dataAttribute[setting.dataAttribute.length - 1]);

                svg.selectAll(".bar")
                    .data(dataWithIdx)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.idx); })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(d.value); })
                    .attr("height", function(d) { return height - y(d.value); });

            }

            function makeLineChart(data) //http://bl.ocks.org/mbostock/3883245
            {
                var dataWithIdx = [];
                for (var i = 0; i < data.length; i++)
                {
                    dataWithIdx.push({idx:i, value:data[i]});
                }

                var width = setting.width - setting.margin.left - setting.margin.right;
                var height = setting.height - setting.margin.top - setting.margin.bottom;
                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                var line = d3.svg.line()
                    .x(function(d) { return x(d.idx); })
                    .y(function(d) { return y(d.value); });

                var svg = d3.select(setting.containerID).append("svg")
                    .attr("width", setting.width)
                    .attr("height", setting.height)
                    .append("g")
                    .attr("transform", "translate(" + setting.margin.left + "," + setting.margin.top + ")");

                x.domain(dataWithIdx.map(function(d) { return d.idx; }));
                y.domain([
                    d3.min(dataWithIdx, function(d) { return d.value; }) - 10,
                    d3.max(dataWithIdx, function(d) { return d.value; }) + 10
                ]);


                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(setting.dataAttribute[setting.dataAttribute.length - 1]);

                svg.append("path")
                    .datum(dataWithIdx)
                    .attr("class", "line")
                    .attr("d", line);

            }


            /**
             * Creates a range of numbers in an array, starting at a specified number and
             * ending before a different specified number.
             * @param {number} start  Indicates what number should be used as the first
             *     number in the returned array.  If this is the only number argument
             *     supplied, this will be used as the edge and 0 will be used as the start.
             * @param {number=} edge  Indicates the first number that should not appear in
             *     the range of numbers.  If this number preceeds the start in the range
             *     (taking into account the step), an empty array will be returned.  If not
             *     specified and not inferred this defaults to 0.
             * @param {number=} step  Indicates the difference between one number and the
             *     subsequent number placed in the returned array.  If not specified this
             *     defaults to 1.
             * @return {!Array.<number>}  Array of numbers in the specified range.
             */
            function range(start, edge, step) {
                // If only one number was passed in make it the edge and 0 the start.
                if (arguments.length == 1) {
                    edge = start;
                    start = 0;
                }

                // Validate the edge and step numbers.
                edge = edge || 0;
                step = step || 1;

                // Create the array of numbers, stopping befor the edge.
                for (var ret = []; (edge - start) * step > 0; start += step) {
                    ret.push(start);
                }
                return ret;
            }
        }


    }
}(jQuery));