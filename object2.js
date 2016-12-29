/**
 * Created by yc on 16/12/14.
 */
/**
 * 分级告警交互js
 * Created by lemon on 16-7-29.
 */
;
(function ($) {
    //dom扩展
    $.fn.extend({
        //绑定未来所有下拉框的公用选择事件(添加active/把active li 内容展示出来)
        dropbox: function () {
            var $this = $(this);
            $this.find('.dropdown-toggle').live('click', function (e) {
                if ($(this).parent().hasClass('disabled')) return false;
                $('.dropbox').not($(this).parent()).removeClass('open');
                $(this).parents('.dropbox').toggleClass("open");
                return false;
            });
            $this.find('.dropdown-menu').live('click', function (e) {
                $(this).parents('.dropbox').toggleClass("open");
            });
            $this.find('li').live('click', function (e) {
                var $span = $(this).closest('.dropbox').find('span');
                var oldVal = $span.text();
                $(".dropdown-toggle .fl", $(this).closest('.dropbox')).text($(this).find('a').text());
                $(this).addClass('active').siblings().removeClass('active');
                $('.dropbox').find('li').removeAttr('data-active');
                if ($(this).text() == oldVal) {
                    $(this).attr('data-active', true);
                }
                ;
                e.preventDefault();
            });
            return $this;
        },
        //公用删除基础告警线/升级告警线
        deleteLine: function () {
            var $this = $(this);
            $this.find('a.remove-btn').live('click', function (e) {
                $(this).parent().remove();
                e.preventDefault();
            });
            return $this;
        },
        //阈值比较自定义验证范围输入1-limit
        checkNum: function (limit) {
            var $this = $(this);
            var flag = [];
            $this.find('input').each(function (i) {
                var $this = $(this);
                var iv = parseInt($this.val());
                if (!isNaN(iv) && /(^[1-9]\d*$)/.test(iv) && iv <= parseInt(limit)) {
                    $this.removeClass('red-border');
                    flag.remove(i);
                } else {
                    $.errorTip('请输入1-' + limit + '之间的整数！');
                    $this.addClass('red-border');
                    flag.push(i);
                }
            });
            $this.data('flag', flag);
            return $this;
        },
        //单个input输入验证
        validateInput: function (start, end) {
            var $this = $(this);
            var iv = parseInt($this.val());
            var flag = [];
            var reg = /^[1-9]\d*|[0]{1,1}$/;
            if (reg.test(iv) && iv >= parseInt(start) && iv <= parseInt(end)) {
                $this.removeClass('red-border');
                flag.remove(iv);
            } else {
                $.errorTip('请输入' + start + '-' + end + '之间的整数！');
                $this.addClass('red-border');
                flag.push(iv);
            }
            $this.data('flag', flag);
            return $this;
        },
    });
    $('.dropbox').dropbox();
    $('.alarm-line').deleteLine();
    $(document).click(function () {
        $(".dropdown").removeClass("open");
        $(".dropbox").removeClass("open");
    });
})(jQuery);

