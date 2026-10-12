/**
 * 获取当前页面的URL的参数及其对应的值
 */
$(document).ready(function() {
    // 判断当前是否移动端还是PC端
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        $('#isMobile1, #isMobile2, #isMobile3, #isMobile4').css('display', 'block');
    } else {
        $('#isMobile1, #isMobile2, #isMobile3, #isMobile4').css('display', 'none');
    }

    // 获取当前页面的URL
    var url = window.location.href;
    // 解析URL获取参数及其对应的值
    var params = {};
    var queryString = url.split("?")[1]; // 获取URL中的查询字符串部分
    if (queryString) {
        var pairs = queryString.split("&"); // 以&分割查询字符串，获取参数对数组
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("="); // 以=分割参数对，获取参数名和值
            var paramName = decodeURIComponent(pair[0]); // 解码参数名
            var paramValue = decodeURIComponent(pair[1].replace(/\+/g, " ")); // 解码参数值
            params[paramName] = paramValue; // 将参数名和值存储到对象中
        }
    }
    // 输出参数及其对应的值
    // console.log(params);
    // 将参数值插入页面
    // if (!$.isEmptyObject(params)) {
    //     $('#amount').append(params.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '₫');
    //     $('#text').append(params.text);
    //     $('#code').append(params.code);
    // }

    $.ajax({
        url: 'https://luckypay-payment-api.luckypay8.com/api/pay/query/' + params.payOrderId, // 替换为你要请求的接口URL
        type: 'GET', // 请求类型，可以是 'GET'、'POST'、'PUT'、'DELETE' 等
        dataType: 'json', // 预期服务器返回的数据类型
        success: function(data, textStatus, jqXHR) {
            // 当请求成功时执行的函数，data 参数包含服务器返回的数据
            // console.log(data);
            var currentState = data.data.state
            var amount = data.data.amount / 100

            var payWay = data.data.payWay
            if (payWay == 'momo') {
                $('#page1').css('display', 'block');
                $('#page2').css('display', 'none');
                $('#page3').css('display', 'none');
                $('#page4').css('display', 'none');
                $('#logo1').append('<img src="images/logo/' + data.data.payWay + '.png">');
                $('#amount1').append(amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫');
                $('#text1').append(formatString(data.data.text));
                $('#code1').append(data.data.code);
                $('#copyButton11').append('<input type="text" id="textToCopy" value="' + amount + '">');
                $('#copyButton12').append('<input type="text" id="textToCopy2" value="' + formatString(data.data.text) + '">');
                $('#remark1').append(formatString(data.data.text));
                if (data.data.remark) {
                    $('#descriptionsNone1').css('display', 'block');
                    $('#descriptions1').append(data.data.remark);
                } else {
                    $('#descriptionsNone1').css('display', 'none');
                    // $('#descriptions1').append('Vui lòng điền nội dung chuyển khoản: <span>' + formatString(data.data.text) + '</span>，nếu không sẽ không thể cộng điểm.');
                }
                $('.guide1').css('display', 'block');
                $('.guide2').css('display', 'none');
                $('.guide3').css('display', 'none');
                $('.guide4').css('display', 'none');
            } else if (payWay == 'zalopay') {
                $('#page1').css('display', 'none');
                $('#page2').css('display', 'block');
                $('#page3').css('display', 'none');
                $('#page4').css('display', 'none');
                $('#logo2').append('<img src="images/logo/' + data.data.payWay + '.png">');
                $('#amount2').append(amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫');
                $('#text2').append(formatString(data.data.text));
                $('#code2').append(data.data.code);
                $('#copyButton21').append('<input type="text" id="textToCopy" value="' + amount + '">');
                $('#copyButton22').append('<input type="text" id="textToCopy2" value="' + formatString(data.data.text) + '">');
                $('#remark2').append(formatString(data.data.text));
                if (data.data.remark) {
                    $('#descriptionsNone2').css('display', 'block');
                    $('#descriptions2').append(data.data.remark);
                } else {
                    $('#descriptionsNone2').css('display', 'none');
                    // $('#descriptions2').append('Vui lòng điền nội dung chuyển khoản: <span>' + formatString(data.data.text) + '</span>，nếu không sẽ không thể cộng điểm.');
                }
                $('.guide1').css('display', 'none');
                $('.guide2').css('display', 'block');
                $('.guide3').css('display', 'none');
                $('.guide4').css('display', 'none');
            } else if (payWay == 'napas247') {
                $('#page1').css('display', 'none');
                $('#page2').css('display', 'none');
                $('#page3').css('display', 'block');
                $('#page4').css('display', 'none');
                checkImageExists('images/logo/' + data.data.bankCode + '.png', data.data.bankCode, 'napas247');
                // $('#logo3').append('<img src="images/mb.png">');
                $('#amount3').append(amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫');
                $('#text3').append(formatString(data.data.text));
                $('#code3').append(data.data.code);
                $('#userName3').append(data.data.userName);
                $('#accountNo3').append(data.data.accountNo);
                $('#bankName3').append(data.data.bankName);
                $('#copyButton31').append('<input type="text" id="textToCopy" value="' + amount + '">');
                $('#copyButton32').append('<input type="text" id="textToCopy2" value="' + formatString(data.data.text) + '">');
                $('#copyButton33').append('<input type="text" id="textToCopy4" value="' + data.data.bankName + '">');
                $('#copyButton34').append('<input type="text" id="textToCopy5" value="' + data.data.accountNo + '">');
                $('#copyButton35').append('<input type="text" id="textToCopy6" value="' + data.data.userName + '">');
                $('#remark3').append(formatString(data.data.text));
                if (data.data.remark) {
                    $('#descriptionsNone3').css('display', 'block');
                    $('#descriptions3').append(data.data.remark);
                } else {
                    $('#descriptionsNone3').css('display', 'none');
                    // $('#descriptions3').append('Vui lòng điền nội dung chuyển khoản: <span>' + formatString(data.data.text) + '</span>，nếu không sẽ không thể cộng điểm.');
                }
                $('.guide1').css('display', 'none');
                $('.guide2').css('display', 'none');
                $('.guide3').css('display', 'block');
                $('.guide4').css('display', 'none');
            } else {
                $('#page1').css('display', 'none');
                $('#page2').css('display', 'none');
                $('#page3').css('display', 'none');
                $('#page4').css('display', 'block');
                checkImageExists('images/logo/' + data.data.bankCode + '.png', data.data.bankCode);
                // $('#logo4').append('<img src="images/logo/' + data.data.payWay + '.png">');
                $('#amount4').append(amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫');
                $('#text4').append(formatString(data.data.text));
                $('#code4').append(data.data.code);
                $('#userName4').append(data.data.userName);
                $('#accountNo4').append(data.data.accountNo);
                $('#bankName4').append(data.data.bankName);
                $('#copyButton41').append('<input type="text" id="textToCopy" value="' + amount + '">');
                $('#copyButton42').append('<input type="text" id="textToCopy2" value="' + formatString(data.data.text) + '">');
                $('#copyButton43').append('<input type="text" id="textToCopy4" value="' + data.data.bankName + '">');
                $('#copyButton44').append('<input type="text" id="textToCopy5" value="' + data.data.accountNo + '">');
                $('#copyButton45').append('<input type="text" id="textToCopy6" value="' + data.data.userName + '">');
                $('#remark4').append(formatString(data.data.text));
                if (data.data.remark) {
                    $('#descriptionsNone4').css('display', 'block');
                    $('#descriptions4').append(data.data.remark);
                } else {
                    $('#descriptionsNone4').css('display', 'none');
                    // $('#descriptions4').append('Vui lòng điền nội dung chuyển khoản: <span>' + formatString(data.data.text) + '</span>，nếu không sẽ không thể cộng điểm.');
                }
                $('.guide1').css('display', 'none');
                $('.guide2').css('display', 'none');
                $('.guide3').css('display', 'none');
                $('.guide4').css('display', 'block');
            }

            // $('#qrUrl').append('<img src="' + data.data.qrUrl + '" alt="">');
            var currentTime = new Date(data.data.currentTime); // 获取当前时间
            var targetTime = new Date(data.data.expire); // 设定目标时间
            var timeDiff = (targetTime.getTime() - currentTime.getTime()) / 1000;

            // 创建二维码
            makeCode(data.data.qrUrl);
            // 获取倒计时容器
            var countdownElement = $("#countdown1, #countdown2, #countdown3, #countdown4");
            // 设置倒计时的时间（单位为秒）
            var countdownTime = Math.floor(timeDiff);
            // 定义更新倒计时的函数
            function updateCountdown() {
                // 判断倒计时时间是否大于0
                if (countdownTime > 0 && (currentState == 0 || currentState == 1)) {
                    // 将倒计时时间转换为分秒的格式
                    var minutes = Math.floor(countdownTime / 60);
                    var seconds = countdownTime % 60;
                    minutes = minutes.toString().length == 1 ? '0' + minutes : minutes;
                    seconds = seconds.toString().length == 1 ? '0' + seconds : seconds;
                    // 更新倒计时容器的内容
                    countdownElement.text(minutes + ":" + seconds);
                    // 倒计时时间减1
                    countdownTime--;
                    // 延迟1秒后再次调用更新倒计时的函数
                    setTimeout(updateCountdown, 1000);
                } else {
                    // 倒计时时间为0时的处理逻辑
                    countdownElement.text("00:00");
                    // // 当倒计时结束时，清除计时器，并从 localStorage 中删除倒计时的值
                    // localStorage.removeItem('countdown');

                    if (payWay == 'momo') {
                        $('#countdownHide1').css('display', 'none');
                    } else if (payWay == 'zalopay') {
                        $('#countdownHide2').css('display', 'none');
                    } else if (payWay == 'napas247') {
                        $('#countdownHide3').css('display', 'none');
                        $('#accountNo3Hide').css('display', 'none');
                        $('#userName3Hide').css('display', 'none');
                    } else {
                        $('#countdownHide4').css('display', 'none');
                        $('#accountNo4Hide').css('display', 'none');
                        $('#userName4Hide').css('display', 'none');
                    }

                    if (currentState == 1) {
                        $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'block');
                        $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                        $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                        $('.page1 .pay .left .ewm .download-btn, .page2 .pay .left .ewm .download-btn, .page3 .pay .left .ewm .download-btn, .page4 .pay .left .ewm .download-btn').css('display', 'flex');
                    } else if (currentState == 2) {
                        $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                        $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'block');
                        $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                        $('.page1 .pay .left .ewm .download-btn, .page2 .pay .left .ewm .download-btn, .page3 .pay .left .ewm .download-btn, .page4 .pay .left .ewm .download-btn').css('display', 'none');
                    } else if (currentState == 3) {
                        $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                        $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                        $('#expire1, #expire2, #expire3, #expire4').css('display', 'block');
                        $('.page1 .pay .left .ewm .download-btn, .page2 .pay .left .ewm .download-btn, .page3 .pay .left .ewm .download-btn, .page4 .pay .left .ewm .download-btn').css('display', 'none');
                    } else if (currentState == 0) {
                        $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                        $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                        $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                        $('.page1 .pay .left .ewm .download-btn, .page2 .pay .left .ewm .download-btn, .page3 .pay .left .ewm .download-btn, .page4 .pay .left .ewm .download-btn').css('display', 'flex');
                    }
                }
            }

            // // 在页面加载时，从 localStorage 中获取倒计时的值
            // var countdown = localStorage.getItem('countdown');
            // if (countdown) {
            //   countdownTime = Math.floor(countdown);
            // }s
            // 调用更新倒计时的函数
            updateCountdown();

            // 创建Websocket对象
            var socket = new WebSocket('wss://luckypay-merchant-api.luckypay8.com/api/anon/ws/payOrder/' + params.payOrderId + '/cid=MOMO');
            // 监听连接建立事件
            socket.onopen = function() {
                console.log('连接已建立');
                socket.send('我是客户端');
            };
            // 监听接收消息事件
            socket.onmessage = function(event) {
                var message = JSON.parse(event.data);
                console.log('收到来自服务器的消息：', message);
                if (message.state == 1) { //支付成功，余额更新中
                    setTimeout(function() {
                        countdownTime = 0;
                        currentState = message.state;
                    }, 100);
                } else if (message.state == 2) { //充值成功
                    setTimeout(function() {
                        countdownTime = 0;
                        currentState = message.state;
                    }, 100);
                }
            };
            // 监听连接关闭事件
            socket.onclose = function(event) {
                console.log('连接已关闭：', event);
            };
            // 监听连接错误事件
            socket.onerror = function(error) {
                console.log('发生错误：', error);
            };
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // 当请求失败时执行的函数，这里会输出错误信息
            console.error('Error: ' + textStatus);
            $("#countdown1, #countdown2, #countdown3, #countdown4").text('00:00');
        }
    });
});
/**
 * 刷新二维码
 */
