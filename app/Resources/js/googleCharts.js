(function($) {
    'use strict';

    $.fn.googleCharts = function(options) {

        if (typeof(google) == "undefined") {
            return;
        }

        this.each(function () {
            if ($('#piechart-' + $(this).data('opinion-id')).length) {

                var chart_opinion;
                var options;
                var data;

                data = new google.visualization.DataTable();
                data.addColumn('string', 'Task');
                data.addColumn('number', 'Opinions');
                data.addRows([
                    ["D'accord", $(this).data('ok')],
                    ["Mitigé", $(this).data('mitige')],
                    ["Pas d'accord", $(this).data('nok')]
                ]);
                options = {
                    legend: 'none',
                    colors: ['#5cb85c', '#f0ad4e', '#d9534f'],
                    pieSliceText: 'value',
                    backgroundColor: 'transparent'
                };
                chart_opinion = new google.visualization.PieChart(document.getElementById('piechart-' + $(this).data('opinion-id')));
                chart_opinion.draw(data, options);
            }
        });

        return this;
    };

})(jQuery);
