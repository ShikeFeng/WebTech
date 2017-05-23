'use strict';
$(document).ready(function(){
                            $("#password_show_button").mouseup(function(){
                                $("#profile_password").attr("type", "password");
                            });
                            $("#password_show_button").mousedown(function(){
                                $("#profile_password").attr("type", "text");
                            });
                        });