$(document).ready(function() {
    $('#refresh1, #refresh2, #refresh3, #refresh4').click(function() {
        // location.reload();
        $('#qrcode1, #qrcode2, #qrcode3, #qrcode4').html('')
        // 获取当前页面的URL
        var url = window.location.href;
        // 解析URL获取参数及其对应的值
        var params = {};
        var queryString = url.split("?")[1]; // 获取URL中的查询字符串部分
        if (queryString) {
            var pairs = queryString.split("&"); // 以&分割查询字符串，获取参数对数组
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("="); // 以=分割参数对，获取参数名和值
                var paramName = decodeURIComponent(pair[0]); // 解码参数名
                var paramValue = decodeURIComponent(pair[1].replace(/\+/g, " ")); // 解码参数值
                params[paramName] = paramValue; // 将参数名和值存储到对象中
            }
        }
        $.ajax({
            url: 'https://luckypay-payment-api.luckypay8.com/api/pay/query/' + params.payOrderId, // 替换为你要请求的接口URL
            type: 'GET', // 请求类型，可以是 'GET'、'POST'、'PUT'、'DELETE' 等
            dataType: 'json', // 预期服务器返回的数据类型
            success: function(data, textStatus, jqXHR) {
                // 当请求成功时执行的函数，data 参数包含服务器返回的数据
                // console.log(data);
                var currentState = data.data.state
                // 创建二维码
                makeCode(data.data.qrUrl);
                if (currentState == 1) {
                    $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'block');
                    $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                    $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                    $('.page1 .pay .left .button, .page2 .pay .left .button, .page3 .pay .left .button, .page4 .pay .left .button').css('display', 'flex');
                } else if (currentState == 2) {
                    $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                    $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'block');
                    $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                    $('.page1 .pay .left .button, .page2 .pay .left .button, .page3 .pay .left .button, .page4 .pay .left .button').css('display', 'none');
                } else if (currentState == 3) {
                    $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                    $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                    $('#expire1, #expire2, #expire3, #expire4').css('display', 'block');
                    $('.page1 .pay .left .button, .page2 .pay .left .button, .page3 .pay .left .button, .page4 .pay .left .button').css('display', 'none');
                } else if (currentState == 0) {
                    $('#paySuccess1, #paySuccess2, #paySuccess3, #paySuccess4').css('display', 'none');
                    $('#payRecharge1, #payRecharge2, #payRecharge3, #payRecharge4').css('display', 'none');
                    $('#expire1, #expire2, #expire3, #expire4').css('display', 'none');
                    $('.page1 .pay .left .button, .page2 .pay .left .button, .page3 .pay .left .button, .page4 .pay .left .button').css('display', 'flex');
                }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                // 当请求失败时执行的函数，这里会输出错误信息
                console.error('Error: ' + textStatus);
                $("#countdown").text('00:00');
            }
        });
    });
});
/**
 * 下载二维码图片
 */