;
(function ($) {
    //function扩展
    $.extend({
        //错误提示
        errorTip: function (msg, dom) {
            if (!dom) dom = $('#basicViewDiv');
            dom.children('p').empty().text(msg).css('color', 'red');
            setTimeout(function () {
                dom.children('p').empty();
            }, 4000);
        },
        //根据dom1告警等级展示dom2告警等级
        showLevel: function (dom1, dom2) {
            //提醒/次要/严重/紧急
            var classArr = ['remind', 'secondary', 'serious', 'urgent'];
            var level = dom1.data('level');
            dom2.html(dom1.children('a').html());
            dom2.removeAttr('class').addClass('alert-level ' + classArr[(level - 1)]);
        },
        //检验重复告警线
        checkRepeatLine: function (ary) {
            var flag = true;
            var nary = ary.sort();
            for (var i = 0; i < ary.length; i++) {
                if (nary[i] == nary[i + 1]) {
                    flag = false;
                    //分割ary[i] 1=>比较条件 2=>比较值
                    var kvarr = nary[i].split(".");
                    //把重复指标换成文字描述
                    var metricTitle = $('.monitor-index li.active a').html();
                    var metricCmp = JKB.cache.th_cond[kvarr[0]]['name'];
                    var metricValue = kvarr[1];
                    var repeatLineMsg = "请勿添加重复告警指标：" + metricTitle + metricCmp + metricValue;
                    //3秒之后删除错误提示
                    $.errorTip(repeatLineMsg);
                    break;
                }
            }
            return flag;
        },
        //公用控制告警级别联动
        linkage: function (dom, value) {
            dom.each(function (i) {
                //紧急的展示自己
                if (value == 4 && (i + 1) == 4) {
                    $(this).show();
                    return false;
                }
                //其余的展示高级
                if ((i + 1) <= value) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });

            //触发一次点击事件
            if (value < 4) {
                dom.eq(value).find('a').trigger('click');
            } else if (value == 4) {
                dom.eq(value - 1).find('a').trigger('click');
            }
        },
        //范围告警线排版
        typeSetting: function (num) {
            //获取基础告警线div中的已添加的告警线个数
            var basicRangeLine = $('#basicViewDiv .alarm-line');
            //大于1条开始排版
            if (num > 1 && num < 5) {
                //第一行的左侧变成可编辑状态
                basicRangeLine.first().find('.input-left').removeAttr('readonly');
                //第二行开始 如果有下一栏 把当前行的右侧input值赋给下一栏的左侧input，并给readonly属性
                basicRangeLine.each(function () {
                    $(this).next().find('.input-left').val($(this).find('.input-right').val()).attr('readonly', true);
                    if ($(this).index() < num - 1) {
                        //if(!$(this).find('.alarm-level .dropbox').hasClass('disabled')){
                        //    $(this).find('.alarm-level .dropbox').addClass('disabled');
                        //}
                        //编辑时候需要增加readonly
                        $(this).find('.alarm-level .dropbox').removeClass('disabled').addClass('disabled');
                        $(this).children('a').remove();
                    }
                });
            }
        },
        /**
         * 保存验证方法
         * 验证范围告警线的基础告警线输入
         * 1.单条告警线，允许右边为空
         * 2.两条，三条告警线允许最后一条告警线右边为空
         * 3.四条告警线左边必须是数字
         * @returns {boolean}
         */
        checkInput: function () {
            var flag = true;
            var basicLength = $('#basicViewDiv .alarm-line').length;
            var reg = /^[1-9]\d*|[0]{1,1}$/;
            $('#basicViewDiv .alarm-line').each(function (i) {
                var riv = $(this).find('.input-right').val();
                var liv = $(this).find('.input-left').val();
                if (i < basicLength - 1) {
                    if (reg.test(riv) && reg.test(liv) && riv > liv) {
                        $(this).find('input').removeClass('red-border');
                    } else {
                        $.errorTip('请检查输入是否为整数且不得小于左侧输入');
                        $(this).find('.input-right').addClass('red-border');
                        flag = false;
                    }
                } else if (i == basicLength - 1) {
                    //先验左边是否合法
                    if (reg.test(liv)) {
                        $(this).find('input').removeClass('red-border');
                    } else {
                        $.errorTip('请检查输入是否为正整数');
                        $(this).find('.input-left').addClass('red-border');
                        flag = false;
                    }
                    //如果右边有值 验证左右
                    if (riv) {
                        if (reg.test(riv) && riv > liv) {
                            $(this).find('input').removeClass('red-border');
                        } else {
                            $.errorTip('请检查输入是否为正整数且不得小于左侧输入');
                            $(this).find('.input-right').addClass('red-border');
                            flag = false;
                        }
                    }
                }
            });
            return flag;
        },
        /**
         * 添加基础告警线验证方法
         *
         */
        checkAddInput: function () {
            var flag = true;
            var basicLength = $('#basicViewDiv .alarm-line').length;
            var reg = /^[1-9]\d*|[0]{1,1}$/;
            if (basicLength < 4) {
                $('#basicViewDiv .alarm-line').each(function (i) {
                    var riv = $(this).find('.input-right').val();
                    var liv = $(this).find('.input-left').val();
                    if (reg.test(riv) && reg.test(liv) && riv > liv) {
                        $(this).find('input').removeClass('red-border');
                    } else {
                        $.errorTip('请检查输入是否为整数且不得小于左侧输入');
                        $(this).find('.input-right').addClass('red-border');
                        flag = false;
                    }
                });
            }
            return flag;
        },
        //升级验证
        upgradeCheck: function () {
            var flag = true;
            var type = $('#updateViewDiv .alarm-line .time-mode li.active').data('value');
            var fir_input = $('#updateViewDiv .alarm-line').find('input:eq(0)');
            var time_type = $('#updateViewDiv .alarm-line .time-type li.active').data('value');
            if (time_type == 5) {
                fir_input.validateInput('1', '1440');
            } else if (time_type == 6) {
                fir_input.validateInput('1', '24');
            } else if (time_type == 7) {
                fir_input.validateInput('1', '30');
            }
            if (fir_input.data('flag').length) {
                flag = false;
                return flag;
            }
            if (type == 1) {
                var sec_input = $('#updateViewDiv .alarm-line').find('input:eq(1)');
                sec_input.validateInput('2', '99');
                if (sec_input.data('flag').length) {
                    flag = false;
                    return flag;
                }
            }
            return flag;
        },
        //保存和关闭监测点弹窗公共方法
        modalRevoke: function () {
            $('#choose-monitor-modal input:checked').prop('checked', false);
            $('.selected-num').text(0);
            $('#awesomplete_mon').val('');
            $.removeHighLight();
            $('.choose-monitor-modal').hide();
            $('.backdrop').hide();
        },
        //监测点弹框移除高亮显示
        removeHighLight: function () {
            $('.all-monitor .son-monitor label.checkbox').removeClass('highlight-checkbox');
        },
        //输入要搜索的内容后，下面子监测点label匹配元素高亮显示
        searchResHighLight: function () {
            $.removeHighLight();
            var searchedText = $('input#awesomplete_mon').val();
            $('.all-monitor .son-monitor label.checkbox').each(function () {
                var allLabelValue = $(this).text();
                if (allLabelValue.indexOf(searchedText) != -1 && searchedText != '') {
                    $(this).addClass('highlight-checkbox');
                } else {
                    $(this).removeClass('highlight-checkbox');
                }
            })
        },
        //监测点数字个数更新
        updateNum: function () {
            var $allCheckbox = $(".all-monitor .son-monitor").find(":checkbox");
            var num = $allCheckbox.filter(":checked").length;
            $(".selected-num").text(num);
        },
        //判断全选是否勾上
        judgeCheckAll: function () {
            var $allCheckbox = $(".all-monitor .son-monitor").find(":checkbox");
            $('#checkbox_all').prop('checked', $allCheckbox.filter(':checked').length == $allCheckbox.length);
        },
        //判断列全选是否勾上
        judgeColCheck: function (col, checkedEle, son) {
            col.prop('checked', checkedEle.length == son.length);
        },
        //指定监测点弹框铺值
        setMonDefaultVal: function (monitorsCount, selectId) {
            $('.selected-num').text(monitorsCount);
            if (selectId.length > 0) {
                $.each(selectId, function (k, v) {
                    $('.all-monitor .son-monitor').find(':checkbox[value="' + v + '"]').prop('checked', true);
                });
                $('.all-monitor .son-monitor').each(function () {
                    var col = $(this).prev('.monitor-type').find(':checkbox');
                    var checkedEle = $(this).find(':checked');
                    var son = $(this).find(':checkbox');
                    $.judgeColCheck(col, checkedEle, son);
                });
                $.judgeCheckAll();
            }
        },
        //展示升级告警线内容
        showUpgradeHtml: function (dom, type) {
            var upgradeLines = $('#updateViewDiv .alarm-line');
            //范围用的
            var rangeFirHtml = $('#updateViewDiv .alarm-line').find('.upgrade-dep li.active span').first().text();
            var rangeLastHtml = $('#updateViewDiv .alarm-line').find('.upgrade-dep li.active span').last().text();
            var updateAlarmType = $('#updateViewDiv .alarm-line .time-mode li.active');
            var updateAlarmTypeValue = parseInt(updateAlarmType.data('value'));
            var updateAlarmTypeHtml = updateAlarmType.find('a').html();
            var updateFristInput = $('#updateViewDiv .alarm-line input:eq(0)').val();
            var updateAlarmUnit = $('#updateViewDiv .alarm-line .time-type li.active');
            //var updateAlarmUnitValue    = parseInt(updateAlarmUnit.data('value'));
            var updateAlarmUnitHtml = updateAlarmUnit.find('a').html();
            var updateSecondInput = $('#updateViewDiv .alarm-line input:eq(1)').val();

            var depCond = upgradeLines.find('.upgrade-dep li.active span').first().text();
            var depVal = upgradeLines.find('.upgrade-dep li.active span').last().text();

            dom.find('.upgrade-line span.alarm-cond').empty().html(depCond);
            dom.find('.upgrade-line span.alarm-val').empty().html(depVal);
            dom.find('.range-value span:eq(0)').html(rangeFirHtml);
            dom.find('.range-value span:eq(1)').html(rangeLastHtml);
            dom.find('.time-mode').empty().html(updateAlarmTypeHtml);
            dom.find('.time-unit').empty().html(updateFristInput + updateAlarmUnitHtml);
            if (updateAlarmTypeValue == 1) {
                dom.find('.time-count').empty().html(updateSecondInput);
            } else if (updateAlarmTypeValue == 2) {
                dom.find('.cumulative').remove()
            }
            $.showLevel(upgradeLines.find('.alarm-level li.active'), dom.find('.upgrade-line .alarm-level span'));
            return true;
        },
        //绑定编辑/删除事件
        bindAlarmEvent: function (dom, index) {
            var jsonData = taskAlarmLineHandle.buildJsonData();
            dom.find('.edit').data('alarmContent', jsonData);
            if (typeof index != 'undefined' && index >= 0) {
                //修改
                //绑定编辑和删除事件
                dom.find('.edit').bind('click', function () {
                    taskAlarmLineHandle.editAlarmLine(index);
                });
                dom.find('.del').bind('click', function () {
                    taskAlarmLineHandle.delAlarmLine(index);
                });
                dom.insertBefore($('#alarm_lines_list').children().eq(index));
                $('#alarm_lines_list').children().eq(index + 1).remove();
            } else {
                dom.appendTo($('#alarm_lines_list'));
                //绑定编辑和删除事件
                var lastDiv = $('#alarm_lines_list').children().last();
                lastDiv.find('.edit').bind('click', function () {
                    taskAlarmLineHandle.editAlarmLine(lastDiv.index());
                });
                lastDiv.find('.del').bind('click', function () {
                    taskAlarmLineHandle.delAlarmLine(lastDiv.index());
                });
            }
            $.closeTh();
        },
        //清空数据并关闭添加告警线内容
        closeTh: function () {
            //清空数据
            $('.monitor-index li:eq(0)').trigger('click');
            $('.monitor-point li:eq(0)').trigger('click').data('monitorsSelected', '');
            $('#mon_num_checked').text('0');
            $('.monitor-point input').val('10');

            $('.alarm-frequency li:eq(0)').trigger('click');
            $('.alarm-frequency input').val('10');

            $('#add_alarm_line .unfold_footer .btn-primary').unbind('click').bind('click', function (e) {
                taskAlarmLineHandle.saveAlarmLine();
                e.preventDefault();
            });
            $('#add_alarm_line').hide();
        },
        //编辑时,编辑框内展示升级告警线
        editUpgradeLineShow: function (json) {
            $.each(json, function (k, v) {
                //当前仅一条升级告警线，每次触发第一条即可
                var actLi = k;
                var timeType = v.type;
                var timeRange = v.time_range;
                var timeRangeUnit = v.time_range_unit;
                var upLevel = v.up_level;
                $('#updateViewDiv .alert-upgrade-list').find('.upgrade-dep li[data-value=' + actLi + ']').trigger('click');
                $('#updateViewDiv .alert-upgrade-list').find('.time-mode li[data-value=' + timeType + ']').trigger('click');
                $('#updateViewDiv .alert-upgrade-list').find('.time-mode').next('input').val(timeRange);
                $('#updateViewDiv .alert-upgrade-list').find('.time-type li[data-value=' + timeRangeUnit + ']').trigger('click');
                $('#updateViewDiv .alert-upgrade-list').find('.alarm-level li[data-level=' + upLevel + ']').trigger('click');
                var value = v.value;
                $('.alert-upgrade-list').find('.only-acc input').val(value);
            })
        }
    });
})(jQuery);

