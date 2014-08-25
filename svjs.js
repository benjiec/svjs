window.SequenceViewer = function ($, selector) {
    $('<table></table>').addClass('svjs').appendTo($(selector));

    function clear() {
        $('table', selector).empty();
    }

    // Displays annotations with sequence. Annotations should be an array of
    // objects, each with base_first, base_last, and display_name attributes.
    //
    function setSequenceWithAnnotations(sequence, annotations, start_bp, rowlen) {
        if (start_bp < 1) { alert('start_bp should be one or greater'); }

        function annotationToggle(ev) {
            var el = $(ev.target);
            if (el.hasClass('sequence-annotation-selected')) {
                $('tr.sequence-annotation td div').show();
                $('tr.sequence-annotation').show();
                $('tr.sequence-annotation td div.sequence-annotation-selected')
                  .removeClass('sequence-annotation-selected');
            }
            else {
                $('tr.sequence-annotation td div').hide();
                $('tr.sequence-annotation').hide();

                var id = el.data('sequence-annotation-id');
                $('tr.sequence-annotation td div.sequence-annotation-'+id)
                  .addClass('sequence-annotation-selected')
                  .show()
                  .parents('tr')
                  .show();
            }
        }

        rowlen = typeof rowlen !== 'undefined' ? rowlen : 80;
        clear();
        var rsplit = new RegExp('(.{1,'+rowlen+'})', 'g');
        var rows = sequence.match(rsplit);

        var ai = 0;
        _.map(annotations, function(a) { a.__sequence_annotation_id = ai; ai++; });

        var row_start = start_bp;
        _.map(rows, function(row) {
            var row_end = row_start+row.length-1;
            var row_annotations = _.select(annotations, function(a) {
                return (row_start <= a.base_first && a.base_first <= row_end) ||
                       (row_start <= a.base_last && a.base_last <= row_end);
            });

            var start_annotations = [];
            var end_annotations = [];

            _.map(row_annotations, function(a) {
                if (row_start <= a.base_first && a.base_first <= row_end) {
                    var i = a.base_first-row_start;
                    if (start_annotations[i] === undefined) { start_annotations[i] = []; }
                    start_annotations[i].push(a);
                }
                if (row_start <= a.base_last && a.base_last <= row_end) {
                    var i = a.base_last-row_start;
                    if (end_annotations[i] === undefined) { end_annotations[i] = []; }
                    end_annotations[i].push(a);
                }
            });

            var tr_mid = $('<tr class="sequence-bp"></tr>');
            var pos = $('<td class="sequence-pos sequence-pos-left"></td>').append(row_start);
            tr_mid.append(pos);

            var tr_top = [];
            var tr_top_html = '<tr class="sequence-annotation sequence-annotation-start"></tr>';
            var tr_bot = [];
            var tr_bot_html = '<tr class="sequence-annotation sequence-annotation-end"></tr>';

            var i = 0;
            _.map(row.split(''), function(bp) {
                var td = $('<td></td>');
                td.append(bp);
                tr_mid.append(td);

                if (start_annotations.length > 0) {
                    if (start_annotations[i]) {
                        _.map(start_annotations[i], function(a) {
                            var tr = $(tr_top_html);
                            // empty td for bp number
                            tr.append('<td></td>');
                            if (i > 0) { tr.append('<td colspan="'+i+'"></td>'); }
                            var td = $('<td></td>');
                            var c = '&gt;';
                            if (a.strand < 0) { c = '&lt;'; }
                            var a = $('<div></div>')
                                      .addClass('sequence-annotation-'+a.__sequence_annotation_id)
                                      .data('sequence-annotation-id', a.__sequence_annotation_id)
                                      .append('['+c+a.display_name);
                            td.append(a);
                            tr.append(td);
                            if (i < row.length-1) { tr.append('<td colspan="'+(row.length-i-1)+'"></td>'); }
                            // empty td for bp number
                            tr.append('<td></td>');
                            tr_top.push(tr);
                        });
                    }
                }

                if (end_annotations.length > 0) {
                    if (end_annotations[i]) {
                        _.map(end_annotations[i], function(a) {
                            var tr = $(tr_bot_html);
                            // empty td for bp number
                            tr.append('<td></td>');
                            if (i > 0) { tr.append('<td colspan="'+i+'"></td>'); }
                            var td = $('<td></td>');
                            var a = $('<div></div>')
                                      .addClass('sequence-annotation-'+a.__sequence_annotation_id)
                                      .data('sequence-annotation-id', a.__sequence_annotation_id)
                                      .append(']'+a.display_name);
                            td.append(a);
                            tr.append(td);
                            if (i < row.length-1) { tr.append('<td colspan="'+(row.length-i-1)+'"></td>'); }
                            // empty td for bp number
                            tr.append('<td></td>');
                            tr_bot.push(tr);
                        });
                    }
                }

                i += 1;
            });

            if (row_end < start_bp+sequence.length-1) {
                var pos = $('<td class="sequence-pos sequence-pos-right"></td>').append(row_end);
                tr_mid.append(pos);
            }

            if (tr_top.length > 0) { tr_top[0].addClass('sequence-annotation-start-first'); }
            _.map(tr_top, function(tr) { $('table', selector).append(tr); });
            $('table', selector).append(tr_mid);
            if (tr_bot.length > 0) { tr_bot[tr_bot.length-1].addClass('sequence-annotation-end-last'); }
            _.map(tr_bot, function(tr) { $('table', selector).append(tr); });

            row_start += row.length;
        });

        $('tr.sequence-annotation td div').on('click', annotationToggle);
    }

    return {
        clear: clear,
        setSequenceWithAnnotations: setSequenceWithAnnotations
    }
}