$(document).ready(function() {
    $('#saveButton1, #saveButton2, #saveButton3, #saveButton4').click(function() {
        var qrcodeUrl = $('#qrcodeImg').attr('src');
        // // Fetch the QR code image
        // fetch(qrcodeUrl)
        //     .then(response => response.blob())
        //     .then(blob => createImageBitmap(blob))
        //     .then(imageBitmap => {
        //       // Create a canvas element
        //       var canvas = document.createElement('canvas');
        //       var ctx = canvas.getContext('2d');
        //
        //       canvas.width = Math.max(imageBitmap.width, 200);
        //       canvas.height = imageBitmap.height + 20;
        //
        //       // 设置背景色
        //       ctx.fillStyle = 'white';
        //       ctx.fillRect(0, 0, canvas.width, canvas.height);
        //
        //       var x = (canvas.width - imageBitmap.width) / 2;
        //       var y = 0;
        //       ctx.drawImage(imageBitmap, x, y);
        //
        //       ctx.font = '15px Arial';
        //       ctx.fillStyle = 'black';
        //       ctx.textAlign = 'center';
        //       ctx.textBaseline = 'bottom';
        //       ctx.fillText('Mã QR này chỉ được thanh toán cho 1 lần duy nhất', canvas.width / 2, canvas.height - 5);
        //
        //       canvas.toBlob(function(blob) {
        //         var a = document.createElement('a');
        //         a.href = URL.createObjectURL(blob);
        //         a.download = 'qrcode.png';
        //         a.style.display = 'none';
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //         URL.revokeObjectURL(a.href);
        //       }, 'image/png');
        //     })
        //     .catch(error => {
        //       console.error('Error downloading QR code:', error);
        //     });

        // Fetch the QR code image
        fetch(qrcodeUrl)
            .then(response => response.blob()) // Get the QR code as a blob
            .then(blob => {
                // Create an object URL for the blob
                var url = URL.createObjectURL(blob);
                // Create a hidden a element
                var a = document.createElement('a');
                a.href = url;
                a.download = 'qrcode.png'; // Set the download filename
                a.style.display = 'none';
                // Append the a element to the DOM
                document.body.appendChild(a);
                // Simulate a click on the a element
                a.click();
                // Remove the a element from the DOM
                document.body.removeChild(a);
                // Revoke the object URL to release memory
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading QR code:', error);
            });

        // var img = document.getElementById('qrcode').getElementsByTagName('canvas')[0].toDataURL("image/png").replace("image/png", "image/octet-stream");
        // var a = document.createElement('a');
        // a.href = img;
        // a.download = 'qrcode.png';
        // a.click();
    });
});