var taskAlarmLineHandle = (function ($) {

    //监测点弹窗初始化标识
    var initMonitor = true;

    /**
     * 加载网站告警设置页面
     * Ajax Load alarm page
     */
    var loadSiteAlarmPage = function () {
        var monitorGroupId = $('#group_id').val();
        JKB.submit.ajax_load('add_alarm_line', 'task', 'load_alarm_grade_threshold_setting', {
            task_type: task_type,
            monitor_group_id: monitorGroupId
        }, function (result) {
            if (!result) {
                var html = '<div class="form"><div class="control-group"><div class="controls warn">' + L.monitor_service.no_support_alarm + '</div></div></div>';
                $('#add_cus_alarm').html(html);
                return false;
            }
            //var actLiValue = $('.monitor-point li.active').data('value');
            //taskAlarmLineHandle.loadMonitorSet(actLiValue);

            //TODO 修改任务 加载已有的告警线 task_id task_sort task_type 生成默认告警线
            if (task_id) {
                loadAlarmLines(task_id, 0, task_type);
            } else {
                var obj = {};
                var faultData = '{"metric":6,"gradable":0,"grades":{"1":{"level":1,"ahead":399,"cmp_ahead":1,"unit":4}},"extends":{"monitor":{"type":3,"num":1,"value":[0]},"remind":{"type":1,"value":0,"unit":1}}}';
                obj.threshold_content = faultData;
                makeAlarmList(obj);
            }
        });
    };

    /**
     * 修改时，加载任务已添加的告警线
     * @param task_id
     * @param task_sort
     * @param task_type
     */
    var loadAlarmLines = function (task_id, task_sort, task_type) {
        if (!task_id) return false;
        var url = '';
        switch (parseInt(task_sort)) {
            case 0:
                url = '/jkb/task_task_create_dispose/loadSiteAlarmList/s';
                break;
            case 1:
                url = '/jkb/task_server_create_dispose/loadServerAlarmList/s';
                break;
            case 2:
                url = '/jkb/task_service_create_dispose/loadServiceAlarmList/s';
                break;
        }
        if (!url) return false;
        $.getJSON(url, {task_id: task_id}, function (json) {
            if (!json) return false;
            for (var i = 0; i < json.length; i++) {
                makeAlarmList(json[i]);
            }
        });
    };

    /**
     * 根据json数据生成告警线列表
     * @param data
     * 格式
     * {
        "threshold_id":"29365",
        "type":"traceroute",
        "threshold_content":"{"metric":"300","gradable":0,"grades":{"1":{"level":1,"ahead":"1","cmp_ahead":"1","unit":"4"}},"extends":{"monitor":{"type":3,"num":1,"value":[0]},"remind":{"type":2,"value":2,"unit":1}}}",
        "status":"0"
    }
     */
    var makeAlarmList = function (data) {
        var th_cont = eval('(' + data.threshold_content + ')');
        var metric = th_cont.metric;
        var monitor = th_cont.extends.monitor;
        var remind = th_cont.extends.remind;
        var grades = th_cont.extends.grades;
        var upgrades = th_cont.extends.upgrades;
        //添加
        $('.add_line_one').trigger('click');
        //指标
        $('.monitor-index li[data-value=' + metric + ']').trigger('click');
        //基础告警线
        addBasicLine(grades);
        //升级告警线
        if (upgrades) {
            addUpgradeLine(upgrades);
        }
        //监测点
        loadMonitorSet(monitor.type, monitor);
        //告警频率
        $('.frequency-type li[data-value=' + remind.type + ']').trigger('click');
        //自定义的需要展示input值 & 单位
        if (remind.type == 2) {
            $('.alarm-frequency input').val(remind.value);
            $('.alarm-frequency .dropdown-menu:eq(1) li[data-value=' + remind.unit + ']').trigger('click');
        }
        //保存
        $('#add_alarm_line  .unfold_footer a.btn-primary').trigger('click');
    };

    /**
     * 加载监测点设置
     * @param val 监测点类型选择 1.任意 2.指定 3.平均
     * @param json 保存的监测点json格式数据
     */
    var loadMonitorSet = function (val, json) {
        if (val == 2) {
            if (json) {
                $('.monitor-point li.appoint').trigger('click', json);
            } else {
                $('.monitor-point li.appoint').trigger('click');
            }
        } else if (val == 1) {
            $('.monitor-point li.free').trigger('click');
            $('.point-set-body input').val(json.num)
        } else {
            $('.monitor-point li.average').trigger('click');
        }
    };

    /**
     * 加载监测点列表
     */
    var loadMonitorList = function () {
        //区别是否初始化 来处理监测点选中个数/总数
        //init
        if (initMonitor) {
            var monitorGroupId = $('#group_id').val();

            JKB.submit.ajax_load('alarm_grade_monitor_list', 'task', 'loadAlarmGradeMonitorList', {'monitor_group_id': monitorGroupId}, function (result) {
                if (!result) {
                    var html = '<div class="form"><div class="control-group"><div class="controls warn">' + L.monitor_service.no_support_alarm + '</div></div></div>';
                    $('#add_cus_alarm').html(html);
                    return false;
                }
                //铺上数据
                $('#mon_num_total').text(JKB.cache.allMonitorCount);
                $('#mon_num_checked').text(JKB.cache.selectedMonitorCount);
                //监测点弹窗部分只初始化一次,标识变为false
                initMonitor = false;
            });
        }
        else {
            //$.setMonDefaultVal();
            //传入现有的数据 或者 定义为默认值   1.修改展示编辑框  2.更改了监测点类型 3 添加一个指定监测点
            //清空弹窗部分的数据,铺上现有的数据
            $('#mon_num_total').text(JKB.cache.allMonitorCount);
            $('#mon_num_checked').text(JKB.cache.selectedMonitorCount);

        }
    };

    /**
     * 初始化页面全局变量
     */
    var initResource = function () {
        //获取页面json对象
        eval("JKB.cache.th_define=" + JKB.cache.th_define);
        eval("JKB.cache.th_metric=" + JKB.cache.th_metric);
        eval("JKB.cache.th_cond=" + JKB.cache.th_cond);
        eval("JKB.cache.th_comp=" + JKB.cache.th_comp);
        eval("JKB.cache.th_unit=" + JKB.cache.th_unit);
        eval("JKB.cache.th_monitor_set=" + JKB.cache.th_monitor_set);

        //加载监控指标
        for (var metric in JKB.cache.th_define) {
            $('<li data-value="' + metric + '" data-alert_type="' + JKB.cache.th_define[metric].alert_type + '"><a href="javascript:;">' + JKB.cache.th_metric[metric]['name'] + "</a></li>").appendTo(".monitor-index ul");
        }
        $('.monitor-index ul li:first').removeClass('active').addClass('active');
        $('.monitor-index ul li.active').trigger('click');

        //加载监测点设置
        /*for (var monitor in JKB.cache.th_monitor_set)
         {
         $('<li data-value="'+monitor+'"><a href="javascript:;">'+JKB.cache.th_monitor_set[monitor] + "</a></li>").appendTo(".monitor-point ul");
         }
         $('.monitor-point ul li:first').removeClass('active').addClass('active');*/

    };

    /**
     * 切换告警指标时初始化页面
     * 保存/取消 恢复初始化状态
     * @param index
     */
    var initAlarmLine = function (index) {
        var activeAlertType = parseInt($('.monitor-index li:nth-child(' + index + ')').data('alert_type'));
        var activeAlertValue = parseInt($('.monitor-index li:nth-child(' + index + ')').data('value'));
        var activeAlertLine = $('.monitor-index li:nth-child(' + index + ') a').html();
        switch (activeAlertType) {
            case 1:
                $('#grade_nocmp').children().clone().appendTo($('#basicViewDiv .no-comparison'));
                $('#basicViewDiv .no-comparison').find('.alarm-metric').html(activeAlertLine);
                $('#basicViewDiv .no-comparison').find('.alarm-level li:eq(3)').trigger('click');
                $("#basicViewDiv > a ").hide();
                $("#updateViewDiv > a ").show();
                break;
            case 2:
                //加载指标信息和比较条件
                $('#grade_value_cmp').children().find('.alarm-metric').html(activeAlertLine);
                var conditionSets = JKB.cache.th_define[activeAlertValue]['cmp_rules'];
                var targetUl = $('#grade_value_cmp').children().find('.alarm-condition');
                targetUl.empty();
                for (var i = 0, j = conditionSets.length; i < j; i++) {
                    $('<li data-value="' + conditionSets[i] + '"><a href="javascript:;">' + JKB.cache.th_cond[conditionSets[i]]['name'] + '</a></li>').appendTo(targetUl);
                }
                $(targetUl).find('li:first').removeClass('active').addClass('active').trigger('click');
                $("#basicViewDiv > a ").show();
                $("#updateViewDiv > a ").show();
            case 3:
                $('#grade_range_cmp').children().find('.alarm-metric').html(activeAlertLine);
                $('#grade_range_cmp').children().find('.input-company').empty().html('ms');
                $("#basicViewDiv > a ").show();
                $("#updateViewDiv .upgrade-tip").show();
                break;
        }
        $('#updateViewDiv').find('.alarm-metric').html(activeAlertLine);
    };

    /**
     * 添加基础阈值
     * @param json
     */
    var addBasicLine = function (json) {
        var activeAlertType = parseInt($('.monitor-index li.active').data('alert_type'));
        var addedLineLength = $('#basicViewDiv .alarm-line').length;
        switch (activeAlertType) {
            case 2:
                if (addedLineLength > 0 && addedLineLength <= 20) {
                    //检验右侧input值是否符合1-999
                    if ($('.monitor-index li.active').data('value') == 3) {
                        $('#basicViewDiv .alarm-line').checkNum('100');
                    } else {
                        $('#basicViewDiv .alarm-line').checkNum('999');
                    }
                    if ($('#basicViewDiv .alarm-line').data('flag').length) return false;

                    //超过两行开始校验重复告警线
                    if (addedLineLength >= 2) {
                        var waitToChecked = [];
                        $('#basicViewDiv .alarm-line').each(function () {
                            var key = parseInt($(this).find('.alarm-condition li.active').data('value'));
                            var val = parseInt($(this).find('.threshold-condition input').val());
                            var cmbKV = key + '.' + val;
                            waitToChecked.push(cmbKV);
                        });
                        if (!$.checkRepeatLine(waitToChecked)) return false;
                    }
                } else if (addedLineLength > 20) {
                    $.errorTip('最多只能添加20条基础告警线哦！');
                    return false;
                }

                //如果有json数据
                if (json) {
                    $.each(json, function (i, n) {
                        //兼容带单位的告警线类型
                        var valueBasicLine = $('#grade_value_cmp').children().clone();
                        if ($('.monitor-index li.active').data('value') == 3) {
                            valueBasicLine.find('.no-unit').replaceWith('<div class="input-has-company"><input class="input-single input-width-45" type="text" value="100"><span class="input-company value-unit">%</span></div>');
                        }
                        valueBasicLine.appendTo($('#basicViewDiv .value-comparison'));
                        var basicValLine = $('#basicViewDiv .value-comparison .alarm-line').last();
                        //等于
                        basicValLine.find('.alarm-condition li').each(function () {
                            if ($(this).data('value') == n.cmp_ahead) {
                                $(this).trigger('click');
                                return false;
                            }
                        });
                        //404
                        basicValLine.find('input').val(n.ahead);
                        //严重
                        basicValLine.find('.alarm-level li').each(function () {
                            $.linkage($(this).parent().children(), n.level - 1);
                            if ($(this).data('level') == n.level) {
                                $(this).trigger('click');
                                return false;
                            }
                        });
                    });
                } else {
                    //兼容带单位的告警线类型
                    var valueBasicLine = $('#grade_value_cmp').children().clone();
                    if ($('.monitor-index li.active').data('value') == 3) {
                        valueBasicLine.find('.no-unit').replaceWith('<div class="input-has-company"><input class="input-single input-width-45" type="text" value="100"><span class="input-company value-unit">%</span></div>');
                    }
                    valueBasicLine.appendTo($('#basicViewDiv .value-comparison'));
                }
                break;
            case 3:
                if (addedLineLength > 0 && addedLineLength < 3) {
                    if (!($.checkAddInput())) return false;
                    $('#basicViewDiv .alarm-line').find('.dropbox').last().addClass('disabled');
                    $('#grade_range_cmp').children().clone().appendTo($('#basicViewDiv .range-comparison'));
                    $.linkage($('#basicViewDiv .alarm-line').last().find('.alarm-level li'), $('#basicViewDiv .alarm-line').last().prev().find('.alarm-level li.active').data('level'));
                    $.typeSetting(addedLineLength + 1);

                } else if (addedLineLength == 3) {
                    if (!($.checkAddInput())) return false;
                    $('#basicViewDiv .alarm-line').find('.dropbox').last().addClass('disabled');
                    $('#grade_range_cmp').children().clone().appendTo($('#basicViewDiv .range-comparison')).find('.input-right').parent().remove();
                    $('#basicViewDiv .alarm-line').last().find('.cond-right').remove();
                    $.linkage($('#basicViewDiv .alarm-line').last().find('.alarm-level li'), $('#basicViewDiv .alarm-line').last().prev().find('.alarm-level li.active').data('level'));
                    $.typeSetting(addedLineLength + 1);
                    $('#basicViewDiv > a').addClass('not-click');

                } else if (addedLineLength == 4) {
                    $.errorTip('该指标告警线数量已经达到上限！');
                } else {
                    //区分是否有json数据
                    if (json) {
                        $.each(json, function (i, n) {
                            $('#grade_range_cmp').children().clone().appendTo($('#basicViewDiv .range-comparison'));
                            var basicLine = $('#basicViewDiv .range-comparison .alarm-line');
                            //left-input
                            basicLine.last().find('.input-left').val(n.ahead);
                            //right-input
                            if (basicLine.length == 4) {
                                basicLine.last().find('.input-right').parent().remove();
                                basicLine.last().find('.cond-right').remove();
                            } else {
                                basicLine.last().find('.input-right').val(n.behind);
                            }
                            //严重
                            basicLine.last().find('.alarm-level li').each(function () {
                                $.linkage($(this).parent().children(), n.level - 1);
                                if ($(this).data('level') == n.level) {
                                    $(this).trigger('click');
                                    return false;
                                }
                            });
                        });
                        $.typeSetting($('#basicViewDiv .range-comparison .alarm-line').length);
                    } else {
                        $('#grade_range_cmp').children().clone().appendTo($('#basicViewDiv .range-comparison'));
                    }
                }
                break;
            default:
                break;
        }
        //TODO 如果有基础告警线 给升级按钮添加可用class
    };

    /**
     * 添加升级告警线
     * 升级按钮是否可点,取决于基础告警线是否至少有1条;
     * 当指标类型为范围和具体值时,获取基础告警线的值/单位/预算符等,将其拼接组成升级告警线的升级依据值,并生成基础告警线对应的level,添加一条的时候触发第一条依据值的click事件;
     * 当指标类型为无比较时,直接触发告警等级升级(linkage);
     */
    var addUpgradeLine = function (json) {
        var monIndexValue = $('.monitor-index .index-type li.active').text();
        var basicDiv3 = $('#basicViewDiv').find('.alarm-line');
        if (basicDiv3.length) {
            var metric = $('.monitor-index .index-type li.active').data('alert_type');
            switch (metric) {
                case 1:
                    noCmpUpgradeShow(monIndexValue, $('#upgrade_nocmp'), json);
                    break;
                case 2:
                    valueCmpUpgradeShow(monIndexValue, basicDiv3, $('#upgrade_value_cmp'), json);
                    break;
                case 3:
                    rangeCmpUpgradeShow(monIndexValue, basicDiv3, $('#upgrade_range_cmp'), json);
                    break;
            }
        } else {
            $.errorTip('请先添加基础告警线！', $('#updateViewDiv'));
            return false;
        }
    };

    /**
     * 需要和预设范围比较的升级展示
     * @param monIndexValue
     * @param basicDiv3
     * @param clonedRoot
     * @param json
     */
    var rangeCmpUpgradeShow = function (monIndexValue, basicDiv3, clonedRoot, json) {

        var updateLineClone = clonedRoot.children('.clearfix').clone(true);
        updateLineClone.find('.upgrade-condition span:first').text(monIndexValue);
        var firUl = updateLineClone.find('.dropbox').first().find('ul');

        basicDiv3.each(function (i) {
            var level = $(this).find('ul:last li.active').data('level');
            var left_val = $(this).find('.threshold-condition input').first().val();
            var unit = $(this).find('.threshold-condition input').first().next('span').text();
            var li = '<li data-value="' + (i + 1) + '" data-level="' + level + '" data-inputval="' + left_val + '"><a href="javascript:;"><span>' + left_val + '</span><span>' + unit + '</span></a></li>';
            firUl.append(li);
        });
        updateLineClone.find('input:eq(0)').val('');
        updateLineClone.find('input:eq(1)').val('');
        $('#updateViewDiv .range-comparison').append(updateLineClone);
        if (json) {
            $.editUpgradeLineShow(json);
        } else {
            $('.alert-upgrade-list').find('.dropbox:first').find('li:first').trigger('click');
            $('.alert-upgrade-list').find('.time-mode li:eq(1)').trigger('click');
            $('.alert-upgrade-list').find('.time-type li').first().trigger('click');
        }

    };

    /**
     * 需要和具体值比较的升级展示
     * @param monIndexValue
     * @param basicDiv3
     * @param clonedRoot
     * @param json
     */
    var valueCmpUpgradeShow = function (monIndexValue, basicDiv3, clonedRoot, json) {
        var updateLineClone = clonedRoot.children('.clearfix').clone(true);
        updateLineClone.find('.upgrade-condition span:first').text(monIndexValue);
        var firUl = updateLineClone.find('.dropbox').first().find('ul');

        basicDiv3.each(function (i) {
            var level = $(this).find('ul:last li.active').data('level');
            var operSymbol = $(this).find('.threshold-condition li.active').text();
            var val = $(this).find('input').val();
            var symbol = $(this).find('.input-company').text();
            var li = '<li data-value="' + (i + 1) + '" data-level="' + level + '" data-inputval="' + val + '"><a href="javascript:;"><span>' + operSymbol + '</span><span>' + (val + symbol) + '</span></a></li>';
            firUl.append(li);
        });
        updateLineClone.find('input:eq(0)').val('');
        updateLineClone.find('input:eq(1)').val('');
        $('#updateViewDiv .value-comparison').append(updateLineClone);
        if (json) {
            $.editUpgradeLineShow(json);
        } else {
            $('.alert-upgrade-list').find('.dropbox:first').find('li:first').trigger('click');
            $('.alert-upgrade-list').find('.time-mode li:eq(1)').trigger('click');
            $('.alert-upgrade-list').find('.time-type li').first().trigger('click');
        }
    };

    /**
     * 无比较的升级展示
     * @param monIndexValue
     * @param clonedRoot
     * @param json
     */
    var noCmpUpgradeShow = function (monIndexValue, clonedRoot, json) {
        var updateLineClone = clonedRoot.children('.alarm-line').clone(true);
        updateLineClone.find('.upgrade-condition span:first').text(monIndexValue);
        updateLineClone.find('input:eq(0)').val('');
        updateLineClone.find('input:eq(1)').val('');

        $('#updateViewDiv .no-comparison').append(updateLineClone);
        if (json) {
            $.editUpgradeLineShow(json);
        } else {
            $('.alert-upgrade-list').find('.dropbox:first').find('li:first').trigger('click');
            $('.alert-upgrade-list').find('.time-mode li:eq(1)').trigger('click');
            $('.alert-upgrade-list').find('.time-type li').first().trigger('click');
            var dom = $('#updateViewDiv').find('.dropbox:last').find('li');
            var level = $('#basicViewDiv').find('.dropbox').find('li.active').data('level');
            $.linkage(dom, level);
        }

    };

    /**
     * 添加告警线
     * 1.验证基础告警线
     * 2.如有有升级告警线 验证升级告警线
     *
     */
    var saveAlarmLine = function (index) {
        var basicLines = $('#basicViewDiv .alarm-line');
        var upgradeLines = $('#updateViewDiv .alarm-line');
        //获取公共参数 当前基础指标name/value
        var activeMetricTitle = $('.monitor-index li.active a').text();
        var activeAlertType = parseInt($('.monitor-index li.active').data('alert_type'));

        //获取监测点信息后期考虑单独提成方法 仅供网站类型任务使用
        var activeMonitorTitle = $('.monitor-point li.active a').text();
        var activeMonitorType = parseInt($('.monitor-point li.active').data('value'));
        //指定监测点时需要检验是否选择监测点
        if (activeMonitorType == 2) {
            var monitorData = $('.monitor-point .appoint').data('monitorsSelected');
            if (typeof monitorData == 'undefined' || monitorData.num == 0 || monitorData == '') {
                $.errorTip('请选择监测点！');
                return false;
            }
        } else if (activeMonitorType == 1) {
            var point_input = $('.point-set-body input');
            var allPointCount = JKB.cache.allMonitorCount;
            point_input.validateInput(1, allPointCount);
            if (point_input.data('flag').length) {
                flag = false;
                return flag;
            }
        }

        //获取监测点展示内容 指定10个 任意10个 平均
        var monitorCont = '';
        switch (activeMonitorType) {
            case 1:
                monitorCont = activeMonitorTitle + '(' + $('.monitor-point').find('input').val() + '个)';
                break;
            case 2:
                monitorCont = activeMonitorTitle + '(' + monitorData.num + '个)';
                break;
            case 3:
                monitorCont = activeMonitorTitle;
                break;
        }
        //获取告警频率信息
        var activeFreqTitle = parseInt($('.alarm-frequency li.active').data('value'));
        var freqHtml = '';
        if (activeFreqTitle == 2) {
            var customFreq = $('.alarm-frequency .frequency-set-body');
            var freqTimeType = $('.frequency-set-body li.active').data('value');
            if (freqTimeType == 5) {
                customFreq.find('input').validateInput(1, 1440);
            } else if (freqTimeType == 6) {
                customFreq.find('input').validateInput(1, 24);
            }
            if (customFreq.find('input').data('flag').length) {
                return false;
            }
            freqHtml = customFreq.find('input').val() + customFreq.find('li.active a').text() + '发送一次';
        } else {
            freqHtml = $('.alarm-frequency .frequency-type li.active a').text();
        }

        //已添加的告警线列表
        switch (activeAlertType) {
            case 1:
                //验证是否有升级告警线
                if (upgradeLines.length) {
                    if (!$.upgradeCheck()) return false;
                }
                var noCmpDiv = $('#nocmp_list').children().clone();
                if (!upgradeLines.length) {
                    noCmpDiv.find('.no-comparison-result .upgrade-line').remove();
                }
                //展示基础告警线内容 替换指标/监测点/频率/分级/升级内容
                noCmpDiv.find('.alarm-metric').empty().text(activeMetricTitle);
                noCmpDiv.find('.point-count').empty().text(monitorCont);
                noCmpDiv.find('.send-freq').empty().text(freqHtml);
                $.showLevel(basicLines.find('.alarm-level li.active'), noCmpDiv.find('.basic-line .alarm-level span'));

                //如果有升级告警线 展示升级告警线内容
                if (upgradeLines.length) {
                    $.showUpgradeHtml(noCmpDiv);
                }
                //保存指标信息到编辑按钮
                $.bindAlarmEvent(noCmpDiv, index);
                break;
            case 2:
                //验证基础告警线输入 & 升级输入
                if (basicLines.length) {
                    $('#basicViewDiv .alarm-line').checkNum('999');
                    if ($('#basicViewDiv .alarm-line').data('flag').length) return false;
                }
                //验证是否有升级告警线      ------可以提取为公共方法
                if (upgradeLines.length) {
                    if (!$.upgradeCheck()) return false;
                }
                var ValCmpDiv = $('#value_cmp_list').children().clone();
                if (!upgradeLines.length) {
                    ValCmpDiv.find('.value-comparison-result .upgrade-line').remove();
                }
                //展示基础告警线内容 替换指标/监测点/频率/分级/升级内容
                ValCmpDiv.find('.alarm-metric').empty().text(activeMetricTitle);
                ValCmpDiv.find('.point-count').empty().text(monitorCont);
                ValCmpDiv.find('.send-freq').empty().text(freqHtml);
                var levelArr = ['remind', 'secondary', 'serious', 'urgent'];
                basicLines.each(function () {
                    var buildBasicList = $('<div class="clearfix ev-in-row"></div>');
                    var condName = $(this).find('.threshold-condition li.active').text();
                    var condVal = parseInt($(this).find('.threshold-condition input').val());
                    var condUnit = $(this).find('.value-unit').text();
                    var buildBasicCond = '<div class="fl"><span class="alarm-metric">' + activeMetricTitle + '</span><span class="alarm-cond">' + condName + '</span><span class="alarm-val">' + condVal + condUnit + '</span></div>';
                    var activeAlarmLi = $(this).find('.alarm-level li.active');
                    var activeHtml = activeAlarmLi.text();
                    var activeLevel = activeAlarmLi.data('level');
                    var buildBasicLevel = '<div class="fr"><label>告警级别：</label><span class="alert-level ' + levelArr[activeLevel - 1] + '">' + activeHtml + '</span></div>';
                    buildBasicList.append(buildBasicCond + buildBasicLevel);
                    ValCmpDiv.find('.basic-line-list').append(buildBasicList);
                });
                //如果有升级告警线 展示升级告警线内容
                if (upgradeLines.length) {
                    $.showUpgradeHtml(ValCmpDiv);
                }
                $.bindAlarmEvent(ValCmpDiv, index);
                break;
            case 3:
                //验证基础输入 & 升级输入
                if (basicLines.length) {
                    if (!($.checkInput('save'))) return false;
                } else {
                    $.errorTip('请添加基础告警线！', $('#basicViewDiv'));
                    return false;
                }
                if (upgradeLines.length) {
                    if (!$.upgradeCheck()) return false;
                }
                var rangeCmpDiv = $('#range_cmp_list').children().clone();
                if (!upgradeLines.length) {
                    rangeCmpDiv.find('.range-comparison-result .upgrade-line').remove();
                }
                //展示基础告警线内容 替换指标/监测点/频率/分级/升级内容
                rangeCmpDiv.find('.alarm-metric').empty().text(activeMetricTitle);
                rangeCmpDiv.find('.point-count').empty().text(monitorCont);
                rangeCmpDiv.find('.send-freq').empty().text(freqHtml);

                //获取基础告警线的数据
                var classArr = ['remind', 'secondary', 'serious', 'urgent'];
                basicLines.each(function () {
                    var leftValue = parseInt($(this).find('input:eq(0)').val());
                    var rightValue = parseInt($(this).find('input:eq(1)').val());
                    var unit = $(this).find('.input-company:eq(0)').text();
                    var alarmLevel = $(this).find('.alarm-level li.active a').text();
                    var alarmLevelVal = $(this).find('.alarm-level li.active').data('level');
                    var basicLineCont = '<div class="clearfix ev-in-row"><div class="fl"><span>' + leftValue + '</span><span>' + unit + '</span><span>&nbsp;&nbsp;&lt;&nbsp;&nbsp;' + activeMetricTitle + '</span>';
                    if (rightValue) {
                        basicLineCont += '<span>&nbsp;&nbsp;≤&nbsp;&nbsp;</span><span>' + rightValue + '</span><span>' + unit + '</span>';
                    }
                    basicLineCont += '</div><div class="fr alarm-level"><label>告警级别：</label><span class="alert-level ' + classArr[alarmLevelVal - 1] + '">' + alarmLevel + '</span></div></div>';
                    $(basicLineCont).appendTo(rangeCmpDiv.find('.basic-line-list'));
                });
                //如果有升级告警线 展示升级告警线内容
                if (upgradeLines.length) {
                    $.showUpgradeHtml(rangeCmpDiv);
                }
                //保存指标信息到编辑按钮
                $.bindAlarmEvent(rangeCmpDiv, index);
                break;
        }
    };

    /**
     * 生成单条告警线json数据，为编辑按钮保存准备
     */
    var buildJsonData = function () {
        var currMetricSettings = new Object();

        //监控指标
        var metricLineType = $('.monitor-index .index-type li.active').data('alert_type');//告警线分类类型
        var metricName = $('.monitor-index .index-type li.active').data('value');//指标名称代号

        //监测点
        var monitor = new Object();
        var groupId, monType, monNum, monValue;
        groupId = parseInt($('#group_id').val());
        monType = $('.monitor-point li.active').data('value');
        if (monType == 1) {
            monNum = $('.point-set-body input').val();
            monValue = [];
        } else if (monType == 2) {
            monNum = $('.monitor-point li.active').data('monitorsSelected').num;
            monValue = $('.monitor-point li.active').data('monitorsSelected').value;
        } else if (monType == 3) {
            monNum = '';
            monValue = [];
        }
        monitor.groupId = groupId;
        monitor.type = monType;
        monitor.num = monNum;
        monitor.value = monValue;

        //告警频率
        var remind = new Object();
        var remType, remValue, remUnit;
        remType = $('.alarm-frequency .frequency-type li.active').data('value');
        if (remType == 2) {
            remValue = $('.frequency-set-body input').val();
            remUnit = $('.frequency-set-body li.active').data('value');
        } else if (remType == 1 || remType == 3) {
            remValue = '';
            remUnit = '';
        }
        remind.type = remType;
        remind.value = remValue;
        remind.unit = remUnit;

        //基础告警线
        var basicDomList = $('#basicViewDiv .alarm-line');
        var grades = new Object();
        basicDomList.each(function (k, v) {
            var value = new Object();
            value.level = $(v).find('.alarm-level li.active').data('level');
            value.unit = JKB.cache.th_define[metricName].unit[0];   //该种取单位的方法:[0]只适合网站监控
            switch (metricLineType) {
                case 1:
                    //故障告警线值
                    if (metricName == 6 || metricName == 7) {
                        value.ahead = 399;        //目前先写死,配置文件更改后再修改
                    }
                    //不可用监测点值
                    if (metricName == 4) {
                        value.ahead = 0;            //目前先写死,配置文件更改后再修改
                    }
                    value.cmp_ahead = JKB.cache.th_define[metricName].cmp_rules[0];
                    value.behind = '';
                    value.com_behind = '';
                    break;
                case 2:
                    value.ahead = parseInt($(v).find('.threshold-condition input').val());
                    value.cmp_ahead = $(v).find('.threshold-condition li.active').data('value');
                    value.behind = '';
                    value.com_behind = '';
                    break;
                case 3:
                    value.ahead = parseInt($(v).find('.threshold-condition input').first().val());
                    value.cmp_ahead = JKB.cache.th_define[metricName].cmp_rules.start[0];
                    value.behind = parseInt($(v).find('.threshold-condition input').last().val()) ? parseInt($(v).find('.threshold-condition input').last().val()) : '';
                    value.com_behind = JKB.cache.th_define[metricName].cmp_rules.end[0];
                    break;
            }
            grades[k + 1] = value;
        });

        //升级告警线
        var upgradeList = $('#updateViewDiv .alarm-line');
        if (upgradeList.length) {
            var upgrades = new Object();
            upgradeList.each(function (k, v) {
                var value = new Object();
                var selectlineNum;
                value.up_level = $(v).find('.alarm-level li.active').data('level');
                value.unit = JKB.cache.th_define[metricName].unit[0];   //该种取单位的方法:[0]只适合网站监控
                value.type = $('.time-mode li.active').data('value');
                value.time_range = parseInt($(v).find('.upgrade-condition > input').val());
                value.time_range_unit = $(v).find('.time-type li.active').data('value');
                if (value.type == 1) {
                    value.value = parseInt($(v).find('.only-acc input').val());
                } else {
                    value.value = '';
                }
                if (metricLineType == 1) {
                    value.level = basicDomList.find('.alarm-level li.active').data('level');
                    value.cmp_ahead = JKB.cache.th_define[metricName].cmp_rules[0];
                    if (metricName == 4) {
                        value.ahead = 0;      //目前先写死,配置文件更改后再修改
                    } else if (metricName == 6 || metricName == 7) {
                        value.ahead = 399;      //目前先写死,配置文件更改后再修改
                    }
                } else {
                    value.level = $(v).find('.upgrade-dep li.active').data('level');
                    selectlineNum = $(v).find('.upgrade-dep li.active').data('value');
                    value.ahead = grades[selectlineNum].ahead;
                    if (metricLineType == 2) {
                        value.cmp_ahead = grades[selectlineNum].cmp_ahead;
                    }
                    if (metricLineType == 3) {
                        value.cmp_ahead = 1;
                    }
                }
                if (metricLineType == 1) {
                    upgrades[1] = value;
                } else if (metricLineType == 2 || metricLineType == 3) {
                    selectlineNum = $(v).find('.upgrade-dep li.active').data('value');
                    upgrades[selectlineNum] = value;
                }
            });
        }

        //汇总json串
        currMetricSettings.metric = metricName;
        currMetricSettings.gradable = 1;
        currMetricSettings.extends = new Object();
        currMetricSettings.extends.monitor = monitor;
        currMetricSettings.extends.remind = remind;
        currMetricSettings.grades = grades;
        if (upgradeList.length) {
            currMetricSettings.upgrades = upgrades;
        }
        return currMetricSettings;
    };

    /**
     * 编辑告警线
     * @param index
     */
    var editAlarmLine = function (index) {
        $('#add_alarm_line').show();
        var alarmData = $('#alarm_lines_list .result-group').eq(index).find('.edit').data('alarmContent');
        //初始化资源
        $('.monitor-index li[data-value=' + alarmData.metric + ']').trigger('click');
        //加载初级告警线
        addBasicLine(alarmData.grades);
        // 如果有升级告警线 加载升级告警线
        if (alarmData.upgrades) {
            addUpgradeLine(alarmData.upgrades);
        }
        //加载监测点信息
        var monitorType = alarmData.extends.monitor.type;
        loadMonitorSet(monitorType, alarmData.extends.monitor);
        //选择告警频率
        var alarmFreq = alarmData.extends.remind.type;

        $('.frequency-type li[data-value=' + alarmFreq + ']').trigger('click');
        //自定义的需要展示input值 & 单位
        if (alarmFreq == 2) {
            $('.alarm-frequency input').val(alarmData.extends.remind.value);
            $('.alarm-frequency .dropdown-menu:eq(1) li[data-value=' + alarmData.extends.remind.unit + ']').trigger('click');
        }
        //绑定保存/取消事件
        $('#add_alarm_line .unfold_footer .btn-primary').unbind('click').bind('click', function (e) {
            taskAlarmLineHandle.saveAlarmLine(index);
            e.preventDefault();
        });
    };

    /**
     * 删除告警线
     * @param index
     */
    var delAlarmLine = function (index) {
        $('#alarm_lines_list').children().eq(index).remove();
    };

    /**
     * form表单格式化告警线到input value
     */
    var formatAlarmLines = function () {
        var b = {};
        var a = [];
        $('#alarm_lines_list').children().each(function () {
            a.push($(this).find('.edit').data('alarmContent'));
        });
        b.threshold_content = a;
        $('#alarm_line_data').val(JSON.stringify(b));
    };


    return {
        initResource: initResource,
        loadSiteAlarmPage: loadSiteAlarmPage,
        initAlarmLine: initAlarmLine,


        addBasicLine: addBasicLine,
        loadMonitorSet: loadMonitorSet,
        loadMonitorList: loadMonitorList,
        addUpgradeLine: addUpgradeLine,
        saveAlarmLine: saveAlarmLine,
        buildJsonData: buildJsonData,
        editAlarmLine: editAlarmLine,
        delAlarmLine: delAlarmLine,
        formatAlarmLines: formatAlarmLines
    }
})(jQuery);


