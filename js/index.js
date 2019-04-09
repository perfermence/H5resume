/*Loading*/
let loadingRender=(function () {
    let $loadingBox=$('.loadingBox'),
        $current=$loadingBox.find('.current');
    let imgData=["img/icon.png","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png",
        "img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png",
        "img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png",
        "img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg",
        "img/zf_cubeTip.png", "img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png",
        "img/zf_messageChat.png", "img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png",
        "img/zf_outline.png", "img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png",
        "img/zf_phoneLogo.png","img/zf_return.png", "img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg",
        "img/zf_styleTip1.png","img/zf_styleTip2.png", "img/zf_teacher1.png","img/zf_teacher2.png",
        "img/zf_teacher3.jpg","img/zf_teacher4.png","img/zf_teacher5.png", "img/zf_teacher6.png",
        "img/zf_teacherTip.png"];
    //=>run:预加载图片
    let n=0,
        len=imgData.length;
    let run=function run(callback){
      imgData.forEach(item=>{
          let tempImg=new Image;
          tempImg.onload=()=>{
              tempImg=null;
              $current.css('width',(++n/len)*100+'%');
              //加载完成:执行回调函数（让当前loading页面消失）
              if (n===len){
                  clearTimeout(delayTimer);//计时器是为了不能加载完成而设置的，所以此处如果已经每张都加载了，应该把计时器删掉。
                  callback&&callback();
              }
          };
          tempImg.src=item;
      })
    };
    //max-delay：设置最长等待时间（假设是10S，到达10S的时候，我们判断加载了多少，如果已经到达90%以上，
    // 我们可以正常访问内容,如果不足，直接提示用户当前网络不好，稍后再试）
    let delayTimer=null;
    let maxDelay=function maxDelay(done) {
        delayTimer=setTimeout((callback)=>{
            if (n/len>=0.9){
                $current.css('width','100%');
                callback&&callback();
                return;
            }
            alert('非常遗憾，当前你的网络状况不佳，请稍后再试！');
            //此时我们不应该继续加载图片，而是让其关掉页面或者是跳转到其他页面
            // window.location.href='http://www.qq.com';
        },10000);
    };

    //=>done:完成后要做的事情
    let done=function done() {
        //停留1秒钟再移除进入下一环节
        let timer=setTimeout(()=>{
            $loadingBox.remove();//直接移除，这是个不可回退的事情
            clearTimeout(timer);
            phoneRender.init();
        },1000);
    };
    return{
        init:function () {
            $loadingBox.css('display','block');
            run(done);
            maxDelay(done);
            console.log(1);
        }
    }
})();
/*phone*/
let phoneRender=(function(){
    let $phoneBox=$('.phoneBox'),
        $time=$phoneBox.find('span'),
        $answer=$phoneBox.find('.answer'),
        $answerMarkLink=$answer.find('.markLink'),
        $hang=$phoneBox.find('.hang'),
        $hangMarkLink=$hang.find('.markLink'),
        answerBell=$('#answerBell')[0],
        introduction=$('#introduction')[0];//zepto中没有提供处理音视频的方法，此处需要转为原生JS，用原生JS的方法操作

    let answerMarkTouch=function () {
        //1.remove answer
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();//一定要先暂停再移除

        //2.show hang
        $hang.css('transform','translateY(0rem)');
        $time.css('display','block');
        introduction.play();

        //3.计算当前时间
        computedTime();
    };
    //计算播放时间
    let computedTimer=null;
    let computedTime=function () {
        let duration=0;
        //我们让audio播放，首先会先去加载资源，部分资源加载完成才会播放，才会计算出总时间duration等信
        // 息，所以我们可以把获取信息放到can-play事件中，等开始播放了再计算
        introduction.oncanplay=function(){
            duration=introduction.duration;
            console.log(duration);
        };

        computedTimer=setInterval(()=>{
            let val=introduction.currentTime;
            if (val+1>=duration){//此处总时间会大于播放时间，所以val不可能大于等于duration，可给其加1
                clearInterval(computedTimer);
                //时间到了也该关闭phone
                closePhone();
                return;
            }
            let minute=Math.floor(val/60),
                second=Math.floor(val-minute*60);
            minute=minute<10?'0'+minute:minute;
            second=second<10?'0'+second:second;
            $time.html(`${minute}:${second}`);
        },1000);
    };

    //关闭phone
    let closePhone=function () {
        clearInterval(computedTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };
    return {
        init:function () {
            $phoneBox.css('display','block');
            //播放bell
            answerBell.play();
            answerBell.volume=0.3;//设置音量大小

            //点击answer-Mark
            $answerMarkLink.tap(answerMarkTouch);

            //点击hang-mark:关闭phone页面
            $hangMarkLink.tap(closePhone);
        }
    }
})();

/*message*/
let messageRender=(function () {
    let $messageBox=$('.messageBox'),
        $wrapper=$messageBox.find('.wrapper'),
        $messageList=$wrapper.find('li'),
        $keyBoard=$messageBox.find('.keyBoard'),
        $textInp=$keyBoard.find('span'),
        $submit=$keyBoard.find('.submit'),
        demonMusic=$('#demonMusic')[0];
    let step=-1,//记录当前展示信息的索引
        total=$messageList.length+1,//=>记录信息的总条数(自己发一条所以加1)
        autoTimer=null,
        interval=2000;//记录信息多长时间出来一条（信息相继出现的间隔时间）
    //展示信息
    let showMessage=function () {
        ++step;
        if (step===2){
            //已经展示两条了，此时暂时结束自动信息发送，让键盘出来，开始执行手动发送
            clearInterval(autoTimer);
            handleSend();//进行手动发送
            return;
        }
        let $cur=$messageList.eq(step);//获取当前需要操作的信息
        $cur.addClass('active');
        if (step>=3){
            //说明展示了四条或者四条以上，此时我们让wrapper向上移动（移动的距离是新展示这一条的高度）
        let curH=$cur[0].offsetHeight,//转换为原生JS获取当前这一条的高度
            //JS中基于CSS获取transform，获取的值是一个矩阵
            wraT=parseFloat($wrapper.css('top'));
        $wrapper.css('top',wraT-curH);

        }
        if (step>=total-1){
            //展示完了
            clearInterval(autoTimer);
            closeMessage();
        }
    };
    //手动发送
    let handleSend=function () {
        $keyBoard.css('transform','translateY(0rem)')
            .one('transitionend',()=>{
            //transition-end:监听当前元素transition动画结束的事件（有几个样式属性改变，并且执行了过渡效果，
            // 事件就会被触发执行几次），用one方法绑定事件，只会让其触发一次
                let str=`好的，马上介绍`,
                    n=-1,
                    textTimer=null;
                textTimer=setInterval(()=>{
                    let originHTML=$textInp.html();
                    $textInp.html(originHTML+str[++n]);
                    if (n>=str.length-1){
                        //文字显示完成
                        clearInterval(textTimer);
                        $submit.css('display','block');
                    }
                },100);
        });
    };

    //点击submit
    let handleSubmit=function () {
        //把新创建的LI增加到页面中第二个LI的后面
        $(` <li class="self">
                <i class="arrow"></i>
                <img src="img/zf_messageStudent.png" alt="" class="pic">
                ${$textInp.html()}
            </li>`).insertAfter($messageList.eq(1)).addClass('active');

        //该消失的消失
        $textInp.html('');
        $submit.css('display','none');
        $keyBoard.css('transform','translateY(3.7rem)');

        //继续展示剩余的消息
        $messageList=$wrapper.find('li');
        autoTimer=setInterval(showMessage,interval);
    };

    //关掉这个区域
    let closeMessage=function () {
        let delayTimer=setTimeout(()=>{
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();

            cubeRender.init();
        },interval);

    };
    return{
        init:function () {
            $messageBox.css('display','block');
            showMessage();//刚开始进来展示一条
            autoTimer=setInterval(showMessage,interval);//之后每隔2S展示一条
            //submit
            $submit.tap(handleSubmit);
            //music
            demonMusic.play();
            demonMusic.volume=0.3;

        }
    }
})();

/*CUBE*/
let cubeRender=(function () {
    let $cubeBox=$('.cubeBox'),
        $cube=$('.cube'),
        $cubeList=$cube.find('li');
    //手指控制旋转
    let start=function (ev) {
        //记录手指按在位置的起始坐标
        let  point=ev.changedTouches[0];
        this.strX=point.clientX;
        this.strY=point.clientY;
        this.changeX=0;
        this.changeY=0;
    };
    //手指移动
    let move=function (ev) {
        //最新手指位置减去起始手指位置，记录X/Y轴的偏移
        let  point=ev.changedTouches[0];
        this.changeX=point.clientX-this.strX;
        this.changeY=point.clientY-this.strY;
    };
    //手指离开
    let end=function (ev) {
        //获取change值、rotate值
        let {changeX,changeY,rotateX,rotateY}=this;
        let isMove=false;
        //验证是否发生移动（判断滑动误差）
        Math.abs(changeX)>10||Math.abs(changeY)>10?isMove=true:null;
        //只有发生移动才做处理
        if (isMove){
            //左后滑动=>change-x=>rotate-y(正比：change 越大，rotate越大)
            //上下滑动=>change-Y=>rotate-X(正比：change 越大，rotate越小)
            rotateX=rotateX-changeY;
            rotateY=rotateY+changeX;
            //赋值给魔方
            $(this).css('transform',`scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
            //让当前旋转的角度成为下一次起始的角度
            this.rotateX=rotateX;
            this.rotateY=rotateY;
        }
        //清空其他记录的自定义属性
        ['strX','strY','changeX','changeY'].forEach(item=>{
            this[item]=null;
        });

    };

    return{
        init:function () {
            $cubeBox.css('display','block');
            //手指操作cube，让cube跟着旋转
            let cube=$cube[0];//转为原生JS
            cube.rotateX=-35;
            cube.rotateY=35;//记录初始的旋转角度（存储到自定义属性上）
            $cube.on('touchstart',start)
                .on('touchmove',move)
                .on('touchend',end);
            //=>在cubeRender中点击每个面调转到详情区域对应的页面
            $cubeList.tap(function () {
                $cubeBox.css('display','none');
                //跳转到详情区域，通过传递点击LI的索引，让其定位到具体的slide
                let index=$(this).index();
                detailRender.init(index);
            });
        }
    }
})();

/*detail*/
let detailRender=(function () {
    let $detailBox=$('.detailBox'),
        swiper=null;
    let $dl=$('.page1>dl');
    let swiperInit=function () {
        swiper=new Swiper('.swiper-container',{
            //initialSlide:1 初始化slide索引是第几张
            //direction:horizontal/vertical:控制滑动方向
            effect:'coverflow',
           // loop:'true'//swiper有一个bug，3D切换设置loop为TRUE的时候，偶尔会出现无法切换的情况（2D
            // 效果没问题） 无缝切换原理：把真实第一张克隆一份到末尾，把真实最后一张也克隆一份放到开始（真实slide有五份，
            // 它就有七份）
            onInit:move,//初始化成功执行的回调函数
            //实现动画：用的是CSS3，不是JS
            onTransitionEnd:move
                //切换动画完成执行的回调函数
                //swiper:当前初始化的实例

            //实例的私有属性：
            /* activeInde:当前展示slide块的索引
                slides:获取所有的slide（数组）
            *
            * */
            //实例的公有方法
            //slideTo:切换到指定索引的slide

        });
    };
    let move=function (swiper) {
        //swiper:当前创建的实例
        //1、判断当前是否是第一个slide：如果是让3D菜单展开，不是收起3D菜单
        let activeIn=swiper.activeIndex,
            slideAry=swiper.slides;
        slideAry=[].slice.call(slideAry);
        console.log(slideAry);
        if (activeIn===0){
            //说明是page1
            //实现折叠效果
            $dl.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8
            });
            $dl.makisu('open');

        } else{
            $dl.makisu({
                selector:'dd',
                speed:0
            });
            $dl.makisu('close');
        }

        // 2、滑动到哪个页面，把当前页面设置对应的ID，其余页面ID移除
        slideAry.forEach((item,index)=>{
            if (activeIn===index){
                item.id=`page${index+1}`;
                return;
            }
            item.id=null;
        })
    };
    return{
        init:function (index=0) {
            $detailBox.css('display','block');
            //初始化swiper
            if (!swiper){
                //防止重复初始化
                swiperInit();
            }
           swiper.slideTo(index,0);//swiper提供的方法，跳转到指定的页面
            // 第二个参数：切换的速度  0：立即切换没有切换的动画
        }
    }
})();
//=>开发过程中，由于当前项目板块众多（每一个板块都是一个单例），我们最好规划一种机制：
// 通过标识的判断可以让程序执行对应的板块内容，这样开发哪个板块，我们就把标识改为啥（HASH路由控制）
let url=window.location.href,//获取当前页面的URL地址，location.href='xxx'这种写法是让其跳转到另一个页面
    well=url.indexOf('#'),
    hash=well===-1?null:url.substr(well+1);
switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();
}