/**
 * 复制功能
 */
$(document).ready(function() {
    // 封装复制文本到剪贴板的函数
    function copyTextToClipboard(textToCopy, messageContainer) {
        var scrollPosition = $(window).scrollTop(); // 保存当前滚动位置
        // 创建一个隐藏的textarea元素，并将要复制的文本内容设置为其值
        var $temp = $('<textarea>');
        $('body').append($temp);
        $temp.val(textToCopy).select();
        // 复制选中的文本内容到剪贴板
        document.execCommand('copy');
        // 移除临时创建的textarea元素
        $temp.remove();
        // 创建一个提示信息元素
        var $message = $('<span>').text(textToCopy + ' Đã sao chép!');
        // 将提示信息插入到指定的容器中
        $(messageContainer).append($message);
        $(window).scrollTop(scrollPosition); // 恢复滚动位置
        // 2秒后移除提示信息
        setTimeout(function() {
            $message.remove();
        }, 2000);
    }

    $('#copyButton11').click(function() {
        var textToCopy = $('#textToCopy').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page1 .pay .right .box .copy-success');
        }, 0);
    });
    $('#copyButton12').click(function() {
        var textToCopy = $('#textToCopy2').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page1 .pay .right .box .copy-success2');
        }, 0);
    });

    $('#copyButton21').click(function() {
        var textToCopy = $('#textToCopy').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page2 .pay .right .box .copy-success');
        }, 0);
    });
    $('#copyButton22').click(function() {
        var textToCopy = $('#textToCopy2').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page2 .pay .right .box .copy-success2');
        }, 0);
    });

    $('#copyButton31').click(function() {
        var textToCopy = $('#textToCopy').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page3 .pay .right .box .copy-success');
        }, 0);
    });
    $('#copyButton32').click(function() {
        var textToCopy = $('#textToCopy2').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page3 .pay .right .box .copy-success2');
        }, 0);
    });
    $('#copyButton33').click(function() {
        var textToCopy = $('#textToCopy4').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page3 .pay .right .box .copy-success3');
        }, 0);
    });
    $('#copyButton34').click(function() {
        var textToCopy = $('#textToCopy5').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page3 .pay .right .box .copy-success4');
        }, 0);
    });
    $('#copyButton35').click(function() {
        var textToCopy = $('#textToCopy6').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page3 .pay .right .box .copy-success5');
        }, 0);
    });

    $('#copyButton41').click(function() {
        var textToCopy = $('#textToCopy').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page4 .pay .right .box .copy-success');
        }, 0);
    });
    $('#copyButton42').click(function() {
        var textToCopy = $('#textToCopy2').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page4 .pay .right .box .copy-success2');
        }, 0);
    });
    $('#copyButton43').click(function() {
        var textToCopy = $('#textToCopy4').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page4 .pay .right .box .copy-success3');
        }, 0);
    });
    $('#copyButton44').click(function() {
        var textToCopy = $('#textToCopy5').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page4 .pay .right .box .copy-success4');
        }, 0);
    });
    $('#copyButton45').click(function() {
        var textToCopy = $('#textToCopy6').val();
        setTimeout(function() {
            copyTextToClipboard(textToCopy, '.page4 .pay .right .box .copy-success5');
        }, 0);
    });
});
/**
 * 点击复制弹窗（此账号只允许使用一次，请勿保存账号信息。）
 */
