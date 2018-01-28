function init(){
	gapi.client.setApiKey("AIzaSyB54I2tksQXwZId9FiRq5sjzQ-8P177GB0");
	gapi.client.load("youtube","v3",function(){
	});
}
function getUserFromBase(){
	$.ajax({
		url:'usersOnline',
		method:'GET',
		success: function(data){
			var res = JSON.parse(data);
			for (var i = 0; i < res.length; i++) {
				if(res[i].online){ var s = "<span class=\"isOnline\">Online</span>";
				                   $(".userss .divUser:eq( "+i+" )").append(s);
				}else{ var s = "<span class=\"isOffline\">Offline</span>";
					   $(".userss .divUser:eq( "+i+" )").append(s);}}}});	
}

$(document).ready(function() {
getUserFromBase();
// setInterval(function(){
// 		getUserFromBase();
// 	},10000);
});
//refresh message between users
var dataMes;
var refreshdata;
var iamG;
var newdata;

function showScroll(){
	if(dataMes==null){
		return;
	}else if(dataMes==0){
		return;
	}
	else{
	$('#mes_right').css('overflow-y','visible');
	setTimeout(function() {$('#mes_right').css('overflow-y','hidden'); }, 3000);
	}
}

function selectFriend(user,iam){
	$.ajax({
    	url:'selectFriend',
		data:({selectF:user}),
		method:'POST',
		success: function(data){
		    $('#W_tof').html(data);
			$('#pool_mess').val('');
			$.ajax({
				url:'getMessage',
				method:'POST',
				contentType:"text/html; charset=UTF-8",
				success: function(data){
					var res = JSON.parse(data);
					dataMes = res.length;
					var s = "";
					if(dataMes==0){
						$('#mees').html("<div id=\"DefInf\"><span id=\"def\">Let's start discussing with your friend</span></div>");
						return;
					}
					for (var i = 0; i < res.length; i++) {
						iamG = iam;
						if(res[i].senderId==iam){
							s = getFromDB("messRUser",res[i].date,res[i].text,s);
						}
						else{
							s = getFromDB("messRFriend",res[i].date,res[i].text,s);
						}
					}
					$("#mees").html(s);
				}
			});
		}
   });
}

function getFromDB(user,date,text,s){
	var str = text+"";
	var resss = str.match(/[+]http/g);
	if(resss == "+http"){
			var ress = text.replace("+http","");
			s +="<div class=\"messageBlock\"><div><span class=\"dateM\">"+date+"</span></div>"+
			"<div id=\""+user+"\"><iframe width=\"300\" height=\"180\" src=\"https://www.youtube.com/embed/"+ress+"\"></iframe></div></div>";
		}else{
		s +="<div class=\"messageBlock\"><div><span class=\"dateM\">"+date+"</span></div>"+"<div id=\""+user+"\">"+text+"</div></div>";
		}
	return s;
}