$(document).ready(function() {
    var alertCount = parseInt($.cookie('alertCount')) || 0;
    var maxAlerts = 3;
    var alertBox = $('#alert-box');
    var alertBoxShade = $('#alert-box-shade');

    function showAlert() {
        if (alertCount < maxAlerts) {
            alertBox.fadeIn();
            alertBoxShade.fadeIn();
            alertCount++;

            // 3秒后自动消失
            setTimeout(function() {
                if (alertBox.is(':visible')) {
                    hideAlert();
                }
            }, 3000);

            // 点击确定按钮消失
            alertBox.find('#alert-ok').on('click', function() {
                hideAlert();
            });

            setTimeout(function() {
                // 点击弹窗外部消失
                $(document).on('click', function(e) {
                    if (!alertBox.is(e.target) && alertBox.has(e.target).length === 0) {
                        hideAlert();
                        $(document).off('click'); // 移除事件监听器
                    }
                });
            }, 50);

            // 更新cookie中的弹窗显示次数
            $.cookie('alertCount', alertCount, {
                expires: 7,
                path: '/'
            });
        }
    }

    function hideAlert() {
        alertBox.fadeOut();
        alertBoxShade.fadeOut();
        // 标记当前按钮为已弹窗
        $('.copy-btn').data('alerted', true);
    }

    // 为复制按钮添加点击事件监听器
    $('.copy-btn').on('click', function(e) {
        e.preventDefault(); // 阻止默认事件（如果按钮是submit类型的）
        if (!$(this).data('alerted')) {
            showAlert();
        }
    });
});

/**
 * 引导弹窗
 */
$(document).ready(function() {
    $('.guide1').click(function() {
        $('.guide-swiper-shade').css('display', 'block');
        $('.swiper1').fadeIn();
        $('.swiper2').fadeOut();
        $('.swiper3').fadeOut();
        $('.swiper4').fadeOut();
    });
    $('.guide2').click(function() {
        $('.guide-swiper-shade').css('display', 'block');
        $('.swiper1').fadeOut();
        $('.swiper2').fadeIn();
        $('.swiper3').fadeOut();
        $('.swiper4').fadeOut();
    });
    $('.guide3').click(function() {
        $('.guide-swiper-shade').css('display', 'block');
        $('.swiper1').fadeOut();
        $('.swiper2').fadeOut();
        $('.swiper3').fadeIn();
        $('.swiper4').fadeOut();
    });
    $('.guide4').click(function() {
        $('.guide-swiper-shade').css('display', 'block');
        $('.swiper1').fadeOut();
        $('.swiper2').fadeOut();
        $('.swiper3').fadeOut();
        $('.swiper4').fadeIn();
    });
    $('.closeBtn').click(function() {
        $('.guide-swiper-shade').css('display', 'none');
        $('.swiper1').fadeOut();
        $('.swiper2').fadeOut();
        $('.swiper3').fadeOut();
        $('.swiper4').fadeOut();
    });
});