function retUser() {
	$.ajax({
		url:'searchUsers',
		data:({searchUser:$('#searchUser').val()}),
		method:'GET',
		success: function(data){
			var res = JSON.parse(data);
			var s="";
			for (var i = 0; i < res.length; i++) {
				s +="<li class=\"listSearch\"><div id=\"blockSearch\"><a href='gotoFriend?name="+res[i].name+"'>"+res[i].name+" "+res[i].surname+"</a></div></li>";
			}
			$("#retser").html(s);
		},
		error:function(){
			alert("error search");
		}
	});
}
var selects;
function changeS(e){
    selects = e;
	if(selects == "Message" ){
		$("#pool_mess").val('');
		$("#pool_mess").attr("placeholder", "send a message...");
		$(".resultSearch").fadeOut(250,0);
	}else if (selects == "Video"){
		$("#pool_mess").val('');
		$("#pool_mess").attr("placeholder", "send a video...");
		if(tr == true){
		$(".resultSearch").fadeTo(250,1);
		}
	}
}
var tr = false;
var clickOn = false;
var clickIndex;
function sendMessege(){
	document.onkeyup = function (e) {
		console.log("before invoke send");
		//variable for selection type message
		var select = selects;
		//choice
		switch(select){
		case "Message":
		 $(".resultSearch").fadeOut(250,0);
	     e = e || window.event;
		 if (e.keyCode === 13) {
			 if(dataMes==0){
					$('#mees').html("");
				}
			    $.ajax({
			    	url:'sendMessage',
			    	mimeType:"text/html; charset=UTF-8",
					data:({message:$('#pool_mess').val()}),
					method:'POST',
					success: function(data){
						var result = JSON.parse(data);
						var sss="";
						sss +="<div class=\"messageBlock\"><div><span class=\"dateM\">"+result[1]+"</span></div>"+"<div id=\"messRUser\">"+result[0]+"</div></div>"
		                $('#messRUser').css({"padding-left":""+((result[0].length*1,5)-result[0].length)+"px"});
			     		$("#mees").append(sss);
						$('#pool_mess').val('');
					}
			});
	      }
		break;
		case "Video":
		var s="";
		if($('#pool_mess').val()==""){
			s = "";
			$(".resultSearch").fadeOut(250);
		}else if(e.keyCode === 13){
			if(dataMes==0){
				$('#mees').html("");
			}
			var request = gapi.client.youtube.search.list({
				part:"snippet",
				type:"video",
				q:$('#pool_mess').val().replace(/%20/g,"+"),
				maxResults: 8,
				order:"viewCount"
			});
			
			if(tr == true){
				$(".resultSearch").fadeIn(250);
				request.execute(function(response){
				    var results = response.result;
		    		$.each(results.items, function (index, item) {
		    			s +="<div id=\"resultSepar"+index+"\" onclick=\"selectVideo("+index+",'"+item.id.videoId+"')\"><iframe width=\"300\" height=\"180\" src=\"https://www.youtube.com/embed/"+item.id.videoId+"\"></iframe>"+
	 		    		"<div><i id=\"Separ"+index+"\" class=\"fa fa-check\" aria-hidden=\"true\"></i></div></div>";	    
		    		});
		    		$(".resultSearch").html(s);
		    		configToVideo(results);
			});
				$(".resultSearch").fadeIn(500);
				
			}else{
			request.execute(function(response){
				    var results = response.result;
				    s +="";
		    		$.each(results.items, function (index, item) {
		    						 s +="<div id=\"resultSepar"+index+"\" onclick=\"selectVideo("+index+",'"+item.id.videoId+"')\"><iframe width=\"300\" height=\"180\" src=\"https://www.youtube.com/embed/"+item.id.videoId+"\"></iframe>"+
		    		 		    		"<div><i id=\"Separ"+index+"\" class=\"fa fa-check\" aria-hidden=\"true\"></i></div></div>";
		    		});
				    $(".resultSearch").html(s);
					$(".resultSearch").fadeTo(500,1);
					configToVideo(results);
		    		tr = true;
		    		clickOn = false;
			});
	      }
		}
		break;
		}
	}
}

function configToVideo(results){
	$.each(results.items, function(index,item){
		$('#resultSepar'+index+'').css({"display":"inline-block","margin":"8px 30px 0 20px","padding":"10px 10px 5px 10px"});
		$('#Separ'+index+'').css({"color": "white", "float": "right","margin-top":"10px"});
	    $('#resultSepar'+index+'').mouseover(function(){
	    	    $('#resultSepar'+index+'').css('background','#6b6b6b');
			    $('#Separ'+index+'').css("color","rgb(91, 181, 255)");
		});
		$('#resultSepar'+index+'').mouseleave(function(){
			if(clickOn != true || clickIndex !=index){
				$('#Separ'+index+'').css("color","white");
				$('#resultSepar'+index+'').css('background','none');
				
			}else{
				$('#resultSepar'+index+'').css('background','#6b6b6b');
				$('#Separ'+index+'').css("color","rgb(91, 181, 255)");
			}
		});
	});
}
function selectVideo(e,k){
	clickOn = true;
	clickIndex = e;
	for(var i = 0; i < 8; i++){
	if(i == e){
		$('#resultSepar'+e+'').css('background','#6b6b6b');
		$('#Separ'+e+'').css('color','rgb(91, 181, 255)');
		
	}else{
	$('#resultSepar'+i+'').css('background','none');
	$('#Separ'+i+'').css('color','white');
	}
	}
	$.ajax({
    	url:'sendMessage',
    	mimeType:"text/html; charset=UTF-8",
		data:({message:k+"+http"}),
		method:'POST',
		success: function(data){
			var res = data[0].replace("+http","");
			var s="";
            s +="<div class=\"messageBlock\"><div><span class=\"dateM\">"+data[1]+"</span></div>" +
            	"<div id=\"messRUser\"><iframe width=\"300\" height=\"180\" src=\"https://www.youtube.com/embed/"+res+"\"></iframe></div></div>";
			$("#mees").append(s);
			$('#pool_mess').val('');
		}
});
	$(".resultSearch").fadeOut(250);	
}