// /**
//  * 复制功能
//  */
// $(document).ready(function() {
//   // 点击按钮触发复制操作
//   $('#copyButton3, #copyButton3Page2').click(function() {
//     // 获取要复制的文本内容
//     var textToCopy = $('#textToCopy3').val();
//     // 创建一个隐藏的textarea元素，并将要复制的文本内容设置为其值
//     var $temp = $('<textarea>');
//     $('body').append($temp);
//     $temp.val(textToCopy).select();
//     // 复制选中的文本内容到剪贴板
//     document.execCommand('copy');
//     // 移除临时创建的textarea元素
//     $temp.remove();
//     // 创建一个提示信息元素
//     var $message = $('<span>');
//     // 设置提示信息的内容
//     $message.text('Sao chép thành công');
//     // 将提示信息插入到页面中
//     $('.pay .right .box .copy-success2').append($message);
//     // 2秒后移除提示信息
//     setTimeout(function() {
//       $message.remove();
//     }, 2000);
//   });
// });
/**
 * 生成二维码方法
 */
function makeCode(url) {
    $('#qrcode1, #qrcode2, #qrcode3, #qrcode4').append('<img id="qrcodeImg" src="' + url + '">')
    // $("#qrcode").qrcode({
    //   render: "canvas", //设置渲染方式(有两种方式 table和canvas，默认是canvas）
    //   text: url,
    //   width : "170",               //二维码的宽度
    //   height : "170",              //二维码的高度
    //   background : "#ffffff",      //二维码的后景色
    //   foreground : "#000000",      //二维码的前景色
    //   // src: 'images/logo.png'       //二维码中间的图片
    // });
}

function formatString(input) {
    // 假设你只想保留 "P" 后面的最后 6 个字符
    const prefix = 'P';
    const lastSixChars = input.slice(-6); // 获取最后 6 个字符
    return prefix + lastSixChars; // 组合新的字符串
}

function checkImageExists(imageUrl, data, type) {
    var img = new Image();
    img.onload = function() {
        if (type === 'napas247') {
            // 图片存在
            $('#logo3').append('<img src="images/logo/' + data + '.png">');
            $('#logo33').append('<img src="images/logo/' + data + '.png">');
        } else {
            // 图片存在
            $('#logo4').append('<img src="images/logo/' + data + '.png">');
            $('#logo44').append('<img src="images/logo/' + data + '.png">');
        }

    };
    img.onerror = function() {
        // 图片不存在
        // $('#logo4').append('<img src="images/logo/sab.png">');
    };
    img.src = imageUrl; // 设置src时开始加载图片
}

// function convertToSeconds(time) {
//   const parts = time.split(':');
//   const minutes = parseInt(parts[0], 10);
//   const seconds = parseInt(parts[1], 10);
//   return minutes * 60 + seconds;
// }
//
// $(window).on('beforeunload', function() {
//   // 在 localStorage 中保存倒计时的当前值
//   localStorage.setItem('countdown', convertToSeconds($('#countdown').text()));
// });